from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.database import client
from backend.routers import auth

app = FastAPI(title='FaceWise API')
app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:5173'],
    allow_methods=['*'],
    allow_headers=['*'],
)
app.include_router(auth.router)


@app.get('/')
def home():
    return {'status': 'FaceWise API running'}


@app.get('/health/db')
def health_db():
    client.admin.command('ping')
    return {'database': 'connected'}
