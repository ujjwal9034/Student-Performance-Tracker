import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { apiAdmin } from "../api";
import DashboardLayout from "../DashboardLayout";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("teachers");
  const [message, setMessage] = useState("");

  // Teachers
  const [teachers, setTeachers] = useState([]);
  const [newTeacher, setNewTeacher] = useState({ name: "", email: "", password: "" });

  // Students
  const [students, setStudents] = useState([]);
  const [newStudent, setNewStudent] = useState({ name: "", email: "", password: "", semester: 1 });

  // Courses
  const [courses, setCourses] = useState([]);
  const [newCourse, setNewCourse] = useState({ name: "", code: "" });

  // Fetch all data
  const fetchAll = async () => {
    try {
      const teachersData = await apiAdmin.getTeachers();
      const studentsData = await apiAdmin.getStudents();
      const coursesData = await apiAdmin.getCourses();
      setTeachers(teachersData);
      setStudents(studentsData);
      setCourses(coursesData);
    } catch (err) {
      setMessage(err.message);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Add teacher
  const handleAddTeacher = async (e) => {
    e.preventDefault();
    try {
      await apiAdmin.addTeacher(newTeacher);
      setMessage("Teacher added successfully!");
      setNewTeacher({ name: "", email: "", password: "" });
      fetchAll();
    } catch (err) {
      setMessage(err.message);
    }
  };

  // Add student
  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      await apiAdmin.addStudent({ ...newStudent, semester: Number(newStudent.semester) });
      setMessage("Student added successfully!");
      setNewStudent({ name: "", email: "", password: "", semester: 1 });
      fetchAll();
    } catch (err) {
      setMessage(err.message);
    }
  };

  // Add course
  const handleAddCourse = async (e) => {
    e.preventDefault();
    try {
      await apiAdmin.addCourse(newCourse);
      setMessage("Course added successfully!");
      setNewCourse({ name: "", code: "" });
      fetchAll();
    } catch (err) {
      setMessage(err.message);
    }
  };

  // Delete handlers
  const handleDeleteTeacher = async (id) => {
    try {
      await apiAdmin.deleteTeacher(id);
      setMessage("Teacher deleted successfully!");
      fetchAll();
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleDeleteStudent = async (id) => {
    try {
      await apiAdmin.deleteStudent(id);
      setMessage("Student deleted successfully!");
      fetchAll();
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleDeleteCourse = async (id) => {
    try {
      await apiAdmin.deleteCourse(id);
      setMessage("Course deleted successfully!");
      fetchAll();
    } catch (err) {
      setMessage(err.message);
    }
  };

  const tabButton = (key, label) => (
    <button
      onClick={() => setActiveTab(key)}
      className={`px-4 py-2 border-b-2 ${activeTab === key ? "border-blue-600 text-blue-600" : "border-transparent"}`}
    >
      {label}
    </button>
  );

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
        <p className="mb-6">Welcome{user?.email ? `, ${user.email}` : ""}</p>

        {/* Tabs */}
        <div className="flex gap-4 border-b mb-6">
          {tabButton("teachers", "Teachers")}
          {tabButton("students", "Students")}
          {tabButton("courses", "Courses")}
        </div>

        {/* Teachers Tab */}
        {activeTab === "teachers" && (
          <div className="border rounded p-4" style={{ backgroundColor: "#F7F7F5" }}>
            <h3 className="font-semibold mb-3">Add Teacher</h3>
            <form onSubmit={handleAddTeacher} className="flex gap-2 mb-4 flex-wrap">
              <input
                type="text"
                placeholder="Name"
                value={newTeacher.name}
                onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
                required
                className="border p-2 rounded"
              />
              <input
                type="email"
                placeholder="Email"
                value={newTeacher.email}
                onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
                required
                className="border p-2 rounded"
              />
              <input
                type="password"
                placeholder="Password"
                value={newTeacher.password}
                onChange={(e) => setNewTeacher({ ...newTeacher, password: e.target.value })}
                required
                className="border p-2 rounded"
              />
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Add</button>
            </form>

            <h3 className="font-semibold mb-2">Existing Teachers</h3>
            <table className="w-full border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2">ID</th>
                  <th className="border p-2">Name</th>
                  <th className="border p-2">Email</th>
                  <th className="border p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="border p-2">{t.id}</td>
                    <td className="border p-2">{t.name}</td>
                    <td className="border p-2">{t.email}</td>
                    <td className="border p-2">
                      <button
                        onClick={() => handleDeleteTeacher(t.id)}
                        className="px-2 py-1 bg-red-600 text-white rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Students Tab */}
        {activeTab === "students" && (
          <div className="border rounded p-4" style={{ backgroundColor: "#F7F7F5" }}>
            <h3 className="font-semibold mb-3">Add Student</h3>
            <form onSubmit={handleAddStudent} className="flex gap-2 mb-4 flex-wrap">
              <input
                type="text"
                placeholder="Name"
                value={newStudent.name}
                onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                required
                className="border p-2 rounded"
              />
              <input
                type="email"
                placeholder="Email"
                value={newStudent.email}
                onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                required
                className="border p-2 rounded"
              />
              <input
                type="password"
                placeholder="Password"
                value={newStudent.password}
                onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                required
                className="border p-2 rounded"
              />
              <input
                type="number"
                placeholder="Semester"
                value={newStudent.semester}
                min={1}
                onChange={(e) => setNewStudent({ ...newStudent, semester: e.target.value })}
                required
                className="border p-2 rounded w-24"
              />
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Add</button>
            </form>

            <h3 className="font-semibold mb-2">Existing Students</h3>
            <table className="w-full border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2">ID</th>
                  <th className="border p-2">Name</th>
                  <th className="border p-2">Email</th>
                  <th className="border p-2">Semester</th>
                  <th className="border p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="border p-2">{s.id}</td>
                    <td className="border p-2">{s.name}</td>
                    <td className="border p-2">{s.email}</td>
                    <td className="border p-2">{s.semester}</td>
                    <td className="border p-2">
                      <button
                        onClick={() => handleDeleteStudent(s.id)}
                        className="px-2 py-1 bg-red-600 text-white rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === "courses" && (
          <div className="border rounded p-4" style={{ backgroundColor: "#F7F7F5" }}>
            <h3 className="font-semibold mb-3">Add Course</h3>
            <form onSubmit={handleAddCourse} className="flex gap-2 mb-4 flex-wrap">
              <input
                type="text"
                placeholder="Course Name"
                value={newCourse.name}
                onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                required
                className="border p-2 rounded"
              />
              <input
                type="text"
                placeholder="Course Code"
                value={newCourse.code}
                onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
                required
                className="border p-2 rounded w-32"
              />
              <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded">Add</button>
            </form>

            <h3 className="font-semibold mb-2">Existing Courses</h3>
            <table className="w-full border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2">ID</th>
                  <th className="border p-2">Name</th>
                  <th className="border p-2">Code</th>
                  <th className="border p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="border p-2">{c.id}</td>
                    <td className="border p-2">{c.name}</td>
                    <td className="border p-2">{c.code}</td>
                    <td className="border p-2">
                      <button
                        onClick={() => handleDeleteCourse(c.id)}
                        className="px-2 py-1 bg-red-600 text-white rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

export default AdminDashboard;
