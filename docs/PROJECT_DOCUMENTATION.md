# Krishi Bhavan Management System – Project Documentation

Comprehensive guide for developing, running, and extending the platform that connects Krishi Bhavan officers (staff), farmers, workers, and end users for e‑commerce, work requests, complaints, and crop recommendations.

## 1. Technology Stack
- Backend: Django 4.2, Django REST Framework, Simple JWT, SQLite (dev) / PostgreSQL (prod ready).
- Frontend: React 18, Vite 5, Tailwind CSS, React Router, Axios.
- Runtime: Python 3.11+, Node.js 18+ (Vite 5 requirement).

## 2. Repository Layout
- `backend/` – Django project (`config`) and apps: `users`, `products`, `orders`, `complaints`, `workers`, `crop_recommendation`.
- `frontend/` – React app (Vite). Pages/components under `src/`.
- `docs/` – API design and project docs.
- `.env` / `.env.example` – Django environment variables.
- `requirements.txt` – Backend dependencies.

## 3. Backend (Django)
### 3.1 Prerequisites
- Python 3.11+
- pip

### 3.2 Setup
```bash
python -m venv venv
venv\Scripts\activate         # Windows
pip install -r requirements.txt
cd backend
python manage.py migrate
python manage.py createsuperuser   # Krishi Bhavan staff account
```

### 3.3 Environment Variables
Define in `.env` (already present for dev):
```
DJANGO_SECRET_KEY=django-insecure-123456789
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost
```
Add database settings if switching to PostgreSQL (see `backend/config/settings.py`).

### 3.4 Running
```bash
venv\Scripts\activate
cd backend
python manage.py runserver 127.0.0.1:8000
```
API base: `http://127.0.0.1:8000/api/`  
Admin: `http://127.0.0.1:8000/admin/`

### 3.5 Notable Apps & Roles
- `users`: Farmer, AppUser, Worker profiles; JWT auth; role/approval checks.
- `products`: Krishi Bhavan catalog + farmer-created listings; reviews.
- `orders`: User cart/checkout; farmer purchases from catalog; admin order views.
- `complaints`: User/farmer complaints with admin replies.
- `workers`: Worker directory; farmer → worker requests; worker approve/reject.
- `crop_recommendation`: Rule-based recommendations using soil, water, climate, pH, previous crop.

### 3.6 Testing
```bash
venv\Scripts\activate
cd backend
python manage.py test
```

## 4. Frontend (React + Vite)
### 4.1 Prerequisites
- Node.js 18+ (includes npm)

### 4.2 Setup & Scripts
```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 3000   # Dev server
npm run build                                 # Production build to dist/
npm run preview                               # Preview built site
```
Vite proxy (configured in `frontend/vite.config.js`) forwards `/api`, `/media`, `/admin` to `http://127.0.0.1:8000`—run the backend first.

### 4.3 Entry Points
- `src/main.jsx` – app bootstrap and router.
- `src/pages/` – views (Home, Login, Register, Products, Cart, etc.).
- `src/context/AuthContext.jsx` – auth state and token handling.
- `src/services/api.js` – Axios instance with JWT interceptors and REST helpers.

## 5. Authentication & Roles
- JWT (Simple JWT): obtain tokens via `POST /api/auth/token/` with `username`, `password`.
- Roles:
  - **Staff** (`is_staff=True`): Krishi Bhavan admins; manage catalog, approvals, complaints.
  - **Farmer**: needs approval to sell and send work requests.
  - **AppUser**: buys farmer products, reviews, complaints.
  - **Worker**: receives and responds to work requests.

## 6. API Reference
- Full endpoint table: `docs/API_DESIGN.md`.
- Base URL: `/api/`.
- Common endpoints:
  - Auth: `/auth/token/`, `/auth/token/refresh/`, `/auth/register/*`, `/auth/profile/*`
  - Products: `/products/farming/`, `/products/farmer-products/`
  - Orders: `/orders/cart/`, `/orders/checkout/`, `/orders/user-orders/`, `/orders/fp-orders/`
  - Complaints: `/complaints/`, `/complaints/<id>/reply/`
  - Workers: `/workers/`, `/workers/requests/`
  - Crop recommendation: `POST /crop-recommendation/`

## 7. Deployment Notes
- Switch to PostgreSQL; configure `DATABASES` in `config/settings.py` and set `ALLOWED_HOSTS`.
- Use `DEBUG=False`; set strong `DJANGO_SECRET_KEY`.
- Serve static/media via a proper web server (e.g., nginx) and configure `MEDIA_ROOT`/`STATIC_ROOT`.
- Build frontend (`npm run build`) and serve `frontend/dist` via nginx or a CDN; point it to backend API origin.

## 8. Troubleshooting
- **Frontend “spawn EPERM” on Windows**: run from an elevated shell, use `npm.cmd`, or ensure antivirus isn’t blocking `esbuild.exe`.
- **Proxy 404s**: confirm backend is running on `127.0.0.1:8000` and Vite proxy paths (`/api`, `/media`, `/admin`) match.
- **CORS/CSRF**: not needed for SPA when served from same origin via proxy; if hosting separately, enable CORS in Django.

## 9. Quick Start (TL;DR)
```bash
# Backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
cd backend && python manage.py migrate && python manage.py runserver 127.0.0.1:8000

# Frontend (new shell)
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 3000
```
Open http://127.0.0.1:3000 and log in with the superuser or a registered account.
