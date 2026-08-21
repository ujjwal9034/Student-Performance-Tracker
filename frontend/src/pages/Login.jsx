import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button, TextField, Typography, Box, Paper } from '@mui/material';
import modernEduBg from "../images/modern_edu.png";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Theme awareness
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  useEffect(() => {
    const onThemeChange = () => setTheme(localStorage.getItem("theme") || "light");
    // Listen for class changes on <html>
    const observer = new MutationObserver(() => {
      const isLight = document.documentElement.classList.contains("light");
      setTheme(isLight ? "light" : "dark");
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const isLight = theme === "light";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const userData = await login(email.trim(), password);
      if (userData.role === "admin") navigate("/admin-dashboard");
      else if (userData.role === "teacher") navigate("/teacher-dashboard");
      else navigate("/student-dashboard");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const textFieldSx = {
    '& .MuiOutlinedInput-root': {
      color: isLight ? '#0f172a' : 'white',
      borderRadius: '12px',
      backgroundColor: isLight ? '#ffffff' : 'rgba(10, 15, 30, 0.4)',
      '& fieldset': { borderColor: isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.08)' },
      '&:hover fieldset': { borderColor: isLight ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.18)' },
      '&.Mui-focused fieldset': { borderColor: '#818cf8', borderWidth: '2px' },
    },
    '& .MuiInputLabel-root': { color: isLight ? '#64748b' : 'rgba(255,255,255,0.55)' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#818cf8' },
  };

  return (
    <div className={`min-h-screen flex ${isLight ? 'bg-gray-50' : 'bg-slate-950'}`}>
      {/* Left side - Animated Gradient Background */}
      <div className={`hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12 ${isLight ? 'bg-gradient-to-br from-indigo-50 via-white to-purple-50' : 'bg-slate-900'}`}>
        {/* Animated Glow Orbs */}
        <div className={`absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full blur-[120px] mix-blend-screen animate-pulse duration-1000 ${isLight ? 'bg-indigo-200/40' : 'bg-indigo-600/20'}`}></div>
        <div className={`absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full blur-[120px] mix-blend-screen animate-pulse duration-[3000ms] delay-1000 ${isLight ? 'bg-purple-200/40' : 'bg-purple-600/20'}`}></div>
        <div className={`absolute top-[30%] right-[10%] w-[50%] h-[50%] rounded-full blur-[100px] mix-blend-screen animate-pulse duration-[4000ms] delay-500 ${isLight ? 'bg-emerald-200/30' : 'bg-emerald-600/10'}`}></div>

        {/* Noise overlay for texture */}
        <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
        
        {/* Decorative Top Elements */}
        <div className="relative z-10 flex items-center gap-3">
           <div className={`w-10 h-10 rounded-xl backdrop-blur-md border flex items-center justify-center font-bold text-xl shadow-xl ${isLight ? 'bg-indigo-100 border-indigo-200 text-indigo-600' : 'bg-white/10 border-white/10 text-white'}`}>
              A
           </div>
           <span className={`font-bold tracking-widest text-lg ${isLight ? 'text-slate-800' : 'text-white opacity-90'}`}>ACADTRACK</span>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full max-w-lg mx-auto text-center">
          <img src={modernEduBg} alt="Modern Education Illustration" className="w-[350px] mb-8 drop-shadow-[0_0_40px_rgba(99,102,241,0.25)] animate-float" />
          <Typography variant="h2" fontWeight="900" sx={{ mb: 2, lineHeight: 1.1, color: isLight ? '#0f172a' : 'white', letterSpacing: '-0.02em' }}>
            Empower Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Learning</span>
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, lineHeight: 1.7, fontSize: '1.05rem', color: isLight ? '#475569' : '#cbd5e1' }}>
            Track performance, unlock insights, and achieve your educational goals with our intelligent next-generation platform.
          </Typography>
        </div>
      </div>

      {/* Right side - Form */}
      <div className={`w-full lg:w-1/2 flex items-center justify-center p-8 relative ${isLight ? 'bg-gray-50' : 'bg-slate-950'}`}>
        <div className={`absolute top-[20%] right-[10%] w-[300px] h-[300px] rounded-full blur-[90px] pointer-events-none ${isLight ? 'bg-indigo-100/50' : 'bg-indigo-600/5'}`} />
        
        <Paper 
          elevation={0} 
          className="w-full max-w-md p-10 rounded-2xl"
          sx={{ 
            backgroundColor: isLight ? 'rgba(255, 255, 255, 0.9)' : 'rgba(15, 23, 42, 0.45)', 
            backdropFilter: 'blur(16px)',
            border: isLight ? '1px solid rgba(0, 0, 0, 0.08)' : '1px solid rgba(255, 255, 255, 0.08)',
            color: isLight ? '#0f172a' : 'white',
            boxShadow: isLight ? '0 20px 40px -15px rgba(0,0,0,0.08)' : '0 20px 40px -15px rgba(0,0,0,0.5)'
          }}
        >
          <div className="mb-8 text-center">
            <Typography variant="h4" fontWeight="800" sx={{ mb: 1, color: isLight ? '#4f46e5' : '#818cf8', letterSpacing: '-0.01em' }}>
              Welcome Back
            </Typography>
            <Typography variant="body2" sx={{ color: isLight ? '#64748b' : '#94a3b8' }}>
              Sign in to access your dashboard
            </Typography>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <TextField
              fullWidth
              variant="outlined"
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={textFieldSx}
            />
            
            <TextField
              fullWidth
              variant="outlined"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              sx={textFieldSx}
            />

            <Box display="flex" justifyContent="flex-end" width="100%">
              <Link to="/forgot-password" className="text-[#818cf8] text-sm hover:underline hover:text-indigo-300 transition-colors">
                Forgot password?
              </Link>
            </Box>

            {message && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-center text-sm font-medium">
                {message}
              </div>
            )}

            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                py: 1.6,
                mt: 1,
                background: 'linear-gradient(to right, #4f46e5, #6366f1)',
                textTransform: 'none',
                fontSize: '1.05rem',
                fontWeight: 'bold',
                borderRadius: '12px',
                color: '#ffffff',
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(to right, #4338ca, #4f46e5)',
                  boxShadow: '0 6px 20px rgba(79, 70, 229, 0.45)',
                },
                '&:disabled': {
                  opacity: 0.5,
                  color: 'rgba(255,255,255,0.5)'
                }
              }}
            >
              {loading ? "Signing in..." : "Login"}
            </Button>
          </form>

          <Box mt={4} textAlign="center">
            <Typography variant="body2" sx={{ color: isLight ? '#64748b' : '#94a3b8' }}>
              New student / teacher?{' '}
              <Link to="/register" className="text-[#818cf8] font-medium hover:underline hover:text-indigo-300 transition-colors">
                Request Account Access
              </Link>
            </Typography>
          </Box>
        </Paper>
      </div>
    </div>
  );
};

export default Login;