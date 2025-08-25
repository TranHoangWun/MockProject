// component/header/Header.jsx
import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import { NavLink } from "react-router-dom";
import "./Header.css";
import { FaUser, FaSearch, FaEnvelope } from "react-icons/fa";

function Header() {
  const { user, logout, userRole } = useContext(AuthContext);
  const { pathname, hash } = useLocation(); //  lấy pathname & hash từ React Router

  // Logo và link chính theo role
  const homeLink =
    userRole === "student"
      ? "/student"
      : userRole === "employer"
        ? "/employer"
        : userRole === "admin"
          ? "/admin"
          : "/intro";

  return (
    <nav className="navbar navbar-expand-lg navbar-dark custom-navbar-color">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to={homeLink}>
          <img src="/careerconnect-white3.png" alt="Logo" className="navbar-logo" />
          <span className="brand-text">Sinh Viên Huế Jobs</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div id="navbarNav" className="collapse navbar-collapse">
          <ul className="navbar-nav ms-auto">
            {userRole === "student" && (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/student">
                    Công việc
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/posts">
                    Bài viết
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/messages">
                    Tin nhắn <FaEnvelope className="ms-1" />
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/about">
                    Giới thiệu
                  </NavLink>
                </li>
              </>
            )}

            {userRole === "employer" && (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/employer">Quản lý tuyển dụng</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/messages">
                    Tin nhắn <FaEnvelope className="ms-1" />
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/profile">Hồ sơ công ty</NavLink>
                </li>
              </>
            )}

            {userRole === "admin" && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/admin">Dashboard Admin</NavLink>
              </li>
            )}

            {user ? (
              <>
                <li className="nav-item d-flex align-items-center ms-2">
                  {user.profile?.image && (
                    <img
                      src={user.profile.image}
                      alt="avatar"
                      className="rounded-circle me-2"
                      style={{ width: "35px", height: "35px", objectFit: "cover" }}
                    />
                  )}
                  <NavLink to="/profile" className="nav-link mb-0">
                    Xin chào, {user.profile?.companyName || user.profile?.fullName || user.username}
                  </NavLink>
                </li>
                <li className="nav-item">
                  <button
                    type="button"
                    className="btn btn-custom ms-2"
                    onClick={logout}
                  >
                    Đăng xuất
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link to="/login" className="btn btn-outline-light me-2">
                    Đăng nhập
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/register" className="btn btn-light">
                    Đăng ký
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Header;
