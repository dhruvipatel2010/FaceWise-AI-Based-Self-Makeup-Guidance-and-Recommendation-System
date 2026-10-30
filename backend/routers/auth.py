from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, Field

from backend.auth.security import create_token, decode_token, hash_password, verify_password
from backend.database import db

router = APIRouter(prefix='/auth', tags=['auth'])
bearer = HTTPBearer()


class RegisterIn(BaseModel):
    name: str = Field(min_length=2, max_length=60)
    email: str = Field(min_length=5, max_length=120)
    password: str = Field(min_length=8, max_length=72)


class LoginIn(BaseModel):
    email: str
    password: str


@router.post('/register')
def register(data: RegisterIn):
    email = data.email.strip().lower()
    if '@' not in email:
        raise HTTPException(400, 'Enter a valid email')
    if db.users.find_one({'email': email}):
        raise HTTPException(400, 'Email already registered')
    db.users.insert_one({
        'name': data.name.strip(),
        'email': email,
        'password_hash': hash_password(data.password),
        'role': 'user',
        'status': 'active',
    })
    return {'message': 'Registered'}


@router.post('/login')
def login(data: LoginIn):
    user = db.users.find_one({'email': data.email.strip().lower()})
    if not user or not verify_password(data.password, user['password_hash']):
        raise HTTPException(401, 'Invalid email or password')
    if user.get('status') != 'active':
        raise HTTPException(403, 'Account is not active')
    return {'token': create_token(str(user['_id']), user['role']), 'role': user['role']}


def current_user(cred: HTTPAuthorizationCredentials = Depends(bearer)):
    try:
        return decode_token(cred.credentials)
    except Exception:
        raise HTTPException(401, 'Invalid or expired token')


def require_admin(user=Depends(current_user)):
    if user['role'] != 'admin':
        raise HTTPException(403, 'Admin only')
    return user


@router.get('/me')
def me(user=Depends(current_user)):
    doc = db.users.find_one({'_id': ObjectId(user['sub'])})
    if not doc:
        raise HTTPException(404, 'User not found')
    return {'name': doc['name'], 'email': doc['email'], 'role': doc['role']}
