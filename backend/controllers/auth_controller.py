from fastapi import HTTPException
from sqlalchemy.orm import Session
import schemas
import database
import auth
import models

def register_user(user: schemas.UserCreate, db: Session):
    existing = db.query(models.User).filter(models.User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    if user.role == "student" and (user.semester is None or int(user.semester) < 1):
        raise HTTPException(status_code=400, detail="Semester is required for student and must be >= 1")

    new_user = models.User(
        name=user.name,
        email=user.email,
        password=auth.hash_password(user.password),
        role=user.role,
        semester=int(user.semester) if user.role == "student" else None,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    # Create student/teacher row
    if user.role == "student":
        db.add(models.Student(user_id=new_user.id, semester=int(user.semester)))
        db.commit()
    elif user.role == "teacher":
        db.add(models.Teacher(user_id=new_user.id))
        db.commit()
    return {"message": "User registered", "id": new_user.id}

def login_user(user: schemas.UserLogin, db: Session):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or not auth.verify_password(user.password, db_user.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    return {"message": "Login successful", "user_id": db_user.id, "role": db_user.role}
