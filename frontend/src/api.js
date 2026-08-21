export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Request helper
async function request(path, { method = "GET", body, headers = {} } = {}) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: { "Content-Type": "application/json", ...headers },
      body: body ? JSON.stringify(body) : undefined,
    });
    let data = null;
    try {
      data = await res.json();
    } catch (e) {
      // Ignore non-JSON
    }
    if (!res.ok) {
      const message = data?.detail || data?.message || `Request failed: ${res.status}`;
      throw new Error(message);
    }
    return data;
  } catch (err) {
    throw new Error(err?.message || "Network error - failed to fetch");
  }
}

// Auth APIs
export const apiAuth = {
  register: (payload) => request("/auth/register", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  changePassword: (payload) => request("/auth/change-password", { method: "POST", body: payload }),
  forgotPassword: (payload) => request("/auth/forgot-password", { method: "POST", body: payload }),
  resetPassword: (payload) => request("/auth/reset-password", { method: "POST", body: payload }),
};

//Admin APIs
export const apiAdmin = {
  // ── Admins ──────────────────────────────────────────────────────
  getAdmins: () => request("/admin/admins"),
  addAdmin: ({ name, email, password }) =>
    request("/admin/admins", {
      method: "POST",
      body: { name, email, password, role: "admin" },
    }),
  promoteToAdmin: (userId) =>
    request(`/admin/promote/${userId}`, { method: "POST" }),
  deleteAdmin: (adminId, requesterId) =>
    request(`/admin/admins/${adminId}?requester_id=${requesterId}`, { method: "DELETE" }),

  // ── Approvals ───────────────────────────────────────────────────
  getPendingUsers: () => request("/admin/pending"),
  approveUser: (userId) => request(`/admin/approve/${userId}`, { method: "POST" }),
  rejectUser: (userId) => request(`/admin/reject/${userId}`, { method: "POST" }),

  // ── Teachers ─────────────────────────────────────────────────────
  getTeachers: () => request("/admin/teachers"),
  getStudents: () => request("/admin/students"),
  getCourses: () => request("/admin/courses"),
  addTeacher: ({ name, email, password }) =>
    request("/admin/teachers", {
      method: "POST",
      body: { name, email, password, role: "teacher" },
    }),
  addStudent: ({ name, email, password, semester }) =>
    request("/admin/students", {
      method: "POST",
      body: { name, email, password, role: "student", semester },
    }),
  addCourse: ({ name, teacher_id, semester }) =>
    request("/admin/courses", {
      method: "POST",
      body: { name, teacher_id, semester },
    }),
  deleteTeacher: (id) => request(`/admin/teachers/${id}`, { method: "DELETE" }),
  deleteStudent: (id) => request(`/admin/students/${id}`, { method: "DELETE" }),
  deleteCourse: (id) => request(`/admin/courses/${id}`, { method: "DELETE" }),

  // Academic Calendar Events
  getCalendarEvents: () => request("/admin/calendar-events"),
  createCalendarEvent: (payload) => request("/admin/calendar-events", { method: "POST", body: payload }),
  deleteCalendarEvent: (id) => request(`/admin/calendar-events/${id}`, { method: "DELETE" }),
};
// Teacher APIs
export const apiTeacher = {
  getCourses: (teacherId) => request(`/teacher/${teacherId}/courses`),
  getStudentsInCourse: (courseId) => request(`/teacher/courses/${courseId}/students`),
  getStudentsInCourseBySemester: ({ course_id, semester }) =>
    request(`/teacher/courses/${course_id}/students/by-semester?semester=${semester}`),
  recordBulkAttendance: ({ course_id, date, records }) =>
    request(`/teacher/attendance/bulk`, { method: "POST", body: { course_id, date, records } }),
  getAttendance: ({ course_id, date, semester }) => {
    const params = new URLSearchParams();
    params.append("course_id", course_id);
    params.append("date_value", date);
    params.append("semester", semester);
    return request(`/teacher/attendance?${params.toString()}`);
  },
  createCourse: ({ name, teacher_id, semester }) =>
    request(`/teacher/courses`, { method: "POST", body: { name, teacher_id, semester } }),
  resolveIssue: ({ issue_id, status, remark }) =>
    request(`/teacher/issues/${issue_id}/resolve`, { method: "POST", body: { status, remark } }),
  deleteIssue: (issue_id) =>
    request(`/teacher/issues/${issue_id}`, { method: "DELETE" }),
  enrollStudents: ({ course_id, student_ids }) =>
    request(`/teacher/courses/enroll`, { method: "POST", body: { course_id, student_ids } }),
  getIssues: (teacherId) => request(`/teacher/${teacherId}/issues`),
  upsertMarksBulk: ({ course_id, semester, exam_type, records }) =>
    request(`/teacher/courses/marks/bulk`, {
      method: "POST",
      body: { course_id, semester, exam_type, records },
    }),
  getMarks: ({ course_id, semester, exam_type }) => {
    const params = new URLSearchParams();
    params.append("semester", semester);
    params.append("exam_type", exam_type);
    return request(`/teacher/courses/${course_id}/grades?${params.toString()}`);
  },
  getCourseEnrollments: (courseId) => request(`/teacher/courses/${courseId}/enrollments`),
  listStudents: ({ semester, course_id, exclude_enrolled } = {}) => {
    const params = new URLSearchParams();
    if (semester !== undefined && semester !== null && semester !== "") params.append("semester", semester);
    if (course_id !== undefined && course_id !== null && course_id !== "") params.append("course_id", course_id);
    if (exclude_enrolled) params.append("exclude_enrolled", "true");
    const qs = params.toString();
    return request(`/teacher/students${qs ? `?${qs}` : ""}`);
  },
  createStudent: ({ name, email, password, semester }) =>
    request(`/teacher/students`, { method: "POST", body: { name, email, password, role: "student", semester } }),
  
  // Attendance summaries
  getCourseAttendanceSummary: ({ course_id, semester }) => {
    const params = new URLSearchParams();
    params.append("semester", semester);
    return request(`/teacher/courses/${course_id}/attendance/summary?${params.toString()}`);
  },
  getTeacherOverallAttendanceSummary: ({ teacher_id, semester }) => {
    const params = new URLSearchParams();
    params.append("semester", semester);
    return request(`/teacher/${teacher_id}/attendance/summary?${params.toString()}`);
  },
  getTeacherAttendanceDetailed: ({ teacher_id, semester, course_id }) => {
    const params = new URLSearchParams();
    params.append("semester", semester);
    if (course_id) params.append("course_id", course_id);
    return request(`/teacher/${teacher_id}/attendance/detailed?${params.toString()}`);
  },
  
  // Course management
  deleteCourse: (courseId) => request(`/teacher/courses/${courseId}`, { method: "DELETE" }),
  enrollAllSemesterStudents: (courseId) => request(`/teacher/courses/${courseId}/enroll/all-semester`, { method: "POST" }),

  // Announcements
  getAnnouncements: (teacherId) => request(`/teacher/${teacherId}/announcements`),
  createAnnouncement: (payload) => request(`/teacher/announcements`, { method: "POST", body: payload }),
  deleteAnnouncement: (announcementId) => request(`/teacher/announcements/${announcementId}`, { method: "DELETE" }),

  // At-risk Alerts
  getAtRiskStudents: ({ teacher_id, semester }) => request(`/teacher/${teacher_id}/at-risk/${semester}`),

  // CSV Import
  importGradesCSV: ({ course_id, semester, exam_type, file }) => {
    const formData = new FormData();
    formData.append("file", file);
    return fetch(`${BASE_URL}/teacher/courses/${course_id}/grades/import?semester=${semester}&exam_type=${exam_type}`, {
      method: "POST",
      body: formData,
    }).then(async (res) => {
      let data = null;
      try { data = await res.json(); } catch(e) {}
      if (!res.ok) {
        throw new Error(data?.detail || data?.message || "Failed to import CSV");
      }
      return data;
    });
  },

  // Timetable
  getTimetable: (teacherId) => request(`/teacher/${teacherId}/timetable`),
  createTimetableSlot: (payload) => request("/teacher/timetable", { method: "POST", body: payload }),
  deleteTimetableSlot: (id) => request(`/teacher/timetable/${id}`, { method: "DELETE" }),

  // Assignments
  getAssignments: (teacherId) => request(`/teacher/${teacherId}/assignments`),
  createAssignment: (payload) => request("/teacher/assignments", { method: "POST", body: payload }),
  getAssignmentSubmissions: (assignmentId) => request(`/teacher/assignments/${assignmentId}/submissions`),
  gradeSubmission: ({ submission_id, marks_obtained, feedback }) =>
    request(`/teacher/submissions/${submission_id}/grade`, { method: "POST", body: { marks_obtained, feedback } }),

  // Exams
  getExams: (teacherId) => request(`/teacher/${teacherId}/exams`),
  createExam: (payload) => request("/teacher/exams", { method: "POST", body: payload }),
  deleteExam: (id) => request(`/teacher/exams/${id}`, { method: "DELETE" }),
  createQRSession: (payload) => request("/teacher/qr-session", { method: "POST", body: payload }),
  getQRSessionScans: (sessionToken) => request(`/teacher/qr-session/${sessionToken}/scans`),
};

// Student APIs
export const apiStudent = {
  getAttendance: (studentId) => request(`/student/${studentId}/attendance`),
  getAttendanceSummary: (studentId) => request(`/student/${studentId}/attendance/summary`),
  getAttendanceByDate: ({ student_id, date }) => {
    const params = new URLSearchParams();
    params.append("date_value", date);
    return request(`/student/${student_id}/attendance/by-date?${params.toString()}`);
  },
  raiseIssue: ({ student_id, course_id, date, reason }) =>
    request(`/student/issues`, { method: "POST", body: { student_id, course_id, date, reason } }),
  getStudentIssues: (studentId) => request(`/student/${studentId}/issues`),
  getGrades: ({ student_id, semester, show_mid = true, show_end = true }) => {
    const params = new URLSearchParams({ show_mid, show_end });
    return request(`/student/${student_id}/grades/summary/${semester}?${params.toString()}`);
  },
  getCourses: (studentId) => request(`/student/${studentId}/courses`),
  getAttendanceByCourseAndMonth: ({ student_id, course_id, year, month }) =>
    request(`/student/${student_id}/attendance/by-course-month?course_id=${course_id}&year=${year}&month=${month}`),
  getAttendanceByCourseAndDate: ({ student_id, course_id, date }) => {
    const params = new URLSearchParams();
    params.append("course_id", course_id);
    params.append("date_value", date);
    return request(`/student/${student_id}/attendance/by-course-date?${params.toString()}`);
  },
  getAttendanceHeatmap: (studentId) => request(`/student/${studentId}/attendance/heatmap`),
  getAnnouncements: (studentId) => request(`/student/${studentId}/announcements`),

  // Timetable, Assignments, Exams
  getTimetable: (studentId) => request(`/student/${studentId}/timetable`),
  getAssignments: (studentId) => request(`/student/${studentId}/assignments`),
  submitAssignment: (payload) => request("/student/submissions", { method: "POST", body: payload }),
  getExams: (studentId) => request(`/student/${studentId}/exams`),
  getProfile: (studentId) => request(`/student/${studentId}/profile`),
  updateProfile: (studentId, payload) =>
    request(`/student/${studentId}/profile`, { method: "POST", body: payload }),
  uploadProfilePhoto: (studentId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    return fetch(`${BASE_URL}/student/${studentId}/profile/upload-photo`, {
      method: "POST",
      body: formData,
    }).then(async (res) => {
      let data = null;
      try { data = await res.json(); } catch(e) {}
      if (!res.ok) {
        throw new Error(data?.detail || data?.message || "Failed to upload photo");
      }
      return data;
    });
  },
  getSmartInsights: (studentId) => request(`/student/${studentId}/smart-insights`),
  claimQRAttendance: (studentId, token) =>
    request(`/student/${studentId}/qr-attendance/claim`, { method: "POST", body: { session_token: token } })
};

export default {
  apiAuth,
  apiAdmin,
  apiTeacher,
  apiStudent,
};