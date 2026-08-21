import { createContext, useContext, useState, useEffect } from "react";
import { apiAuth } from "../api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Load user
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  // Login
  const login = async (email, password) => {
    const data = await apiAuth.login({ email, password });

    const userData = {
      id: data.user_id,
      email: email,
      name: data.name,
      role: data.role,
      semester: data.semester,
      profile_pic: data.profile_pic,
    };

    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));

    return userData;
  };

  // Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  // Update user details
  const updateUser = (fields) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...fields };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);