"""Password hashing and bearer token generation utilities."""

from datetime import datetime, timedelta
import secrets
import hashlib

# Token configuration
SECRET_KEY = "your-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7

# Password hashing
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

# Verify plaintext password against stored hash
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return hash_password(plain_password) == hashed_password

# Generate secure random token for session authentication
def generate_token(length: int = 32) -> str:
    return secrets.token_urlsafe(length)

# Get token expiry timestamp based on configuration
def get_token_expiry():
    return datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
