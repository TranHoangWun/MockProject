import React, { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const IntroPage = () => {
  const { isAuthenticated, userRole } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      // Nếu là student, redirect vào dashboard student
      if (userRole === "student") navigate("/student");
      else if (userRole === "employer") navigate("/employer");
      else if (userRole === "admin") navigate("/admin");
      else navigate("/"); // default
    }
  }, [isAuthenticated, userRole, navigate]);

  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 text-center">
      <h1 className="mb-3">Chào mừng đến với HueJob 👋</h1>
      <p className="mb-4">Nền tảng tìm việc nhanh chóng và dễ dàng cho sinh viên.</p>
      <div>
        <Link to="/login" className="btn btn-primary me-2">
          Đăng nhập
        </Link>
        <Link to="/register" className="btn btn-outline-secondary">
          Đăng ký
        </Link>
      </div>
    </div>
  );
};

export default IntroPage;
