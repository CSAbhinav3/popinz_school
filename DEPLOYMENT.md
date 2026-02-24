# Deployment Readiness

## Deploy on Render (recommended)

This repo includes a **Render Blueprint** (`render.yaml`) that provisions a Postgres database, the FastAPI backend, and the Vite frontend as a static site.

### 1. Push to GitHub

Ensure your code is in a GitHub (or GitLab) repo. Render deploys from Git.

### 2. Create a Render account and connect the repo

- Go to [render.com](https://render.com) and sign up / log in.
- **New → Blueprint**.
- Connect your Git provider and select the repository that contains this app.
- Render will detect `render.yaml` in the root.

### 3. Configure environment variables (required)

Before or right after the first deploy, set these in the **Render Dashboard**:

**Backend service (`preschool-backend`)**

- **CORS_ORIGINS** — Set to a JSON array of your frontend URL.  
  Example: `["https://preschool-frontend.onrender.com"]`  
  (Use the exact URL Render gives your frontend; replace with your custom domain if you add one.)

**Frontend service (`preschool-frontend`)**

- **VITE_API_URL** — Set to your backend API base URL (no trailing slash).  
  Example: `https://preschool-backend.onrender.com/api/v1`  
  (Use the URL from the backend service; it’s shown in the Render dashboard.)

**DATABASE_URL** and **SECRET_KEY** are set automatically by the Blueprint (Postgres connection and a generated secret).

### 4. Deploy

- Click **Apply** (or let Render deploy from the Blueprint).
- Wait for the database, backend, and frontend to finish deploying.
- If you added or changed **CORS_ORIGINS** or **VITE_API_URL** after the first deploy, trigger a **Manual Deploy** on the frontend (and backend if you changed CORS) so the new values are used.

### 5. Seed initial users (optional)

To create admin/teacher/parent users:

- In Render Dashboard, open the **preschool-backend** service.
- Go to **Shell** and run (from repo root):
  ```bash
  cd backend && python -m scripts.seed_users
  ```

### 6. URLs

- **Frontend:** `https://<preschool-frontend>.onrender.com`
- **Backend API:** `https://<preschool-backend>.onrender.com`  
  Docs: `https://<preschool-backend>.onrender.com/docs`

---

## Environment Variables (reference)

### Backend (`.env` locally; env vars on Render)

- `DATABASE_URL` – SQLite for dev: `sqlite+aiosqlite:///./playschool.db`. On Render, Postgres URL is provided (and auto-converted to `postgresql+asyncpg://`).
- `SECRET_KEY` – JWT secret (e.g. `openssl rand -hex 32`). On Render, can be generated.
- `CORS_ORIGINS` – Allowed frontend origins, e.g. `["https://your-app.onrender.com"]` (JSON array).

### Frontend

- `VITE_API_URL` – Backend API base URL. Default: `http://127.0.0.1:8000/api/v1`. For production set when building (e.g. in Render env: `https://preschool-backend.onrender.com/api/v1`).

## Build & Run (local)

### Backend

```bash
cd backend
pip install -r requirements.txt
# Set .env then:
uvicorn app.main:app --host 0.0.0.0 --port 8000
# Seed users (once): python -m scripts.seed_users
```

### Frontend

```bash
cd frontend
npm install
npm run build
# Serve build: e.g. npx serve dist
```

## Other platforms

- Deploy backend to Railway, Fly.io, or similar; attach a cloud DB (Postgres or MySQL).
- Deploy frontend (e.g. Vercel, Netlify, or Render static site) and set `VITE_API_URL` to your backend URL.
- Ensure backend `CORS_ORIGINS` includes the frontend origin.
