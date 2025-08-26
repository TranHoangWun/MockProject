// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import users from "data/users";
import { getCurrentUser, logout } from "../services/authService";

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

  // Add this to the deleteAccount function or wherever account deletion is handled
  const deleteAccount = (userId) => {
    // Get existing users
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Find the user to delete
    const userToDelete = users.find(u => u.id === userId);
    
    // Check if user is an employer
    if (userToDelete && userToDelete.role === 'employer') {
      // Clean up associated job listings
      const employerJobs = JSON.parse(localStorage.getItem('employerJobs') || '[]');
      const updatedJobs = employerJobs.filter(job => job.employerId !== userId);
      localStorage.setItem('employerJobs', JSON.stringify(updatedJobs));
      
      // Clean up employer profiles
      try {
        const profiles = JSON.parse(localStorage.getItem('employerProfiles') || '{}');
        if (profiles[userId]) {
          delete profiles[userId];
          localStorage.setItem('employerProfiles', JSON.stringify(profiles));
        }
      } catch (error) {
        console.error("Error cleaning up employer profiles:", error);
      }
    }
    
    // Remove the user
    const updatedUsers = users.filter(u => u.id !== userId);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    // ...rest of the deletion logic
  };

  // isAuthenticated = có user hay không
  const isAuthenticated = !!user;
  // userRole lấy từ user.role 
  const userRole = user?.role || null;

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, isAuthenticated, userRole, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};


/*import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Khi reload app -> lấy lại user từ localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData)); // lưu phiên
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}; */