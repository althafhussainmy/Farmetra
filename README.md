# Krishi Bhavan Management System

Agricultural management platform connecting **Krishi Bhavan (admin)**, **farmers**, **workers**, and **users** with e-commerce, crop recommendations, work requests, and complaint handling.

## Tech stack

- **Backend:** Django 4.2 + Django REST Framework + JWT (Simple JWT)
- **Frontend:** React 18 + Vite + React Router + Tailwind CSS
- **Database:** SQLite (dev); switch to PostgreSQL for production
- **Crop recommendation:** Rule-based engine (extensible to ML/scikit-learn)

## Project structure

```
project/
├── backend/                 # Django project
│   ├── config/              # Settings, URLs
│   ├── users/               # Farmer, AppUser, Worker
│   ├── products/            # FarmingProduct, FarmerProduct, Review
│   ├── orders/              # Orders, cart, payments
│   ├── complaints/          # Complaints & replies
│   ├── workers/             # Work requests
│   └── crop_recommendation/ # Crop recommendation engine
├── frontend/                # React (Vite + Tailwind)
│   ├── src/
│   │   ├── components/      # Layout, Navbar
│   │   ├── context/         # AuthContext
│   │   ├── pages/           # Home, Login, Register, Products, Cart, etc.
│   │   └── services/        # api.js
│   └── package.json
├── docs/
│   └── API_DESIGN.md        # REST API reference
├── requirements.txt
└── README.md
```

## Setup

### 1. Virtual environment (recommended)

```bash
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/macOS
venv/bin/activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Run migrations

```bash
cd backend
python manage.py migrate
```

### 4. Create superuser (Krishi Bhavan admin)

```bash
python manage.py createsuperuser
```

### 5. Run server

```bash
python manage.py runserver
```

API base: `http://127.0.0.1:8000/api/`  
Django admin: `http://127.0.0.1:8000/admin/`

### 6. Frontend (optional)

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhthost:3000/**. The frontend proxies `/api` and `/media` to the Django server (port 8000), so run the backend first.

## API overview

- **Auth:** `POST /api/auth/register/farmer/`, `register/user/`, `register/worker/`, `POST /api/auth/token/`
- **Products:** `GET /api/products/farming/`, `GET /api/products/farmer-products/?farmer=<id>`
- **Orders:** `GET /api/orders/user-orders/`, `fp-orders/`, `cart/`
- **Complaints:** `GET|POST /api/complaints/`
- **Workers:** `GET /api/workers/`, `GET|POST /api/workers/requests/`, `PATCH .../approve/`, `.../reject/`
- **Crop recommendation:** `POST /api/crop-recommendation/` with `soil_type`, `water_availability`, `climate`, optional `ph`, `previous_crop`

See **docs/API_DESIGN.md** for full endpoint list and request/response details.

## Crop recommendation

Rule-based engine uses: **soil_type**, **water_availability**, **climate**, and optional **pH** and **previous_crop**. Returns a list of recommended crops with match reasons. Stored in `CropRecommendationRequest` for history. Designed for future ML (e.g. scikit-learn) integration.

## License

Use as per your project requirements.
