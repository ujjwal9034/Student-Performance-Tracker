from sqlalchemy.orm import Session
import schemas
import database
import auth
import models
from sqlalchemy import func, case, extract
from models import Grade, Course, Enrollment, Attendance
from datetime import date
from calendar import monthrange
from typing import List


# Attendance summary
def get_attendance_summary(student_id: int, db: Session):
    """Return overall and course-wise attendance summary."""
    # Count present/total per course
    per_course = (
        db.query(
            models.Attendance.course_id.label("course_id"),
            func.count().label("total"),
            func.sum(case((func.lower(models.Attendance.status) == "present", 1), else_=0)).label("present_count"),
        )
        .filter(models.Attendance.student_id == student_id)
        .group_by(models.Attendance.course_id)
        .all()
    )

    # Course names
    course_ids = [r.course_id for r in per_course]
    names_map = {}
    if course_ids:
        courses = db.query(models.Course).filter(models.Course.id.in_(course_ids)).all()
        names_map = {c.id: c.name for c in courses}

    course_summaries = []
    total_present = 0
    total_records = 0

    for r in per_course:
        total_present += r.present_count or 0
        total_records += r.total or 0
        pct = (float(r.present_count) / float(r.total) * 100.0) if r.total else 0.0
        course_summaries.append({
            "course_id": r.course_id,
            "course_name": names_map.get(r.course_id),
            "present": int(r.present_count or 0),
            "total": int(r.total or 0),
            "percentage": round(pct, 2),
        })

    overall_pct = (float(total_present) / float(total_records) * 100.0) if total_records else 0.0
    overall = {
        "present": int(total_present),
        "total": int(total_records),
        "percentage": round(overall_pct, 2)
    }

    return {
        "overall": overall,
        "by_course": course_summaries
    }


# Attendance by date
def get_attendance_by_course_and_date(student_id: int, course_id: int, date_value, db: Session):
    """Return attendance status for specific course and date."""
    record = (
        db.query(models.Attendance)
        .filter(
            models.Attendance.student_id == student_id,
            models.Attendance.course_id == course_id,
            models.Attendance.date == date_value,
        )
        .first()
    )

    if record:
        return {
            "course_id": course_id,
            "date": record.date.isoformat(),
            "status": record.status.capitalize()
        }
    else:
        return {
            "course_id": course_id,
            "date": str(date_value),
            "status": "No record found"
        }


# Grades summary
def get_grades_summary_by_semester(student_id: int, semester: int, db: Session, show_mid: bool = True, show_end: bool = True):
    """Return grade summary for semester with exam type filters."""

    # Enrolled courses
    enrolled = (
        db.query(Course.id.label("course_id"), Course.name.label("course_name"))
        .join(Enrollment, Enrollment.course_id == Course.id)
        .filter(
            Enrollment.student_id == student_id,
            Enrollment.semester == semester
        )
        .all()
    )

    # Exam filters
    exam_filters = []
    if show_mid:
        exam_filters.append("mid")
    if show_end:
        exam_filters.append("end")

    # Fetch grades
    grades = (
        db.query(Grade.course_id, Grade.exam_type, Grade.marks)
        .filter(
            Grade.student_id == student_id,
            Grade.semester == semester,
            Grade.exam_type.in_(exam_filters)
        )
        .all()
    )

    # Map results
    by_course = {}
    for row in enrolled:
        by_course[row.course_id] = {
            "course_id": row.course_id,
            "course_name": row.course_name,
            "mid": None,
            "end": None
        }

    for g in grades:
        if g.course_id in by_course:
            by_course[g.course_id][g.exam_type] = g.marks

    return list(by_course.values())


# Raise issue
def raise_issue(issue: schemas.IssueCreate, db: Session):
    new_issue = models.AttendanceIssue(**issue.dict())
    db.add(new_issue)
    db.commit()
    db.refresh(new_issue)
    return {"message": "Issue raised", "id": new_issue.id}


# Attendance by month
def get_attendance_by_course_and_month(student_id: int, course_id: int, year: int, month: int, db):
    """Return attendance status for all dates in given month."""
    records = db.query(Attendance).filter(
        Attendance.student_id == student_id,
        Attendance.course_id == course_id,
        extract("year", Attendance.date) == year,
        extract("month", Attendance.date) == month
    ).all()
    
    # Date -> status map
    attendance_map = {r.date: "Present" if r.status.lower() == "present" else "Absent" for r in records}

    # Generate all dates
    num_days = monthrange(year, month)[1]
    result = []
    for day in range(1, num_days + 1):
        current_date = date(year, month, day)
        status = attendance_map.get(current_date, "Absent")
        result.append({"date": current_date, "status": status})
    
    return result


# Enrolled courses
def get_enrolled_courses(student_id: int, db: Session):
    """Return list of enrolled courses."""
    rows = (
        db.query(models.Course, models.Enrollment)
        .join(models.Enrollment, models.Enrollment.course_id == models.Course.id)
        .filter(models.Enrollment.student_id == student_id)
        .all()
    )
    return [
        {"id": c.id, "name": c.name, "teacher_id": c.teacher_id, "semester": e.semester}
        for (c, e) in rows
    ]