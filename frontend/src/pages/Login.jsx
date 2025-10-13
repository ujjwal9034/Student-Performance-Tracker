import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from '@mui/material'
import DashboardLayout from "../DashboardLayout.jsx"

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Login
      const userData = await login(email.trim(), password);

      // Redirect
      if (userData.role === "admin") navigate("/admin-dashboard");
      else if (userData.role === "teacher") navigate("/teacher-dashboard");
      else navigate("/student-dashboard");

    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: "300px", height: "310px", margin: "50px auto", backgroundColor: "#F7F7F5", padding: "9px" }} className="rounded-lg">
        <h2 className="text-black text-center p-10 text-2xl font-mono font-bold">Login</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="text-center  text-black font-mono bg-gray-300   font-bold rounded-sm"
            style={{ marginBottom: "7px" }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="text-center bg-gray-300  text-black font-mono font-bold rounded-sm"
            style={{ marginBottom: "7px" }}
          />

          <Button
            type="submit"
            variant="contained"
            sx={{
              px: 1,
              py: 2,
              width: '110px',
              height: '40px',
              backgroundColor: '#1F3954',
              color: 'white',
              fontWeight: 'bold',
              borderRadius: '8px',
            }}
          >
            Login
          </Button>
        </form>
        {message && <p style={{ color: "red" }}>{message}</p>}
      </div>
    </DashboardLayout>
  );
};

export default Login;