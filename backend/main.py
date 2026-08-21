from dotenv import load_dotenv
load_dotenv(override=True)


from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
import models
import database
from routes import auth_routes, teacher_routes, student_routes, admin_routes, report_routes
import os
from fastapi.staticfiles import StaticFiles

# Ensure tables are created first
models.Base.metadata.create_all(bind=database.engine)

# Seed default admin if not exists
try:
    import auth
    db_session = next(database.get_db())
    EMAIL = os.getenv("SUPER_ADMIN_EMAIL", "ujjwalchauhan671@gmail.com")
    PASSWORD = os.getenv("SUPER_ADMIN_PASSWORD", "admin123")
    NAME = os.getenv("SUPER_ADMIN_NAME", "Ujjwal Chauhan")
    existing_admin = db_session.query(models.User).filter(models.User.email == EMAIL).first()
    if not existing_admin:
        admin_user = models.User(
            name=NAME,
            email=EMAIL,
            password=auth.hash_password(PASSWORD),
            role="admin",
        )
        db_session.add(admin_user)
        db_session.commit()
        print(f"[OK] Seeded admin account: {EMAIL}")
    else:
        print(f"[INFO] Admin account already exists: {EMAIL}")
except Exception as e:
    print(f"[ERROR] Failed to seed admin user: {e}")

# Dynamic DB migration to add new bio & profile_pic columns to sqlite db if they do not exist
try:
    with database.engine.begin() as conn:
        # SQLite needs manual ALTER statements since Base.metadata.create_all won't add columns to existing tables
        conn.execute("ALTER TABLE users ADD COLUMN bio TEXT")
except Exception:
    # Ignore if column already exists
    pass

try:
    with database.engine.begin() as conn:
        conn.execute("ALTER TABLE users ADD COLUMN profile_pic VARCHAR(255)")
except Exception:
    pass

# Ensure profile pic directory exists
os.makedirs("static/profile_pics", exist_ok=True)

app = FastAPI(title="Student Performance Tracker")
app.mount("/static", StaticFiles(directory="static"), name="static")

# Allow CORS for frontend
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5175",
    "http://localhost:5176",
    "https://student-performance-tracker-v2.vercel.app",
]
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    origins.append(frontend_url)

# Use explicit dev origins to work with allow_credentials
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health Check Root Endpoint
@app.get("/")
def health_check():
    return {"status": "healthy", "message": "Student Performance Tracker API is awake"}

# Routes
app.include_router(auth_routes.router)
app.include_router(teacher_routes.router)
app.include_router(student_routes.router)
app.include_router(admin_routes.router)
app.include_router(report_routes.router)

