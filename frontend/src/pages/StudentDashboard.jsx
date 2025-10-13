import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiStudent } from "../api";
import DashboardLayout from "../DashboardLayout";

const StudentDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("attendance");

  // Attendance states
  const [attendance, setAttendance] = useState([]);
  const [attendanceYear, setAttendanceYear] = useState(new Date().getFullYear());
  const [attendanceMonth, setAttendanceMonth] = useState(new Date().getMonth() + 1);
  const [attendanceByMonthResult, setAttendanceByMonthResult] = useState([]);

  const [attendanceSummary, setAttendanceSummary] = useState({
    overall: { present: 0, total: 0, percentage: 0 },
    by_course: [],
  });
  const [attendanceCheckCourseId, setAttendanceCheckCourseId] = useState("");

  // Courses & Grades
  const [courses, setCourses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [showMid, setShowMid] = useState(true);
  const [showEnd, setShowEnd] = useState(true);
  const [gradesSemester, setGradesSemester] = useState(user?.semester ?? "");

  // Issue form
  const [issueCourseId, setIssueCourseId] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [issueReason, setIssueReason] = useState("");
  const [studentIssues, setStudentIssues] = useState([]);

  const [message, setMessage] = useState("");

  // Load courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await apiStudent.getCourses(user.id);
        setCourses(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCourses();
  }, [user.id]);

  // Load issues
  useEffect(() => {
    if (activeTab === "issue") {
      fetchStudentIssues();
    }
  }, [activeTab, user.id]);

  // Attendance summary
  const handleViewAttendanceSummary = async () => {
    setMessage("");
    try {
      const data = await apiStudent.getAttendanceSummary(user.id);
      setAttendanceSummary(data);
    } catch (err) {
      setMessage(err.message);
    }
  };

  // Attendance by month
  const handleCheckAttendanceByMonth = async () => {
    if (!attendanceCheckCourseId || !attendanceYear || !attendanceMonth) return;

    try {
      const data = await apiStudent.getAttendanceByCourseAndMonth({
        student_id: user.id,
        course_id: Number(attendanceCheckCourseId),
        year: Number(attendanceYear),
        month: Number(attendanceMonth),
      });

      setAttendanceByMonthResult(data);
    } catch (err) {
      setMessage(err.message);
    }
  };

  // Grades summary
  const handleViewGradesSummary = async () => {
    setMessage("");
    try {
      const semesterCandidate = gradesSemester || user?.semester || (courses && courses[0] && courses[0].semester);
      if (!semesterCandidate) {
        setMessage("Semester info missing.");
        return;
      }
      const semester = Number(semesterCandidate);

      const data = await apiStudent.getGrades({
        student_id: user.id,
        semester,
        show_mid: Boolean(showMid),
        show_end: Boolean(showEnd),
      });
      setGrades(Array.isArray(data) ? data : []);
    } catch (err) {
      setMessage(err.message || "Failed to load grades");
    }
  };

  // Raise issue
  const handleRaiseIssue = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await apiStudent.raiseIssue({
        student_id: user.id,
        course_id: Number(issueCourseId),
        date: issueDate,
        reason: issueReason,
      });
      setMessage("✅ Issue raised successfully!");
      setIssueCourseId("");
      setIssueDate("");
      setIssueReason("");
      fetchStudentIssues();
    } catch (err) {
      setMessage(err.message);
    }
  };

  // Fetch issues
  const fetchStudentIssues = async () => {
    try {
      const data = await apiStudent.getStudentIssues(user.id);
      setStudentIssues(data);
    } catch (err) {
      console.error(err);
    }
  };

  const tabButton = (key, label) => (
    <button
      type="button"
      onClick={() => setActiveTab(key)}
      className={`px-4 py-2 border-b-2 ${activeTab === key ? "border-blue-600 text-blue-600" : "border-transparent"
        }`}
    >
      {label}
    </button>
  );

  return (
    <DashboardLayout>
      <div className="p-6 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Student Dashboard</h2>
        <p className="mb-6">Welcome{user?.email ? `, ${user.email}` : ""}</p>

        {/* Tabs */}
        <div className="flex gap-4 border-b mb-6">
          {tabButton("attendance", "Attendance")}
          {tabButton("grades", "Grades")}
          {tabButton("issue", "Raise Issue")}
        </div>

        {/* Attendance */}
        {activeTab === "attendance" && (
          <div className="border rounded p-4 bg-gray-50 space-y-6">
            {/* Summary */}
            <div>
              <button
                onClick={handleViewAttendanceSummary}
                className="px-4 py-2 bg-indigo-600 text-white rounded"
              >
                View Overall Attendance
              </button>

              {attendanceSummary.by_course.length > 0 && (
                <div className="mt-4">
                  <div className="p-3 rounded border bg-white mb-3">
                    <div className="text-sm text-gray-500">Overall Attendance</div>
                    <div className="text-xl font-semibold">
                      {attendanceSummary.overall.percentage}%
                    </div>
                    <div className="text-xs text-gray-500">
                      {attendanceSummary.overall.present}/{attendanceSummary.overall.total} days
                    </div>
                  </div>

                  <table className="w-full border-collapse">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border p-2 text-left">Course</th>
                        <th className="border p-2">Present</th>
                        <th className="border p-2">Total</th>
                        <th className="border p-2">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceSummary.by_course.map((c) => (
                        <tr key={c.course_id} className="hover:bg-gray-50">
                          <td className="border p-2">{c.course_name}</td>
                          <td className="border p-2">{c.present}</td>
                          <td className="border p-2">{c.total}</td>
                          <td className="border p-2">{c.percentage}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Attendance by Month */}
            <div>
              <h4 className="font-semibold mb-2">Check Attendance by Month</h4>
              <div className="flex gap-3 items-center mb-3">
                <select
                  value={attendanceCheckCourseId}
                  onChange={(e) => setAttendanceCheckCourseId(e.target.value)}
                  className="border p-2 rounded"
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
                  value={attendanceYear}
                  onChange={(e) => setAttendanceYear(e.target.value)}
                  placeholder="Year"
                  className="border p-2 rounded w-20"
                />
                <input
                  type="number"
                  value={attendanceMonth}
                  onChange={(e) => setAttendanceMonth(e.target.value)}
                  placeholder="Month"
                  min={1}
                  max={12}
                  className="border p-2 rounded w-20"
                />

                <button
                  onClick={handleCheckAttendanceByMonth}
                  className="px-4 py-2 bg-slate-700 text-white rounded"
                >
                  Check
                </button>
              </div>

              {attendanceByMonthResult && attendanceByMonthResult.length > 0 && (
                <div style={{ height: "300px", width: "300px" }}>
                  <div className="grid grid-cols-7 gap-2 mt-3">
                    {attendanceByMonthResult.map((a) => (
                      <div
                        key={a.date}
                        className={`p-2 rounded text-center font-semibold ${a.status === "Present" ? "bg-green-200 text-green-800" : "bg-white "
                          }`}
                      >
                        {new Date(a.date).getDate()}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Grades */}
        {activeTab === "grades" && (
          <div className="border rounded p-4 bg-gray-50">
            <div className="flex gap-4 items-center mb-4">
              <label>
                <input
                  type="checkbox"
                  checked={showMid}
                  onChange={(e) => setShowMid(e.target.checked)}
                  className="mr-2"
                />
                Show Mid
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={showEnd}
                  onChange={(e) => setShowEnd(e.target.checked)}
                  className="mr-2"
                />
                Show End
              </label>
              <button
                onClick={handleViewGradesSummary}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                View Marks
              </button>
            </div>

            {/* Semester input */}
            {!user?.semester && (
              <div className="mb-2">
                <label className="mr-2 text-sm">Semester:</label>
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={gradesSemester}
                  onChange={(e) => setGradesSemester(e.target.value)}
                  className="border p-2 rounded w-28"
                  placeholder="Enter semester"
                />
              </div>
            )}

            {grades.length > 0 && (showMid || showEnd) ? (
              <table className="w-full border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-2 text-left">Course</th>
                    {showMid && <th className="border p-2 text-left">Mid</th>}
                    {showEnd && <th className="border p-2 text-left">End</th>}
                  </tr>
                </thead>
                <tbody>
                  {grades.map((g, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="border p-2">{g.course_name ?? "-"}</td>
                      {showMid && <td className="border p-2">{g.mid ?? "-"}</td>}
                      {showEnd && <td className="border p-2">{g.end ?? "-"}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500">
                {grades.length === 0
                  ? "No marks data available."
                  : "Select at least one exam type to view marks."}
              </p>
            )}
          </div>
        )}

        {/* Raise Issue */}
        {activeTab === "issue" && (
          <div className="border rounded p-4 bg-gray-50">
            <h3 className="font-semibold mb-4">Raise Attendance Issue</h3>
            <form onSubmit={handleRaiseIssue} className="space-y-3 mb-6">
              <select
                value={issueCourseId}
                onChange={(e) => setIssueCourseId(e.target.value)}
                required
                className="border p-2 rounded w-full"
              >
                <option value="">Select Course</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                required
                className="border p-2 rounded w-full"
              />
              <textarea
                placeholder="Reason"
                value={issueReason}
                onChange={(e) => setIssueReason(e.target.value)}
                required
                className="border p-2 rounded w-full h-24"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 text-white rounded"
              >
                Submit Issue
              </button>
            </form>

            {/* Issue Status */}
            <div className="mt-8">
              <h3 className="font-semibold mb-4">Your Issues</h3>
              {studentIssues.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border p-2 text-left">Course</th>
                        <th className="border p-2 text-left">Date</th>
                        <th className="border p-2 text-left">Reason</th>
                        <th className="border p-2 text-left">Status</th>
                        <th className="border p-2 text-left">Teacher Remark</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentIssues.map((issue) => (
                        <tr key={issue.id} className="hover:bg-gray-50">
                          <td className="border p-2">{issue.course_name}</td>
                          <td className="border p-2">{new Date(issue.date).toLocaleDateString()}</td>
                          <td className="border p-2">{issue.reason}</td>
                          <td className="border p-2">
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${issue.status === "Approved"
                                ? "bg-green-100 text-green-800"
                                : issue.status === "Rejected"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                                }`}
                            >
                              {issue.status}
                            </span>
                          </td>
                          <td className="border p-2">{issue.remark || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No issues raised yet.</p>
              )}
            </div>
          </div>
        )}

        {/* Message */}
        {message && (
          <p
            className={`mt-4 ${message.toLowerCase().includes("success")
              ? "text-green-600"
              : "text-red-600"
              }`}
          >
            {message}
          </p>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;