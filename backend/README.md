# Play School Management System - Backend

Production-ready FastAPI backend with PostgreSQL, JWT authentication, role-based access (Admin, Teacher, Parent), QR-based attendance, and analytics.

## Features

- **JWT authentication**: Access + refresh tokens, configurable expiry
- **Roles**: Admin, Teacher, Parent with role middleware and dependency checks
- **QR attendance**: Teachers generate time-limited QR tokens; parents mark attendance only for their own child; single-use tokens with replay protection
- **CRUD**: Users (admin), Students, Activities, Attendance, Feedback with validation
- **Analytics**: Dashboard and attendance analytics for teachers/admin
- **Security**: Bcrypt password hashing, token validation, CORS

## Project structure (clean / modular)

```
backend/
├── app/
│   ├── main.py           # FastAPI app, CORS, lifespan
│   ├── config.py         # Pydantic settings
│   ├── database.py       # Async engine, session, get_db
│   ├── core/
│   │   ├── security.py   # JWT, password hashing
│   │   ├── dependencies.py  # get_current_user, require_roles
│   │   └── middleware.py   # Timing middleware
│   ├── models/           # SQLAlchemy ORM
│   ├── schemas/          # Pydantic request/response
│   ├── api/v1/           # Route modules
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── students.py
│   │   ├── activities.py
│   │   ├── attendance.py  # QR generate, mark, list, analytics
│   │   ├── feedback.py
│   │   ├── analytics.py   # Dashboard
│   │   └── router.py      # Aggregates routes
│   └── utils/
│       └── qr_token.py    # QR generate/validate, replay protection
├── requirements.txt
├── .env.example
└── README.md
```

## Setup

### 1. Python environment

```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# Linux/macOS
source .venv/bin/activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. MySQL

Create the database (in MySQL client or phpMyAdmin):

```sql
CREATE DATABASE playschool CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Set `DATABASE_URL` in `.env` (see `.env.example`). If your password contains `@` or `#`, URL-encode them as `%40` or `%23`.

### 4. Environment

```bash
cp .env.example .env
# Edit .env with your DATABASE_URL and SECRET_KEY
```

### 5. Run

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- API: http://localhost:8000  
- Swagger: http://localhost:8000/docs  
- ReDoc: http://localhost:8000/redoc  

### 6. Create first users (no real email needed)

You don't need real Gmail or email accounts. The app uses email only as a login ID. Seed default admin, teacher, and parent accounts:

```bash
# From the backend directory
py -m scripts.seed_users
```

This creates:

| Email               | Password  | Role    |
|---------------------|-----------|---------|
| admin@poppinz.com   | Admin123  | admin   |
| teacher@poppinz.com | Teacher1  | teacher |
| parent@poppinz.com   | Parent123 | parent  |

Use these on the website **Login** page. Change passwords in production.

| Area        | Endpoints |
|------------|-----------|
| Auth       | `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `GET /api/v1/auth/me` |
| Users      | `GET/POST /api/v1/users`, `GET/PATCH/DELETE /api/v1/users/{id}` (admin) |
| Students   | Full CRUD; parents see only their children |
| Activities | Full CRUD (teacher/admin); parents list/view |
| Attendance | `POST /api/v1/attendance/qr/generate`, `POST /api/v1/attendance/mark`, `GET /api/v1/attendance`, `POST /api/v1/attendance/manual`, `GET /api/v1/attendance/analytics/summary`, `GET /api/v1/attendance/analytics/daily` |
| Feedback   | Full CRUD (parents for their own) |
| Analytics  | `GET /api/v1/analytics/dashboard`, `GET /api/v1/analytics/activities/summary` (teacher/admin) |

## QR attendance flow

1. **Teacher/Admin**: `POST /api/v1/attendance/qr/generate` → receives `qr_token` and `expires_at`.
2. Display QR (encode `qr_token` in a QR code) for the session.
3. **Parent**: Scans QR, then `POST /api/v1/attendance/mark` with `qr_token` and `student_id` (only their child). Token is validated (signature, expiry, single-use); one attendance per student per day.

## Security notes

- Set strong `SECRET_KEY` and `QR_SECRET_KEY` in production.
- Use HTTPS in production.
- Passwords are hashed with bcrypt.
- JWT access tokens expire; refresh tokens can be used to get new access tokens (refresh endpoint can be extended as needed).
