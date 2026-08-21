from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import schemas
import database
import models
from controllers import admin_controller



router = APIRouter(prefix="/admin", tags=["Admin"])

# ── Admin management ────────────────────────────────────────────
@router.get("/admins")
def get_admins(db: Session = Depends(database.get_db)):
    return admin_controller.get_admins(db)

@router.post("/admins")
def add_admin(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    return admin_controller.add_admin(user, db)

@router.post("/promote/{user_id}")
def promote_to_admin(user_id: int, db: Session = Depends(database.get_db)):
    return admin_controller.promote_to_admin(user_id, db)

@router.delete("/admins/{admin_id}")
def delete_admin(admin_id: int, requester_id: int, db: Session = Depends(database.get_db)):
    """Remove an admin. Only the super admin (requester) is allowed."""
    return admin_controller.delete_admin(admin_id, requester_id, db)

# ── Approvals ───────────────────────────────────────────────────
@router.get("/pending")
def get_pending_users(db: Session = Depends(database.get_db)):
    return admin_controller.get_pending_users(db)

@router.post("/approve/{user_id}")
def approve_user(user_id: int, db: Session = Depends(database.get_db)):
    return admin_controller.approve_user(user_id, db)

@router.post("/reject/{user_id}")
def reject_user(user_id: int, db: Session = Depends(database.get_db)):
    return admin_controller.reject_user(user_id, db)

def add_teacher(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    return admin_controller.add_teacher(user, db)

@router.post("/students")
def add_student(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    return admin_controller.add_student(user, db)

@router.get("/teachers")
def get_teachers(db: Session = Depends(database.get_db)):
    return admin_controller.get_teachers(db)

@router.get("/students")
def get_students(db: Session = Depends(database.get_db)):
    return admin_controller.get_students(db)

@router.get("/courses")
def get_courses(db: Session = Depends(database.get_db)):
    return admin_controller.get_courses(db)

@router.post("/courses")
def add_course(course: schemas.CourseCreate, db: Session = Depends(database.get_db)):
    return admin_controller.add_course(course, db)

@router.delete("/teachers/{teacher_id}")
def delete_teacher(teacher_id: int, db: Session = Depends(database.get_db)):
    return admin_controller.delete_teacher(teacher_id, db)

@router.delete("/students/{student_id}")
def delete_student(student_id: int, db: Session = Depends(database.get_db)):
    return admin_controller.delete_student(student_id, db)

@router.delete("/courses/{course_id}")
def delete_course(course_id: int, db: Session = Depends(database.get_db)):
    return admin_controller.delete_course(course_id, db)

# Calendar Event CRUD
@router.post("/calendar-events")
def create_calendar_event(payload: schemas.CalendarEventCreate, db: Session = Depends(database.get_db)):
    event = models.CalendarEvent(
        title=payload.title,
        description=payload.description,
        start_date=payload.start_date,
        end_date=payload.end_date,
        event_type=payload.event_type
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return {"message": "Calendar event created successfully", "id": event.id}

@router.delete("/calendar-events/{id}")
def delete_calendar_event(id: int, db: Session = Depends(database.get_db)):
    event = db.query(models.CalendarEvent).filter(models.CalendarEvent.id == id).first()
    if not event:
        return {"error": "Event not found"}
    db.delete(event)
    db.commit()
    return {"message": "Calendar event deleted successfully"}

@router.get("/calendar-events")
def get_calendar_events(db: Session = Depends(database.get_db)):
    events = db.query(models.CalendarEvent).order_by(models.CalendarEvent.start_date.asc()).all()
    results = []
    for e in events:
        results.append({
            "id": e.id,
            "title": e.title,
            "description": e.description,
            "start_date": e.start_date.isoformat() if e.start_date else None,
            "end_date": e.end_date.isoformat() if e.end_date else None,
            "event_type": e.event_type
        })
    return results


