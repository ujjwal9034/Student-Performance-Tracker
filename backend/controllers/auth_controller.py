from fastapi import HTTPException
from sqlalchemy.orm import Session
import schemas
import database
import auth
import models
from email_service import send_student_registration_email, send_teacher_registration_email, send_password_reset_email
import uuid
from datetime import datetime, timedelta

def register_user(user: schemas.UserCreate, db: Session):
    if user.role == "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin registration is not allowed via this endpoint."
        )

    existing = db.query(models.User).filter(models.User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    if user.role == "student" and (user.semester is None or int(user.semester) < 1):
        raise HTTPException(status_code=400, detail="Semester is required for student and must be >= 1")

    # Save to database but mark as unapproved
    new_user = models.User(
        name=user.name,
        email=user.email,
        password=auth.hash_password(user.password),
        role=user.role,
        semester=int(user.semester) if user.role == "student" else None,
        is_approved=0  # Pending admin approval
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Do NOT send welcome emails yet. They will be sent upon approval by Admin.
    return {"message": "Account created and pending admin approval.", "id": new_user.id}

def login_user(user: schemas.UserLogin, db: Session):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or not auth.verify_password(user.password, db_user.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    if getattr(db_user, "is_approved", 1) == 0:
        raise HTTPException(status_code=403, detail="Your account is pending admin approval. Please wait or contact support.")
    return {"message": "Login successful", "user_id": db_user.id, "name": db_user.name, "role": db_user.role, "semester": db_user.semester, "profile_pic": db_user.profile_pic}

def change_password(payload: schemas.ChangePassword, db: Session):
    db_user = db.query(models.User).filter(models.User.id == payload.user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not auth.verify_password(payload.old_password, db_user.password):
        raise HTTPException(status_code=400, detail="Incorrect current password")
    
    db_user.password = auth.hash_password(payload.new_password)
    db.commit()
    
    return {"message": "Password updated successfully!"}

def forgot_password(payload: schemas.ForgotPassword, db: Session):
    db_user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not db_user:
        # For security, do not reveal if the email exists or not
        return {"message": "If that email exists, a password reset link has been sent."}
    
    # Generate token
    token = uuid.uuid4().hex
    db_user.reset_token = token
    db_user.reset_token_expiry = datetime.utcnow() + timedelta(minutes=15)
    db.commit()
    
    # In a real app we'd construct this frontend URL based on environment.
    frontend_url = "http://localhost:5173"
    reset_link = f"{frontend_url}/reset-password?token={token}"
    
    send_password_reset_email(email=db_user.email, reset_link=reset_link)
    return {"message": "If that email exists, a password reset link has been sent."}

def reset_password(payload: schemas.ResetPassword, db: Session):
    db_user = db.query(models.User).filter(models.User.reset_token == payload.token).first()
    
    if not db_user or not db_user.reset_token_expiry:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token.")
    
    if datetime.utcnow() > db_user.reset_token_expiry:
        raise HTTPException(status_code=400, detail="Reset token has expired.")
        
    db_user.password = auth.hash_password(payload.new_password)
    db_user.reset_token = None
    db_user.reset_token_expiry = None
    db.commit()
    
    return {"message": "Password has been successfully reset. You can now login."}
