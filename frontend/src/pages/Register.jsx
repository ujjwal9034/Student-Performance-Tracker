import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../DashboardLayout";

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [semester, setSemester] = useState(1);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Register
      const response = await fetch("http://localhost:8000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, semester: role === "student" ? Number(semester) : null }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Registration failed");
      }

      const data = await response.json();
      setMessage("Registration successful! Logging you in...");

      // Auto login
      const userData = await login(email, password);

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
      <div style={{ maxWidth: "300px", backgroundColor: "#F7F7F5", height: "310px", margin: "50px auto", padding: "9px", border: "2px solid #1e2939" }} className="rounded-lg">
        <h2 className="text-black text-center p-10 text-2xl font-mono font-bold">Register</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="text-center  bg-gray-300  text-black  font-mono font-bold rounded-sm"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="text-center  text-black bg-gray-300 font-mono font-bold rounded-sm"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            className="text-center text-black bg-gray-300  font-mono font-bold rounded-sm"
          />
          <select value={role}
            className="text-center text-black bg-gray-300  font-mono font-bold rounded-sm" onChange={(e) => setRole(e.target.value)}>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
          </select>
          {role === "student" && (
            <input
              type="number"
              placeholder="Semester"
              value={semester}
              min={1}
              max={8}
              onChange={(e) => setSemester(e.target.value)}
              required
              className="text-center text-black bg-gray-300  font-mono font-bold rounded-sm"
            />
          )}
          <button type="submit" className=" px-1 py-2
        text-center          
        text-white         
        font-bold           
        rounded-lg         
         "
            style={{ width: "110px", height: "40px", backgroundColor: "#1F3954" }}>REGISTER</button>
        </form>
        {message && <p style={{ color: message.includes("successful") ? "green" : "red" }}>{message}</p>}
      </div>
    </DashboardLayout>
  );
};

export default Register;