const BASE_URL = "http://localhost:8000";



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
      // ignore non-JSON
    }
    if (!res.ok) {
      const message = data?.detail || data?.message || `Request failed: ${res.status}`;
      throw new Error(message);
    }
    return data;
  } catch (err) {
    // Network/CORS errors surface here as TypeError: Failed to fetch
    throw new Error(err?.message || "Network error - failed to fetch");
  }
}

// Auth APIs
export const apiAuth = {
  register: (payload) => request("/auth/register", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
};

// Admin APIs
export const apiAdmin = {
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
};

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

  // ✅ New APIs for attendance summaries
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

  // Detailed per-student attendance (overall + per-course), optional course filter
  getTeacherAttendanceDetailed: ({ teacher_id, semester, course_id }) => {
    const params = new URLSearchParams();
    params.append("semester", semester);
    if (course_id) params.append("course_id", course_id);
    return request(`/teacher/${teacher_id}/attendance/detailed?${params.toString()}`);
  },

  // ✅ Existing delete course API
  deleteCourse: (courseId) => request(`/teacher/courses/${courseId}`, { method: "DELETE" }),

  // Enroll all students of the course's semester
  enrollAllSemesterStudents: (courseId) => request(`/teacher/courses/${courseId}/enroll/all-semester`, { method: "POST" }),
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
  getGrades: ({ student_id, semester }) => request(`/student/${student_id}/grades/${semester}`),
  getCourses: (studentId) => request(`/student/${studentId}/courses`),
  getGradesSummary: ({ student_id, semester }) =>
    request(`/student/${student_id}/grades/summary/${semester}`),
};

export default {
  apiAuth,
  apiAdmin,
  apiTeacher,
  apiStudent,
};
