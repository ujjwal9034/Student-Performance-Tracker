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

@router.post("/change-password")
def change_password(payload: schemas.ChangePassword, db: Session = Depends(database.get_db)):
    return auth_controller.change_password(payload, db)

@router.post("/forgot-password")
def forgot_password(payload: schemas.ForgotPassword, db: Session = Depends(database.get_db)):
    return auth_controller.forgot_password(payload, db)

@router.post("/reset-password")
def reset_password(payload: schemas.ResetPassword, db: Session = Depends(database.get_db)):
    return auth_controller.reset_password(payload, db)
