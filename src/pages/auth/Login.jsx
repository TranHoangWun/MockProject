import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { login as loginService } from "../../services/authService";
import { FaEnvelope, FaLock, FaGoogle, FaFacebookF, FaPhone } from "react-icons/fa";
import HueLogo from "../../assets/images/logo/HueCity.jpg";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = loginService(email.trim(), password);

    if (user) {
      login(user);
      switch (user.role) {
        case "student":
          navigate("/");
          break;
        case "employer":
          navigate("/employer");
          break;
        case "admin":
          navigate("/admin");
          break;
        default:
          navigate("/");
      }
    } else {
      setError("Email hoặc mật khẩu không đúng");
    }
  };

  return (
    <div className="d-flex  w-100 flex-grow-1 ">
      {/* Form login bên trái */}
      <div className="d-flex flex-column justify-content-center align-items-center w-50 p-5 bg-white">
        <h2 className="mb-4 text-primary fw-bold">Chào mừng bạn trở lại</h2>

        <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: "350px" }}>
          {/* Email */}
          <div className="input-group mb-3">
            <span className="input-group-text bg-white">
              <FaEnvelope className="text-primary" />
            </span>
            <input
              type="email"
              className="form-control"
              placeholder="Nhập email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="input-group mb-2">
            <span className="input-group-text bg-white">
              <FaLock className="text-primary" />
            </span>
            <input
              type="password"
              className="form-control"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <div className="text-danger mb-2">{error}</div>}

          <div className="text-end mb-3">
            <a href="#" className="text-danger" style={{ fontSize: "0.9rem" }}>
              Quên mật khẩu
            </a>
          </div>

          <button className="btn btn-primary w-100 mb-3">Đăng nhập</button>

          {/* Đăng nhập bằng MXH */}
          <div className="d-flex justify-content-center gap-2">
            <button type="button" className="btn btn-outline-danger">
              <FaGoogle />
            </button>
            <button type="button" className="btn btn-outline-primary">
              <FaFacebookF />
            </button>
            <button type="button" className="btn btn-outline-dark">
              <FaPhone />
            </button>
          </div>
        </form>

        <div className="mt-3">
          Bạn chưa có tài khoản?{" "}
          <a href="/register" className="text-primary fw">
            Đăng ký ngay
          </a>
        </div>
      </div>

      {/* Ảnh nền bên phải */}
      <div
        className="w-50 d-none d-md-block"
        style={{
          backgroundImage:
            `url(${HueLogo})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
           backgroundRepeat: "no-repeat",
        }}
      ></div>
    </div>
  );
}
