# Host the app so anyone can access it

You need **two** URLs: one for the frontend (the website users open) and one for the backend (the API).  
Frontend is hosted on **Vercel**, backend on **Render**. Both have free tiers.

---

## 1. Deploy backend (Render)

1. Go to [render.com](https://render.com) and sign in (e.g. with GitHub).
2. **New → Web Service**.
3. Connect the repo **CSAbhinav3/popinz_school** (or your fork).
4. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Runtime:** Python 3
5. **Environment variables** (in Render dashboard):
   - `SECRET_KEY` — use a long random string (e.g. run `openssl rand -hex 32` locally and paste).
   - `CORS_ORIGINS` — set to your **frontend** URL as JSON, e.g.  
     `["https://your-app-name.vercel.app"]`  
     (Replace with your real Vercel URL after step 2. You can add it later and redeploy.)
   - `DATABASE_URL` — leave empty to use SQLite (data may reset on redeploy). For a persistent DB, create a Render **PostgreSQL** and paste its URL.
6. Click **Create Web Service**. Wait for the first deploy.
7. Copy your backend URL, e.g. **`https://preschool-api.onrender.com`**.  
   The API base is that URL + `/api/v1` (e.g. `https://preschool-api.onrender.com/api/v1`).

---

## 2. Deploy frontend (Vercel)

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. **Add New → Project** and import **popinz_school** (or your repo).
3. Leave **Root Directory** empty (repo root). Build settings are read from `vercel.json`.
4. **Environment variables:**
   - Name: `VITE_API_URL`  
   - Value: your **backend API** URL, e.g. `https://preschool-api.onrender.com/api/v1`
5. Deploy. When it’s done, Vercel gives you a URL like **`https://popinz-school.vercel.app`**.

---

## 3. Point backend at the frontend (CORS)

1. In **Render** → your backend service → **Environment**.
2. Set (or update) **CORS_ORIGINS** to your **Vercel** URL as JSON, e.g.:  
   `["https://popinz-school.vercel.app"]`
3. Save and let the service **redeploy**.

---

## 4. Share the link

Give users the **Vercel** link (e.g. `https://popinz-school.vercel.app`).  
That’s the app; the backend URL is only for API calls from the frontend.

---

## Quick reference

| What        | Where   | URL you get                          |
|------------|---------|--------------------------------------|
| Frontend   | Vercel  | `https://<project>.vercel.app`       |
| Backend API | Render | `https://<service>.onrender.com/api/v1` |

- **Frontend** needs `VITE_API_URL` = backend API URL.
- **Backend** needs `CORS_ORIGINS` = `["https://<your-vercel-url>"]` and a strong `SECRET_KEY`.
