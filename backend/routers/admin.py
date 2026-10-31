"""
Admin router — user management, stats, audit logs, notifications, feedback, reports.
Every write action is recorded to admin_logs.
All endpoints require role == 'admin'.
"""
from datetime import datetime, timezone, timedelta

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from backend.database import db
from backend.routers.auth import require_admin

router = APIRouter(prefix='/admin', tags=['admin'])


# ── helpers ──────────────────────────────────────────────────────────────────

def _log(admin_id: str, action: str, collection: str = '', record_id: str = ''):
    """Write one entry to admin_logs."""
    db.admin_logs.insert_one({
        'admin_id': admin_id,
        'action': action,
        'target_collection': collection,
        'record_id': record_id,
        'created_at': datetime.now(timezone.utc),
    })


def _clean_user(doc: dict) -> dict:
    return {
        'id': str(doc['_id']),
        'name': doc.get('name', ''),
        'email': doc.get('email', ''),
        'role': doc.get('role', 'user'),
        'status': doc.get('status', 'active'),
    }


# ── dashboard stats ───────────────────────────────────────────────────────────

@router.get('/stats')
def get_stats(admin=Depends(require_admin)):
    """Return headline numbers for the admin dashboard."""
    total_users = db.users.count_documents({'role': 'user'})

    today_start = datetime.now(timezone.utc).replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    scans_today = db.face_scans.count_documents({'created_at': {'$gte': today_start}})

    total_recommendations = db.recommendations.count_documents({})

    open_feedback = db.feedback.count_documents({'read_by_admin': {'$ne': True}})

    return {
        'total_users': total_users,
        'scans_today': scans_today,
        'total_recommendations': total_recommendations,
        'open_feedback': open_feedback,
    }


@router.get('/scans/by-category')
def scans_by_category(admin=Depends(require_admin)):
    """Scan counts grouped by category for the Recharts bar chart."""
    pipeline = [
        {'$group': {'_id': '$category', 'count': {'$sum': 1}}},
    ]
    results = list(db.face_scans.aggregate(pipeline))
    # Ensure all three categories always appear
    counts = {'makeup': 0, 'skincare': 0, 'hairdressing': 0}
    for r in results:
        key = (r['_id'] or '').lower()
        if key in counts:
            counts[key] = r['count']
    return [{'category': k.capitalize(), 'scans': v} for k, v in counts.items()]


@router.get('/scans/recent')
def recent_scans(limit: int = Query(10, le=50), admin=Depends(require_admin)):
    """Most recent scans with joined user name for the dashboard table."""
    docs = list(
        db.face_scans.find().sort('created_at', -1).limit(limit)
    )
    rows = []
    for d in docs:
        user = db.users.find_one({'_id': ObjectId(d['user_id'])}) if d.get('user_id') else None
        rows.append({
            'id': str(d['_id']),
            'user_name': user['name'] if user else 'Unknown',
            'category': d.get('category', 'makeup'),
            'face_shape': d.get('face_shape', '—'),
            'created_at': d['created_at'].isoformat() if d.get('created_at') else '',
            'status': d.get('status', 'success'),
        })
    return rows


# ── user management ───────────────────────────────────────────────────────────

@router.get('/users')
def list_users(
    q: str | None = None,
    status: str | None = None,
    skip: int = 0,
    limit: int = Query(30, le=100),
    admin=Depends(require_admin),
):
    """Search and paginate all user accounts."""
    query: dict = {}
    if q:
        query['$or'] = [
            {'name': {'$regex': q, '$options': 'i'}},
            {'email': {'$regex': q, '$options': 'i'}},
        ]
    if status:
        query['status'] = status
    docs = db.users.find(query).skip(skip).limit(limit)
    total = db.users.count_documents(query)
    return {'total': total, 'users': [_clean_user(d) for d in docs]}


class UserStatusIn(BaseModel):
    status: str = Field(pattern=r'^(active|suspended)$')


@router.patch('/users/{user_id}/status')
def set_user_status(user_id: str, data: UserStatusIn, admin=Depends(require_admin)):
    """Activate or suspend a user account."""
    try:
        oid = ObjectId(user_id)
    except InvalidId:
        raise HTTPException(400, 'Invalid id')
    result = db.users.update_one({'_id': oid}, {'$set': {'status': data.status}})
    if not result.matched_count:
        raise HTTPException(404, 'User not found')
    _log(admin['sub'], f'set_user_status:{data.status}', 'users', user_id)
    return {'message': f'User status set to {data.status}'}


# ── notifications ─────────────────────────────────────────────────────────────

class NotifyIn(BaseModel):
    message: str = Field(min_length=1, max_length=500)
    target: str = Field(default='all')  # 'all' or a user_id string


@router.post('/notifications/send')
def send_notification(data: NotifyIn, admin=Depends(require_admin)):
    """Send a notification to all users or a specific user."""
    now = datetime.now(timezone.utc)
    if data.target == 'all':
        user_ids = [str(u['_id']) for u in db.users.find({'role': 'user'}, {'_id': 1})]
    else:
        user_ids = [data.target]

    if not user_ids:
        raise HTTPException(400, 'No users to notify')

    docs = [
        {'user_id': uid, 'message': data.message, 'read': False, 'created_at': now}
        for uid in user_ids
    ]
    db.notifications.insert_many(docs)
    _log(admin['sub'], 'send_notification', 'notifications')
    return {'sent': len(docs)}


# ── feedback management ───────────────────────────────────────────────────────

@router.get('/feedback')
def list_feedback(skip: int = 0, limit: int = Query(30, le=100), admin=Depends(require_admin)):
    """List all user feedback entries with user name."""
    docs = list(db.feedback.find().sort('created_at', -1).skip(skip).limit(limit))
    rows = []
    for d in docs:
        user = db.users.find_one({'_id': ObjectId(d['user_id'])}) if d.get('user_id') else None
        rows.append({
            'id': str(d['_id']),
            'user_name': user['name'] if user else 'Unknown',
            'rating': d.get('rating'),
            'text': d.get('text', ''),
            'read_by_admin': d.get('read_by_admin', False),
            'created_at': d.get('created_at', ''),
        })
    total = db.feedback.count_documents({})
    return {'total': total, 'feedback': rows}


@router.patch('/feedback/{feedback_id}/read')
def mark_feedback_read(feedback_id: str, admin=Depends(require_admin)):
    """Mark a feedback item as read by admin."""
    try:
        oid = ObjectId(feedback_id)
    except InvalidId:
        raise HTTPException(400, 'Invalid id')
    db.feedback.update_one({'_id': oid}, {'$set': {'read_by_admin': True}})
    return {'message': 'Marked as read'}


# ── audit logs ────────────────────────────────────────────────────────────────

@router.get('/logs')
def get_logs(skip: int = 0, limit: int = Query(50, le=200), admin=Depends(require_admin)):
    """Return recent admin audit log entries."""
    docs = list(db.admin_logs.find().sort('created_at', -1).skip(skip).limit(limit))
    total = db.admin_logs.count_documents({})
    rows = []
    for d in docs:
        rows.append({
            'id': str(d['_id']),
            'admin_id': d.get('admin_id', ''),
            'action': d.get('action', ''),
            'target_collection': d.get('target_collection', ''),
            'record_id': d.get('record_id', ''),
            'created_at': d['created_at'].isoformat() if d.get('created_at') else '',
        })
    return {'total': total, 'logs': rows}


# ── reports ───────────────────────────────────────────────────────────────────

@router.get('/reports/summary')
def report_summary(admin=Depends(require_admin)):
    """Aggregate summary for the reports page."""
    # Scans per day for last 7 days
    seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
    pipeline = [
        {'$match': {'created_at': {'$gte': seven_days_ago}}},
        {
            '$group': {
                '_id': {
                    '$dateToString': {'format': '%Y-%m-%d', 'date': '$created_at'}
                },
                'count': {'$sum': 1},
            }
        },
        {'$sort': {'_id': 1}},
    ]
    daily_scans = [{'date': r['_id'], 'scans': r['count']} for r in db.face_scans.aggregate(pipeline)]

    # Face shape breakdown
    shape_pipeline = [
        {'$group': {'_id': '$face_shape', 'count': {'$sum': 1}}},
        {'$sort': {'count': -1}},
    ]
    shape_dist = [{'shape': r['_id'], 'count': r['count']} for r in db.face_scans.aggregate(shape_pipeline)]

    return {
        'daily_scans': daily_scans,
        'face_shape_distribution': shape_dist,
        'total_users': db.users.count_documents({'role': 'user'}),
        'total_scans': db.face_scans.count_documents({}),
        'total_products': db.products.count_documents({}),
    }

