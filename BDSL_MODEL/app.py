import os
import cv2
import base64
import logging
from collections import deque

import numpy as np
import torch
import torch.nn as nn
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

NUM_CLASSES, SEQUENCE_LENGTH, IMG_SIZE = 3, 16, 224
MODEL_PATH = "bdsl_best_cnn_lstm_model.pth"
CLASS_NAMES = ["W1", "W2", "W3"]
SIGN_LANGUAGE_MAPPING = {"W1": "HELLO", "W2": "THANK YOU", "W3": "YES"}
SIGN_DESCRIPTIONS = {
    "W1": "👋 HELLO - Waving hand gesture greeting",
    "W2": "🙏 THANK YOU - Hands together in gratitude",
    "W3": "👍 YES - Thumbs up affirmative gesture",
}

if torch.backends.mps.is_available():
    device = torch.device("mps")
    logger.info("Using Apple Silicon (MPS)")
elif torch.cuda.is_available():
    device = torch.device("cuda")
    logger.info(f"Using CUDA: {torch.cuda.get_device_name(0)}")
else:
    device = torch.device("cpu")
    logger.info("Using CPU")


class CNN_LSTM(nn.Module):
    def __init__(self, num_classes, hidden_size=256, num_layers=1):
        super().__init__()
        resnet = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)
        self.cnn = nn.Sequential(*list(resnet.children())[:-1])
        self.feature_dim = resnet.fc.in_features
        self.lstm = nn.LSTM(self.feature_dim, hidden_size, num_layers, batch_first=True)
        self.fc = nn.Linear(hidden_size, num_classes)

    def forward(self, x):
        b, s, _, _, _ = x.size()
        feats = [self.cnn(x[:, t]).view(b, -1) for t in range(s)]
        lstm_out, _ = self.lstm(torch.stack(feats, dim=1))
        return self.fc(lstm_out[:, -1, :])


def load_model():
    if not os.path.exists(MODEL_PATH):
        logger.warning(f"Model file not found at {MODEL_PATH}")
        return None
    m = CNN_LSTM(num_classes=NUM_CLASSES).to(device)
    m.eval()
    try:
        logger.info(f"Attempting to load model from: {MODEL_PATH}")
        state_dict = torch.load(MODEL_PATH, map_location=device, weights_only=False)
        m.load_state_dict(state_dict)
        logger.info(" Model loaded and state dict applied successfully")
        logger.info(f"Total Parameters: {sum(p.numel() for p in m.parameters()):,}")
        return m
    except Exception as e:
        logger.error(f" Failed to load model: {type(e).__name__}: {e}", exc_info=True)
        return None


transform_pipeline = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])
logger.info("Transform pipeline initialized")
model = load_model()


def preprocess_frames(frames):
    processed = []
    for i, frame in enumerate(frames):
        try:
            processed.append(transform_pipeline(Image.fromarray(frame.astype("uint8"))))
        except Exception as e:
            logger.error(f"Error processing frame {i}: {e}")
            return None
    return torch.stack(processed).unsqueeze(0) if processed else None


def predict_sign(frames_tensor):
    if model is None or frames_tensor is None:
        return None
    try:
        with torch.no_grad():
            probs = torch.softmax(model(frames_tensor.to(device)), dim=1)
            conf, idx = torch.max(probs, 1)
        pred_idx = idx.item()
        pred_class = CLASS_NAMES[pred_idx] if pred_idx < len(CLASS_NAMES) else "Unknown"
        probs_dict = {name: f"{probs[0][i].item()*100:.2f}%" for i, name in enumerate(CLASS_NAMES)}
        return {
            "predicted_class": pred_class,
            "confidence": f"{conf.item()*100:.2f}%",
            "predicted_text": SIGN_LANGUAGE_MAPPING.get(pred_class, pred_class),
            "description": SIGN_DESCRIPTIONS.get(pred_class, f"Sign: {pred_class}"),
            "all_probabilities": probs_dict,
        }
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        return None


def base_response(frame_count, buffer_len):
    status = f"{buffer_len}/{SEQUENCE_LENGTH}"
    return {
        "frame_count": frame_count,
        "buffer_size": buffer_len,
        "buffer_status": status,
        "prediction": f"Accumulating frames... ({status})",
    }


app = FastAPI(title="Sign Language Recognition API", description="Real-time CNN-LSTM based sign language recognition", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])


@app.get("/", response_class=HTMLResponse)
async def index():
    try:
        with open("index.html", "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        return HTMLResponse("<h1>Error: index.html not found</h1>", status_code=404)


@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "model_loaded": model is not None,
        "device": str(device),
        "sequence_length": SEQUENCE_LENGTH,
        "num_classes": NUM_CLASSES,
        "classes": CLASS_NAMES,
    }


@app.websocket("/ws/predict")
async def websocket_predict(websocket: WebSocket):
    await websocket.accept()
    logger.info("🔗 Client connected to WebSocket")
    frame_buffer, frame_count = deque(maxlen=SEQUENCE_LENGTH), 0
    try:
        while True:
            data = await websocket.receive_text()
            encoded = data.split(",", 1)[1] if "," in data else data
            try:
                img = cv2.imdecode(np.frombuffer(base64.b64decode(encoded), np.uint8), cv2.IMREAD_COLOR)
                if img is None:
                    await websocket.send_json({"error": "Invalid image data"})
                    continue
                frame_buffer.append(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
                frame_count += 1
                response = base_response(frame_count, len(frame_buffer))
                if len(frame_buffer) == SEQUENCE_LENGTH:
                    logger.info(f"Buffer full! Processing {SEQUENCE_LENGTH} frames for prediction...")
                    frames_tensor = preprocess_frames(list(frame_buffer))
                    if frames_tensor is None:
                        response.update({"prediction": "Preprocessing failed", "status": "error"})
                        logger.warning(" Frame preprocessing failed")
                    elif model is None:
                        response.update({"prediction": "Model not loaded", "status": "error"})
                        logger.error(" Model is None!")
                    else:
                        pred = predict_sign(frames_tensor)
                        if pred:
                            final = f"{pred['predicted_text']} ({pred['confidence']})"
                            response.update({
                                "prediction": final,
                                "confidence": pred["confidence"],
                                "class": pred["predicted_class"],
                                "probabilities": pred["all_probabilities"],
                                "status": "success",
                            })
                            logger.info(f"Prediction: {final}")
                        else:
                            response.update({"prediction": "Prediction failed", "status": "error"})
                            logger.warning(" Prediction returned None")
                await websocket.send_json(response)
            except (base64.binascii.Error, ValueError) as e:
                logger.warning(f" Invalid frame data: {e}")
                await websocket.send_json({"error": f"Invalid frame data: {e}", "status": "error"})
            except Exception as e:
                logger.error(f" Frame processing error: {e}")
                await websocket.send_json({"error": f"Processing error: {e}", "status": "error"})
    except WebSocketDisconnect:
        logger.info("👋 Client disconnected from WebSocket")
    except Exception as e:
        logger.error(f"WebSocket error: {e}", exc_info=True)
        try:
            await websocket.close()
        except Exception:
            pass


@app.on_event("startup")
async def startup_event():
    sep = "=" * 70
    logger.info(sep)
    logger.info("Sign Language Recognition API Starting Up")
    logger.info(sep)
    logger.info(f"Device: {device}")
    logger.info(f"Model Loaded: {model is not None}")
    logger.info(f"Classes: {CLASS_NAMES}")
    logger.info(f"Sequence Length: {SEQUENCE_LENGTH}")
    logger.info(f"Image Size: {IMG_SIZE}x{IMG_SIZE}")
    logger.info(sep)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)
