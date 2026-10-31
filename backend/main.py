from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.database import client
from backend.routers import auth, products, scans, admin as admin_router

app = FastAPI(title='FaceWise API')
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r'http://(localhost|127\.0\.0\.1)(:\d+)?',
    allow_methods=['*'],
    allow_headers=['*'],
)
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(scans.router)
app.include_router(admin_router.router)


@app.get('/')
def home():
    return {'status': 'FaceWise API running'}


@app.get('/health/db')
def health_db():
    client.admin.command('ping')
    return {'database': 'connected'}
