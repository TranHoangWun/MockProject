import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import StudentDashboard from "./pages/student/Student.jsx";
import EmployerDashboard from "./pages/employer/Employer.jsx";
import EmployerPostJob from "./pages/employer/EmployerPostJob.jsx";
import AdminDashboard from "./pages/admin/Admin.jsx";
import { AuthProvider, useAuth } from "./context/AuthContext.js";
import Profile from "./components/profile/Profile.jsx";
import Header from "./components/layout/header/Header.jsx";
import Footer from "./components/layout/footer/Footer.jsx";
import ProtectedRoute from "./components/layout/ProtectRoute.jsx";
import IntroPage from "./pages/intro/Intro.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
// Fix the import path to use relative path
import Posts from "./components/Posts.jsx";
// Fix the import path to use relative path
import PostDetail from "./pages/student/postdetail/PostDetail.jsx";
import About from "./pages/about/About.jsx";
// Fix the import paths for message components
import MessageCenter from "./pages/messages/MessageCenter.jsx";
import Conversation from "./pages/messages/Conversation.jsx";
import initializeStorageCleanup from './utils/storageCleanup';

// Component chứa logic render chính
function AppContent() {
  const location = useLocation();
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register" || location.pathname === "/intro";
  const { user } = useAuth();

  console.log("AppContent rendering, user:", user);

  return (
    <>
      <Header />
      <div className="content" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Routes>
          {/* Chuyển hướng từ đường dẫn gốc "/" sang "/intro" */}
          <Route path="/" element={<Navigate to="/intro" replace />} />
          <Route path="/intro" element={<IntroPage />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/student" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
          <Route path="/employer" element={<ProtectedRoute><EmployerDashboard /></ProtectedRoute>} />
          <Route path="/employer/post-job" element={<ProtectedRoute><EmployerPostJob /></ProtectedRoute>} /> {/* Thêm route đến trang đăng tin mới */}
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/posts" element={<ProtectedRoute><Posts /></ProtectedRoute>} />
          <Route path="/posts/:id" element={<ProtectedRoute><PostDetail /></ProtectedRoute>} />
          <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />

          {/* Thêm routes cho tin nhắn */}
          <Route path="/messages" element={<ProtectedRoute><MessageCenter /></ProtectedRoute>} />
          <Route path="/messages/new" element={<ProtectedRoute><Conversation /></ProtectedRoute>} />
          <Route path="/messages/:conversationId" element={<ProtectedRoute><Conversation /></ProtectedRoute>} />

          {/* Lỗi 404 hoặc trang không tìm thấy */}
          <Route path="*" element={<div>Trang không tìm thấy.</div>} />
        </Routes>
      </div>
      {!isAuthPage && <Footer />}
    </>
  );
}

// Component chính của ứng dụng
function App() {
  // Run cleanup on app initialization and whenever component re-renders
  React.useEffect(() => {
    console.log("Running storage cleanup on refresh/initialization");
    const results = initializeStorageCleanup();
    console.log("Cleanup results:", results);
    
    // Set up a refresh check interval
    const cleanupInterval = setInterval(() => {
      console.log("Running scheduled cleanup check");
      initializeStorageCleanup();
    }, 60000); // Run every minute
    
    return () => clearInterval(cleanupInterval);
  }, []);

  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;