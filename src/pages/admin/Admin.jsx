import React from "react";
import { getCurrentUser, logout } from "../../services/authService";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const user = getCurrentUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="container mt-5">
      <h2>🛠️ Xin chào {user?.username}</h2>
      <p>Bạn đang đăng nhập với vai trò <b>Admin</b>.</p>
      <ul>
        <li>Quản lý người dùng</li>
        <li>Duyệt tin tuyển dụng</li>
        <li>Báo cáo thống kê</li>
      </ul>
      <button className="btn btn-danger mt-3" onClick={handleLogout}>
        Đăng xuất
      </button>
    </div>
  );
}
