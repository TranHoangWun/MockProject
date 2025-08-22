import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import StudentDashboard from "./pages/student/Student.jsx";
import EmployerDashboard from "./pages/employer/Employer.jsx";
import AdminDashboard from "./pages/admin/Admin.jsx";
import { AuthProvider, useAuth } from "./context/AuthContext.js";
import Profile from "./components/profile/Profile.jsx";
import Header from "./components/layout/header/Header.jsx";
import Footer from "./components/layout/footer/Footer.jsx";
import ProtectedRoute from "./components/layout/ProtectRoute.jsx";
import IntroPage from "./pages/intro/Intro.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import Posts from "./components/Posts";
import PostDetail from "pages/student/postdetail/PostDetail.jsx";

// Component chứa logic render chính
function AppContent() {
  const location = useLocation();
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register" || location.pathname === "/intro";
  const { user } = useAuth();

  return (
    <>
      <Header />
      <div className="content" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/intro" element={<IntroPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
          <Route path="/employer" element={<ProtectedRoute><EmployerDashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/posts" element={<ProtectedRoute><Posts/></ProtectedRoute>} />
          <Route path="/posts/:id" element={<ProtectedRoute><PostDetail/></ProtectedRoute>} />
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
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;