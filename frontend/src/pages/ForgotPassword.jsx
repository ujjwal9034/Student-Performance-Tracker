import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiAuth } from "../api";
import { Button, TextField, Typography, Box, Paper } from '@mui/material';
import loginBg from "../images/login_bg.png";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  // Theme awareness
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  useEffect(() => {
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
      const res = await apiAuth.forgotPassword({ email });
      setMessage(res.message || "Reset link sent!");
      setSuccess(true);
    } catch (err) {
      setMessage(err.message || "Failed to request reset.");
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
      '&.Mui-focused fieldset': { borderColor: '#818cf8', borderWidth: '2px' } 
    },
    '& .MuiInputLabel-root': { color: isLight ? '#64748b' : 'rgba(255,255,255,0.55)' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#818cf8' },
  };

  return (
    <div className={`min-h-screen flex ${isLight ? 'bg-gray-50' : 'bg-slate-950'}`}>
      {/* Left side */}
      <div className={`hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12 ${isLight ? 'bg-gradient-to-br from-indigo-50 via-white to-purple-50' : 'bg-slate-900'}`}>
        <img src={loginBg} alt="Background" className={`absolute inset-0 w-full h-full object-cover mix-blend-luminosity ${isLight ? 'opacity-20' : 'opacity-40'}`} />
        <div className={`absolute inset-0 ${isLight ? 'bg-gradient-to-t from-white via-white/60 to-white/30' : 'bg-gradient-to-t from-slate-950 via-slate-900/60 to-slate-900/30'}`} />
        
        {/* Decorative Top Elements */}
        <div className="relative z-10 flex items-center gap-3">
           <div className={`w-10 h-10 rounded-xl backdrop-blur-md border flex items-center justify-center font-bold text-xl shadow-xl ${isLight ? 'bg-indigo-100 border-indigo-200 text-indigo-600' : 'bg-white/10 border-white/10 text-white'}`}>
              A
           </div>
           <span className={`font-bold tracking-widest text-lg ${isLight ? 'text-slate-800' : 'text-white opacity-90'}`}>ACADTRACK</span>
        </div>

        <div className="relative z-10 flex flex-col justify-center h-full max-w-md mx-auto text-left">
          <Typography variant="h3" fontWeight="950" sx={{ mb: 2, color: isLight ? '#0f172a' : 'white', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
            Access Restored <br />
            in <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Minutes</span>
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.85, lineHeight: 1.6, color: isLight ? '#475569' : '#cbd5e1' }}>
            Submit your registered email address below, and we will send you a secure link to reset your account credentials.
          </Typography>
        </div>
      </div>

      {/* Right side */}
      <div className={`w-full lg:w-1/2 flex items-center justify-center p-8 relative ${isLight ? 'bg-gray-50' : 'bg-slate-950'}`}>
        <div className={`absolute bottom-[20%] left-[10%] w-[300px] h-[300px] rounded-full blur-[90px] pointer-events-none ${isLight ? 'bg-purple-100/50' : 'bg-purple-600/5'}`} />

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
            <Typography variant="h4" fontWeight="800" sx={{ mb: 1, color: isLight ? '#4f46e5' : '#818cf8', letterSpacing: '-0.01em' }}>Forgot Password</Typography>
            <Typography variant="body2" sx={{ color: isLight ? '#64748b' : '#94a3b8' }}>Enter your email to receive a reset link</Typography>
          </div>

          {!success ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <TextField 
                fullWidth 
                type="email" 
                label="Email Address" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                variant="outlined" 
                sx={textFieldSx} 
              />
              
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
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          ) : (
            <div className={`text-center p-6 rounded-xl ${isLight ? 'bg-emerald-50 border border-emerald-200' : 'bg-emerald-500/10 border border-emerald-500/25'}`}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1.5, color: isLight ? '#059669' : '#34d399' }}>Check your Email</Typography>
              <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.8, color: isLight ? '#475569' : '#cbd5e1' }}>{message}</Typography>
              <Button 
                variant="outlined" 
                onClick={() => navigate("/login")} 
                sx={{ 
                  color: '#818cf8', 
                  borderColor: 'rgba(129, 140, 248, 0.4)',
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  '&:hover': {
                    borderColor: '#818cf8',
                    backgroundColor: 'rgba(129, 140, 248, 0.05)'
                  }
                }}
              >
                Return to Login
              </Button>
            </div>
          )}

          {!success && (
            <Box mt={4} textAlign="center">
              <Link to="/login" className="text-[#818cf8] text-sm font-medium hover:underline hover:text-indigo-300 transition-colors">Back to Login</Link>
            </Box>
          )}
        </Paper>
      </div>
    </div>
  );
};

export default ForgotPassword;
