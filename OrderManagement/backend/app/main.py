from fastapi import FastAPI, Request, status, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.auth import router as auth_router
from app.api.orders import router as orders_router
from app.core.config import settings
from app.database.database import engine, Base, SessionLocal
from app.models.user import User
from app.core.security import get_password_hash
from app.websocket.manager import manager

# Create the FastAPI app instance
app = FastAPI(
    title="Order Management API",
    description="Real-Time Order Management Dashboard Backend API built with FastAPI",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS (Cross-Origin Resource Sharing) middleware configuration
# This allows the Next.js frontend to securely query the API from a different origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev simplicity, allow all. In production, restrict to frontend domain.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers directly to support /login and /orders exact URL specifications
app.include_router(auth_router)
app.include_router(orders_router)

# WebSocket Endpoint for real-time order updates
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """Establishes and keeps alive a real-time WebSocket connection to broadcast status updates."""
    await manager.connect(websocket)
    try:
        while True:
            # Wait for any message from the client. This keeps the connection alive
            # and detects client disconnects gracefully.
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)

# ----------------------------------------------------
# ERROR HANDLING
# ----------------------------------------------------

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Formats standard HTTPExceptions (like 404 or 401) to match the structured JSON schema."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": exc.detail,
            "data": None
        }
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handles Pydantic validation errors, turning them into a clean structured response."""
    errors = exc.errors()
    # Format error location and message for easy API consumer debugging
    detail_messages = [f"{'.'.join(str(loc) for loc in err['loc'])}: {err['msg']}" for err in errors]
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "message": "Input validation failed",
            "data": detail_messages
        }
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global catch-all for unhandled exceptions to prevent crashing and return standard JSON error structures."""
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": f"An unexpected server error occurred: {str(exc)}",
            "data": None
        }
    )

# ----------------------------------------------------
# DATABASE INITIALIZATION & SEEDING ON STARTUP
# ----------------------------------------------------

@app.on_event("startup")
def startup_event():
    """Execute startup logic: ensure database tables exist and seed the default admin account."""
    # Ensure tables exist (Alembic can also migrate, but this ensures a seamless out-of-the-box local setup)
    Base.metadata.create_all(bind=engine)
    
    # Check and seed default user credentials
    db = SessionLocal()
    try:
        default_admin = db.query(User).filter(User.username == "admin").first()
        if not default_admin:
            hashed_password = get_password_hash("admin123")
            admin_user = User(username="admin", hashed_password=hashed_password)
            db.add(admin_user)
            db.commit()
            print("----------------------------------------------------------------------")
            print("Default admin user created successfully (username: admin, password: admin123).")
            print("----------------------------------------------------------------------")
    finally:
        db.close()
