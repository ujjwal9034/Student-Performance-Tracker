import React, { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiStudent } from "../api";
import DashboardLayout from "../DashboardLayout";

const StudentDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("attendance");

  const [attendance, setAttendance] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState({ overall: { present: 0, total: 0, percentage: 0 }, by_course: [] });
  const [attendanceDate, setAttendanceDate] = useState("");
  const [attendanceByDate, setAttendanceByDate] = useState([]);
  const [courses, setCourses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [gradesSemester, setGradesSemester] = useState(1);

  const [issueCourseId, setIssueCourseId] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [issueReason, setIssueReason] = useState("");

  const [message, setMessage] = useState("");

  // Fetch attendance (raw records)
  const handleViewAttendance = async () => {
    setMessage("");
    try {
      const data = await apiStudent.getAttendance(user.id);
      setAttendance(data);
    } catch (err) {
      setMessage(err.message);
    }
  };

  // Fetch attendance summary
  const handleViewAttendanceSummary = async () => {
    setMessage("");
    try {
      const data = await apiStudent.getAttendanceSummary(user.id);
      setAttendanceSummary(data);
    } catch (err) {
      setMessage(err.message);
    }
  };

  // Fetch attendance by date
  const handleViewByDate = async () => {
    if (!attendanceDate) {
      setMessage("Please select a date");
      return;
    }
    setMessage("");
    try {
      const data = await apiStudent.getAttendanceByDate({ student_id: user.id, date: attendanceDate });
      setAttendanceByDate(data);
    } catch (err) {
      setMessage(err.message);
    }
  };

  // Fetch grades
  const handleViewGrades = async () => {
    setMessage("");
    try {
      const data = await apiStudent.getGrades({
        student_id: user.id,
        semester: Number(gradesSemester),
      });
      setGrades(data);
    } catch (err) {
      setMessage(err.message);
    }
  };

  // Load courses and grade summary for UX clarity
  const handleLoadCourses = async () => {
    setMessage("");
    try {
      const data = await apiStudent.getCourses(user.id);
      setCourses(data);
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleViewGradesSummary = async () => {
    setMessage("");
    try {
      const data = await apiStudent.getGradesSummary({ student_id: user.id, semester: Number(gradesSemester) });
      setGrades(data);
    } catch (err) {
      setMessage(err.message);
    }
  };

  // Raise attendance issue
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
      setMessage("Issue raised successfully!");
      setIssueCourseId("");
      setIssueDate("");
      setIssueReason("");
    } catch (err) {
      setMessage(err.message);
    }
  };

  const tabButton = (key, label) => (
    <button
      type="button"
      onClick={() => setActiveTab(key)}
      className={`px-4 py-2 border-b-2 ${activeTab === key ? "border-blue-600 text-blue-600" : "border-transparent"}`}
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

        {/* Attendance Tab */}
        {activeTab === "attendance" && (
          <div className="border rounded p-4" style={{ backgroundColor: "#F7F7F5" }}>
            <div className="flex flex-wrap gap-3 mb-4">
              <button onClick={handleViewAttendance} className="px-4 py-2 bg-blue-600 text-white rounded">
                View Records
              </button>
              <button onClick={handleViewAttendanceSummary} className="px-4 py-2 bg-indigo-600 text-white rounded">
                View Summary
              </button>
              <div className="flex items-center gap-2">
                <input type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} className="border p-2 rounded" />
                <button onClick={handleViewByDate} className="px-3 py-2 bg-slate-700 text-white rounded">By Date</button>
              </div>
            </div>

            {/* Summary cards */}
            {attendanceSummary?.by_course?.length > 0 && (
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                  <div className="p-3 rounded border bg-white">
                    <div className="text-sm text-gray-500">Overall Attendance</div>
                    <div className="text-xl font-semibold">{attendanceSummary.overall.percentage}%</div>
                    <div className="text-xs text-gray-500">{attendanceSummary.overall.present}/{attendanceSummary.overall.total} days present</div>
                  </div>
                </div>
                <div className="overflow-x-auto">
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
                          <td className="border p-2 text-left">{c.course_name || c.course_id}</td>
                          <td className="border p-2">{c.present}</td>
                          <td className="border p-2">{c.total}</td>
                          <td className="border p-2">{c.percentage}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* By date table */}
            {attendanceByDate.length > 0 && (
              <div className="mb-6">
                <div className="font-semibold mb-2">Attendance on {attendanceDate}</div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border p-2 text-left">Course</th>
                        <th className="border p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceByDate.map((r, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="border p-2 text-left">{r.course_name || r.course_id}</td>
                          <td className="border p-2">{r.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Raw records */}
            {attendance.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border p-2">Date</th>
                      <th className="border p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.map((a, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="border p-2">{a.date}</td>
                        <td className="border p-2">{a.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No attendance records found.</p>
            )}
          </div>
        )}

        {/* Grades Tab */}
        {activeTab === "grades" && (
          <div className="border rounded p-4" style={{ backgroundColor: "#F7F7F5" }}>
            <div className="mb-4 flex items-center gap-4">
              <label>Semester:</label>
              <input
                type="number"
                min={1}
                value={gradesSemester}
                onChange={(e) => setGradesSemester(e.target.value)}
                className="border p-2 rounded w-28"
                style={{ backgroundColor: "#F7F7F5" }}
              />
              <button onClick={handleViewGradesSummary} className="px-4 py-2 bg-green-600 text-white rounded">
                View Summary (Mid/End)
              </button>
              <button onClick={handleLoadCourses} className="px-3 py-2 bg-slate-700 text-white rounded">
                Load My Courses
              </button>
            </div>

            {/* Grades summary table */}
            {grades.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border p-2 text-left">Course</th>
                      <th className="border p-2">Mid</th>
                      <th className="border p-2">End</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grades.map((g, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="border p-2 text-left">{g.course_name || g.course_id}</td>
                        <td className="border p-2">{g.mid ?? "-"}</td>
                        <td className="border p-2">{g.end ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No grades found for this semester.</p>
            )}
          </div>
        )}

        {/* Raise Issue Tab */}
        {activeTab === "issue" && (
          <div className="border rounded p-4" style={{ backgroundColor: "#F7F7F5" }}>
            <h3 className="font-semibold mb-4">Raise Attendance Issue</h3>
            <form onSubmit={handleRaiseIssue} className="space-y-3">
              <input
                type="number"
                placeholder="Course ID"
                value={issueCourseId}
                onChange={(e) => setIssueCourseId(e.target.value)}
                required
                className="border p-2 rounded w-full"
              />
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
              <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded">
                Submit Issue
              </button>
            </form>
          </div>
        )}

        {/* Message */}
        {message && (
          <p
            className={`mt-4 ${
              message.toLowerCase().includes("success") ? "text-green-600" : "text-red-600"
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
