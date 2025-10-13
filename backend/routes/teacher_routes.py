from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session,joinedload
from typing import List
from datetime import date
from sqlalchemy.sql import func

import database
import models
import schemas
from controllers import teacher_controller, admin_controller

router = APIRouter(prefix="/teacher", tags=["Teacher"])

@router.get("/issues")
def list_all_issues(db: Session = Depends(database.get_db)):
    return db.get_all_issues(db)


@router.get("/{teacher_id}/courses")
def get_courses(teacher_id: int, db: Session = Depends(database.get_db)):
    return db.query(models.Course).filter(models.Course.teacher_id == teacher_id).all()

@router.get("/{teacher_id}/issues")
def get_teacher_issues(teacher_id: int, db: Session = Depends(database.get_db)):
    # issues for courses taught by teacher, include student name and course info
    rows = (
        db.query(models.AttendanceIssue, models.Course, models.User)
        .join(models.Course, models.Course.id == models.AttendanceIssue.course_id)
        .join(models.User, models.User.id == models.AttendanceIssue.student_id)
        .filter(models.Course.teacher_id == teacher_id)
        .all()
    )

    result = []
    for issue, course, user in rows:
        result.append({
            "id": issue.id,
            "course_id": course.id,
            "course_name": getattr(course, "name", None),
            "student_id": user.id,
            "student_name": getattr(user, "name", None),
            "student_email": getattr(user, "email", None),
            "status": getattr(issue, "status", None),
            "remark": getattr(issue, "remark", None),
            "created_at": issue.created_at.isoformat() if getattr(issue, "created_at", None) else None,
"updated_at": issue.updated_at.isoformat() if getattr(issue, "updated_at", None) else None,

        })
    return result

@router.get("/courses/{course_id}/students")
def get_students_in_course(course_id: int, db: Session = Depends(database.get_db)):
    # Legacy: list all students enrolled in the course (no semester filter)
    return (
        db.query(models.User)
        .join(models.Enrollment, models.Enrollment.student_id == models.User.id)
        .filter(models.Enrollment.course_id == course_id)
        .all()
    )


@router.get("/courses/{course_id}/students/by-semester")
def get_students_in_course_by_semester(course_id: int, semester: int, db: Session = Depends(database.get_db)):
    # Students enrolled in the course for a particular semester, verified against students table
    return (
        db.query(models.User)
        .join(models.Enrollment, models.Enrollment.student_id == models.User.id)
        .join(models.Student, models.Student.user_id == models.User.id)
        .filter(
            models.Enrollment.course_id == course_id,
            models.Enrollment.semester == semester,
            models.Student.semester == semester,
        )
        .all()
    )

class AttendanceRecordPayload(schemas.BaseModel):
    student_id: int
    status: str


class BulkAttendancePayload(schemas.BaseModel):
    course_id: int
    date: date
    records: List[AttendanceRecordPayload]


@router.post("/attendance/bulk")
def record_bulk_attendance(payload: BulkAttendancePayload, db: Session = Depends(database.get_db)):
    # Validate inputs
    if not payload.records:
        return {"message": "No records provided", "inserted": 0, "updated": 0}

    # Upsert attendance: if a record exists for (student, course, date) update status, else insert
    inserted = 0
    updated = 0
    for rec in payload.records:
        if rec.status not in ("present", "absent"):
            # normalize unsupported values to absent
            rec.status = "absent"
        existing = (
            db.query(models.Attendance)
            .filter(
                models.Attendance.student_id == rec.student_id,
                models.Attendance.course_id == payload.course_id,
                models.Attendance.date == payload.date,
            )
            .first()
        )
        if existing:
            existing.status = rec.status
            updated += 1
        else:
            new_att = models.Attendance(
                student_id=rec.student_id,
                course_id=payload.course_id,
                date=payload.date,
                status=rec.status,
            )
            db.add(new_att)
            inserted += 1
    db.commit()
    return {"message": "Attendance saved", "inserted": inserted, "updated": updated}


@router.get("/attendance")
def get_attendance(course_id: int, date_value: date, semester: int, db: Session = Depends(database.get_db)):
    # Only attendance for students enrolled in this course and semester (cross-check students table)
    rows = (
        db.query(models.User, models.Attendance)
        .join(models.Attendance, models.Attendance.student_id == models.User.id)
        .join(models.Enrollment, models.Enrollment.student_id == models.User.id)
        .join(models.Student, models.Student.user_id == models.User.id)
        .filter(
            models.Attendance.course_id == course_id,
            models.Attendance.date == date_value,
            models.Enrollment.course_id == course_id,
            models.Enrollment.semester == semester,
            models.Student.semester == semester,
        )
        .all()
    )
    result = []
    for user, att in rows:
        result.append({
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "status": att.status,
        })
    return result


@router.post("/courses")
def create_course(course: schemas.CourseCreate, db: Session = Depends(database.get_db)):
    return teacher_controller.create_course(course, db)


class ResolveIssuePayload(schemas.BaseModel):
    status: str
    remark: str | None = None


@router.post("/issues/{issue_id}/resolve")
def resolve_issue(issue_id: int, payload: ResolveIssuePayload, db: Session = Depends(database.get_db)):
    return teacher_controller.resolve_issue(issue_id, payload.status, payload.remark or "", db)


@router.post("/courses/enroll")
def enroll_students(payload: schemas.EnrollStudentsPayload, db: Session = Depends(database.get_db)):
    return teacher_controller.enroll_students(payload, db)


@router.get("/{teacher_id}/issues")
def get_teacher_issues(teacher_id: int, db: Session = Depends(database.get_db)):
    # issues for courses taught by teacher
    return (
        db.query(models.AttendanceIssue)
        .join(models.Course, models.Course.id == models.AttendanceIssue.course_id)
        .filter(models.Course.teacher_id == teacher_id)
        .all()
    )


class BulkMarksPayload(schemas.BulkMarksPayload):
    pass


@router.delete("/courses/{course_id}")
def delete_course(course_id: int, db: Session = Depends(database.get_db)):
    # Fetch course
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        return {"error": "Course not found"}

    # Unenroll all students from this course
    db.query(models.Enrollment).filter(models.Enrollment.course_id == course_id).delete()

    # Delete all attendance records for this course
    db.query(models.Attendance).filter(models.Attendance.course_id == course_id).delete()

    # Delete all grades for this course
    db.query(models.Grade).filter(models.Grade.course_id == course_id).delete()

    # Delete the course
    db.delete(course)
    db.commit()
    return {"message": "Course deleted successfully"}


@router.post("/courses/marks/bulk")
def upsert_marks(payload: BulkMarksPayload, db: Session = Depends(database.get_db)):
    return teacher_controller.upsert_bulk_marks(payload, db)


@router.get("/courses/{course_id}/grades")
def list_course_grades(course_id: int, semester: int, exam_type: str, db: Session = Depends(database.get_db)):
    # Return all students enrolled in the course for the semester with their marks (if already recorded)
    # This supports prefilling the teacher dashboard: marks is null when not yet entered
    from sqlalchemy import and_
    rows = (
        db.query(
            models.User.id.label("student_id"),
            models.User.name.label("student_name"),
            models.Student.semester.label("semester"),
            models.Grade.marks.label("marks"),
        )
        .join(models.Student, models.Student.user_id == models.User.id)
        .join(
            models.Enrollment,
            and_(
                models.Enrollment.student_id == models.User.id,
                models.Enrollment.course_id == course_id,
                models.Enrollment.semester == semester,
            ),
        )
        .outerjoin(
            models.Grade,
            and_(
                models.Grade.student_id == models.User.id,
                models.Grade.course_id == course_id,
                models.Grade.semester == semester,
                models.Grade.exam_type == exam_type,
            ),
        )
        .filter(
            models.User.role == models.RoleEnum.student,
            models.Student.semester == semester,
        )
        .all()
    )
    return [
        {
            "student_id": r.student_id,
            "name": r.student_name,
            "semester": r.semester,
            "marks": r.marks,
        }
        for r in rows
    ]


@router.get("/courses/{course_id}/attendance/summary")
def course_attendance_summary(course_id: int, semester: int, db: Session = Depends(database.get_db)):
    return teacher_controller.get_course_attendance_summary(course_id, semester, db)


@router.get("/{teacher_id}/attendance/summary")
def teacher_overall_attendance_summary(teacher_id: int, semester: int, db: Session = Depends(database.get_db)):
    return teacher_controller.get_teacher_overall_attendance_summary(teacher_id, semester, db)


@router.get("/{teacher_id}/attendance/detailed")
def teacher_attendance_detailed(teacher_id: int, semester: int, course_id: int | None = None, db: Session = Depends(database.get_db)):
    return teacher_controller.get_teacher_attendance_detailed(teacher_id, semester, db, course_id)


@router.get("/courses/{course_id}/enrollments")
def list_course_enrollments(course_id: int, db: Session = Depends(database.get_db)):
    rows = (
        db.query(models.User, models.Enrollment)
        .join(models.Enrollment, models.Enrollment.student_id == models.User.id)
        .filter(models.Enrollment.course_id == course_id)
        .all()
    )
    # Serialize into a simple list of dicts
    result = []
    for user, enr in rows:
        result.append({
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "enrollment_id": enr.id,
            "date_enrolled": enr.created_at.isoformat() if enr.created_at else None,
        })
    return result


@router.post("/courses/{course_id}/enroll/all-semester")
def enroll_all_semester_students(course_id: int, db: Session = Depends(database.get_db)):
    return teacher_controller.enroll_all_students_of_course_semester(course_id, db)


@router.get("/students")
def list_students(semester: int | None = None, course_id: int | None = None, exclude_enrolled: bool = False, db: Session = Depends(database.get_db)):
    # Base: only students; use students table for semester
    if course_id is None:
        q = (
            db.query(models.User, models.Student)
            .join(models.Student, models.Student.user_id == models.User.id)
            .filter(models.User.role == models.RoleEnum.student)
        )
        if semester is not None:
            q = q.filter(models.Student.semester == semester)
        rows = q.all()
        return [ {"id": u.id, "name": u.name, "email": u.email, "semester": s.semester} for (u, s) in rows ]
    # When course_id provided, include enrolled flag via left join to enrollments
    from sqlalchemy import literal
    q = (
        db.query(
            models.User,
            models.Student,
            models.Enrollment.id.label("enr_id"),
        )
        .join(models.Student, models.Student.user_id == models.User.id)
        .outerjoin(
            models.Enrollment,
            (models.Enrollment.student_id == models.User.id) & (models.Enrollment.course_id == course_id) & (models.Enrollment.semester == (semester if semester is not None else models.Student.semester)),
        )
        .filter(models.User.role == models.RoleEnum.student)
    )
    if semester is not None:
        q = q.filter(models.Student.semester == semester)
    rows = q.all()
    result = []
    for (u, s, enr_id) in rows:
        if exclude_enrolled and enr_id:
            continue
        result.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "semester": s.semester,
            "enrolled": True if enr_id else False,
        })
    return result


@router.post("/students")
def create_student(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    # Allow teacher to create a student (reuses admin add_student logic)
    return admin_controller.add_student(user, db)