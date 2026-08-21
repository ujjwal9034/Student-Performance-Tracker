import os
from fastapi import HTTPException
from sqlalchemy.orm import Session
import models
import schemas
import database
import auth
from email_service import send_student_registration_email, send_teacher_registration_email

# ── Super Admin (cannot be removed or demoted by anyone else) ────
SUPER_ADMIN_EMAIL = os.getenv("SUPER_ADMIN_EMAIL", "ujjwalchauhan671@gmail.com")

def _assert_super_admin(requester_id: int, db: Session):
    """Raise 403 if the requester is not the super admin."""
    requester = db.query(models.User).filter(models.User.id == requester_id).first()
    if not requester or requester.email != SUPER_ADMIN_EMAIL:
        raise HTTPException(
            status_code=403,
            detail="Only the super admin can perform this action."
        )

def get_admins(db: Session):
    return db.query(models.User).filter(models.User.role == "admin").all()

def add_admin(user: schemas.UserCreate, db: Session):
    """Create a brand-new admin account (called by existing admin)."""
    existing = db.query(models.User).filter(models.User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")
    new_admin = models.User(
        name=user.name,
        email=user.email,
        password=auth.hash_password(user.password),
        role="admin",
    )
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)
    return {"message": "Admin account created", "id": new_admin.id}

def promote_to_admin(user_id: int, db: Session):
    """Promote an existing user (teacher/student) to admin role."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role == "admin":
        raise HTTPException(status_code=400, detail="User is already an admin")
    user.role = "admin"
    db.commit()
    db.refresh(user)
    return {"message": f"{user.name} has been promoted to admin", "id": user.id}

def delete_admin(admin_id: int, requester_id: int, db: Session):
    """Remove an admin account. Only the super admin can do this."""
    _assert_super_admin(requester_id, db)
    admin = db.query(models.User).filter(
        models.User.id == admin_id, models.User.role == "admin"
    ).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    if admin.email == SUPER_ADMIN_EMAIL:
        raise HTTPException(status_code=400, detail="The super admin account cannot be removed.")
    db.delete(admin)
    db.commit()
    return {"message": f"Admin '{admin.name}' has been removed."}


# ── Approvals ───────────────────────────────────────────────────
def get_pending_users(db: Session):
    return db.query(models.User).filter(models.User.is_approved == 0).all()

def approve_user(user_id: int, db: Session):
    user = db.query(models.User).filter(models.User.id == user_id, models.User.is_approved == 0).first()
    if not user:
        raise HTTPException(status_code=404, detail="Pending user not found")
    
    user.is_approved = 1
    db.commit()

    # Create role profile and send welcome email
    if user.role == "student":
        db.add(models.Student(user_id=user.id, semester=user.semester))
        db.commit()
        send_student_registration_email(name=user.name, email=user.email, semester=user.semester)
    elif user.role == "teacher":
        db.add(models.Teacher(user_id=user.id))
        db.commit()
        send_teacher_registration_email(name=user.name, email=user.email)

    return {"message": f"User {user.name} approved."}

def reject_user(user_id: int, db: Session):
    user = db.query(models.User).filter(models.User.id == user_id, models.User.is_approved == 0).first()
    if not user:
        raise HTTPException(status_code=404, detail="Pending user not found")
    
    db.delete(user)
    db.commit()
    return {"message": f"User {user.name} rejected and removed."}




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
    # Send welcome email to the teacher
    send_teacher_registration_email(name=teacher.name, email=teacher.email)
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
    # Send welcome email to the student
    send_student_registration_email(
        name=student.name,
        email=student.email,
        semester=int(user.semester),
    )
    return {"message": "Student added", "id": student.id}

def get_teachers(db: Session):
    return db.query(models.User).filter(models.User.role == "teacher").all()

def get_students(db: Session):
    return db.query(models.User).filter(models.User.role == "student").all()

def get_courses(db: Session):
    return db.query(models.Course).all()

def add_course(course: schemas.CourseCreate, db: Session):
    teacher = db.query(models.User).filter(models.User.id == course.teacher_id, models.User.role == "teacher").first()
    if not teacher:
        raise HTTPException(status_code=400, detail="Teacher not found")
    new_course = models.Course(
        name=course.name,
        teacher_id=course.teacher_id,
        semester=course.semester
    )
    db.add(new_course)
    db.commit()
    db.refresh(new_course)
    return {"message": "Course added", "id": new_course.id}

def delete_teacher(teacher_id: int, db: Session):
    teacher = db.query(models.User).filter(models.User.id == teacher_id, models.User.role == "teacher").first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    db.delete(teacher)
    db.commit()
    return {"message": "Teacher deleted"}

def delete_student(student_id: int, db: Session):
    student = db.query(models.User).filter(models.User.id == student_id, models.User.role == "student").first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    db.delete(student)
    db.commit()
    return {"message": "Student deleted"}

def delete_course(course_id: int, db: Session):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    db.delete(course)
    db.commit()
    return {"message": "Course deleted"}
