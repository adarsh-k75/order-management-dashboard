# Real-Time Order Management Dashboard

This is a clean, modern full-stack Order Management Dashboard application built with a FastAPI backend and a Next.js (App Router) frontend, utilizing WebSockets for instant state updates and PostgreSQL as the primary database.

---

## Environment Variables

### Backend Configuration (`backend/.env`)
Create a `.env` file inside the `backend/` folder:
```env
PORT=8000
SECRET_KEY=38e3e4a9e525ad2a25ff0f11de8c3be3dfcb469123bde874e0d9b4db9a099aa5
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/order_management
```

### Frontend Configuration (`frontend/.env.local`)
Create a `.env.local` file inside the `frontend/` folder:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
```

---

## Installation & Launch Steps

### 1. Run PostgreSQL using Docker
To start the database service locally, run:
```bash
cd backend
docker-compose up -d db
```
This runs a Postgres instance listening on `localhost:5432` with username `postgres`, password `postgres123`, and database name `order_management`.

### 2. Install and Run Backend
In the `backend/` folder, activate a virtual environment, install python libraries, and boot the server:

**For Windows (PowerShell)**:
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**For macOS / Linux**:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

*Note: Database tables are automatically initialized and configured on API startup. A default login user is seeded:*
* **Username**: `admin`
* **Password**: `admin123`

To run migrations manually using Alembic (Optional):
```bash
alembic upgrade head
```

### 3. Install and Run Frontend
In the `frontend/` folder, run npm install and boot Next.js in development mode:
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
