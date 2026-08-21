import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Home = () => {
  // Theme awareness
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const isLight = document.documentElement.classList.contains("light");
      setTheme(isLight ? "light" : "dark");
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const isLight = theme === "light";

  return (
    <div className={`dashboard-layout-root relative min-h-screen flex flex-col items-center justify-center px-6 md:px-12 py-16 overflow-hidden ${isLight ? 'bg-gray-50' : 'bg-slate-950'}`}>
      {/* Background Ambient Glows */}
      <div className={`absolute top-[20%] left-[10%] w-[350px] h-[350px] rounded-full blur-[100px] pointer-events-none animate-pulse-glow ${isLight ? 'bg-indigo-200/30' : 'bg-indigo-600/10'}`} />
      <div className={`absolute bottom-[20%] right-[10%] w-[400px] h-[400px] rounded-full blur-[120px] pointer-events-none animate-pulse-glow ${isLight ? 'bg-purple-200/30' : 'bg-purple-600/10'}`} style={{ animationDelay: '-3s' }} />

      <div className="relative z-10 max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Text Section */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6 tracking-wide uppercase ${isLight ? 'bg-indigo-100 border border-indigo-200 text-indigo-600' : 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-300'}`}>
            <span>✨</span> Welcome to the future of education
          </div>
          
          <h1 className={`text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6 tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Performance <br />
            Tracker <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">System</span>
          </h1>
          
          <p className={`text-base md:text-lg mb-8 max-w-lg leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Track attendance, grades, and academic performance effortlessly. Empower teachers to guide their students, while giving students the tools to monitor and improve their own progress in real-time.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <Link 
              to="/register" 
              className="px-7 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/25 active:scale-95 transition-all"
            >
              Get Started
            </Link>
            <Link 
              to="/login" 
              className={`px-7 py-3.5 font-bold rounded-xl active:scale-95 transition-all ${isLight ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50' : 'bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200'}`}
            >
              Login
            </Link>
          </div>
        </div>

        {/* Image Section */}
        <div className="relative flex justify-center w-full mt-8 md:mt-0 animate-float">
          {/* Glass Card Border Glow */}
          <div className={`absolute inset-0 rounded-2xl blur-xl opacity-75 pointer-events-none ${isLight ? 'bg-gradient-to-tr from-indigo-200/40 to-purple-200/40' : 'bg-gradient-to-tr from-indigo-500/20 to-purple-500/20'}`} />
          
          <div className={`relative shadow-2xl rounded-2xl overflow-hidden border p-2 backdrop-blur-sm max-w-lg w-full ${isLight ? 'border-slate-200 bg-white/50' : 'border-white/10 bg-slate-900/50'}`}>
            <img 
              src="/hero.png" 
              alt="Performance Tracker Dashboard" 
              className="w-full h-auto object-cover rounded-xl shadow-inner hover:scale-[1.02] transition-transform duration-500 ease-in-out"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
