# Krishi Bhavan Management System – REST API Design

Base URL: `/api/`

Authentication: **JWT** (Bearer token). Obtain via `POST /api/auth/token/` with `username` and `password`.

---

## 1. Auth (`/api/auth/`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/token/` | Login (username, password) → access + refresh | No |
| POST | `/auth/token/refresh/` | Refresh access token | No |
| POST | `/auth/register/farmer/` | Register farmer (state: pending) | No |
| POST | `/auth/register/user/` | Register app user | No |
| POST | `/auth/register/worker/` | Register worker | No |
| GET/PUT/PATCH | `/auth/profile/farmer/` | Farmer profile | Farmer |
| GET/PUT/PATCH | `/auth/profile/user/` | App user profile | AppUser |
| GET/PUT/PATCH | `/auth/profile/worker/` | Worker profile | Worker |

**Register body (farmer/user/worker):** `username`, `password`, `email` (optional), `first_name`, `last_name`, `place`, `address`. Worker add: `skills`.

---

## 2. Products (`/api/products/`)

### Farming products (Krishi Bhavan catalog)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/products/farming/` | List farming products (paginated) | Any |
| GET | `/products/farming/<id>/` | Detail | Any |
| POST | `/products/farming/` | Create (admin) | Staff |
| PUT/PATCH | `/products/farming/<id>/` | Update | Staff |
| DELETE | `/products/farming/<id>/` | Delete | Staff |

### Farmer products (farmer listings)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/products/farmer-products/` | List (filter: farmer_id) | Any |
| GET | `/products/farmer-products/<id>/` | Detail | Any |
| POST | `/products/farmer-products/` | Create | Farmer (approved) |
| PUT/PATCH | `/products/farmer-products/<id>/` | Update (owner) | Farmer |
| DELETE | `/products/farmer-products/<id>/` | Delete (owner) | Farmer |

### Reviews

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/products/farmer-products/<id>/reviews/` | List reviews for product | Any |
| POST | `/products/farmer-products/<id>/reviews/` | Add/update review (user) | AppUser |

---

## 3. Orders (`/api/orders/`)

### User cart (farmer products)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/orders/cart/` | List cart items | AppUser |
| POST | `/orders/cart/` | Add to cart (farmer_product_id, quantity) | AppUser |
| PUT/PATCH | `/orders/cart/<id>/` | Update quantity | AppUser |
| DELETE | `/orders/cart/<id>/` | Remove from cart | AppUser |

### User orders (OrderMaster)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/orders/user-orders/` | List my orders | AppUser |
| GET | `/orders/user-orders/<id>/` | Order detail + payment | AppUser |
| POST | `/orders/checkout/` | Create order from cart + payment | AppUser |

### Farmer orders (FpOrderMaster – farmer buying from catalog)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/orders/fp-orders/` | List farmer’s FP orders | Farmer |
| GET | `/orders/fp-orders/<id>/` | FP order detail + payment | Farmer |
| POST | `/orders/fp-orders/` | Create FP order (items, total) | Farmer |

### Admin: view all orders / payments

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/orders/admin/user-orders/` | All user orders | Staff |
| GET | `/orders/admin/fp-orders/` | All FP orders | Staff |

---

## 4. Complaints (`/api/complaints/`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/complaints/` | My complaints | Farmer / AppUser |
| POST | `/complaints/` | Send complaint (complaint text) | Farmer / AppUser |
| GET | `/complaints/<id>/` | Complaint detail (with reply) | Sender |
| GET | `/complaints/admin/` | List all complaints | Staff |
| PATCH | `/complaints/<id>/reply/` | Set reply (admin) | Staff |

---

## 5. Workers & work requests (`/api/workers/`)

### Workers (for farmers)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/workers/` | List workers (filter: place, skills) | Farmer |

### Work requests

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/workers/requests/` | My work requests (farmer: sent; worker: received) | Farmer / Worker |
| POST | `/workers/requests/` | Send request (worker_id, work_description, wage) | Farmer |
| PATCH | `/workers/requests/<id>/approve/` | Approve | Worker |
| PATCH | `/workers/requests/<id>/reject/` | Reject | Worker |

---

## 6. Crop recommendation (`/api/crop-recommendation/`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/crop-recommendation/` | Get recommendations | Authenticated |

**Body:** `soil_type`, `water_availability`, `climate`, `ph` (optional), `previous_crop` (optional).

**Response:** `{ "recommendations": [ { "crop": "...", "match_reason": "..." }, ... ] }`

---

## Role summary

- **Staff:** Krishi Bhavan (Django `is_staff=True`).
- **Farmer:** Has `Farmer` profile; must be `state=approved` to sell and send work requests.
- **AppUser:** Has `AppUser` profile; can buy, cart, review, complain.
- **Worker:** Has `Worker` profile; can approve/reject work requests.

Implement permission checks in DRF views (e.g. `IsAdminUser`, custom `IsApprovedFarmer`, or role-based permission classes).
