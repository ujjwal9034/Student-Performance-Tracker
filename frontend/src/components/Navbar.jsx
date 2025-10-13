import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import React from "react";

const brand = {
  title: "AcadTrack",
  subtitle: "Student Performance",
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

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
    <header className="sticky top-0 z-50 shadow-sm">
      <nav className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="h-14 flex items-center justify-between">
            
            {/* Brand */}
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center font-bold">A</div>
                <div className="leading-tight">
                  <div className="font-semibold text-sm sm:text-base">{brand.title}</div>
                  <div className="text-[10px] sm:text-xs text-white/80">{brand.subtitle}</div>
                </div>
              </Link>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-2">
              <Link
                to="/"
                className={`px-3 py-2 rounded transition ${isActive("/") ? "bg-white/20" : "hover:bg-white/10"}`}
              >
                Home
              </Link>
              {user && (
                <Link
                  to={dashboardPath}
                  className={`px-3 py-2 rounded transition ${isActive(dashboardPath) ? "bg-white/20" : "hover:bg-white/10"}`}
                >
                  Dashboard
                </Link>
              )}
            </div>

            {/* Auth section */}
            <div className="flex items-center gap-3">
              {!user ? (
                <>
                  <Link
                    to="/login"
                    className="px-3 py-2 rounded bg-white text-indigo-700 font-semibold hover:bg-slate-100 transition"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-3 py-2 rounded border border-white/60 hover:bg-white/10 transition"
                  >
                    Register
                  </Link>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  {/* User info */}
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center uppercase font-semibold">
                      {user?.name?.[0] || user?.email?.[0] || "U"}
                    </div>
                    <div className="hidden sm:block text-sm leading-tight">
                      <div className="font-medium truncate max-w-[160px]">{user?.name || user?.email}</div>
                      <div className="text-[10px] text-white/80">{user?.role || "user"}</div>
                    </div>
                  </div>
                  {/* Logout */}
                  <button
                    onClick={logout}
                    className="px-3 py-2 rounded bg-rose-500 hover:bg-rose-600 font-semibold"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;