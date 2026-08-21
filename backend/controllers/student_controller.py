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

def get_student_issues(student_id: int, db: Session):
    """Return list of issues raised by the student."""
    issues = (
        db.query(
            models.AttendanceIssue.id,
            models.AttendanceIssue.course_id,
            models.Course.name.label("course_name"),
            models.AttendanceIssue.date,
            models.AttendanceIssue.reason,
            models.AttendanceIssue.status,
            models.AttendanceIssue.remark,
            models.AttendanceIssue.created_at
        )
        .join(models.Course, models.Course.id == models.AttendanceIssue.course_id, isouter=True)
        .filter(models.AttendanceIssue.student_id == student_id)
        .order_by(models.AttendanceIssue.created_at.desc())
        .all()
    )
    return [
        {
            "id": i.id,
            "course_id": i.course_id,
            "course_name": i.course_name or "Unknown Course",
            "date": i.date,
            "reason": i.reason,
            "status": i.status,
            "remark": i.remark,
            "created_at": i.created_at
        }
        for i in issues
    ]


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
        status = attendance_map.get(current_date, "Unrecorded")
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

def get_attendance_heatmap(student_id: int, db: Session):
    """Return student's daily attendance records grouped by date for heatmap visualization."""
    records = db.query(models.Attendance).filter(models.Attendance.student_id == student_id).all()
    
    by_date = {}
    for r in records:
        d_str = r.date.isoformat()
        status = r.status.lower()
        by_date.setdefault(d_str, []).append(status)
        
    heatmap = []
    for d_str, statuses in by_date.items():
        present_count = statuses.count("present")
        absent_count = statuses.count("absent")
        if present_count > 0 and absent_count == 0:
            status = "present"
        elif absent_count > 0 and present_count == 0:
            status = "absent"
        elif present_count > 0 and absent_count > 0:
            status = "partial"
        else:
            status = "unrecorded"
            
        heatmap.append({
            "date": d_str,
            "status": status,
            "present_count": present_count,
            "absent_count": absent_count
        })
    return heatmap


from datetime import datetime
from fastapi import HTTPException
import hmac, hashlib, time

def claim_qr_attendance(student_id: int, token: str, ts: int, sig: str, db: Session):
    session = db.query(models.QRSession).filter(models.QRSession.session_token == token).first()
    if not session:
        raise HTTPException(status_code=400, detail="Invalid QR attendance code.")
    
    if not session.is_active:
        raise HTTPException(status_code=400, detail="This QR session is no longer active.")
        
    if session.expires_at < datetime.now():
        session.is_active = False
        db.commit()
        raise HTTPException(status_code=400, detail="This QR code has expired.")

    # Validate timestamp freshness (6-second window = 2 rotation cycles)
    current_time = int(time.time())
    if abs(current_time - ts) > 6:
        raise HTTPException(status_code=400, detail="QR code has expired. Please scan the current QR code displayed on screen.")

    # Validate HMAC signature
    ts_window = ts // 3  # 3-second rotation window
    expected_sig = hmac.new(
        session.signing_secret.encode(),
        str(ts_window).encode(),
        hashlib.sha256
    ).hexdigest()[:16]
    
    if not hmac.compare_digest(sig, expected_sig):
        raise HTTPException(status_code=400, detail="Invalid QR code signature. Please scan the current QR code on screen.")

    # Check if attendance already recorded
    existing = db.query(models.Attendance).filter(
        models.Attendance.student_id == student_id,
        models.Attendance.course_id == session.course_id,
        models.Attendance.date == session.date
    ).first()
    if existing:
        return {"message": "Attendance already recorded for this course today.", "already_recorded": True}
        
    # Register attendance
    att = models.Attendance(
        student_id=student_id,
        course_id=session.course_id,
        date=session.date,
        status="present"
    )
    db.add(att)
    db.commit()
    return {"message": "Attendance marked successfully as Present!", "already_recorded": False}


def get_smart_insights(student_id: int, db: Session):
    courses = get_enrolled_courses(student_id, db)
    if not courses:
        return {
            "predicted_gpa": 0.0,
            "expected_performance": [],
            "study_recommendations": []
        }
        
    att_summary = get_attendance_summary(student_id, db)
    att_map = {c["course_id"]: c["percentage"] for c in att_summary["by_course"]}
    
    predicted_items = []
    recommendations = []
    total_predicted_score = 0.0
    
    topic_suggestions = {
        "math": ["Linear Algebra", "Calculus Limits", "Eigenvalues", "Probability Matrices"],
        "science": ["Thermodynamics", "Organic Synthesis", "Quantum Mechanics", "Wave Optics"],
        "computer": ["Dynamic Programming", "Database Indexing", "Concurrency Control", "Graph Algorithms"],
        "history": ["Industrial Revolution", "Renaissance Art", "French Revolution", "World War I"],
        "english": ["Literary Criticism", "Shakespearean Prose", "Advanced Grammar Syntax", "Creative Essays"]
    }
    
    for c in courses:
        course_id = c["id"]
        course_name = c["name"]
        
        grade_row = db.query(models.Grade).filter(
            models.Grade.student_id == student_id,
            models.Grade.course_id == course_id,
            models.Grade.exam_type == "mid"
        ).first()
        
        midterm_val = grade_row.marks if grade_row else None
        attendance_rate = att_map.get(course_id, 100.0)
        
        if midterm_val is not None:
            base_expected = float(midterm_val)
        else:
            base_expected = 75.0
            
        if attendance_rate >= 90.0:
            att_factor = 5.0
        elif attendance_rate >= 80.0:
            att_factor = 2.0
        elif attendance_rate < 75.0:
            if attendance_rate < 60.0:
                att_factor = -18.0
            else:
                att_factor = -8.0
        else:
            att_factor = 0.0
            
        expected_score = base_expected + att_factor
        expected_score = max(0.0, min(100.0, expected_score))
        
        if expected_score < 60.0 or attendance_rate < 75.0:
            risk = "High"
        elif expected_score < 80.0:
            risk = "Medium"
        else:
            risk = "Low"
            
        predicted_items.append({
            "course_id": course_id,
            "course_name": course_name,
            "attendance_rate": round(attendance_rate, 2),
            "mid_term_marks": midterm_val,
            "expected_score": round(expected_score, 1),
            "risk_level": risk
        })
        
        total_predicted_score += expected_score
        
        c_lower = course_name.lower()
        focus_list = ["Core Lectures", "Textbook Chapters 3-5", "Practice Assignments"]
        for k, v in topic_suggestions.items():
            if k in c_lower:
                focus_list = v
                break
                
        if risk == "High":
            rec_text = f"High academic risk warning! Attendance is {round(attendance_rate, 1)}% (which is below the 75% threshold) or midterm performance was weak. You must review the upcoming modules immediately and seek help from the professor."
            focus_areas = [focus_list[0], focus_list[1], "Office Hours Discussion"]
        elif risk == "Medium":
            rec_text = f"Moderate performance trajectory. Solving practice assignments and reviewing recent mock questions will help secure a top grade."
            focus_areas = [focus_list[1], focus_list[2], "Peer Study Group"]
        else:
            rec_text = f"Excellent learning pace! To challenge yourself further, explore advanced readings and consider volunteering as a peer tutor."
            focus_areas = [focus_list[2], focus_list[3] if len(focus_list) > 3 else "Extra Reading"]
            
        recommendations.append({
            "course_name": course_name,
            "recommendation": rec_text,
            "risk_level": risk,
            "focus_areas": focus_areas
        })
        
    avg_expected = total_predicted_score / len(courses)
    predicted_gpa = round(avg_expected / 10.0, 2)
    predicted_gpa = max(0.0, min(10.0, predicted_gpa))
    
    return {
        "predicted_gpa": predicted_gpa,
        "expected_performance": predicted_items,
        "study_recommendations": recommendations
    }