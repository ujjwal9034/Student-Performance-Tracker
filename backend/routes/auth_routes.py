from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session


import schemas
import database
from controllers import auth_controller

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register")
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    return auth_controller.register_user(user, db)

@router.post("/login")
def login(user: schemas.UserLogin, db: Session = Depends(database.get_db)):
    return auth_controller.login_user(user, db)
