from fastapi import APIRouter, Depends, Query, File, UploadFile, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date
import os
import uuid
import shutil

import schemas
import database
import models
from controllers import student_controller

router = APIRouter(prefix="/student", tags=["Student"])

# Attendance routes
@router.get("/{student_id}/attendance")
def get_attendance(student_id: int, db: Session = Depends(database.get_db)):
    return student_controller.get_attendance(student_id, db)

@router.get("/{student_id}/attendance/summary")
def get_attendance_summary(student_id: int, db: Session = Depends(database.get_db)):
    return student_controller.get_attendance_summary(student_id, db)

@router.get("/{student_id}/attendance/by-date")
def get_attendance_by_date(student_id: int, date_value: date, db: Session = Depends(database.get_db)):
    return student_controller.get_attendance_by_date(student_id, date_value, db)

@router.get("/{student_id}/attendance/by-course-date")
def get_attendance_by_course_and_date(student_id: int, course_id: int, date_value: date, db: Session = Depends(database.get_db)):
    """Get attendance status for specific student, course, and date."""
    return student_controller.get_attendance_by_course_and_date(student_id, course_id, date_value, db)

@router.get("/{student_id}/attendance/by-course-month")
def attendance_by_course_month(
    student_id: int,
    course_id: int = Query(...),
    year: int = Query(...),
    month: int = Query(...),
    db: Session = Depends(database.get_db)
):
    return student_controller.get_attendance_by_course_and_month(student_id, course_id, year, month, db)

@router.get("/{student_id}/attendance/trend")
def get_attendance_trend(student_id: int, db: Session = Depends(database.get_db), course_id: Optional[int] = None):
    return student_controller.get_attendance_trend(student_id, db, course_id)

# Grades routes
@router.get("/{student_id}/grades/{semester}")
def get_grades(student_id: int, semester: int, db: Session = Depends(database.get_db)):
    return student_controller.get_grades_by_semester(student_id, semester, db)

@router.get("/{student_id}/grades/summary/{semester}")
def get_grades_summary(student_id: int, semester: int, show_mid: bool = True, show_end: bool = True, db: Session = Depends(database.get_db)):
    return student_controller.get_grades_summary_by_semester(student_id, semester, db, show_mid, show_end)

# Courses route
@router.get("/{student_id}/courses")
def get_enrolled_courses(student_id: int, db: Session = Depends(database.get_db)):
    return student_controller.get_enrolled_courses(student_id, db)

# Issues route
@router.post("/issues")
def raise_issue(issue: schemas.IssueCreate, db: Session = Depends(database.get_db)):
    return student_controller.raise_issue(issue, db)

@router.get("/{student_id}/issues")
def get_student_issues(student_id: int, db: Session = Depends(database.get_db)):
    return student_controller.get_student_issues(student_id, db)

@router.get("/{student_id}/attendance/heatmap")
def get_attendance_heatmap(student_id: int, db: Session = Depends(database.get_db)):
    return student_controller.get_attendance_heatmap(student_id, db)

@router.get("/{student_id}/announcements")
def get_student_announcements(student_id: int, db: Session = Depends(database.get_db)):
    enrolled_courses = student_controller.get_enrolled_courses(student_id, db)
    course_ids = [c["id"] for c in enrolled_courses]
    announcements = (
        db.query(models.Announcement)
        .filter(
            (models.Announcement.course_id.in_(course_ids)) | (models.Announcement.course_id.is_(None))
        )
        .order_by(models.Announcement.created_at.desc())
        .all()
    )
    results = []
    for a in announcements:
        teacher_name = db.query(models.User.name).filter(models.User.id == a.teacher_id).scalar() or "Teacher"
        course_name = db.query(models.Course.name).filter(models.Course.id == a.course_id).scalar() if a.course_id else "All Courses (Broadcast)"
        results.append({
            "id": a.id,
            "teacher_name": teacher_name,
            "course_name": course_name,
            "title": a.title,
            "content": a.content,
            "created_at": a.created_at.isoformat() if a.created_at else None
        })
    return results

# Timetable semanal
@router.get("/{student_id}/timetable")
def get_student_timetable(student_id: int, db: Session = Depends(database.get_db)):
    enrolled_courses = student_controller.get_enrolled_courses(student_id, db)
    course_ids = [c["id"] for c in enrolled_courses]
    if not course_ids:
        return []
    slots = db.query(models.ClassSchedule).filter(models.ClassSchedule.course_id.in_(course_ids)).all()
    results = []
    for s in slots:
        course_name = db.query(models.Course.name).filter(models.Course.id == s.course_id).scalar()
        results.append({
            "id": s.id,
            "course_id": s.course_id,
            "course_name": course_name or "Unknown Course",
            "day_of_week": s.day_of_week,
            "start_time": s.start_time,
            "end_time": s.end_time,
            "room": s.room
        })
    return results

# Assignments student list and submission
@router.get("/{student_id}/assignments")
def get_student_assignments(student_id: int, db: Session = Depends(database.get_db)):
    enrolled_courses = student_controller.get_enrolled_courses(student_id, db)
    course_ids = [c["id"] for c in enrolled_courses]
    if not course_ids:
        return []
    assignments = db.query(models.Assignment).filter(models.Assignment.course_id.in_(course_ids)).all()
    results = []
    for a in assignments:
        course_name = db.query(models.Course.name).filter(models.Course.id == a.course_id).scalar()
        sub = db.query(models.AssignmentSubmission).filter(
            models.AssignmentSubmission.assignment_id == a.id,
            models.AssignmentSubmission.student_id == student_id
        ).first()
        results.append({
            "id": a.id,
            "course_id": a.course_id,
            "course_name": course_name or "Unknown Course",
            "title": a.title,
            "description": a.description,
            "due_date": a.due_date.isoformat() if a.due_date else None,
            "max_marks": a.max_marks,
            "submission": {
                "id": sub.id,
                "submission_text": sub.submission_text,
                "submitted_at": sub.submitted_at.isoformat() if sub.submitted_at else None,
                "status": sub.status,
                "marks_obtained": sub.marks_obtained,
                "feedback": sub.feedback
            } if sub else None
        })
    return results

@router.post("/submissions")
def submit_assignment(payload: schemas.SubmissionCreate, db: Session = Depends(database.get_db)):
    existing = db.query(models.AssignmentSubmission).filter(
        models.AssignmentSubmission.assignment_id == payload.assignment_id,
        models.AssignmentSubmission.student_id == payload.student_id
    ).first()
    if existing:
        existing.submission_text = payload.submission_text
        existing.status = "Submitted"
        db.commit()
        return {"message": "Assignment submission updated successfully"}
        
    sub = models.AssignmentSubmission(
        assignment_id=payload.assignment_id,
        student_id=payload.student_id,
        submission_text=payload.submission_text,
        status="Submitted"
    )
    db.add(sub)
    db.commit()
    return {"message": "Assignment submitted successfully"}

# Student exams list
@router.get("/{student_id}/exams")
def get_student_exams(student_id: int, db: Session = Depends(database.get_db)):
    enrolled_courses = student_controller.get_enrolled_courses(student_id, db)
    course_ids = [c["id"] for c in enrolled_courses]
    if not course_ids:
        return []
    exams = db.query(models.ExamSchedule).filter(models.ExamSchedule.course_id.in_(course_ids)).all()
    results = []
    for e in exams:
        course_name = db.query(models.Course.name).filter(models.Course.id == e.course_id).scalar()
        results.append({
            "id": e.id,
            "course_id": e.course_id,
            "course_name": course_name or "Unknown Course",
            "exam_type": e.exam_type,
            "date": e.date.isoformat() if e.date else None,
            "start_time": e.start_time,
            "end_time": e.end_time,
            "room": e.room
        })
    return results


@router.get("/{student_id}/profile", response_model=schemas.UserProfileResponse)
def get_student_profile(student_id: int, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.id == student_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Student not found")
    
    enrollments = db.query(models.Enrollment).filter(models.Enrollment.student_id == student_id).all()
    history = []
    for e in enrollments:
        course_name = db.query(models.Course.name).filter(models.Course.id == e.course_id).scalar() or "Unknown Course"
        history.append({
            "course_id": e.course_id,
            "course_name": course_name,
            "semester": e.semester,
            "enrolled_on": e.created_at
        })
        
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "bio": user.bio,
        "profile_pic": user.profile_pic,
        "semester": user.semester,
        "enrollments": history
    }

@router.post("/{student_id}/profile")
def update_student_profile(student_id: int, payload: schemas.UserProfileUpdate, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.id == student_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Student not found")
        
    user.name = payload.name
    user.bio = payload.bio
    if payload.semester is not None:
        user.semester = payload.semester
        
    db.commit()
    db.refresh(user)
    return {"message": "Profile updated successfully"}

@router.post("/{student_id}/profile/upload-photo")
def upload_student_photo(student_id: int, file: UploadFile = File(...), db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.id == student_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Student not found")
        
    ext = os.path.splitext(file.filename)[1]
    if ext.lower() not in [".jpg", ".jpeg", ".png", ".gif"]:
        raise HTTPException(status_code=400, detail="Only JPG, PNG or GIF images are allowed.")
        
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join("static", "profile_pics", filename)
    
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    user.profile_pic = f"/static/profile_pics/{filename}"
    db.commit()
    return {"message": "Photo uploaded successfully", "profile_pic": user.profile_pic}


@router.get("/{student_id}/smart-insights", response_model=schemas.SmartInsightsResponse)
def get_smart_insights(student_id: int, db: Session = Depends(database.get_db)):
    return student_controller.get_smart_insights(student_id, db)

@router.post("/{student_id}/qr-attendance/claim")
def claim_qr_attendance(student_id: int, payload: schemas.QRClaimPayload, db: Session = Depends(database.get_db)):
    return student_controller.claim_qr_attendance(student_id, payload.session_token, db)
