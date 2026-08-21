from fastapi import APIRouter, Depends, Query, UploadFile, File
from fastapi.responses import StreamingResponse
import io
import csv
from sqlalchemy.orm import Session, joinedload
from typing import Optional
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
    return teacher_controller.get_all_issues(db)


@router.get("/{teacher_id}/courses")
def get_courses(teacher_id: int, db: Session = Depends(database.get_db)):
    courses = db.query(models.Course).filter(models.Course.teacher_id == teacher_id).all()
    result = []
    for c in courses:
        count = db.query(models.Enrollment).filter(models.Enrollment.course_id == c.id).count()
        result.append({
            "id": c.id,
            "name": c.name,
            "semester": c.semester,
            "teacher_id": c.teacher_id,
            "enrollment_count": count
        })
    return result

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
            "reason": getattr(issue, "reason", None),
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
    remark: Optional[str] = None


@router.post("/issues/{issue_id}/resolve")
def resolve_issue(issue_id: int, payload: ResolveIssuePayload, db: Session = Depends(database.get_db)):
    return teacher_controller.resolve_issue(issue_id, payload.status, payload.remark or "", db)

@router.delete("/issues/{issue_id}")
def delete_issue(issue_id: int, db: Session = Depends(database.get_db)):
    return teacher_controller.delete_issue(issue_id, db)


@router.post("/courses/enroll")
def enroll_students(payload: schemas.EnrollStudentsPayload, db: Session = Depends(database.get_db)):
    return teacher_controller.enroll_students(payload, db)



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
def teacher_attendance_detailed(teacher_id: int, semester: int, course_id: Optional[int] = None, db: Session = Depends(database.get_db)):
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
def list_students(semester: Optional[int] = None, course_id: Optional[int] = None, exclude_enrolled: bool = False, db: Session = Depends(database.get_db)):
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

# Announcement CRUD routes
@router.post("/announcements")
def create_announcement(payload: schemas.AnnouncementCreate, db: Session = Depends(database.get_db)):
    new_ann = models.Announcement(
        teacher_id=payload.teacher_id,
        course_id=payload.course_id,
        title=payload.title,
        content=payload.content
    )
    db.add(new_ann)
    db.commit()
    db.refresh(new_ann)
    return {"message": "Announcement created successfully", "id": new_ann.id}

@router.get("/{teacher_id}/announcements")
def get_teacher_announcements(teacher_id: int, db: Session = Depends(database.get_db)):
    announcements = (
        db.query(models.Announcement)
        .filter(models.Announcement.teacher_id == teacher_id)
        .order_by(models.Announcement.created_at.desc())
        .all()
    )
    results = []
    for a in announcements:
        course_name = db.query(models.Course.name).filter(models.Course.id == a.course_id).scalar() if a.course_id else "All Courses (Broadcast)"
        results.append({
            "id": a.id,
            "teacher_id": a.teacher_id,
            "course_id": a.course_id,
            "course_name": course_name,
            "title": a.title,
            "content": a.content,
            "created_at": a.created_at.isoformat() if a.created_at else None
        })
    return results

@router.delete("/announcements/{announcement_id}")
def delete_announcement(announcement_id: int, db: Session = Depends(database.get_db)):
    ann = db.query(models.Announcement).filter(models.Announcement.id == announcement_id).first()
    if not ann:
        return {"error": "Announcement not found"}
    db.delete(ann)
    db.commit()
    return {"message": "Announcement deleted successfully"}

# CSV Export/Import
@router.get("/courses/{course_id}/grades/export")
def export_grades_csv(course_id: int, semester: int, exam_type: str, db: Session = Depends(database.get_db)):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        return {"error": "Course not found"}

    records = list_course_grades(course_id, semester, exam_type, db)

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Student ID", "Student Name", "Semester", "Exam Type", "Marks"])
    for r in records:
        writer.writerow([r["student_id"], r["name"], r["semester"], exam_type, r["marks"] if r["marks"] is not None else ""])
        
    output.seek(0)
    filename = f"Grades_{course.name.replace(' ', '_')}_{exam_type}_Sem{semester}.csv"
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode('utf-8')),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/courses/{course_id}/attendance/export")
def export_attendance_csv(course_id: int, semester: int, db: Session = Depends(database.get_db)):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        return {"error": "Course not found"}

    records = teacher_controller.get_course_attendance_summary(course_id, semester, db)

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Student ID", "Student Name", "Present Classes", "Total Classes", "Attendance Percentage"])
    for r in records:
        writer.writerow([r["student_id"], r["name"], r["present"], r["total"], f"{r['percentage']}%"])
        
    output.seek(0)
    filename = f"Attendance_{course.name.replace(' ', '_')}_Sem{semester}.csv"
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode('utf-8')),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.post("/courses/{course_id}/grades/import")
def import_grades_csv(
    course_id: int,
    semester: int = Query(...),
    exam_type: str = Query(...),
    file: UploadFile = File(...),
    db: Session = Depends(database.get_db)
):
    contents = file.file.read()
    buffer = io.StringIO(contents.decode('utf-8'))
    reader = csv.reader(buffer)
    
    # Skip header
    next(reader, None)
    
    records = []
    errors = []
    
    for row_idx, row in enumerate(reader, start=2):
        if not row:
            continue
        if len(row) < 5:
            errors.append(f"Row {row_idx}: Invalid column count")
            continue
            
        try:
            student_id = int(row[0].strip())
            marks_str = row[4].strip()
            if not marks_str:
                continue
            marks = int(marks_str)
            
            # Verify student enrollment
            enrolled = db.query(models.Enrollment).filter(
                models.Enrollment.student_id == student_id,
                models.Enrollment.course_id == course_id,
                models.Enrollment.semester == semester
            ).first()
            
            if not enrolled:
                errors.append(f"Row {row_idx}: Student ID {student_id} is not enrolled in this course/semester")
                continue
                
            records.append({
                "student_id": student_id,
                "marks": marks
            })
        except Exception as e:
            errors.append(f"Row {row_idx}: Failed to parse data - {str(e)}")
            
    if errors:
        return {"error": "CSV verification failed", "details": errors}
        
    payload_records = [schemas.BulkMarksRecord(student_id=r["student_id"], marks=r["marks"]) for r in records]
    payload = schemas.BulkMarksPayload(
        course_id=course_id,
        semester=semester,
        exam_type=exam_type,
        records=payload_records
    )
    
    teacher_controller.upsert_bulk_marks(payload, db)
    return {"message": f"Successfully imported {len(records)} grade records"}

# At-risk Alert endpoint
@router.get("/{teacher_id}/at-risk/{semester}")
def get_at_risk_students(teacher_id: int, semester: int, db: Session = Depends(database.get_db)):
    return teacher_controller.get_at_risk_students(teacher_id, semester, db)

# Timetable weekly schedule routes
@router.post("/timetable")
def create_timetable_slot(payload: schemas.ClassScheduleCreate, db: Session = Depends(database.get_db)):
    slot = models.ClassSchedule(
        course_id=payload.course_id,
        day_of_week=payload.day_of_week,
        start_time=payload.start_time,
        end_time=payload.end_time,
        room=payload.room
    )
    db.add(slot)
    db.commit()
    db.refresh(slot)
    return {"message": "Class schedule slot created successfully", "id": slot.id}

@router.get("/{teacher_id}/timetable")
def get_teacher_timetable(teacher_id: int, db: Session = Depends(database.get_db)):
    courses = db.query(models.Course).filter(models.Course.teacher_id == teacher_id).all()
    course_ids = [c.id for c in courses]
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

@router.delete("/timetable/{id}")
def delete_timetable_slot(id: int, db: Session = Depends(database.get_db)):
    slot = db.query(models.ClassSchedule).filter(models.ClassSchedule.id == id).first()
    if not slot:
        return {"error": "Schedule slot not found"}
    db.delete(slot)
    db.commit()
    return {"message": "Timetable slot deleted successfully"}

# Assignment Management routes
@router.post("/assignments")
def create_assignment(payload: schemas.AssignmentCreate, db: Session = Depends(database.get_db)):
    assignment = models.Assignment(
        course_id=payload.course_id,
        title=payload.title,
        description=payload.description,
        due_date=payload.due_date,
        max_marks=payload.max_marks
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return {"message": "Assignment created successfully", "id": assignment.id}

@router.get("/assignments/{assignment_id}/submissions")
def get_submissions(assignment_id: int, db: Session = Depends(database.get_db)):
    submissions = db.query(models.AssignmentSubmission).filter(models.AssignmentSubmission.assignment_id == assignment_id).all()
    results = []
    for s in submissions:
        student_name = db.query(models.User.name).filter(models.User.id == s.student_id).scalar() or "Student"
        student_email = db.query(models.User.email).filter(models.User.id == s.student_id).scalar() or ""
        results.append({
            "id": s.id,
            "assignment_id": s.assignment_id,
            "student_id": s.student_id,
            "student_name": student_name,
            "student_email": student_email,
            "submission_text": s.submission_text,
            "submitted_at": s.submitted_at.isoformat() if s.submitted_at else None,
            "status": s.status,
            "marks_obtained": s.marks_obtained,
            "feedback": s.feedback
        })
    return results

@router.post("/submissions/{submission_id}/grade")
def grade_submission(submission_id: int, payload: schemas.GradeSubmissionPayload, db: Session = Depends(database.get_db)):
    sub = db.query(models.AssignmentSubmission).filter(models.AssignmentSubmission.id == submission_id).first()
    if not sub:
        return {"error": "Submission not found"}
    sub.marks_obtained = payload.marks_obtained
    sub.feedback = payload.feedback
    sub.status = "Graded"
    db.commit()
    return {"message": "Submission graded successfully"}

@router.get("/{teacher_id}/assignments")
def get_teacher_assignments(teacher_id: int, db: Session = Depends(database.get_db)):
    courses = db.query(models.Course).filter(models.Course.teacher_id == teacher_id).all()
    course_ids = [c.id for c in courses]
    if not course_ids:
        return []
    assignments = db.query(models.Assignment).filter(models.Assignment.course_id.in_(course_ids)).all()
    results = []
    for a in assignments:
        course_name = db.query(models.Course.name).filter(models.Course.id == a.course_id).scalar()
        results.append({
            "id": a.id,
            "course_id": a.course_id,
            "course_name": course_name or "Unknown Course",
            "title": a.title,
            "description": a.description,
            "due_date": a.due_date.isoformat() if a.due_date else None,
            "max_marks": a.max_marks
        })
    return results

# Exam scheduling routes
@router.post("/exams")
def create_exam_schedule(payload: schemas.ExamScheduleCreate, db: Session = Depends(database.get_db)):
    exam = models.ExamSchedule(
        course_id=payload.course_id,
        exam_type=payload.exam_type,
        date=payload.date,
        start_time=payload.start_time,
        end_time=payload.end_time,
        room=payload.room
    )
    db.add(exam)
    db.commit()
    db.refresh(exam)
    return {"message": "Exam schedule slot created successfully", "id": exam.id}

@router.get("/{teacher_id}/exams")
def get_teacher_exams(teacher_id: int, db: Session = Depends(database.get_db)):
    courses = db.query(models.Course).filter(models.Course.teacher_id == teacher_id).all()
    course_ids = [c.id for c in courses]
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

@router.delete("/exams/{id}")
def delete_exam(id: int, db: Session = Depends(database.get_db)):
    exam = db.query(models.ExamSchedule).filter(models.ExamSchedule.id == id).first()
    if not exam:
        return {"error": "Exam slot not found"}
    db.delete(exam)
    db.commit()
    return {"message": "Exam slot deleted successfully"}


@router.post("/qr-session")
def create_qr_session(payload: schemas.QRSessionCreate, db: Session = Depends(database.get_db)):
    session = teacher_controller.create_qr_session(payload.course_id, payload.duration_minutes, db)
    return {
        "id": session.id,
        "course_id": session.course_id,
        "session_token": session.session_token,
        "expires_at": session.expires_at.isoformat(),
        "is_active": session.is_active
    }

@router.get("/qr-session/{session_token}/scans")
def get_qr_session_scans(session_token: str, db: Session = Depends(database.get_db)):
    return teacher_controller.get_qr_session_scans(session_token, db)
