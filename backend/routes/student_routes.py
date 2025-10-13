from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import date

import schemas
import database
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
def get_attendance_trend(student_id: int, db: Session = Depends(database.get_db), course_id: int | None = None):
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