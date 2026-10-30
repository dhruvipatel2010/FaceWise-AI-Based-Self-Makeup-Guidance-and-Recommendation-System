import sys

from backend.database import db

if len(sys.argv) != 2:
    print('Usage: python -m backend.scripts.make_admin user@example.com')
    sys.exit(1)

email = sys.argv[1].strip().lower()
result = db.users.update_one({'email': email}, {'$set': {'role': 'admin'}})
print('Admin set' if result.matched_count else 'No user with that email')
