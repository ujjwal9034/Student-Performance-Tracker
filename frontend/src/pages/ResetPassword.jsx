import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { apiAuth } from "../api";
import { Button, TextField, Typography, Box, Paper } from '@mui/material';
import loginBg from "../images/login_bg.png";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setMessage("Error: Invalid or missing reset token. Please request a new link.");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const res = await apiAuth.resetPassword({ token, new_password: newPassword });
      setMessage(res.message || "Password successfully reset!");
      setSuccess(true);
    } catch (err) {
      setMessage(err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* Left side */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900 flex-col justify-between p-12">
        <img src={loginBg} alt="Background" className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-slate-900/30" />
        
        {/* Decorative Top Elements */}
        <div className="relative z-10 flex items-center gap-3">
           <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center font-bold text-white text-xl shadow-xl">
              A
           </div>
           <span className="text-white font-bold tracking-widest text-lg opacity-90">ACADTRACK</span>
        </div>

        <div className="relative z-10 flex flex-col justify-center h-full max-w-md mx-auto text-left">
          <Typography variant="h3" fontWeight="950" sx={{ mb: 2, color: 'white', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
            Secure Your <br />
            New <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-300">Password</span>
          </Typography>
          <Typography variant="body1" className="text-slate-300" sx={{ opacity: 0.85, lineHeight: 1.6 }}>
            Set a strong and memorable password to protect your account and regain access to the performance tracking tools.
          </Typography>
        </div>
      </div>

      {/* Right side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-950 relative">
        <div className="absolute bottom-[20%] left-[10%] w-[300px] h-[300px] rounded-full bg-purple-600/5 blur-[90px] pointer-events-none" />

        <Paper 
          elevation={0} 
          className="w-full max-w-md p-10 rounded-2xl"
          sx={{ 
            backgroundColor: 'rgba(15, 23, 42, 0.45)', 
            backdropFilter: 'blur(16px)', 
            border: '1px solid rgba(255, 255, 255, 0.08)', 
            color: 'white',
            boxShadow: '0 20px 40px -15px rgba(0,0,0,0.5)'
          }}
        >
          <div className="mb-8 text-center">
            <Typography variant="h4" fontWeight="800" sx={{ mb: 1, color: '#818cf8', letterSpacing: '-0.01em' }}>Set New Password</Typography>
            <Typography variant="body2" className="text-slate-400">Choose a new password for your account</Typography>
          </div>

          {success ? (
            <div className="text-center p-6 bg-emerald-500/10 border border-emerald-500/25 rounded-xl">
              <Typography variant="h6" className="text-emerald-400 font-bold mb-3">Password Updated!</Typography>
              <Typography variant="body2" className="text-slate-300 mb-6 leading-relaxed">You can now use your new password to log in.</Typography>
              <Button 
                variant="contained" 
                onClick={() => navigate("/login")} 
                sx={{ 
                  py: 1.5, 
                  background: 'linear-gradient(to right, #4f46e5, #6366f1)',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  borderRadius: '10px',
                  boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(to right, #4338ca, #4f46e5)',
                    boxShadow: '0 6px 20px rgba(79, 70, 229, 0.45)',
                  }
                }}
              >
                Go to Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <TextField 
                fullWidth 
                type="password" 
                label="New Password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                required 
                variant="outlined" 
                sx={textFieldSx} 
                disabled={!token}
              />
              <TextField 
                fullWidth 
                type="password" 
                label="Confirm New Password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
                variant="outlined" 
                sx={textFieldSx} 
                disabled={!token}
              />
              
              {message && (
                <div className={`p-3.5 rounded-xl text-sm font-medium ${message.includes('successfully') ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'}`}>
                  {message}
                </div>
              )}
              
              <Button 
                type="submit" 
                variant="contained" 
                disabled={loading || !token} 
                sx={{ 
                  py: 1.6, 
                  mt: 1, 
                  background: 'linear-gradient(to right, #4f46e5, #6366f1)',
                  textTransform: 'none',
                  fontSize: '1.05rem',
                  fontWeight: 'bold',
                  borderRadius: '12px',
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
                {loading ? "Updating..." : "Reset Password"}
              </Button>
            </form>
          )}

          <Box mt={4} textAlign="center">
            <Link to="/login" className="text-[#818cf8] text-sm font-medium hover:underline hover:text-indigo-300 transition-colors">Back to Login</Link>
          </Box>
        </Paper>
      </div>
    </div>
  );
};

const textFieldSx = {
  '& .MuiOutlinedInput-root': { 
    color: 'white', 
    borderRadius: '12px',
    backgroundColor: 'rgba(10, 15, 30, 0.4)',
    '& fieldset': { borderColor: 'rgba(255,255,255,0.08)' }, 
    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.18)' }, 
    '&.Mui-focused fieldset': { borderColor: '#818cf8', borderWidth: '2px' } 
  },
  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.55)' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#818cf8' },
};

export default ResetPassword;
