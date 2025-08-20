import React from "react";
import { getCurrentUser, logout } from "../../services/authService";
import { useNavigate } from "react-router-dom";

export default function EmployerDashboard() {
  const user = getCurrentUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="container mt-5">
      <h2>🏢 Xin chào {user?.company || user?.username}</h2>
      <p>Bạn đang đăng nhập với vai trò <b>Nhà tuyển dụng</b>.</p>
      <ul>
        <li>Đăng tin tuyển dụng mới</li>
        <li>Quản lý tin tuyển dụng đã đăng</li>
        <li>Xem danh sách ứng viên</li>
      </ul>
      <button className="btn btn-danger mt-3" onClick={handleLogout}>
        Đăng xuất
      </button>
    </div>
  );
}
