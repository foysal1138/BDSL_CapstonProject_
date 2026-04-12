"""Patient tracking API routes for authenticated doctors."""

from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from database import Patient, Session as SessionModel, get_db
from schemas import PatientCreate, PatientResponse, PatientUpdate

# APIRouter for patient endpoints with authentication
router = APIRouter(prefix="/patients", tags=["patients"])


# Authentication dependency: validate bearer token and user role
def get_authenticated_user(authorization: str = Header(default=""), db: Session = Depends(get_db)):
    """Validate bearer token and verify doctor/admin authorization."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization token",
        )

    token = authorization.removeprefix("Bearer ").strip()
    session = db.query(SessionModel).filter(
        SessionModel.token == token,
        SessionModel.is_active == True,
    ).first()

    if not session or session.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    if session.user.role not in {"doctor", "admin"}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to manage patients",
        )

    return session.user


# Utility functions for patient operations
def generate_tracking_id() -> str:
    """Generate unique patient tracking ID (PT-XXXXXXXXXX format)."""
    return f"PT-{uuid4().hex[:10].upper()}"


# Patient registration endpoint
@router.post("/register", response_model=PatientResponse)
async def register_patient(
    patient_data: PatientCreate,
    _current_user=Depends(get_authenticated_user),
    db: Session = Depends(get_db),
):
    """Create new patient record with unique tracking ID; reject if duplicate NID/Birth Cert exists."""
    existing_patient = db.query(Patient).filter(
        Patient.nid_birth_cert == patient_data.nid_birth_cert
    ).first()
    if existing_patient:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Patient with this NID / Birth Certificate already exists",
        )

    patient = Patient(
        tracking_id=generate_tracking_id(),
        first_name=patient_data.first_name,
        last_name=patient_data.last_name,
        gender=patient_data.gender,
        age=patient_data.age,
        date_of_birth=patient_data.date_of_birth,
        address=patient_data.address,
        nid_birth_cert=patient_data.nid_birth_cert,
        blood_group=patient_data.blood_group,
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient

# Patient retrieval endpoints
@router.get("", response_model=list[PatientResponse])
async def list_patients(
    _current_user=Depends(get_authenticated_user),
    db: Session = Depends(get_db),
):
    """Retrieve all patient records ordered by creation date (newest first)."""
    return db.query(Patient).order_by(Patient.created_at.desc()).all()


@router.get("/{tracking_id}", response_model=PatientResponse)
async def get_patient(
    tracking_id: str,
    _current_user=Depends(get_authenticated_user),
    db: Session = Depends(get_db),
):
    """Retrieve single patient by tracking ID; returns 404 if not found."""
    patient = db.query(Patient).filter(Patient.tracking_id == tracking_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found",
        )
    return patient


# Patient update endpoint
@router.patch("/{tracking_id}", response_model=PatientResponse)
async def update_patient(
    tracking_id: str,
    patient_update: PatientUpdate,
    _current_user=Depends(get_authenticated_user),
    db: Session = Depends(get_db),
):
    """Update patient fields by tracking ID; only provided fields are changed."""
    patient = db.query(Patient).filter(Patient.tracking_id == tracking_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found",
        )

    # Apply only the fields that were explicitly provided
    updates = patient_update.model_dump(exclude_unset=True)
    for field_name, value in updates.items():
        setattr(patient, field_name, value)

    # Update the timestamp
    patient.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(patient)
    return patient
