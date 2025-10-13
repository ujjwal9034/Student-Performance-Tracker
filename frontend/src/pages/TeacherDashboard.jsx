import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { apiTeacher } from "../api";
import DashboardLayout from "../DashboardLayout";

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("attendance");
  const [issues, setIssues] = useState([]);

  // Attendance states
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedCourseSummary, setSelectedCourseSummary] = useState("");
  const [courseSummary, setCourseSummary] = useState([]);
  const [overallSummary, setOverallSummary] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [students, setStudents] = useState([]);
  const [attendanceSemester, setAttendanceSemester] = useState("");
  const [attendance, setAttendance] = useState({});
  const [message, setMessage] = useState("");

  // Marks states
  const [marksSemester, setMarksSemester] = useState(1);
  const [marksExamType, setMarksExamType] = useState("mid");
  const [marksByStudent, setMarksByStudent] = useState({});

  // Courses states
  const [courseName, setCourseName] = useState("");
  const [courseSemester, setCourseSemester] = useState(1);

  // Enrollment states
  const [enrollments, setEnrollments] = useState([]);
  const [enrollmentsCourseId, setEnrollmentsCourseId] = useState("");
  const [enrollmentsSemester, setEnrollmentsSemester] = useState("");
  const [enrollCourseId, setEnrollCourseId] = useState("");
  const [filterSemester, setFilterSemester] = useState("");
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [newStudentEmail, setNewStudentEmail] = useState("");

  // Issue states
  const [issueId, setIssueId] = useState("");
  const [issueStatus, setIssueStatus] = useState("Approved");
  const [issueRemark, setIssueRemark] = useState("");

  const [savingAttendance, setSavingAttendance] = useState(false);

  // Fetch courses
  useEffect(() => {
    if (user?.id) {
      apiTeacher
        .getCourses(user.id)
        .then((data) => setCourses(data))
        .catch((err) => console.error(err));
    }
  }, [user]);
  
  // Fetch issues
  useEffect(() => {
    if (activeTab === "issues" && user?.id) {
      fetchIssues();
    }
  }, [activeTab, user?.id]);
  
  // Fetch students
  useEffect(() => {
    if (selectedCourse && attendanceSemester) {
      apiTeacher
        .getStudentsInCourseBySemester({ course_id: Number(selectedCourse), semester: Number(attendanceSemester) })
        .then((data) => {
          setStudents(data);
          const initial = {};
          data.forEach((s) => { initial[s.id] = "present"; });
          setAttendance(initial);
          const initialMarks = {};
          data.forEach((s) => { initialMarks[s.id] = ""; });
          setMarksByStudent(initialMarks);
        })
        .catch((err) => console.error(err));
    } else {
      setStudents([]);
      setAttendance({});
      setMarksByStudent({});
    }
  }, [selectedCourse, attendanceSemester]);

  // Load attendance
  useEffect(() => {
    const shouldLoad = activeTab === "attendance" && selectedCourse && selectedDate && attendanceSemester;
    if (!shouldLoad) return;
    (async () => {
      try {
        const existing = await apiTeacher.getAttendance({ course_id: Number(selectedCourse), date: selectedDate, semester: attendanceSemester });
        if (Array.isArray(existing) && existing.length > 0) {
          setAttendance((prev) => {
            const next = { ...prev };
            existing.forEach((row) => {
              next[row.id] = row.status;
            });
            return next;
          });
          setMessage("Loaded existing attendance. You can edit and resubmit.");
        }
      } catch (err) {
        console.log(err)
      }
    })();
  }, [activeTab, selectedCourse, selectedDate, attendanceSemester]);

  // Load marks
  useEffect(() => {
    if (students.length > 0 && selectedCourse && marksSemester) {
      (async () => {
        try {
          await handleLoadExistingMarks(students);
        } catch (_) {
          // ignore
        }
      })();
    }
  }, [marksExamType]);

  // Fetch issues
  const fetchIssues = async () => {
    try {
      const data = await apiTeacher.getIssues(user.id);
      setIssues(data);
    } catch (err) {
      console.error(err);
      setMessage(err.message);
    }
  };

  // Set status
  const setStatus = (studentId, status) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  // Submit attendance
  const handleSubmitAttendance = async () => {
    if (!selectedCourse || !selectedDate || !attendanceSemester) {
      setMessage("Please select course, date, and semester.");
      return;
    }

    const records = students.map((s) => ({
      student_id: s.id,
      course_id: Number(selectedCourse),
      date: selectedDate,
      status: attendance[s.id],
    }));

    try {
      setSavingAttendance(true);
      const res = await apiTeacher.recordBulkAttendance({ course_id: Number(selectedCourse), date: selectedDate, records });
      const info = [];
      if (typeof res.inserted === "number") info.push(`${res.inserted} inserted`);
      if (typeof res.updated === "number") info.push(`${res.updated} updated`);
      setMessage(res.message + (info.length ? ` (${info.join(", ")})` : ""));
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Error submitting attendance");
    } finally {
      setSavingAttendance(false);
    }
  };

  // Create course
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await apiTeacher.createCourse({ name: courseName, teacher_id: user.id, semester: Number(courseSemester) });
      setMessage("Course created successfully!");
      setCourseName("");
      setCourseSemester(1);
      const refreshed = await apiTeacher.getCourses(user.id);
      setCourses(refreshed);
    } catch (err) {
      setMessage(err.message);
    }
  };

  // Set marks
  const setMarks = (studentId, value) => {
    setMarksByStudent((prev) => ({ ...prev, [studentId]: value }));
  };

  // Submit marks
  const handleSubmitMarks = async () => {
    if (!selectedCourse) {
      setMessage("Please select a course.");
      return;
    }
    if (!marksSemester || !Number(marksSemester)) {
      setMessage("Provide valid semester.");
      return;
    }
    const records = students.map((s) => ({ student_id: s.id, marks: Number(marksByStudent[s.id] || 0) }));
    try {
      const res = await apiTeacher.upsertMarksBulk({
        course_id: Number(selectedCourse),
        semester: Number(marksSemester),
        exam_type: marksExamType,
        records,
      });
      setMessage(res.message || "Marks saved");
    } catch (err) {
      setMessage(err.message || "Failed to save marks");
    }
  };

  // Load enrollments
  const handleLoadEnrollments = async () => {
    setMessage("");
    if (!enrollmentsCourseId || !enrollmentsSemester) {
      setMessage("Select course and semester to view enrollments.");
      return;
    }
    try {
      const students = await apiTeacher.getStudentsInCourseBySemester({ course_id: Number(enrollmentsCourseId), semester: Number(enrollmentsSemester) });
      setEnrollments(students.map(s => ({ id: s.id, name: s.name, email: s.email })));
    } catch (err) {
      setMessage(err.message);
    }
  };

  // Enroll students
  const handleEnrollStudents = async (e) => {
    if (e) e.preventDefault();
    setMessage("");
    try {
      const ids = selectedStudentIds.map((x) => Number(x));
      if (ids.length === 0) {
        setMessage("Please select at least one student");
        return;
      }
      if (!enrollCourseId) {
        setMessage("Please select a course");
        return;
      }
      await apiTeacher.enrollStudents({ course_id: Number(enrollCourseId), student_ids: ids });
      setMessage("Students enrolled successfully!");
      setSelectedStudentIds([]);
      if (selectedCourse && Number(enrollCourseId) === Number(selectedCourse)) {
        const data = await apiTeacher.getStudentsInCourse(selectedCourse);
        setStudents(data);
        const initial = {};
        data.forEach((s) => {
          initial[s.id] = "present";
        });
        setAttendance(initial);
      }
    } catch (err) {
      console.error("Enrollment error:", err);
      setMessage(err.message || "Failed to enroll students");
    }
  };

  // Load available students
  const handleLoadAvailableStudents = async () => {
    setMessage("");

    try {
      const params = {};

      if (filterSemester && !isNaN(filterSemester)) {
        params.semester = Number(filterSemester);
      }

      if (enrollCourseId) {
        params.course_id = Number(enrollCourseId);
      }

      params.exclude_enrolled = true;

      const data = await apiTeacher.listStudents(params);
      setAvailableStudents(data);

      if (data.length === 0) {
        setMessage("No students found for selected filters.");
      }
    } catch (err) {
      setMessage(err.message);
    }
  };

  // Toggle student selection
  const toggleStudentSelect = (id) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Resolve issue
  const handleResolveIssue = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await apiTeacher.resolveIssue({ issue_id: Number(issueId), status: issueStatus, remark: issueRemark });
      setMessage(`Issue ${issueStatus.toLowerCase()} successfully!`);
      setIssueId("");
      setIssueRemark("");
      setIssueStatus("Approved");
    } catch (err) {
      setMessage(err.message);
    }
  };

  // Load students for marks
  const handleLoadStudents = async () => {
    setMessage("");
    if (!selectedCourse || !marksSemester) {
      setMessage("Select course and semester to load students.");
      return;
    }

    try {
      const data = await apiTeacher.getStudentsInCourseBySemester({
        course_id: Number(selectedCourse),
        semester: Number(marksSemester),
      });

      setStudents(data);

      if (data.length === 0) {
        setMessage("No students found for this course and semester.");
        setMarksByStudent({});
        return;
      }

      await handleLoadExistingMarks(data);
      setMessage("Loaded students and existing marks (if any).");
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Error loading students.");
    }
  };

  // Load existing marks
  const handleLoadExistingMarks = async (studentsData) => {
    if (!selectedCourse || !marksSemester) return;

    try {
      const existingMarks = await apiTeacher.getMarks({
        course_id: Number(selectedCourse),
        semester: Number(marksSemester),
        exam_type: marksExamType,
      });

      const marksMap = {};
      studentsData.forEach((s) => {
        const found = existingMarks.find((m) => m.student_id === s.id);
        marksMap[s.id] = found ? found.marks : "";
      });

      setMarksByStudent(marksMap);
    } catch (err) {
      console.error("Error loading existing marks:", err);
      const marksMap = {};
      studentsData.forEach((s) => {
        marksMap[s.id] = "";
      });
      setMarksByStudent(marksMap);
    }
  };

  // Tab button
  const tabButton = (key, label) => (
    <button
      type="button"
      onClick={() => setActiveTab(key)}
      className={`px-4 py-2 border-b-2 ${activeTab === key ? "border-blue-600 text-blue-600" : "border-transparent"}`}
    >
      {label}
    </button>
  );

  // Button styles
  const btnBase = "px-3 py-1 rounded border";
  const btnActivePresent = "bg-green-600 text-white border-green-600";
  const btnInactivePresent = "bg-white text-green-700 border-green-600";
  const btnActiveAbsent = "bg-red-600 text-white border-red-600";
  const btnInactiveAbsent = "bg-white text-red-700 border-red-600";

  return (
    <DashboardLayout>
      <div className="p-6 max-w-5xl mx-auto ">
        <h2 className="text-2xl font-bold mb-4">Teacher Dashboard</h2>
        {/* Tabs */}
        <div className="flex gap-4 border-b mb-6">
          {tabButton("attendance", "Attendance")}
          {tabButton("marks", "Marks")}
          {tabButton("courses", "Courses")}
          {tabButton("enrollments", "Enrollments")}
          {tabButton("issues", "Issues")}
        </div>

        {/* Attendance Tab */}
        {activeTab === "attendance" && (
          <div>
            <h2 className="text-xl font-bold mb-4">Attendance Management</h2>
            {/* Record Attendance */}
            <div className="p-4 rounded mb-6" style={{ backgroundColor: "#F7F7F5" }}>
              <h3 className="font-semibold mb-2">Mark Attendance</h3>
              <p className="text-sm text-gray-600 mb-2">
                Select a course and date, then mark each student as present or absent.
              </p>

              <div className="flex gap-3 mb-3">
                <select
                  className="border p-2 rounded w-1/3"
                  value={selectedCourse}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedCourse(val);
                    const course = courses.find((c) => String(c.id) === String(val));
                    if (course?.semester !== undefined && course?.semester !== null) {
                      setAttendanceSemester(String(course.semester));
                    }
                  }}
                >
                  <option value="">Select Course</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  className="border p-2 rounded w-28"
                  placeholder="Semester"
                  value={attendanceSemester}
                  onChange={(e) => setAttendanceSemester(e.target.value)}
                />
                <input
                  type="date"
                  className="border p-2 rounded"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>

              {/* Students list */}
              {students.length > 0 && (
                <div className="border rounded mb-4 overflow-x-auto">
                  <div className="flex items-center justify-between p-2 bg-gray-50 border-b">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="px-3 py-1 rounded border bg-green-600 text-white border-green-600"
                        onClick={() => {
                          const next = {}; students.forEach(s => { next[s.id] = "present"; }); setAttendance(next);
                        }}
                      >
                        Mark All Present
                      </button>
                      <button
                        type="button"
                        className="px-3 py-1 rounded border bg-red-600 text-white border-red-600"
                        onClick={() => {
                          const next = {}; students.forEach(s => { next[s.id] = "absent"; }); setAttendance(next);
                        }}
                      >
                        Mark All Absent
                      </button>
                    </div>
                    <div className="text-sm text-gray-700">
                      {(() => {
                        const present = students.filter(s => attendance[s.id] === "present").length;
                        const total = students.length;
                        return `${present} / ${total} present`;
                      })()}
                    </div>
                  </div>
                  <table className="w-full border-collapse">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border p-2 text-left">ID</th>
                        <th className="border p-2 text-left">Name</th>
                        <th className="border p-2 text-left">Email</th>
                        <th className="border p-2 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((s) => (
                        <tr key={s.id} className="hover:bg-gray-50">
                          <td className="border p-2">{s.id}</td>
                          <td className="border p-2">{s.name}</td>
                          <td className="border p-2">{s.email}</td>
                          <td className="border p-2">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                className={`${btnBase} ${attendance[s.id] === "present" ? btnActivePresent : btnInactivePresent}`}
                                onClick={() => setStatus(s.id, "present")}
                              >
                                Present
                              </button>
                              <button
                                type="button"
                                className={`${btnBase} ${attendance[s.id] === "absent" ? btnActiveAbsent : btnInactiveAbsent}`}
                                onClick={() => setStatus(s.id, "absent")}
                              >
                                Absent
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <button
                className={`px-4 py-2 text-white rounded ${savingAttendance ? "bg-blue-300" : "bg-blue-600"}`}
                onClick={handleSubmitAttendance}
                disabled={savingAttendance}
              >
                {savingAttendance ? "Saving..." : "Record Attendance"}
              </button>
            </div>

            {/* Course Summary */}
            <div className="p-4 rounded mb-6" style={{ backgroundColor: "#F7F7F5" }}>
              <h3 className="font-semibold mb-2">📘 Course-wise Attendance Summary</h3>

              <div className="flex gap-3 mb-3">
                <select
                  className="border p-2 rounded w-1/3"
                  value={selectedCourseSummary}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedCourseSummary(val);
                    const course = courses.find((c) => String(c.id) === String(val));
                    if (course?.semester !== undefined && course?.semester !== null) {
                      setAttendanceSemester(String(course.semester));
                    }
                  }}
                >
                  <option value="">Select Course</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  className="border p-2 rounded w-28"
                  placeholder="Semester"
                  value={attendanceSemester}
                  onChange={(e) => setAttendanceSemester(e.target.value)}
                />
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded"
                  onClick={async () => {
                    if (!selectedCourseSummary || !attendanceSemester) { setMessage("Select course and semester"); return; }
                    const data = await apiTeacher.getCourseAttendanceSummary({
                      course_id: Number(selectedCourseSummary),
                      semester: Number(attendanceSemester),
                    });
                    setCourseSummary(data);
                  }}
                >
                  Load Summary
                </button>
              </div>

              {courseSummary.length > 0 && (
                <table className="w-full border-collapse">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border p-2 text-left">Student</th>
                      <th className="border p-2 text-left">Present</th>
                      <th className="border p-2 text-left">Total</th>
                      <th className="border p-2 text-left">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courseSummary.map((row) => (
                      <tr key={row.student_id} className="hover:bg-gray-50">
                        <td className="border p-2">{row.name}</td>
                        <td className="border p-2">{row.present}</td>
                        <td className="border p-2">{row.total}</td>
                        <td className="border p-2">{row.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Overall Summary */}
            <div className="p-4 rounded" style={{ backgroundColor: "#F7F7F5" }}>
              <h3 className="font-semibold mb-2">📊 Overall Attendance (All Courses)</h3>

              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm text-gray-700">Semester:</span>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <button
                    key={sem}
                    type="button"
                    onClick={() => setAttendanceSemester(String(sem))}
                    className={`px-2 py-1 rounded border ${String(sem) === String(attendanceSemester)
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-blue-700 border-blue-600"
                      }`}
                  >
                    {sem}
                  </button>
                ))}
                <input
                  type="number"
                  min={1}
                  className="border p-2 rounded w-24 ml-2"
                  placeholder="Custom"
                  value={attendanceSemester}
                  onChange={(e) => setAttendanceSemester(e.target.value)}
                />
              </div>

              <button
                className="px-4 py-2 bg-purple-600 text-white rounded mb-4"
                onClick={async () => {
                  if (!attendanceSemester) {
                    setMessage("Enter semester to load overall summary");
                    return;
                  }
                  setMessage("");
                  try {
                    const data = await apiTeacher.getTeacherOverallAttendanceSummary({
                      teacher_id: user.id,
                      semester: Number(attendanceSemester),
                    });
                    setOverallSummary(Array.isArray(data) ? data : []);
                    if (!data || data.length === 0) {
                      setMessage("No data found for this semester.");
                    }
                  } catch (err) {
                    setOverallSummary([]);
                    setMessage(err.message || "Failed to load overall summary");
                  }
                }}
              >
                Load Overall Summary
              </button>

              {overallSummary.length > 0 && (
                <table className="w-full border-collapse text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border p-2 text-left">Student</th>
                      <th className="border p-2 text-left">Present</th>
                      <th className="border p-2 text-left">Total</th>
                      <th className="border p-2 text-left">Overall %</th>
                    </tr>
                  </thead>

                  <tbody>
                    {overallSummary.map((row) => (
                      <tr key={row.student_id} className="hover:bg-gray-50">
                        <td className="border p-2">{row.name}</td>
                        <td className="border p-2">{row.present}</td>
                        <td className="border p-2">{row.total}</td>
                        <td className="border p-2">
                          {row.total > 0 ? ((row.present / row.total) * 100).toFixed(2) : "0.00"}%
                        </td>
                      </tr>
                    ))}
                  </tbody>

                  <tfoot>
                    {(() => {
                      const totalPresent = overallSummary.reduce((acc, r) => acc + (r.present || 0), 0);
                      const totalClasses = overallSummary.reduce((acc, r) => acc + (r.total || 0), 0);
                      const pct =
                        totalClasses > 0 ? ((totalPresent / totalClasses) * 100).toFixed(2) : "0.00";
                      return (
                        <tr className="bg-gray-50 font-semibold">
                          <td className="border p-2 text-left">Totals</td>
                          <td className="border p-2">{totalPresent}</td>
                          <td className="border p-2">{totalClasses}</td>
                          <td className="border p-2">{pct}%</td>
                        </tr>
                      );
                    })()}
                  </tfoot>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === "courses" && (
          <div>
            {/* Create Course */}
            <div className="mb-6  p-4 rounded" style={{ backgroundColor: "#F7F7F5" }}>
              <h3 className="font-semibold mb-2">Create Course</h3>
              <form onSubmit={handleCreateCourse} className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Course Name"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  required
                  className="border p-2 rounded flex-1"
                />
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={courseSemester}
                  onChange={(e) => setCourseSemester(e.target.value)}
                  className="border p-2 rounded w-28"
                  placeholder="Semester"
                  required
                />
                <button type="submit" className="px-3 py-2 bg-green-600 text-white rounded">Create</button>
              </form>
            </div>

            {/* Course List */}
            <div className="p-4 rounded mb-6" style={{ backgroundColor: "#F7F7F5" }}>
              <h3 className="font-semibold mb-2">Your Courses</h3>
              {courses.length > 0 ? (
                <table className="w-full border-collapse">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border p-2 text-left">ID</th>
                      <th className="border p-2 text-left">Name</th>
                      <th className="border p-2 text-left">Semester</th>
                      <th className="border p-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="border p-2">{c.id}</td>
                        <td className="border p-2">{c.name}</td>
                        <td className="border p-2">{c.semester}</td>
                        <td className="border p-2">
                          <button
                            onClick={async () => {
                              if (!confirm(`Are you sure you want to delete course "${c.name}"? This will unenroll all students.`)) return;
                              try {
                                const res = await apiTeacher.deleteCourse(c.id);
                                alert(res.message);
                                const updated = await apiTeacher.getCourses(user.id);
                                setCourses(updated);
                              } catch (err) {
                                console.error(err);
                                alert(err.message || "Failed to delete course");
                              }
                            }}
                            className="px-3 py-1 bg-red-600 text-white rounded"
                          >
                            Delete
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                const res = await apiTeacher.enrollAllSemesterStudents(c.id);
                                alert(res.message + (res.enrolled !== undefined ? ` (Enrolled: ${res.enrolled})` : ""));
                              } catch (err) {
                                console.error(err);
                                alert(err.message || "Failed to enroll all semester students");
                              }
                            }}
                            className="ml-2 px-3 py-1 bg-blue-600 text-white rounded"
                          >
                            Enroll All (Semester)
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500">No Courses Found.</p>
              )}
            </div>

            {/* Enroll Students */}
            <div className="mb-6  p-4 rounded" style={{ backgroundColor: "#F7F7F5" }}>
              <h3 className="font-semibold mb-2">Enroll Students</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block mb-1">Course:</label>
                  <select
                    value={enrollCourseId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEnrollCourseId(val);
                      const course = courses.find((c) => String(c.id) === String(val));
                      if (course?.semester !== undefined && course?.semester !== null) {
                        setFilterSemester(String(course.semester));
                      }
                    }}
                    className="border p-2 rounded w-full text-black"
                    style={{ backgroundColor: "white" }}
                  >
                    <option value="">-- Select Course --</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Semester:</label>
                  <input
                    type="number"
                    min={1}
                    value={filterSemester}
                    onChange={(e) => setFilterSemester(e.target.value)}
                    className="border p-2 rounded w-full"
                    placeholder="Enter semester"
                  />
                </div>
                
              </div>

              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={handleLoadAvailableStudents}
                  className="px-4 py-2 bg-gray-700 text-white rounded"
                >
                  Load Students
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setMessage("");
                    if (!newStudentEmail || !filterSemester) {
                      setMessage("Enter email and semester for new student");
                      return;
                    }
                    try {
                      const name = newStudentEmail.split('@')[0];
                      await apiTeacher.createStudent({
                        name,
                        email: newStudentEmail,
                        password: "temp123",
                        semester: Number(filterSemester)
                      });
                      setMessage("Student created successfully!");
                      setNewStudentEmail("");
                      await handleLoadAvailableStudents();
                    } catch (err) {
                      setMessage(err.message);
                    }
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded"
                >
                  Add New Student
                </button>
              </div>

              {availableStudents.length > 0 && (
                <div>
                  <div className="max-h-56 overflow-auto border rounded mb-3" >
                    {availableStudents.map((s) => (
                      <label key={s.id} className="flex items-center gap-2 p-2 border-b hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={selectedStudentIds.includes(s.id)}
                          onChange={() => toggleStudentSelect(s.id)}
                        />
                        <span className="flex-1">{s.name} - {s.email}</span>
                      </label>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleEnrollStudents}
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                    disabled={selectedStudentIds.length === 0 || !enrollCourseId}
                  >
                    Enroll Selected Students
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Marks Tab */}
        {activeTab === "marks" && (
          <div>
            {/* Course selector */}
            <div className="mb-4" >
              <label className="mr-2">Select Course:</label>
              <select
                value={selectedCourse}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedCourse(val);
                  const course = courses.find((c) => String(c.id) === String(val));
                  if (course?.semester !== undefined && course?.semester !== null) {
                    setMarksSemester(String(course.semester));
                  }
                }}
                className=" p-2 rounded"
                style={{ backgroundColor: "#F7F7F5" }}
              >
                <option value="">-- Choose Course --</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Semester + Exam type + Load button */}
            <div className="mb-4 flex gap-4 items-center">
              <div>
                <label className="mr-2" >Semester:</label>
                <input
                  type="number"
                  min={1}
                  value={marksSemester}
                  onChange={(e) => setMarksSemester(e.target.value)}
                  className=" p-2 rounded w-28"
                  style={{ backgroundColor: "#F7F7F5" }}
                />
              </div>
              <div>
                <label className="mr-2">Exam:</label>
                <select
                  style={{ backgroundColor: "#F7F7F5" }}
                  value={marksExamType}
                  onChange={(e) => setMarksExamType(e.target.value)}
                  className=" p-2 rounded"
                >
                  <option value="mid">Mid Term</option>
                  <option value="end">End Term</option>
                </select>
              </div>
              <button
                type="button"
                onClick={handleLoadStudents}
                className="px-3 py-2 bg-green-600 text-white rounded"
              >
                Load Students
              </button>
            </div>

            {/* Students table */}
            {students.length > 0 && (
              <div className="border rounded overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-100" >
                    <tr>
                      <th className="border p-2 text-left">ID</th>
                      <th className="border p-2 text-left">Name</th>
                      <th className="border p-2 text-left">Email</th>
                      <th className="border p-2 text-left">Marks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s) => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="border p-2">{s.id}</td>
                        <td className="border p-2">{s.name}</td>
                        <td className="border p-2">{s.email}</td>
                        <td className="border p-2">
                          <input
                            type="number"
                            placeholder="Marks"
                            value={marksByStudent[s.id] ?? ""}
                            onChange={(e) => setMarks(s.id, e.target.value)}
                            className="border p-2 rounded w-24"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Save button */}
            {students.length > 0 && (
              <button
                onClick={handleSubmitMarks}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
              >
                Save Marks
              </button>
            )}
          </div>
        )}

        {/* Enrollments Tab */}
        {activeTab === "enrollments" && (
          <div>
            <div className="mb-6  p-4 rounded">
              <h3 className="font-semibold mb-2" >Get Student Records</h3>

              <div className=" rounded p-3" style={{ backgroundColor: "#F7F7F5" }}>
                <div className="flex flex-wrap gap-2 items-end mb-3">
                  <div>
                    <label className="mr-2">Course:</label>
                    <select
                      className="border p-2 rounded"
                      value={enrollmentsCourseId}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEnrollmentsCourseId(val);
                        const course = courses.find((c) => String(c.id) === String(val));
                        if (course?.semester !== undefined && course?.semester !== null) {
                          setEnrollmentsSemester(String(course.semester));
                        }
                      }}
                    >
                      <option value="" className="text-black">
                        -- Select Course --
                      </option>
                      {courses.map((c) => (
                        <option className="text-black" key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mr-2">Semester:</label>
                    <input
                      type="number"
                      className="border p-2 rounded w-28"
                      value={enrollmentsSemester}
                      onChange={(e) => setEnrollmentsSemester(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleLoadEnrollments}
                    className="px-3 py-2 bg-blue-600 text-white rounded"
                  >
                    Load
                  </button>
                </div>

                {/* Table */}
                {enrollments.length > 0 ? (
                  <table className="w-full border-collapse ">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border p-2 text-left">ID</th>
                        <th className="border p-2 text-left">Name</th>
                        <th className="border p-2 text-left">Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enrollments.map((s) => (
                        <tr key={s.id} className="hover:bg-gray-50">
                          <td className="border p-2">{s.id}</td>
                          <td className="border p-2">{s.name}</td>
                          <td className="border p-2">{s.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-500">No students found for this course & semester.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Issues Tab */}
        {activeTab === "issues" && (
          <div>
            <div className="p-4 rounded" style={{ backgroundColor: "#F7F7F5" }}>
              <h3 className="font-semibold mb-2">Student Raised Issues</h3>
              
              <div className="mb-4">
                <button 
                  onClick={fetchIssues} 
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Refresh Issues
                </button>
              </div>
              
              {issues.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border p-2 text-left">ID</th>
                        <th className="border p-2 text-left">Student Name</th>
                        <th className="border p-2 text-left">Student Email</th>
                        <th className="border p-2 text-left">Course</th>
                        <th className="border p-2 text-left">Date</th>
                        <th className="border p-2 text-left">Reason</th>
                        <th className="border p-2 text-left">Status</th>
                        <th className="border p-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {issues.map((issue) => (
                        <tr key={issue.id} className="hover:bg-gray-50">
                          <td className="border p-2">{issue.id}</td>
                          <td className="border p-2">{issue.student_name || issue.student?.name || issue.student_id}</td>
                          <td className="border p-2">{issue.student_email || issue.student?.email || "-"}</td>
                          <td className="border p-2">{issue.course_name || issue.course?.name || issue.course_id}</td>
                          <td className="border p-2">{new Date(issue.created_at).toLocaleDateString()}</td>
                          <td className="border p-2">{issue.remark}</td>
                          <td className="border p-2">
                            <span 
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                issue.status === "Approved" 
                                  ? "bg-green-100 text-green-800" 
                                  : issue.status === "Rejected"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {issue.status}
                            </span>
                          </td>
                          <td className="border p-2">
                            {issue.status === "Pending" && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setIssueId(issue.id);
                                    setIssueStatus("Approved");
                                    setIssueRemark("");
                                  }}
                                  className="px-2 py-1 bg-green-600 text-white text-xs rounded"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => {
                                    setIssueId(issue.id);
                                    setIssueStatus("Rejected");
                                    setIssueRemark("");
                                  }}
                                  className="px-2 py-1 bg-red-600 text-white text-xs rounded"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No issues to display.</p>
              )}
              
              {/* Resolve Issue Form */}
              {issueId && (
                <div className="mt-6 p-4 border rounded bg-white">
                  <h4 className="font-semibold mb-2">
                    {issueStatus === "Approved" ? "Approve" : "Reject"} Issue #{issueId}
                  </h4>
                  <form onSubmit={handleResolveIssue} className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Remark (Optional)
                      </label>
                      <textarea
                        value={issueRemark}
                        onChange={(e) => setIssueRemark(e.target.value)}
                        className="border p-2 rounded w-full h-24"
                        placeholder="Add a message for the student"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className={`px-4 py-2 text-white rounded ${
                          issueStatus === "Approved" ? "bg-green-600" : "bg-red-600"
                        }`}
                      >
                        {issueStatus === "Approved" ? "Approve" : "Reject"} Issue
                      </button>
                      <button
                        type="button"
                        onClick={() => setIssueId("")}
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

        {message && <p className="mt-4 text-green-600">{message}</p>}
      </div>
    </DashboardLayout>
  );
};

export default TeacherDashboard;