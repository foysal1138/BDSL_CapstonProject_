import pickle
import cv2
import mediapipe as mp
import numpy as np
import base64
import uuid
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import threading
from database.db import (
    init_db,
    insert_prediction,
    get_patient,
    insert_patient,
    get_all_patients,
    get_predictions,
    create_user,
    verify_user,
    get_user_by_email,
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model_dict = pickle.load(open('./model.p', 'rb'))
model = model_dict['model']

mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=False, min_detection_confidence=0.5)

labels_dict = {0: '0', 1: '1', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9'}
classes = list(labels_dict.values())
current_prediction = "Waiting..."
prediction_lock = threading.Lock()


def predict_from_frame(frame):
    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = hands.process(frame_rgb)
    if not results.multi_hand_landmarks:
        return None

    hand_landmarks = results.multi_hand_landmarks[0]
    x_ = []
    y_ = []
    data_aux = []

    for point in hand_landmarks.landmark:
        x_.append(point.x)
        y_.append(point.y)

    for point in hand_landmarks.landmark:
        data_aux.append(point.x - min(x_))
        data_aux.append(point.y - min(y_))

    prediction = model.predict([np.asarray(data_aux)])
    predicted_character = labels_dict[int(prediction[0])]
    return predicted_character


@app.on_event("startup")
async def startup():
    init_db()


@app.get("/")
async def root():
    return {
        "status": "ok",
        "message": "BDSL backend is running",
    }


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "model_loaded": model is not None,
        "classes": classes,
        "sequence_length": 16,
        "num_classes": len(classes),
        "device": "cpu",
    }


@app.get("/prediction")
async def get_prediction():
    with prediction_lock:
        return {"prediction": current_prediction}


@app.post("/patients")
async def create_patient(data: dict):
    try:
        patient_id = insert_patient(
            data["tracking_id"],
            data["first_name"],
            data["last_name"],
            data["gender"],
            data["age"],
            data["date_of_birth"],
            data["address"],
            data["nid_birth_cert"],
            data["blood_group"]
        )
        return {"id": patient_id, "message": "Patient created"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/patients/register")
async def register_patient(data: dict):
    try:
        tracking_id = f"PT-{uuid.uuid4().hex[:10].upper()}"
        patient_id = insert_patient(
            tracking_id,
            data["first_name"],
            data["last_name"],
            data["gender"],
            data["age"],
            data["date_of_birth"],
            data["address"],
            data["nid_birth_cert"],
            data["blood_group"],
        )
        return {"id": patient_id, "tracking_id": tracking_id, "message": "Patient registered"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/patients")
async def list_patients():
    return get_all_patients()


@app.get("/patients/{tracking_id}")
async def get_patient_info(tracking_id: str):
    patient = get_patient(tracking_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient


@app.post("/predictions")
async def save_prediction(data: dict):
    try:
        insert_prediction(
            data["user_id"],
            data["detected_sign"],
            data["confidence"],
            data.get("probabilities")
        )
        return {"message": "Prediction saved"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/predictions/{user_id}")
async def get_user_predictions(user_id: int):
    return get_predictions(user_id)


@app.post("/auth/signup")
async def signup(data: dict):
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    role = data.get("role", "doctor")

    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password are required")
    if get_user_by_email(email):
        raise HTTPException(status_code=400, detail="User already exists")

    user_id = create_user(email, password, role)
    return {"id": user_id, "email": email, "role": role}


@app.post("/auth/login")
async def login(data: dict):
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    user = verify_user(email, password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = f"token-{uuid.uuid4().hex}"
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user["id"], "email": user["email"], "role": user["role"]},
    }


@app.websocket("/ws/predict")
async def ws_predict(websocket: WebSocket):
    global current_prediction
    await websocket.accept()
    try:
        while True:
            data_url = await websocket.receive_text()
            if "," in data_url:
                data_url = data_url.split(",", 1)[1]

            frame_bytes = base64.b64decode(data_url)
            frame_np = np.frombuffer(frame_bytes, dtype=np.uint8)
            frame = cv2.imdecode(frame_np, cv2.IMREAD_COLOR)

            if frame is None:
                await websocket.send_json({"status": "error", "message": "Invalid frame"})
                continue

            prediction = predict_from_frame(frame)
            if prediction is None:
                await websocket.send_json({"status": "success", "prediction": ""})
            else:
                with prediction_lock:
                    current_prediction = prediction
                await websocket.send_json({"status": "success", "prediction": prediction})
    except WebSocketDisconnect:
        return
    except Exception as e:
        await websocket.send_json({"status": "error", "message": str(e)})


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
    # uvicorn.run(app, host="0.0.0.0", port=8760)
