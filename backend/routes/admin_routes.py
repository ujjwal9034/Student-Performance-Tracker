from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import schemas
import database
from controllers import admin_controller



router = APIRouter(prefix="/admin", tags=["Admin"])

@router.post("/teachers")
def add_teacher(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    return admin_controller.add_teacher(user, db)

@router.post("/students")
def add_student(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    return admin_controller.add_student(user, db)
