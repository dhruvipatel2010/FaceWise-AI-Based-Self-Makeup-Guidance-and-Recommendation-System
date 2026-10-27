# FaceWise: AI-Based Self Makeup Guidance and Recommendation System

Read this file fully before changing any code. It is the single source of truth for the project.

## What we are building
A web app where a user scans their face live in the browser and gets makeup, skincare, haircut, hairstyle and hair-color suggestions. It has a User Panel and an Admin Panel. No separate mobile app.

## Tech stack (do not change without asking)
- Frontend: React.js + Vite, Tailwind CSS, React Router, Axios, Recharts
- Camera and face scan: browser `getUserMedia()` + MediaPipe Face Landmarker (`@mediapipe/tasks-vision`), runs in the browser
- Backend: Python + FastAPI, run from the repo root as `uvicorn backend.main:app --reload`
- Database: MongoDB (Atlas) through PyMongo. No PostgreSQL, no SQLAlchemy
- Images: Cloudinary (MongoDB stores only the image URL)
- Auth: JWT + bcrypt password hashing, roles `user` and `admin`
- AI/ML: rule-based recommendations first, then Scikit-learn. PyTorch or TensorFlow only later and only if a good dataset exists

## Folder structure
```
FaceWise/
  frontend/src/{components,pages,services}
  backend/{main.py,database.py,config.py,routers,schemas,services,models,auth}
  ai_models/{face_shape,skin_analysis,makeup_recommendation,hairstyle_recommendation,hair_color,training,evaluation}
  tests/
  .env  .env.example  .gitignore  README.md
```
`backend`, `backend/auth` and `backend/routers` must contain `__init__.py`.

## MongoDB collections
`users`, `user_preferences`, `products`, `product_attributes`, `face_scans`, `recommendations`, `saved_items`, `notifications`, `feedback`, `admin_logs`, `reports`.
Dates are stored as UTC datetimes. IDs are returned to the frontend as strings.

## Pages
User: Home, Login, Register, Dashboard, Makeup, Skincare, Hairdressing, Search, Features, Live Scan, Suggestions, Scan History, Favorites, Notifications, Feedback, Privacy Settings.
Admin: Login, Dashboard, Users, Makeup/Skincare/Hair products, Hairstyles, AI/ML models, Scan monitoring, Recommendations, Reports, Notifications, Feedback, Content, Audit logs, Settings.

## Design tokens (match the approved designs)
- Plum `#2A1B3D` (text, sidebar), Rose `#C23A61` (buttons), Lilac `#EFE9FA` (panels), Page `#F7F5FB` (background)
- Fonts: Bricolage Grotesque (headings, 700), DM Sans (body)
- Rounded cards (about 20px), pill buttons, minimum touch target 44px, real `<button>`, `<a>`, `<label>` elements

## Security and privacy rules (never break these)
1. Never commit `.env` or any secret. Keep `.env.example` with empty values.
2. Never store raw face images or video by default. Send only computed values (face shape and ratios) to the backend.
3. Ask for explicit consent before a scan is saved. The scan endpoint rejects `consent: false`.
4. Users can stop the camera at any time and can delete their account and data.
5. Passwords are hashed with bcrypt. Never log passwords or tokens.
6. Every admin route uses `require_admin`. Every admin action is written to `admin_logs`.
7. Skin results are limited visual guidance, never a medical diagnosis. Show a disclaimer.

## Working rules for the coding agent
- Do one phase or one task per request. Touch only the files that task needs.
- Do not install new libraries or rename files and folders without saying so first.
- Keep code simple and commented where the logic is not obvious. No unused code.
- After each task, list the files changed and give the exact steps to test it.
- If something is unclear, ask one question instead of guessing.
- Do not delete or rewrite working code to fix something unrelated.

## How to run locally
```
# backend (from repo root)
python -m venv .venv
.venv\Scripts\activate
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload      # docs at http://127.0.0.1:8000/docs

# frontend
cd frontend
npm install
npm run dev                            # http://localhost:5173
```
Environment variables: `MONGODB_URI`, `DATABASE_NAME`, `JWT_SECRET` (backend); `VITE_API_URL` (frontend).

## Build order
0 Setup, 1 Project folder and Git, 2 Backend base, 3 Auth, 4 Frontend setup, 5 Products and category pages, 6 Live camera and MediaPipe, 7 Face shape and recommendations, 8 History, favorites, feedback, notifications, 9 Admin panel, 10 Cloudinary images, 11 ML upgrade, 12 Virtual try-on, 13 Testing and privacy, 14 Deploy.

## Definition of done for any phase
The feature works end to end, there are no console or server errors, secrets are not exposed, and the "Done check" of that phase passes.
