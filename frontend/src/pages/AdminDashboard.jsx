import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { apiAdmin } from "../api";
import DashboardLayout from "../DashboardLayout";
import {
  People,
  School,
  Class,
  PendingActions,
  AdminPanelSettings,
  DeleteOutline,
  CheckCircleOutline,
  HighlightOff,
  PersonAdd,
  UploadFile,
  VerifiedUser
} from "@mui/icons-material";

const SUPER_ADMIN_EMAIL = import.meta.env.VITE_SUPER_ADMIN_EMAIL || "ujjwalchauhan671@gmail.com";

const AdminDashboard = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.email === SUPER_ADMIN_EMAIL;

  const [activeTab, setActiveTab] = useState("approvals");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [msgType, setMsgType] = useState("success");

  const [teachers, setTeachers] = useState([]);
  const [newTeacher, setNewTeacher] = useState({ name: "", email: "", password: "" });

  const [students, setStudents] = useState([]);
  const [newStudent, setNewStudent] = useState({ name: "", email: "", password: "", semester: 1 });

  const [courses, setCourses] = useState([]);
  const [newCourse, setNewCourse] = useState({ name: "", teacher_id: "", semester: 1 });

  const [admins, setAdmins] = useState([]);
  const [newAdmin, setNewAdmin] = useState({ name: "", email: "", password: "" });

  const [pendingUsers, setPendingUsers] = useState([]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [teachersData, studentsData, coursesData, adminsData, pendingData] = await Promise.all([
        apiAdmin.getTeachers(),
        apiAdmin.getStudents(),
        apiAdmin.getCourses(),
        apiAdmin.getAdmins(),
        apiAdmin.getPendingUsers(),
      ]);
      setTeachers(teachersData);
      setStudents(studentsData);
      setCourses(coursesData);
      setAdmins(adminsData);
      setPendingUsers(pendingData);
    } catch (err) {
      showMsg(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const showMsg = (text, type = "success") => {
    setMessage(text);
    setMsgType(type);
    setTimeout(() => setMessage(""), 4000);
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    try {
      await apiAdmin.addTeacher(newTeacher);
      showMsg("Teacher added successfully!");
      setNewTeacher({ name: "", email: "", password: "" });
      fetchAll();
    } catch (err) { showMsg(err.message, "error"); }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      await apiAdmin.addStudent({ ...newStudent, semester: Number(newStudent.semester) });
      showMsg("Student added successfully!");
      setNewStudent({ name: "", email: "", password: "", semester: 1 });
      fetchAll();
    } catch (err) { showMsg(err.message, "error"); }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    try {
      await apiAdmin.addCourse({
        name: newCourse.name,
        teacher_id: Number(newCourse.teacher_id),
        semester: Number(newCourse.semester),
      });
      showMsg("Course added successfully!");
      setNewCourse({ name: "", teacher_id: "", semester: 1 });
      fetchAll();
    } catch (err) { showMsg(err.message, "error"); }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    try {
      await apiAdmin.addAdmin(newAdmin);
      showMsg(`Admin account created for ${newAdmin.email}!`);
      setNewAdmin({ name: "", email: "", password: "" });
      fetchAll();
    } catch (err) { showMsg(err.message, "error"); }
  };

  const handlePromote = async (userId, userName) => {
    if (!window.confirm(`Promote "${userName}" to Admin?`)) return;
    try {
      const res = await apiAdmin.promoteToAdmin(userId);
      showMsg(res.message || "User promoted to admin!");
      fetchAll();
    } catch (err) { showMsg(err.message, "error"); }
  };

  const handleDeleteAdmin = async (adminId, adminName) => {
    if (!window.confirm(`Remove admin access from "${adminName}"?`)) return;
    try {
      const res = await apiAdmin.deleteAdmin(adminId, user.id);
      showMsg(res.message || "Admin removed.");
      fetchAll();
    } catch (err) { showMsg(err.message, "error"); }
  };

  const handleApprove = async (userId, userName) => {
    try {
      await apiAdmin.approveUser(userId);
      showMsg(`${userName} has been approved.`);
      fetchAll();
    } catch (err) { showMsg(err.message, "error"); }
  };

  const handleReject = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to REJECT and DELETE the request from ${userName}?`)) return;
    try {
      await apiAdmin.rejectUser(userId);
      showMsg(`Request from ${userName} rejected.`);
      fetchAll();
    } catch (err) { showMsg(err.message, "error"); }
  };

  const handleDeleteTeacher = async (id) => {
    try { await apiAdmin.deleteTeacher(id); showMsg("Teacher deleted."); fetchAll(); }
    catch (err) { showMsg(err.message, "error"); }
  };
  const handleDeleteStudent = async (id) => {
    try { await apiAdmin.deleteStudent(id); showMsg("Student deleted."); fetchAll(); }
    catch (err) { showMsg(err.message, "error"); }
  };
  const handleDeleteCourse = async (id) => {
    try { await apiAdmin.deleteCourse(id); showMsg("Course deleted."); fetchAll(); }
    catch (err) { showMsg(err.message, "error"); }
  };

  const TAB_KEYS = ["approvals", "teachers", "students", "courses", "admins"];
  const TAB_LABELS = { 
    approvals: "Approvals", 
    teachers: "Teachers", 
    students: "Students", 
    courses: "Courses", 
    admins: "Admins" 
  };

  const tabButton = (key) => (
    <button
      key={key}
      onClick={() => setActiveTab(key)}
      className={`px-5 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 flex-1 min-w-[140px] flex items-center justify-center gap-2 border ${
        activeTab === key
          ? "bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-650/20 scale-[1.02]"
          : "bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-white"
      }`}
    >
      {key === "approvals" && <PendingActions fontSize="small" />}
      {key === "teachers" && <School fontSize="small" />}
      {key === "students" && <People fontSize="small" />}
      {key === "courses" && <Class fontSize="small" />}
      {key === "admins" && <AdminPanelSettings fontSize="small" />}
      {TAB_LABELS[key]}
      {key === "approvals" && pendingUsers.length > 0 && (
        <span className="ml-1.5 bg-rose-500 text-white px-2.5 py-0.5 rounded-full text-xs font-black animate-pulse">
          {pendingUsers.length}
        </span>
      )}
    </button>
  );

  // loading skeleton
  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 max-w-7xl mx-auto min-h-screen bg-transparent space-y-6">
          <div className="h-28 glass-panel rounded-2xl mb-8 skeleton"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 glass-panel rounded-2xl skeleton"></div>
            ))}
          </div>
          <div className="h-[420px] glass-panel rounded-2xl skeleton"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-transparent">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 glass-panel p-8 rounded-3xl border border-white/5 relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl font-black text-white tracking-tight">Admin Control Panel</h1>
            <p className="text-slate-400 mt-2 font-medium">
              Logged in as <span className="text-indigo-400 font-semibold">{user?.email}</span> 
              {isSuperAdmin && (
                <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider">
                  ⭐ Super Admin
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Toast */}
        {message && (
          <div className={`p-4 rounded-xl flex items-center gap-3 font-semibold animate-fade-in border ${
            msgType === "success" 
              ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" 
              : "bg-rose-500/10 text-rose-300 border-rose-500/20"
          }`}>
            {msgType === "success" ? <CheckCircleOutline /> : <HighlightOff />}
            {message}
          </div>
        )}

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-card p-6 rounded-3xl flex items-center gap-5 cursor-default">
            <div className="p-4 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20"><PendingActions fontSize="large"/></div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Pending</p>
              <h3 className="text-3xl font-black text-white mt-1">{pendingUsers.length}</h3>
            </div>
          </div>
          <div className="glass-card p-6 rounded-3xl flex items-center gap-5 cursor-default">
            <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20"><School fontSize="large"/></div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Teachers</p>
              <h3 className="text-3xl font-black text-white mt-1">{teachers.length}</h3>
            </div>
          </div>
          <div className="glass-card p-6 rounded-3xl flex items-center gap-5 cursor-default">
            <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20"><People fontSize="large"/></div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Students</p>
              <h3 className="text-3xl font-black text-white mt-1">{students.length}</h3>
            </div>
          </div>
          <div className="glass-card p-6 rounded-3xl flex items-center gap-5 cursor-default">
            <div className="p-4 bg-purple-500/10 text-purple-400 rounded-2xl border border-purple-500/20"><Class fontSize="large"/></div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Courses</p>
              <h3 className="text-3xl font-black text-white mt-1">{courses.length}</h3>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="glass-panel p-2.5 rounded-2xl border border-white/5 flex flex-wrap gap-2 sticky top-4 z-20">
          {TAB_KEYS.map((key) => tabButton(key))}
        </div>

        {/* ── Approvals Tab ─────────────────────────────────────── */}
        {activeTab === "approvals" && (
          <div className="glass-panel rounded-3xl border border-white/5 overflow-hidden animate-in fade-in duration-200">
            <div className="px-8 py-6 border-b border-white/5 bg-white/2">
              <h3 className="text-xl font-bold text-white">Pending Account Approvals</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="glass-table">
                <thead><tr>
                  <th className="text-left">Name</th>
                  <th className="text-left">Email</th>
                  <th className="text-left">Requested Role</th>
                  <th className="text-right">Actions</th>
                </tr></thead>
                <tbody>
                  {pendingUsers.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-12 text-slate-500 font-medium">No pending requests right now. You're all caught up! ✨</td></tr>
                  ) : pendingUsers.map((u) => (
                    <tr key={u.id}>
                      <td className="font-semibold text-slate-200">{u.name}</td>
                      <td className="text-slate-400">{u.email}</td>
                      <td>
                        <span className={`inline-block px-3 py-1 text-xs rounded-full font-bold tracking-wide uppercase ${
                          u.role === 'teacher' 
                            ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="flex justify-end gap-3 pr-2">
                          <button 
                            onClick={() => handleApprove(u.id, u.name)} 
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all active:scale-95 flex items-center gap-1 shadow-md shadow-emerald-605/20"
                          >
                            <CheckCircleOutline fontSize="xs" /> Approve
                          </button>
                          <button 
                            onClick={() => handleReject(u.id, u.name)} 
                            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-all active:scale-95 flex items-center gap-1 shadow-md shadow-rose-655/20"
                          >
                            <HighlightOff fontSize="xs" /> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Teachers Tab ──────────────────────────────────────── */}
        {activeTab === "teachers" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="glass-panel rounded-3xl border border-white/5 p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl"><PersonAdd /></div>
                <h3 className="text-xl font-bold text-white">Add New Teacher</h3>
              </div>
              <form onSubmit={handleAddTeacher} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <input className="glass-input" type="text" placeholder="Full Name"
                  value={newTeacher.name} onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })} required />
                <input className="glass-input" type="email" placeholder="Email Address"
                  value={newTeacher.email} onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })} required />
                <input className="glass-input" type="password" placeholder="Password"
                  value={newTeacher.password} onChange={(e) => setNewTeacher({ ...newTeacher, password: e.target.value })} required />
                <button type="submit" className="px-6 py-3 bg-gradient-to-r from-indigo-650 to-purple-650 hover:from-indigo-600 hover:to-purple-600 text-white font-bold rounded-xl active:scale-95 transition-all shadow-md shadow-indigo-650/20">
                  Add Teacher
                </button>
              </form>
            </div>

            <div className="glass-panel rounded-3xl border border-white/5 overflow-hidden">
              <div className="px-8 py-6 border-b border-white/5 bg-white/2 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Teacher Roster</h3>
                <span className="px-4 py-1.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/25 rounded-full text-sm font-bold">{teachers.length} Active</span>
              </div>
              <div className="overflow-x-auto">
                <table className="glass-table">
                  <thead><tr>
                    <th className="text-left">ID</th>
                    <th className="text-left">Name</th>
                    <th className="text-left">Email</th>
                    <th className="text-right">Actions</th>
                  </tr></thead>
                  <tbody>
                    {teachers.length === 0 ? (
                      <tr><td colSpan={4} className="text-center py-12 text-slate-500 font-medium">No teachers yet.</td></tr>
                    ) : teachers.map((t) => (
                      <tr key={t.id}>
                        <td className="font-bold text-slate-400">#{t.id}</td>
                        <td className="font-semibold text-slate-200">{t.name}</td>
                        <td className="text-slate-400">{t.email}</td>
                        <td className="text-right">
                          <div className="flex justify-end gap-2 pr-2">
                            <button 
                              onClick={() => handlePromote(t.id, t.name)} 
                              className="p-2.5 bg-white/5 hover:bg-amber-500/25 text-amber-400 border border-white/5 hover:border-amber-500/35 rounded-xl transition-all active:scale-90" 
                              title="Promote to Admin"
                            >
                              <AdminPanelSettings fontSize="small" />
                            </button>
                            <button 
                              onClick={() => handleDeleteTeacher(t.id)} 
                              className="p-2.5 bg-white/5 hover:bg-rose-500/25 text-rose-450 border border-white/5 hover:border-rose-500/35 rounded-xl transition-all active:scale-90" 
                              title="Delete"
                            >
                              <DeleteOutline fontSize="small" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── Students Tab ──────────────────────────────────────── */}
        {activeTab === "students" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="glass-panel rounded-3xl border border-white/5 p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl"><PersonAdd /></div>
                <h3 className="text-xl font-bold text-white">Add New Student</h3>
              </div>
              <form onSubmit={handleAddStudent} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                <input className="glass-input md:col-span-2" type="text" placeholder="Full Name"
                  value={newStudent.name} onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })} required />
                <input className="glass-input md:col-span-2" type="email" placeholder="Email Address"
                  value={newStudent.email} onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })} required />
                <input className="glass-input md:col-span-2" type="password" placeholder="Password"
                  value={newStudent.password} onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })} required />
                <input className="glass-input" type="number" placeholder="Semester" min={1} max={8}
                  value={newStudent.semester} onChange={(e) => setNewStudent({ ...newStudent, semester: e.target.value })} required />
                <button type="submit" className="px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl active:scale-95 transition-all shadow-md shadow-emerald-650/20 md:col-span-2">
                  Add Student
                </button>
              </form>
            </div>
            
            <div className="glass-panel rounded-3xl border border-white/5 overflow-hidden">
              <div className="px-8 py-6 border-b border-white/5 bg-white/2 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Student Directory</h3>
                <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 rounded-full text-sm font-bold">{students.length} Enrolled</span>
              </div>
              <div className="overflow-x-auto">
                <table className="glass-table">
                  <thead><tr>
                    <th className="text-left">ID</th>
                    <th className="text-left">Name</th>
                    <th className="text-left">Email</th>
                    <th className="text-left">Semester</th>
                    <th className="text-right">Actions</th>
                  </tr></thead>
                  <tbody>
                    {students.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-12 text-slate-500 font-medium">No students yet.</td></tr>
                    ) : students.map((s) => (
                      <tr key={s.id}>
                        <td className="font-bold text-slate-400">#{s.id}</td>
                        <td className="font-semibold text-slate-200">{s.name}</td>
                        <td className="text-slate-400">{s.email}</td>
                        <td><span className="px-3 py-1 bg-white/5 border border-white/5 text-slate-300 rounded-lg text-xs font-bold">Sem {s.semester}</span></td>
                        <td className="text-right">
                          <div className="flex justify-end gap-2 pr-2">
                            <button 
                              onClick={() => handlePromote(s.id, s.name)} 
                              className="p-2.5 bg-white/5 hover:bg-amber-500/25 text-amber-400 border border-white/5 hover:border-amber-500/35 rounded-xl transition-all active:scale-90" 
                              title="Promote to Admin"
                            >
                              <AdminPanelSettings fontSize="small" />
                            </button>
                            <button 
                              onClick={() => handleDeleteStudent(s.id)} 
                              className="p-2.5 bg-white/5 hover:bg-rose-500/25 text-rose-455 border border-white/5 hover:border-rose-500/35 rounded-xl transition-all active:scale-90" 
                              title="Delete"
                            >
                              <DeleteOutline fontSize="small" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── Courses Tab ───────────────────────────────────────── */}
        {activeTab === "courses" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="glass-panel rounded-3xl border border-white/5 p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl"><UploadFile /></div>
                <h3 className="text-xl font-bold text-white">Add New Course</h3>
              </div>
              <form onSubmit={handleAddCourse} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <input className="glass-input" type="text" placeholder="Course Name"
                  value={newCourse.name} onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })} required />
                <select className="glass-input" value={newCourse.teacher_id}
                  onChange={(e) => setNewCourse({ ...newCourse, teacher_id: e.target.value })} required>
                  <option value="" className="bg-slate-900" disabled>Select Teacher</option>
                  {teachers.map((t) => <option className="bg-slate-900" key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <input className="glass-input" type="number" placeholder="Semester" min={1}
                  value={newCourse.semester} onChange={(e) => setNewCourse({ ...newCourse, semester: e.target.value })} required />
                <button type="submit" className="px-6 py-3 bg-gradient-to-r from-purple-650 to-indigo-650 hover:from-purple-600 hover:to-indigo-600 text-white font-bold rounded-xl active:scale-95 transition-all shadow-md shadow-purple-650/20">
                  Add Course
                </button>
              </form>
            </div>
            
            <div className="glass-panel rounded-3xl border border-white/5 overflow-hidden">
              <div className="px-8 py-6 border-b border-white/5 bg-white/2 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Course Catalog</h3>
                <span className="px-4 py-1.5 bg-purple-500/10 text-purple-300 border border-purple-500/25 rounded-full text-sm font-bold">{courses.length} Available</span>
              </div>
              <div className="overflow-x-auto">
                <table className="glass-table">
                  <thead><tr>
                    <th className="text-left">ID</th>
                    <th className="text-left">Course Name</th>
                    <th className="text-left">Teacher</th>
                    <th className="text-left">Semester</th>
                    <th className="text-right">Actions</th>
                  </tr></thead>
                  <tbody>
                    {courses.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-12 text-slate-500 font-medium">No courses yet.</td></tr>
                    ) : courses.map((c) => (
                      <tr key={c.id}>
                        <td className="font-bold text-slate-400">#{c.id}</td>
                        <td className="font-semibold text-slate-200">{c.name}</td>
                        <td>
                           <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-lg text-xs font-bold">Prof #{c.teacher_id}</span>
                        </td>
                        <td><span className="px-3 py-1 bg-white/5 border border-white/5 text-slate-350 rounded-lg text-xs font-bold">Sem {c.semester}</span></td>
                        <td className="text-right">
                          <button 
                            onClick={() => handleDeleteCourse(c.id)} 
                            className="p-2.5 bg-white/5 hover:bg-rose-500/25 text-rose-455 border border-white/5 hover:border-rose-500/35 rounded-xl transition-all active:scale-90 pr-2" 
                            title="Delete"
                          >
                            <DeleteOutline fontSize="small" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── Admins Tab ────────────────────────────────────────── */}
        {activeTab === "admins" && (
          <div className="space-y-8 animate-in fade-in duration-200">

            {isSuperAdmin ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Create Admin */}
                <div className="glass-panel rounded-3xl border border-white/5 p-8 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl"><VerifiedUser /></div>
                    <h3 className="text-xl font-bold text-white">Create Admin Account</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">Generate a standalone administrator account with full access privileges.</p>
                  <form onSubmit={handleAddAdmin} className="space-y-4">
                    <input className="glass-input" type="text" placeholder="Full Name"
                      value={newAdmin.name} onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })} required />
                    <input className="glass-input" type="email" placeholder="Email Address"
                      value={newAdmin.email} onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })} required />
                    <input className="glass-input" type="password" placeholder="Secure Password"
                      value={newAdmin.password} onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })} required />
                    <button type="submit" className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-550 hover:to-purple-550 text-white font-bold rounded-xl active:scale-98 transition-all shadow-md shadow-indigo-650/20 mt-2">
                      Authorize New Admin
                    </button>
                  </form>
                </div>

                {/* Promote user */}
                <div className="glass-panel rounded-3xl border border-amber-500/15 bg-amber-500/2 p-8 space-y-6 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl"><AdminPanelSettings /></div>
                    <h3 className="text-xl font-bold text-amber-300">Promote Existing User</h3>
                  </div>
                  <p className="text-xs text-amber-400/80 leading-relaxed font-medium">
                    Alternatively, select an active teacher or student below to instantly promote them to administrative privileges.
                  </p>
                  
                  <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                     <p className="text-xs font-bold text-amber-300 mb-3">Quick Promote User:</p>
                     <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-2">
                      {[...teachers, ...students].length === 0 ? (
                        <p className="text-xs text-slate-500 italic">No users available.</p>
                      ) : [...teachers, ...students].map((u) => (
                        <button
                          key={u.id}
                          onClick={() => handlePromote(u.id, u.name)}
                          className="px-3.5 py-2 bg-white/5 hover:bg-amber-500/20 hover:text-amber-300 text-slate-350 text-xs font-bold rounded-xl border border-white/5 hover:border-amber-500/20 transition-all active:scale-95"
                        >
                          {u.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-panel border border-white/5 rounded-3xl p-8 flex items-start gap-5 shadow-xl">
                <div className="p-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-2xl"><VerifiedUser fontSize="large"/></div>
                <div>
                  <h3 className="text-xl font-bold text-white">Restricted Action Area</h3>
                  <p className="text-slate-400 mt-2 text-sm leading-relaxed font-medium">
                    User promotion and admin creation are restricted to the <strong className="text-indigo-300">Super Admin</strong> account. You can view the active directory below, but modifications require elevated clearance.
                  </p>
                </div>
              </div>
            )}

            <div className="glass-panel rounded-3xl border border-white/5 overflow-hidden">
              <div className="px-8 py-6 border-b border-white/5 bg-white/2 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">System Administrators</h3>
                <span className="px-4 py-1.5 bg-white/5 border border-white/5 text-slate-300 rounded-full text-sm font-bold">{admins.length} Active</span>
              </div>
              <div className="overflow-x-auto">
                <table className="glass-table">
                  <thead><tr>
                    <th className="text-left">ID</th>
                    <th className="text-left">Name</th>
                    <th className="text-left">Email Address</th>
                    <th className="text-left">Privilege Level</th>
                    {isSuperAdmin && <th className="text-right">Actions</th>}
                  </tr></thead>
                  <tbody>
                    {admins.map((a) => (
                      <tr key={a.id}>
                        <td className="font-bold text-slate-400">#{a.id}</td>
                        <td className="font-semibold text-slate-200">{a.name}</td>
                        <td className="text-slate-400">{a.email}</td>
                        <td>
                          <span className="inline-block px-3 py-1 bg-white/5 border border-white/5 text-slate-300 text-xs rounded-full font-bold uppercase tracking-wider">
                            Admin
                          </span>
                          {a.email === SUPER_ADMIN_EMAIL && (
                            <span className="ml-2 inline-block px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs rounded-full font-bold uppercase tracking-wider">
                              ⭐ Super Admin
                            </span>
                          )}
                          {a.email === user?.email && (
                            <span className="ml-2 inline-block px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs rounded-full font-bold uppercase tracking-wider">
                              You
                            </span>
                          )}
                        </td>
                        {isSuperAdmin && (
                          <td className="text-right">
                            {a.email !== SUPER_ADMIN_EMAIL ? (
                              <button
                                onClick={() => handleDeleteAdmin(a.id, a.name)}
                                className="px-3.5 py-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-455 hover:text-white font-bold text-xs rounded-xl border border-rose-500/20 hover:border-rose-500 transition-all active:scale-95 pr-2"
                              >
                                Revoke Access
                              </button>
                            ) : (
                              <span className="px-4 py-2 text-xs font-bold text-slate-500 bg-white/2 rounded-xl cursor-not-allowed pr-2">Secured</span>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
