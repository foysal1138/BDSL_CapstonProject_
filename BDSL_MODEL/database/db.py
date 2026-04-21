import sqlite3
import os
from datetime import datetime
import hashlib

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'bdsl.db')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def _hash_password(password):
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'doctor',
        is_active BOOLEAN NOT NULL DEFAULT 1,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )''')
    
    cursor.execute('''CREATE INDEX IF NOT EXISTS ix_users_email ON users(email)''')
    
    cursor.execute('''CREATE TABLE IF NOT EXISTS patients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tracking_id VARCHAR(64) UNIQUE NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        gender VARCHAR(20) NOT NULL,
        age INTEGER NOT NULL,
        date_of_birth DATETIME NOT NULL,
        address VARCHAR(255) NOT NULL,
        nid_birth_cert VARCHAR(100) UNIQUE NOT NULL,
        blood_group VARCHAR(10) NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )''')
    
    cursor.execute('''CREATE INDEX IF NOT EXISTS ix_patients_tracking_id ON patients(tracking_id)''')
    cursor.execute('''CREATE INDEX IF NOT EXISTS ix_patients_nid_birth_cert ON patients(nid_birth_cert)''')
    
    cursor.execute('''CREATE TABLE IF NOT EXISTS predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        detected_sign VARCHAR(50) NOT NULL,
        sign_meaning VARCHAR(100),
        confidence FLOAT NOT NULL,
        all_probabilities VARCHAR(500),
        timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )''')
    
    conn.commit()
    conn.close()

def insert_prediction(user_id, detected_sign, confidence, probabilities=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''INSERT INTO predictions (user_id, detected_sign, confidence, all_probabilities, timestamp)
                      VALUES (?, ?, ?, ?, ?)''',
                   (user_id, detected_sign, confidence, probabilities, datetime.now()))
    conn.commit()
    conn.close()

def get_patient(tracking_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM patients WHERE tracking_id = ?', (tracking_id,))
    patient = cursor.fetchone()
    conn.close()
    return dict(patient) if patient else None

def insert_patient(tracking_id, first_name, last_name, gender, age, date_of_birth, address, nid_birth_cert, blood_group):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''INSERT INTO patients (tracking_id, first_name, last_name, gender, age, date_of_birth, address, nid_birth_cert, blood_group)
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
                   (tracking_id, first_name, last_name, gender, age, date_of_birth, address, nid_birth_cert, blood_group))
    conn.commit()
    patient_id = cursor.lastrowid
    conn.close()
    return patient_id

def get_all_patients():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM patients ORDER BY created_at DESC')
    patients = cursor.fetchall()
    conn.close()
    return [dict(p) for p in patients]

def get_predictions(user_id, limit=100):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM predictions WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?',
                   (user_id, limit))
    predictions = cursor.fetchall()
    conn.close()
    return [dict(p) for p in predictions]


def create_user(email, password, role="doctor"):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        '''INSERT INTO users (email, password, role, is_active) VALUES (?, ?, ?, 1)''',
        (email, _hash_password(password), role),
    )
    conn.commit()
    user_id = cursor.lastrowid
    conn.close()
    return user_id


def get_user_by_email(email):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE email = ? AND is_active = 1', (email,))
    user = cursor.fetchone()
    conn.close()
    return dict(user) if user else None


def verify_user(email, password):
    user = get_user_by_email(email)
    if not user:
        return None
    if user["password"] != _hash_password(password):
        return None
    return user
