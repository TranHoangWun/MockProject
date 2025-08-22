import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import "./Header.css";

function Header() {
  const { user, logout, userRole } = useContext(AuthContext);

  // Logo và link chính theo role
  const homeLink =
    userRole === "student"
      ? "/"
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
                  <a className="nav-link" href="#jobs">Công việc</a>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/posts">Bài viết</Link>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#about">Giới thiệu</a>
                </li>
              </>
            )}

            {userRole === "employer" && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/employer">Quản lý tuyển dụng</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/profile">Hồ sơ công ty</Link>
                </li>
              </>
            )}

            {userRole === "admin" && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin">Dashboard Admin</Link>
                </li>
              </>
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
                  <Link to="/profile" className="nav-link mb-0">
                    Xin chào, {user.profile?.companyName || user.profile?.fullName || user.username}
                  </Link>
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
