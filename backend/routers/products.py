import re

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from backend.database import db
from backend.routers.auth import require_admin

router = APIRouter(prefix='/products', tags=['products'])

CATEGORIES = {'makeup', 'skincare', 'hair'}


class ProductIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    brand: str = Field(default='', max_length=80)
    category: str
    price: float = Field(ge=0)
    image_url: str = Field(default='', max_length=500)
    description: str = Field(default='', max_length=500)


def clean(doc):
    doc['id'] = str(doc.pop('_id'))
    return doc


@router.get('')
def list_products(category: str | None = None, q: str | None = None):
    query = {}
    if category:
        if category not in CATEGORIES:
            raise HTTPException(400, 'Unknown category')
        query['category'] = category
    if q:
        query['name'] = {'$regex': re.escape(q.strip()), '$options': 'i'}
    return [clean(p) for p in db.products.find(query).sort('name', 1).limit(60)]


@router.post('')
def add_product(data: ProductIn, admin=Depends(require_admin)):
    if data.category not in CATEGORIES:
        raise HTTPException(400, 'Category must be makeup, skincare or hair')
    result = db.products.insert_one(data.model_dump())
    return {'id': str(result.inserted_id)}
