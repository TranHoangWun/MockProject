// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import users from "../data/users"; // Import dữ liệu người dùng ban đầu

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("currentUser");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("currentUser", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("currentUser");
  };

  // isAuthenticated = có user hay không
  const isAuthenticated = !!user;
  // userRole lấy từ user.role 
  const userRole = user?.role || null;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, userRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};


