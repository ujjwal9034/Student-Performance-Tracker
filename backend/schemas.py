from pydantic import BaseModel
from datetime import date

class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: str
    semester: int | None = None

class UserLogin(BaseModel):
    email: str
    password: str

class CourseCreate(BaseModel):
    name: str
    teacher_id: int
    semester: int

class AttendanceCreate(BaseModel):
    student_id: int
    course_id: int
    date: date
    status: str

class GradeCreate(BaseModel):
    student_id: int
    course_id: int
    semester: int
    exam_type: str  # "mid" or "end"
    marks: int

class BulkMarksRecord(BaseModel):
    student_id: int
    marks: int

class BulkMarksPayload(BaseModel):
    course_id: int
    semester: int
    exam_type: str  
    records: list[BulkMarksRecord]

class EnrollStudentsPayload(BaseModel):
    course_id: int
    student_ids: list[int]

class StudentFilterQuery(BaseModel):
    semester: int | None = None
    course_id: int | None = None

class GradesQuery(BaseModel):
    student_id: int
    semester: int

class IssueCreate(BaseModel):
    student_id: int
    course_id: int
    date: date
    reason: str
