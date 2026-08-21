import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import React, { useState, useEffect, useRef } from "react";
import { apiAuth, apiStudent, BASE_URL } from "../api";
import { Settings, ExitToApp, Person, HelpOutline, NotificationsNone } from "@mui/icons-material";

const brand = {
  title: "AcadTrack",
  subtitle: "Student Performance",
};

const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL || "support@example.com";

const Navbar = () => {
  const { user, logout, updateUser } = useAuth();
  const location = useLocation();
  const dropdownRef = useRef(null);

  const [showDropdown, setShowDropdown] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

  // Theme support
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

  useEffect(() => {
    if (theme === "light") {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Language support
  const [lang, setLang] = useState(() => localStorage.getItem("lang") || "en");

  const handleLangToggle = () => {
    const newLang = lang === "en" ? "hi" : "en";
    setLang(newLang);
    localStorage.setItem("lang", newLang);
    window.dispatchEvent(new Event("languageChange"));
  };

  // Profile fields state
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editSemester, setEditSemester] = useState("");

  useEffect(() => {
    if (showProfile && user) {
      fetchProfile();
    }
  }, [showProfile, user]);

  const fetchProfile = async () => {
    setProfileLoading(true);
    setProfileMsg("");
    try {
      const data = await apiStudent.getProfile(user.id);
      setProfileData(data);
      setEditName(data.name || "");
      setEditBio(data.bio || "");
      setEditSemester(data.semester || "");
    } catch (err) {
      setProfileMsg("Failed to load profile details.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg("");
    try {
      await apiStudent.updateProfile(user.id, {
        name: editName,
        bio: editBio,
        semester: editSemester ? parseInt(editSemester) : null
      });
      setProfileMsg("✅ Profile updated successfully.");
      updateUser({
        name: editName,
        semester: editSemester ? parseInt(editSemester) : null
      });
      fetchProfile();
    } catch (err) {
      setProfileMsg(err.message || "Failed to update profile.");
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfileMsg("");
    try {
      const res = await apiStudent.uploadProfilePhoto(user.id, file);
      setProfileMsg("✅ Photo uploaded successfully.");
      updateUser({
        profile_pic: res.profile_pic
      });
      fetchProfile();
    } catch (err) {
      setProfileMsg(err.message || "Failed to upload photo.");
    }
  };

  // Password state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [settingsMsg, setSettingsMsg] = useState("");
  const [settingsLoading, setSettingsLoading] = useState(false);

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setSettingsMsg("");
    if (newPassword !== confirmPassword) {
      setSettingsMsg("New passwords do not match.");
      return;
    }
    setSettingsLoading(true);
    try {
      await apiAuth.changePassword({
        user_id: user.id,
        old_password: oldPassword,
        new_password: newPassword,
      });
      setSettingsMsg("✅ Password updated successfully.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setSettingsMsg(err.message || "Failed to update password.");
    } finally {
      setSettingsLoading(false);
    }
  };

  // Dashboard path
  const dashboardPath =
    user?.role === "admin"
      ? "/admin-dashboard"
      : user?.role === "teacher"
      ? "/teacher-dashboard"
      : user?.role === "student"
      ? "/student-dashboard"
      : "/";

  return (
    <header className="sticky top-0 z-50 px-4 py-3">
      <nav className="max-w-6xl mx-auto rounded-2xl bg-slate-900/60 backdrop-blur-md border border-white/5 shadow-2xl text-slate-100 transition-all duration-300">
        <div className="px-4 sm:px-6">
          <div className="h-16 flex items-center justify-between">
            
            {/* Brand */}
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                  A
                </div>
                <div className="leading-tight">
                  <div className="brand-title font-bold text-sm sm:text-base tracking-wide bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent">{brand.title}</div>
                  <div className="brand-subtitle text-[10px] text-slate-400 font-medium">{brand.subtitle}</div>
                </div>
              </Link>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-1.5">
              <Link
                to="/"
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive("/") 
                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" 
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                Home
              </Link>
              {user && (
                <Link
                  to={dashboardPath}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive(dashboardPath) 
                      ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" 
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  Dashboard
                </Link>
              )}
            </div>

            {/* Auth section */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {theme === "dark" ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 9h-1m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              {/* Language Toggle */}
              <button
                onClick={handleLangToggle}
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-indigo-300 transition-all cursor-pointer"
                title="Switch Language / भाषा बदलें"
              >
                {lang === "en" ? "EN" : "हिं"}
              </button>

              {!user ? (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 shadow-lg shadow-indigo-600/25 active:scale-95 transition-all"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-sm font-medium hover:bg-white/5 hover:text-white active:scale-95 transition-all"
                  >
                    Register
                  </Link>
                </>
              ) : (
                <div className="flex items-center gap-3 relative" ref={dropdownRef}>
                  {/* User info & Dropdown Trigger */}
                  <div 
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-1 rounded-xl transition-all"
                  >
                    {user?.profile_pic ? (
                      <img 
                        src={`${BASE_URL}${user.profile_pic}`} 
                        alt="Avatar" 
                        className="w-9 h-9 rounded-xl object-cover border border-indigo-500/20"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border border-indigo-500/20 flex items-center justify-center uppercase font-bold text-indigo-300">
                        {user?.name?.[0] || user?.email?.[0] || "U"}
                      </div>
                    )}
                    <div className="hidden sm:block text-left text-sm leading-tight pr-1">
                      <div className="font-semibold text-slate-200 truncate max-w-[140px]">{user?.name || user?.email}</div>
                      <div className="text-[10px] text-slate-400 capitalize">{user?.role || "user"}</div>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-slate-400 transition-transform ${showDropdown ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  {/* Dropdown Menu */}
                  {showDropdown && (
                    <div className="absolute right-0 top-full mt-3 w-64 glass-panel rounded-2xl py-2.5 z-50 border border-white/10 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 text-slate-200">
                      {/* Profile Header */}
                      <div className="px-4 py-3 border-b border-white/5 mb-2 bg-white/5 mx-2 rounded-xl">
                        <p className="text-sm font-bold text-white truncate">{user?.name || "User"}</p>
                        <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                        <span className="inline-block mt-2 px-2 py-0.5 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold uppercase tracking-wider rounded">
                          {user?.role || "Student"}
                        </span>
                      </div>

                      {/* Menu Items */}
                      <div className="px-2 space-y-0.5">
                        <button
                          onClick={() => { setShowDropdown(false); setShowProfile(true); }}
                          className="w-full text-left px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-indigo-300 rounded-xl flex items-center gap-3 transition-colors"
                        >
                          <Person fontSize="small" className="text-slate-400" />
                          My Profile
                        </button>

                        <button
                          onClick={() => { setShowDropdown(false); setShowNotifications(true); }}
                          className="w-full text-left px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-indigo-300 rounded-xl flex items-center gap-3 transition-colors"
                        >
                          <NotificationsNone fontSize="small" className="text-slate-400" />
                          Notifications
                        </button>

                        <button
                          onClick={() => {
                            setShowDropdown(false);
                            setShowSettings(true);
                          }}
                          className="w-full text-left px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-indigo-300 rounded-xl flex items-center gap-3 transition-colors"
                        >
                          <Settings fontSize="small" className="text-slate-400" />
                          Account Settings
                        </button>

                        <button
                          onClick={() => { setShowDropdown(false); setShowSupport(true); }}
                          className="w-full text-left px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-indigo-300 rounded-xl flex items-center gap-3 transition-colors"
                        >
                          <HelpOutline fontSize="small" className="text-slate-400" />
                          Help & Support
                        </button>
                      </div>

                      <hr className="my-2 border-white/5 mx-4" />
                      
                      <div className="px-2">
                        <button
                          onClick={logout}
                          className="w-full text-left px-3 py-2.5 text-sm font-bold text-rose-400 hover:bg-rose-500/10 rounded-xl flex items-center gap-3 transition-colors"
                        >
                          <ExitToApp fontSize="small" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel text-slate-100 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-white/10 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-white/5">
              <h3 className="text-xl font-bold text-white">Account Settings</h3>
              <button 
                onClick={() => {
                  setShowSettings(false);
                  setSettingsMsg("");
                }} 
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <h4 className="text-md font-semibold mb-4 text-slate-300">Change Password</h4>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Current Password</label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full glass-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full glass-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full glass-input"
                    required
                  />
                </div>
                {settingsMsg && (
                  <div className={`p-3.5 rounded-xl text-sm font-medium ${settingsMsg.includes('✅') ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'}`}>
                    {settingsMsg}
                  </div>
                )}
                <div className="flex gap-3 justify-end mt-6">
                  <button
                    type="button"
                    onClick={() => setShowSettings(false)}
                    className="px-4.5 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 font-semibold rounded-xl transition"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={settingsLoading}
                    className="px-4.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition disabled:opacity-50"
                  >
                    {settingsLoading ? "Saving..." : "Update Password"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel text-slate-100 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/10 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-white/5 sticky top-0 bg-slate-900/90 backdrop-blur-md z-10">
              <h3 className="text-xl font-bold text-white">My Profile</h3>
              <button 
                onClick={() => {
                  setShowProfile(false);
                  setProfileMsg("");
                }} 
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            {profileLoading && !profileData ? (
              <div className="p-10 flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-400 text-sm">Loading profile data...</p>
              </div>
            ) : (
              <div className="p-6 space-y-6">
                {profileMsg && (
                  <div className={`p-4 rounded-xl text-sm font-medium border ${
                    profileMsg.includes("✅") 
                      ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" 
                      : "bg-rose-500/10 text-rose-300 border-rose-500/20"
                  }`}>
                    {profileMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Photo & Role Column */}
                  <div className="flex flex-col items-center space-y-4 bg-white/5 p-4 rounded-2xl border border-white/5 h-fit">
                    <div className="relative group">
                      {profileData?.profile_pic ? (
                        <img 
                          src={`${BASE_URL}${profileData.profile_pic}`} 
                          alt="Profile" 
                          className="w-28 h-28 rounded-2xl object-cover border-2 border-indigo-500/30 shadow-lg"
                        />
                      ) : (
                        <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center text-5xl font-bold uppercase shadow-inner">
                          {user?.name?.[0] || user?.email?.[0] || "U"}
                        </div>
                      )}
                      
                      <label className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <span className="text-white text-xs font-semibold">Change Photo</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                      </label>
                    </div>

                    <div className="text-center w-full">
                      <h4 className="text-lg font-bold text-white truncate">{profileData?.name || user?.name}</h4>
                      <p className="text-xs text-slate-400 truncate mb-3">{profileData?.email || user?.email}</p>
                      
                      <div className="space-y-1">
                        <span className="inline-block px-2.5 py-0.5 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold uppercase tracking-wider rounded-md">
                          {user?.role}
                        </span>
                        {user?.role === "student" && profileData?.semester && (
                          <div className="text-xs text-slate-300 font-medium mt-1">
                            Semester {profileData.semester}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Profile Edit Fields Column */}
                  <form onSubmit={handleUpdateProfile} className="md:col-span-2 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1.5">Full Name</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full glass-input text-sm"
                        placeholder="John Doe"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1.5">Bio / Description</label>
                      <textarea
                        value={editBio}
                        onChange={(e) => setEditBio(e.target.value)}
                        className="w-full glass-input text-sm min-h-[80px]"
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    {user?.role === "student" && (
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1.5">Current Semester</label>
                        <input
                          type="number"
                          value={editSemester}
                          onChange={(e) => setEditSemester(e.target.value)}
                          className="w-full glass-input text-sm"
                          placeholder="e.g. 4"
                          min="1"
                          max="8"
                        />
                      </div>
                    )}

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-indigo-600/20"
                      >
                        Save Profile Changes
                      </button>
                    </div>
                  </form>
                </div>

                {/* Enrollment History Table (Student Only) */}
                {user?.role === "student" && (
                  <div className="space-y-3 border-t border-white/5 pt-6">
                    <h4 className="text-md font-bold text-white">Enrollment History</h4>
                    {!profileData?.enrollments || profileData.enrollments.length === 0 ? (
                      <p className="text-slate-400 text-sm italic">No courses enrolled yet.</p>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-white/5">
                        <table className="w-full glass-table text-left border-collapse">
                          <thead>
                            <tr className="bg-white/5 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                              <th className="py-3 px-4">Course Name</th>
                              <th className="py-3 px-4 text-center">Semester</th>
                              <th className="py-3 px-4 text-right">Enrolled On</th>
                            </tr>
                          </thead>
                          <tbody>
                            {profileData.enrollments.map((enrollment, idx) => (
                              <tr key={idx} className="hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0 text-xs">
                                <td className="py-3 px-4 text-white font-semibold">{enrollment.course_name}</td>
                                <td className="py-3 px-4 text-center text-slate-300">Semester {enrollment.semester}</td>
                                <td className="py-3 px-4 text-right text-slate-400">
                                  {new Date(enrollment.enrolled_on).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            <div className="p-4 border-t border-white/5 bg-slate-900/40 flex justify-end sticky bottom-0 backdrop-blur-md">
              <button 
                onClick={() => {
                  setShowProfile(false);
                  setProfileMsg("");
                }} 
                className="px-5 py-2 bg-white/5 border border-white/10 rounded-xl font-bold text-slate-200 hover:bg-white/10 transition-colors shadow-sm text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel text-slate-100 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-white/10 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-white/5">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <NotificationsNone /> Notifications
              </h3>
              <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-white transition-colors">✕</button>
            </div>
            <div className="p-10 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-5">
                <NotificationsNone fontSize="large" className="text-indigo-400" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">You're all caught up!</h4>
              <p className="text-slate-400 text-sm">You have no new notifications right now. Check back later.</p>
            </div>
          </div>
        </div>
      )}

      {/* Support Modal */}
      {showSupport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel text-slate-100 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-white/10 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-white/5">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <HelpOutline /> Help & Support
              </h3>
              <button onClick={() => setShowSupport(false)} className="text-slate-400 hover:text-white transition-colors">✕</button>
            </div>
            <div className="p-6">
              <div className="mb-6 text-center">
                <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-2">Need Assistance?</h4>
                <p className="text-slate-400 text-sm leading-relaxed">If you are facing issues with your account, navigating the dashboard, or experiencing a bug, please contact the system administrator directly.</p>
              </div>
              <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 p-5 rounded-2xl text-center shadow-inner">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center shadow-sm border border-white/5 mx-auto mb-3">
                  <span className="text-xl">📧</span>
                </div>
                <div className="font-bold text-indigo-300 mb-1">Admin Contact Support</div>
                <a href={`mailto:${SUPPORT_EMAIL}`} className="text-indigo-400 font-semibold text-sm hover:underline hover:text-indigo-300 transition-colors">{SUPPORT_EMAIL}</a>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;