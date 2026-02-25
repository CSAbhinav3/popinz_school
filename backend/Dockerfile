# Play School Backend (FastAPI)
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Create data dir for SQLite (volume can be mounted here)
RUN mkdir -p /app/data

# Default: use SQLite in /app/data so it persists with a volume
ENV DATABASE_URL=sqlite+aiosqlite:///./data/playschool.db

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
