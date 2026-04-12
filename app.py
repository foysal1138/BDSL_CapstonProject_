"""Sign language recognition FastAPI backend with WebSocket predictions."""

import base64
import cv2
import logging
import os
from collections import deque
from datetime import datetime

import numpy as np

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from sqlalchemy.orm import Session

from database import init_db, get_db, User, Prediction, Session as SessionModel
from schemas import LoginRequest, LoginResponse, UserCreate, UserResponse, HealthResponse
from auth import hash_password, verify_password, generate_token, get_token_expiry
from huggingface.inference import (
    CLASS_NAMES, IMG_SIZE, NUM_CLASSES, SEQUENCE_LENGTH, device, model,
    preprocess_frames, predict_sign,
)
from patients import router as patient_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Sign Language Recognition API",
    description="Real-time CNN-LSTM based sign language recognition",
    version="1.0.0"
)

app.include_router(patient_router)

allowed_origins = [
    origin.strip() for origin in os.getenv(
        "ALLOWED_ORIGINS", "http://localhost:5000,http://127.0.0.1:5000"
    ).split(",") if origin.strip()
]
allowed_hosts = [
    host.strip() for host in os.getenv(
        "ALLOWED_HOSTS", "localhost,127.0.0.1"
    ).split(",") if host.strip()
]

app.add_middleware(TrustedHostMiddleware, allowed_hosts=allowed_hosts)
app.add_middleware(CORSMiddleware, allow_origins=allowed_origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

@app.on_event("startup")
async def startup_event():
    init_db()  # Initialize database tables
    logger.info(f"Device: {device} | Model: {model is not None} | Classes: {CLASS_NAMES}")


def get_current_user(token: str, db: Session = Depends(get_db)) -> User:
    """Validate token and return authenticated user."""
    session = db.query(SessionModel).filter(
        SessionModel.token == token,
        SessionModel.is_active == True
    ).first()
    
    if not session or session.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    return session.user


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Check API and model status."""
    return {
        "status": "ok",
        "model_loaded": model is not None,
        "device": str(device),
        "sequence_length": SEQUENCE_LENGTH,
        "num_classes": NUM_CLASSES,
        "classes": CLASS_NAMES,
    }


@app.get("/")
async def root():
    """API metadata and endpoints."""
    return {
        "message": "Sign Language Recognition API",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "auth": {
                "signup": "POST /auth/signup",
                "login": "POST /auth/login",
            },
            "predictions": {
                "history": "GET /predictions/history",
                "websocket": "WS /ws/predict"
            }
        }
    }


@app.post("/auth/signup", response_model=UserResponse)
async def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register doctor account."""
    # Prevent duplicate email registration
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    db_user = User(
        email=user_data.email,
        password=hash_password(user_data.password),
        role=user_data.role,
        is_active=True
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    logger.info(f"New user registered: {user_data.email}")
    return db_user


@app.post("/auth/login", response_model=LoginResponse)
async def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate and return session token."""
    # Verify email and password
    db_user = db.query(User).filter(User.email == credentials.email).first()
    if not db_user or not verify_password(credentials.password, db_user.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    
    if not db_user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User account is inactive")
    
    # Generate session token
    token = generate_token()
    db_session = SessionModel(
        user_id=db_user.id,
        token=token,
        expires_at=get_token_expiry(),
        is_active=True
    )
    db.add(db_session)
    db.commit()
    
    logger.info(f"User logged in: {credentials.email}")
    
    return {
        "access_token": token,
        "user": db_user,
        "message": "Login successful"
    }


@app.get("/predictions/history")
async def get_prediction_history(
    token: str, limit: int = 50, db: Session = Depends(get_db)
):
    """Get user prediction history."""
    user = get_current_user(token, db)
    
    predictions = db.query(Prediction).filter(
        Prediction.user_id == user.id
    ).order_by(Prediction.timestamp.desc()).limit(limit).all()
    
    return {
        "user_id": user.id,
        "total_predictions": len(predictions),
        "predictions": predictions
    }


def create_base_response(frame_count, buffer_len):
    """Build buffer status response."""
    status_str = f"{buffer_len}/{SEQUENCE_LENGTH}"
    return {
        "frame_count": frame_count,
        "buffer_size": buffer_len,
        "buffer_status": status_str,
        "prediction": f"Accumulating frames... ({status_str})",
    }


@app.websocket("/ws/predict")
async def websocket_predict(websocket: WebSocket):
    """Real-time sign prediction via WebSocket: receive frames → buffer → predict."""
    await websocket.accept()
    logger.info("Client connected")
    
    frame_buffer, frame_count = deque(maxlen=SEQUENCE_LENGTH), 0
    
    try:
        while True:
            # Receive base64 frame
            data = await websocket.receive_text()
            encoded = data.split(",", 1)[1] if "," in data else data
            
            try:
                # Decode and convert to numpy array
                img = cv2.imdecode(
                    np.frombuffer(base64.b64decode(encoded), np.uint8),
                    cv2.IMREAD_COLOR
                )
                
                if img is None:
                    await websocket.send_json({"error": "Invalid image data"})
                    continue
                
                # Add frame to buffer (auto-removes oldest if full)
                frame_buffer.append(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
                frame_count += 1
                response = create_base_response(frame_count, len(frame_buffer))
                
                # Run inference when buffer is full
                if len(frame_buffer) == SEQUENCE_LENGTH:
                    frames_tensor = preprocess_frames(list(frame_buffer))
                    
                    if frames_tensor is None:
                        response.update({"prediction": "Preprocessing failed", "status": "error"})
                    elif model is None:
                        response.update({"prediction": "Model not loaded", "status": "error"})
                    else:
                        # Run CNN-LSTM inference
                        pred = predict_sign(frames_tensor)
                        if pred:
                            final_pred = f"{pred['predicted_text']} ({pred['confidence']})"
                            response.update({
                                "prediction": final_pred,
                                "confidence": pred["confidence"],
                                "class": pred["predicted_class"],
                                "probabilities": pred["all_probabilities"],
                                "status": "success",
                                "description": pred["description"],
                            })
                        else:
                            response.update({"prediction": "Prediction failed", "status": "error"})
                
                await websocket.send_json(response)
            
            except (base64.binascii.Error, ValueError) as e:
                await websocket.send_json({"error": f"Invalid frame data: {e}", "status": "error"})
            except Exception as e:
                await websocket.send_json({"error": f"Processing error: {e}", "status": "error"})
    
    except WebSocketDisconnect:
        pass
    except Exception as e:
        logger.error(f"WebSocket error: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8760)
