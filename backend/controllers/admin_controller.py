from fastapi import HTTPException
from sqlalchemy.orm import Session
import models
import schemas
import database
import auth

def add_teacher(user: schemas.UserCreate, db: Session):
    if user.role != "teacher":
        raise HTTPException(status_code=400, detail="Role must be teacher")
    teacher = models.User(
        name=user.name,
        email=user.email,
        password=auth.hash_password(user.password),
        role="teacher"
    )
    db.add(teacher)
    db.commit()
    db.refresh(teacher)
    return {"message": "Teacher added", "id": teacher.id}

def add_student(user: schemas.UserCreate, db: Session):
    if user.role != "student":
        raise HTTPException(status_code=400, detail="Role must be student")
    if user.semester is None or int(user.semester) < 1:
        raise HTTPException(status_code=400, detail="Semester is required for student and must be >= 1")
    student = models.User(
        name=user.name,
        email=user.email,
        password=auth.hash_password(user.password),
        role="student",
        semester=int(user.semester),
    )
    db.add(student)
    db.commit()
    db.refresh(student)
    # ensure student row exists
    db.add(models.Student(user_id=student.id, semester=int(user.semester)))
    db.commit()
    return {"message": "Student added", "id": student.id}
