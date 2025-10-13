from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
import models
import database
from routes import auth_routes, teacher_routes, student_routes, admin_routes

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Student Performance Tracker")

# Allow CORS for frontend
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# Use explicit dev origins to work with allow_credentials
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(auth_routes.router)
app.include_router(teacher_routes.router)
app.include_router(student_routes.router)
app.include_router(admin_routes.router)
