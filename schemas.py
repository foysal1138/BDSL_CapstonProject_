"""Pydantic schemas for authentication, predictions, and patients."""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# Authentication request/response models
class UserBase(BaseModel):
    email: str
    role: str = "doctor"

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    user: UserResponse
    message: str

# Sign language prediction models
class PredictionCreate(BaseModel):
    detected_sign: str
    sign_meaning: str
    confidence: float
    all_probabilities: Optional[str] = None

class PredictionResponse(BaseModel):
    id: int
    user_id: int
    detected_sign: str
    sign_meaning: str
    confidence: float
    timestamp: datetime
    class Config:
        from_attributes = True

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    device: str
    sequence_length: int
    num_classes: int
    classes: list

class PredictionMessage(BaseModel):
    frame_count: int
    buffer_size: int
    buffer_status: str
    prediction: str
    confidence: Optional[str] = None
    class_: Optional[str] = None
    probabilities: Optional[dict] = None
    status: str = "accumulating"

# Patient registration models
class PatientBase(BaseModel):
    first_name: str
    last_name: str
    gender: str
    age: int
    date_of_birth: datetime
    address: str
    nid_birth_cert: str
    blood_group: str

class PatientCreate(PatientBase):
    pass

class PatientUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    gender: Optional[str] = None
    age: Optional[int] = None
    date_of_birth: Optional[datetime] = None
    address: Optional[str] = None
    nid_birth_cert: Optional[str] = None
    blood_group: Optional[str] = None

class PatientResponse(PatientBase):
    id: int
    tracking_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    class Config:
        from_attributes = True
