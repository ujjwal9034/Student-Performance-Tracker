from pydantic import BaseModel
from datetime import date
from typing import Optional

class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: str
    semester: Optional[int] = None

class UserLogin(BaseModel):
    email: str
    password: str

class ChangePassword(BaseModel):
    user_id: int
    old_password: str
    new_password: str

class ForgotPassword(BaseModel):
    email: str

class ResetPassword(BaseModel):
    token: str
    new_password: str

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
    semester: Optional[int] = None
    course_id: Optional[int] = None

class GradesQuery(BaseModel):
    student_id: int
    semester: int

class IssueCreate(BaseModel):
    student_id: int
    course_id: int
    date: date
    reason: str

class AnnouncementCreate(BaseModel):
    teacher_id: int
    course_id: Optional[int] = None
    title: str
    content: str

class ClassScheduleCreate(BaseModel):
    course_id: int
    day_of_week: str
    start_time: str
    end_time: str
    room: str

class AssignmentCreate(BaseModel):
    course_id: int
    title: str
    description: Optional[str] = None
    due_date: date
    max_marks: int = 100

class SubmissionCreate(BaseModel):
    assignment_id: int
    student_id: int
    submission_text: str

class GradeSubmissionPayload(BaseModel):
    marks_obtained: int
    feedback: Optional[str] = None

class ExamScheduleCreate(BaseModel):
    course_id: int
    exam_type: str
    date: date
    start_time: str
    end_time: str
    room: str

class CalendarEventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    start_date: date
    end_date: date
    event_type: str


class UserProfileUpdate(BaseModel):
    name: str
    bio: Optional[str] = None
    semester: Optional[int] = None

class EnrollmentHistoryItem(BaseModel):
    course_id: int
    course_name: str
    semester: int
    enrolled_on: date

class UserProfileResponse(BaseModel):
    id: int
    name: str
    email: str
    bio: Optional[str] = None
    profile_pic: Optional[str] = None
    semester: Optional[int] = None
    enrollments: list[EnrollmentHistoryItem]


from datetime import datetime

class QRSessionCreate(BaseModel):
    course_id: int
    duration_minutes: int = 5

class QRSessionResponse(BaseModel):
    id: int
    course_id: int
    session_token: str
    expires_at: datetime
    is_active: bool

class QRClaimPayload(BaseModel):
    session_token: str

class StudyRecommendation(BaseModel):
    course_name: str
    recommendation: str
    risk_level: str
    focus_areas: list[str]

class PredictiveInsightItem(BaseModel):
    course_id: int
    course_name: str
    attendance_rate: float
    mid_term_marks: Optional[int] = None
    expected_score: float
    risk_level: str

class SmartInsightsResponse(BaseModel):
    predicted_gpa: float
    expected_performance: list[PredictiveInsightItem]
    study_recommendations: list[StudyRecommendation]

