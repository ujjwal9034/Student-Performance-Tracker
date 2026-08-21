from database import Base
from sqlalchemy import Column, Integer, String, ForeignKey, Date, Enum, Text
from sqlalchemy.orm import relationship
import enum
from sqlalchemy import DateTime
from datetime import date
from sqlalchemy.sql import func

class RoleEnum(str, enum.Enum):
    admin = "admin"
    teacher = "teacher"
    student = "student"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(Enum(RoleEnum), nullable=False)
    semester = Column(Integer, nullable=True)
    is_approved = Column(Integer, default=1, nullable=False)  # 0=Pending, 1=Approved
    reset_token = Column(String(255), nullable=True)
    reset_token_expiry = Column(DateTime, nullable=True)
    bio = Column(Text, nullable=True)
    profile_pic = Column(String(255), nullable=True)

    courses = relationship("Course", back_populates="teacher", cascade="all, delete")
    attendance = relationship("Attendance", back_populates="student", cascade="all, delete")
    grades = relationship("Grade", back_populates="student", cascade="all, delete")
    issues = relationship("AttendanceIssue", back_populates="student", cascade="all, delete")
    student_profile = relationship("Student", back_populates="user", uselist=False, cascade="all, delete")
    teacher_profile = relationship("Teacher", back_populates="user", uselist=False, cascade="all, delete")


class Course(Base):
    __tablename__ = "courses"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    teacher_id = Column(Integer, ForeignKey("users.id"))
    semester = Column(Integer, nullable=False)

    teacher = relationship("User", back_populates="courses")
    students = relationship("Enrollment", back_populates="course", cascade="all, delete")


class Enrollment(Base):
    __tablename__ = "enrollments"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    course_id = Column(Integer, ForeignKey("courses.id"))
    semester = Column(Integer, nullable=False)
    created_at = Column(Date, nullable=False, default=date.today)

    course = relationship("Course", back_populates="students")
    student = relationship("User")


class Attendance(Base):
    __tablename__ = "attendance"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    course_id = Column(Integer, ForeignKey("courses.id"))
    date = Column(Date, nullable=False)
    status = Column(String(10), nullable=False)

    student = relationship("User", back_populates="attendance")

class Grade(Base):
    __tablename__ = "grades"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    semester = Column(Integer, nullable=False)
    exam_type = Column(String(10), nullable=False)  # "mid" or "end"
    marks = Column(Integer, nullable=False)

    student = relationship("User", back_populates="grades")


class AttendanceIssue(Base):
    __tablename__ = "attendance_issues"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    course_id = Column(Integer, ForeignKey("courses.id"))
    date = Column(Date, nullable=False)
    reason = Column(Text, nullable=True)
    status = Column(String(20), default="Pending")
    remark = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    student = relationship("User", back_populates="issues")


class Announcement(Base):
    __tablename__ = "announcements"
    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=True)  # null = broadcast to all
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    teacher = relationship("User")
    course = relationship("Course")


class Student(Base):
    __tablename__ = "students"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    semester = Column(Integer, nullable=False)

    user = relationship("User", back_populates="student_profile")


class Teacher(Base):
    __tablename__ = "teachers"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    user = relationship("User", back_populates="teacher_profile")


class ClassSchedule(Base):
    __tablename__ = "class_schedules"
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    day_of_week = Column(String(20), nullable=False)  # "Monday", "Tuesday", etc.
    start_time = Column(String(10), nullable=False)   # e.g. "09:00"
    end_time = Column(String(10), nullable=False)     # e.g. "10:30"
    room = Column(String(50), nullable=False)

    course = relationship("Course")


class Assignment(Base):
    __tablename__ = "assignments"
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    due_date = Column(Date, nullable=False)
    max_marks = Column(Integer, nullable=False, default=100)

    course = relationship("Course")
    submissions = relationship("AssignmentSubmission", back_populates="assignment", cascade="all, delete")


class AssignmentSubmission(Base):
    __tablename__ = "assignment_submissions"
    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("assignments.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    submission_text = Column(Text, nullable=True)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    status = Column(String(20), default="Submitted")  # "Submitted", "Graded"
    marks_obtained = Column(Integer, nullable=True)
    feedback = Column(Text, nullable=True)

    assignment = relationship("Assignment", back_populates="submissions")
    student = relationship("User")


class ExamSchedule(Base):
    __tablename__ = "exam_schedules"
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    exam_type = Column(String(10), nullable=False)   # "mid" or "end"
    date = Column(Date, nullable=False)
    start_time = Column(String(10), nullable=False)   # e.g. "14:00"
    end_time = Column(String(10), nullable=False)     # e.g. "17:00"
    room = Column(String(50), nullable=False)

    course = relationship("Course")


class CalendarEvent(Base):
    __tablename__ = "calendar_events"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    event_type = Column(String(20), nullable=False)  # "Holiday", "Event", "Semester Start", "Semester End"


from sqlalchemy import Boolean

class QRSession(Base):
    __tablename__ = "qr_sessions"
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    session_token = Column(String(100), unique=True, index=True, nullable=False)
    signing_secret = Column(String(64), nullable=False)
    date = Column(Date, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    course = relationship("Course")


