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
