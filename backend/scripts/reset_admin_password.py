import sys
from backend.auth.security import hash_password
from backend.database import db

email = sys.argv[1].strip().lower() if len(sys.argv) > 1 else 'd@gmail.com'
pwd = sys.argv[2] if len(sys.argv) > 2 else 'dhruvi1234'

res = db.users.update_one(
    {'email': email},
    {'$set': {'password_hash': hash_password(pwd), 'role': 'admin', 'status': 'active'}}
)
print(f'User {email} updated with password {pwd}. Matched: {res.matched_count}, Modified: {res.modified_count}')
