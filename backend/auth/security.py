import os
from datetime import datetime, timedelta, timezone
import bcrypt
import jwt


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))


def create_token(user_id: str, role: str) -> str:
    payload = {
        'sub': user_id,
        'role': role,
        'exp': datetime.now(timezone.utc) + timedelta(hours=8),
    }
    return jwt.encode(payload, os.getenv('JWT_SECRET'), algorithm='HS256')


def decode_token(token: str) -> dict:
    return jwt.decode(token, os.getenv('JWT_SECRET'), algorithms=['HS256'])
