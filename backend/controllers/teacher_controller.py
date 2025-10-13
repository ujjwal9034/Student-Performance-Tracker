from fastapi import HTTPException
from sqlalchemy.orm import Session
import schemas
import models
from sqlalchemy import func, case


# Create course
def create_course(course: schemas.CourseCreate, db: Session):
    # Check for duplicates
    exists = (
        db.query(models.Course)
        .filter(models.Course.name == course.name, models.Course.semester == course.semester)
        .first()
    )
    if exists:
        return {"error": "Course with same name already exists in this semester"}
    new_course = models.Course(
        name=course.name,
        teacher_id=course.teacher_id,
        semester=course.semester,
    )
    db.add(new_course)
    db.commit()
    db.refresh(new_course)
    return {"message": "Course created", "id": new_course.id}


# Record attendance
def record_attendance(att: schemas.AttendanceCreate, db: Session):
    new_att = models.Attendance(**att.dict())
    db.add(new_att)
    db.commit()
    return {"message": "Attendance recorded"}


# Resolve issue
def resolve_issue(issue_id: int, status: str, remark: str, db: Session):
    issue = db.query(models.AttendanceIssue).filter(models.AttendanceIssue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    issue.status = status
    issue.remark = remark
    if status == "Approved":
        att = db.query(models.Attendance).filter(
            models.Attendance.student_id == issue.student_id,
            models.Attendance.course_id == issue.course_id,
            models.Attendance.date == issue.date
        ).first()
        if att:
            att.status = "present"
    db.commit()
    return {"message": f"Issue {status.lower()}"}


# Upsert marks
def upsert_bulk_marks(payload: schemas.BulkMarksPayload, db: Session):
    # Insert or update grades
    for rec in payload.records:
        existing = (
            db.query(models.Grade)
            .filter(
                models.Grade.student_id == rec.student_id,
                models.Grade.course_id == payload.course_id,
                models.Grade.semester == payload.semester,
                models.Grade.exam_type == payload.exam_type,
            )
            .first()
        )
        if existing:
            existing.marks = rec.marks
        else:
            db.add(
                models.Grade(
                    student_id=rec.student_id,
                    course_id=payload.course_id,
                    semester=payload.semester,
                    exam_type=payload.exam_type,
                    marks=rec.marks,
                )
            )
    db.commit()
    return {"message": "Marks saved"}


# Enroll students
def enroll_students(payload: schemas.EnrollStudentsPayload, db: Session):
    course = db.query(models.Course).filter(models.Course.id == payload.course_id).first()
    if not course:
        return {"error": "Course not found"}
    for sid in payload.student_ids:
        # Check student semester match
        student = (
            db.query(models.User, models.Student)
            .join(models.Student, models.Student.user_id == models.User.id)
            .filter(
                models.User.id == sid,
                models.User.role == models.RoleEnum.student,
                models.Student.semester == course.semester,
            )
            .first()
        )
        if not student:
            continue
        exists = (
            db.query(models.Enrollment)
            .filter(
                models.Enrollment.course_id == payload.course_id,
                models.Enrollment.student_id == sid,
                models.Enrollment.semester == course.semester,
            )
            .first()
        )
        if not exists:
            db.add(
                models.Enrollment(
                    course_id=payload.course_id,
                    student_id=sid,
                    semester=course.semester,
                )
            )
    db.commit()
    return {"message": "Students enrolled"}


# Get all issues
def get_all_issues(db: Session):
    """Return all attendance issues with student and course details."""
    results = (
        db.query(
            models.AttendanceIssue.id.label("id"),
            models.AttendanceIssue.student_id.label("student_id"),
            models.User.name.label("student_name"),
            models.User.email.label("student_email"),
            models.AttendanceIssue.course_id.label("course_id"),
            models.Course.name.label("course_name"),
            models.AttendanceIssue.date.label("date"),
            models.AttendanceIssue.reason.label("reason"),
            models.AttendanceIssue.status.label("status"),
            models.AttendanceIssue.remark.label("remark"),
        )
        .join(models.User, models.User.id == models.AttendanceIssue.student_id)
        .join(models.Course, models.Course.id == models.AttendanceIssue.course_id)
        .all()
    )

    return [
        {
            "id": r.id,
            "student_id": r.student_id,
            "student_name": r.student_name,
            "student_email": r.student_email,
            "course_id": r.course_id,
            "course_name": r.course_name,
            "date": r.date.isoformat() if r.date else None,
            "reason": r.reason,
            "status": r.status,
            "remark": r.remark,
        }
        for r in results
    ]


# Enroll all semester students
def enroll_all_students_of_course_semester(course_id: int, db: Session):
    """Enroll all students whose semester matches course semester."""
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        return {"error": "Course not found"}
    # Fetch students in semester
    students = (
        db.query(models.User, models.Student)
        .join(models.Student, models.Student.user_id == models.User.id)
        .filter(models.User.role == models.RoleEnum.student, models.Student.semester == course.semester)
        .all()
    )
    created = 0
    for (u, s) in students:
        exists = (
            db.query(models.Enrollment)
            .filter(
                models.Enrollment.course_id == course_id,
                models.Enrollment.student_id == u.id,
                models.Enrollment.semester == course.semester,
            )
            .first()
        )
        if not exists:
            db.add(models.Enrollment(course_id=course_id, student_id=u.id, semester=course.semester))
            created += 1
    db.commit()
    return {"message": "Enrollment sync complete", "enrolled": created}


# Course attendance summary
def get_course_attendance_summary(course_id: int, semester: int, db: Session):
    """Return per-student attendance summary for course and semester."""
    # Enrolled students
    enrolled = (
        db.query(models.User.id.label("student_id"), models.User.name.label("name"))
        .join(models.Enrollment, models.Enrollment.student_id == models.User.id)
        .join(models.Student, models.Student.user_id == models.User.id)
        .filter(
            models.Enrollment.course_id == course_id,
            models.Enrollment.semester == semester,
            models.Student.semester == semester,
            models.User.role == models.RoleEnum.student,
        )
        .all()
    )
    enrolled_ids = [e.student_id for e in enrolled]
    names_map = {e.student_id: e.name for e in enrolled}
    if not enrolled_ids:
        return []

    # Attendance aggregates
    rows = (
        db.query(
            models.Attendance.student_id.label("student_id"),
            func.count().label("total"),
            func.sum(case((func.lower(models.Attendance.status) == "present", 1), else_=0)).label("present_count"),
        )
        .filter(
            models.Attendance.course_id == course_id,
            models.Attendance.student_id.in_(enrolled_ids),
        )
        .group_by(models.Attendance.student_id)
        .all()
    )
    agg_map = {r.student_id: r for r in rows}
    result = []
    for sid in enrolled_ids:
        r = agg_map.get(sid)
        total = int(r.total) if r else 0
        present = int(r.present_count or 0) if r else 0
        pct = round((present / total * 100.0), 2) if total else 0.0
        result.append({
            "student_id": sid,
            "name": names_map.get(sid),
            "present": present,
            "total": total,
            "percentage": pct,
        })
    return result


# Teacher overall attendance summary
def get_teacher_overall_attendance_summary(teacher_id: int, semester: int, db: Session):
    """Return overall attendance per student for teacher's courses."""
    course_ids = [
        c.id
        for c in db.query(models.Course).filter(
            models.Course.teacher_id == teacher_id,
            models.Course.semester == semester,
        ).all()
    ]
    if not course_ids:
        return []

    enrolled_rows = (
        db.query(models.User.id.label("student_id"), models.User.name.label("name"))
        .join(models.Enrollment, models.Enrollment.student_id == models.User.id)
        .join(models.Student, models.Student.user_id == models.User.id)
        .filter(
            models.Enrollment.course_id.in_(course_ids),
            models.Enrollment.semester == semester,
            models.Student.semester == semester,
            models.User.role == models.RoleEnum.student,
        )
        .distinct()
        .all()
    )
    student_ids = [r.student_id for r in enrolled_rows]
    names_map = {r.student_id: r.name for r in enrolled_rows}
    if not student_ids:
        return []

    per_course_rows = (
        db.query(
            models.Attendance.student_id.label("student_id"),
            models.Attendance.course_id.label("course_id"),
            func.count().label("total"),
            func.sum(case((func.lower(models.Attendance.status) == "present", 1), else_=0)).label("present_count"),
        )
        .filter(
            models.Attendance.course_id.in_(course_ids),
            models.Attendance.student_id.in_(student_ids),
        )
        .group_by(models.Attendance.student_id, models.Attendance.course_id)
        .all()
    )

    per_student_courses = {}
    for r in per_course_rows:
        total = int(r.total or 0)
        present = int(r.present_count or 0)
        if total <= 0:
            continue
        per_student_courses.setdefault(r.student_id, []).append((present, total))

    result = []
    for sid in student_ids:
        course_parts = per_student_courses.get(sid, [])
        if not course_parts:
            result.append({
                "student_id": sid,
                "name": names_map.get(sid),
                "present": 0,
                "total": 0,
                "percentage": 0.0,
            })
            continue

        sum_present = sum(p for (p, _) in course_parts)
        sum_total = sum(t for (_, t) in course_parts)
        overall_pct = round((sum_present / sum_total) * 100.0, 2) if sum_total > 0 else 0.0

        result.append({
            "student_id": sid,
            "name": names_map.get(sid),
            "present": int(sum_present),
            "total": int(sum_total),
            "percentage": overall_pct,
        })

    return result


# Teacher detailed attendance
def get_teacher_attendance_detailed(teacher_id: int, semester: int, db: Session, course_id: int | None = None):
    """Return detailed per-student attendance with optional course filter."""
    # Teacher's courses
    course_query = db.query(models.Course.id, models.Course.name).filter(
        models.Course.teacher_id == teacher_id,
        models.Course.semester == semester,
    )
    if course_id is not None:
        course_query = course_query.filter(models.Course.id == course_id)
    courses = course_query.all()
    course_ids = [c.id for c in courses]
    names_map = {c.id: c.name for c in courses}
    if not course_ids:
        return []

    # Enrolled students
    enrolled_rows = (
        db.query(models.User.id.label("student_id"), models.User.name.label("name"))
        .join(models.Enrollment, models.Enrollment.student_id == models.User.id)
        .join(models.Student, models.Student.user_id == models.User.id)
        .filter(
            models.Enrollment.course_id.in_(course_ids),
            models.Enrollment.semester == semester,
            models.Student.semester == semester,
            models.User.role == models.RoleEnum.student,
        )
        .distinct()
        .all()
    )
    student_ids = [r.student_id for r in enrolled_rows]
    student_names = {r.student_id: r.name for r in enrolled_rows}
    if not student_ids:
        return []

    # Per-course aggregates
    per_course_rows = (
        db.query(
            models.Attendance.student_id.label("student_id"),
            models.Attendance.course_id.label("course_id"),
            func.count().label("total"),
            func.sum(case((func.lower(models.Attendance.status) == "present", 1), else_=0)).label("present_count"),
        )
        .filter(
            models.Attendance.course_id.in_(course_ids),
            models.Attendance.student_id.in_(student_ids),
        )
        .group_by(models.Attendance.student_id, models.Attendance.course_id)
        .all()
    )

    # Organize results
    result_map = {}
    for sid in student_ids:
        result_map[sid] = {
            "student_id": sid,
            "name": student_names.get(sid),
            "overall": {"present": 0, "total": 0, "percentage": 0.0},
            "by_course": [],
        }

    for r in per_course_rows:
        total = int(r.total or 0)
        present = int(r.present_count or 0)
        pct = round((present / total * 100.0), 2) if total else 0.0
        result_map[r.student_id]["by_course"].append({
            "course_id": r.course_id,
            "course_name": names_map.get(r.course_id),
            "present": present,
            "total": total,
            "percentage": pct,
        })
        result_map[r.student_id]["overall"]["present"] += present
        result_map[r.student_id]["overall"]["total"] += total

    # Compute percentages
    for sid, entry in result_map.items():
        tot = entry["overall"]["total"]
        pre = entry["overall"]["present"]
        entry["overall"]["percentage"] = round((pre / tot * 100.0), 2) if tot else 0.0

    return list(result_map.values())