from datetime import datetime, timezone
from typing import Literal

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from backend.database import db
from backend.routers.auth import current_user

router = APIRouter(prefix='/scans', tags=['scans'])


class ScanIn(BaseModel):
    face_shape: Literal['Oval', 'Round', 'Square', 'Heart', 'Oblong']
    ratio: float = Field(ge=0.5, le=3)
    skin_tone: Literal['Light', 'Medium', 'Deep'] | None = None
    category: Literal['makeup', 'skincare', 'hairdressing'] = 'makeup'
    consent: bool


def clean(doc):
    return {
        'id': str(doc['_id']),
        'face_shape': doc['face_shape'],
        'ratio': doc['ratio'],
        'skin_tone': doc.get('skin_tone'),
        'created_at': doc['created_at'].isoformat(),
    }


@router.post('')
def save_scan(data: ScanIn, user=Depends(current_user)):
    if not data.consent:
        raise HTTPException(400, 'Consent is required to save a scan')
    result = db.face_scans.insert_one({
        'user_id': user['sub'],
        'face_shape': data.face_shape,
        'ratio': data.ratio,
        'skin_tone': data.skin_tone,
        'category': data.category,
        'consent': True,
        'status': 'success',
        'created_at': datetime.now(timezone.utc),
    })
    return {'id': str(result.inserted_id)}


@router.get('')
def my_scans(user=Depends(current_user)):
    docs = db.face_scans.find({'user_id': user['sub']}).sort('created_at', -1).limit(50)
    return [clean(d) for d in docs]


@router.delete('/{scan_id}')
def delete_scan(scan_id: str, user=Depends(current_user)):
    try:
        oid = ObjectId(scan_id)
    except InvalidId:
        raise HTTPException(400, 'Invalid id')
    result = db.face_scans.delete_one({'_id': oid, 'user_id': user['sub']})
    if not result.deleted_count:
        raise HTTPException(404, 'Scan not found')
    return {'message': 'Deleted'}
