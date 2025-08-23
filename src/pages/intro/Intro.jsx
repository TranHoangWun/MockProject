import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Intro.css";
import img1 from "../../assets/images/logo/HueCity.jpg";
import img2 from "../../assets/images/logo/heroS.jpg";
import img3 from "../../assets/images/logo/tt.jpg";

export default function Intro() {
  const images = [img1, img2, img3];
  const [current, setCurrent] = useState(0);

  // Auto change background every 5s
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="intro-container">
      {/* Hero Section */}
      <section
        className="hero"
        style={{ backgroundImage: `url(${images[current]})` }}
      >
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1 className="hero-title">HueJob - Kết nối cơ hội việc làm</h1>
          <p className="hero-subtitle">
            Website tìm kiếm việc làm cho sinh viên Huế
          </p>
          <div className="hero-buttons">
            <Link to="/login" className="hero-btn-primary">
              🚀 Bắt đầu ngay
            </Link>
            <Link to="/register" className="hero-btn-secondary">
              ✨ Đăng ký miễn phí
            </Link>
          </div>
          <div className="scroll-down">▼</div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2 className="section-title">Tại sao chọn HueJob?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <img src={img1} alt="Việc làm" />
            <h3>Việc làm đa dạng</h3>
            <p>
              Nhiều vị trí part-time, full-time, internship phù hợp cho sinh
              viên.
            </p>
          </div>
          <div className="feature-card">
            <img src={img2} alt="Nhà tuyển dụng" />
            <h3>Nhà tuyển dụng uy tín</h3>
            <p>Kết nối trực tiếp với doanh nghiệp uy tín tại Huế.</p>
          </div>
          <div className="feature-card">
            <img src={img3} alt="Sinh viên" />
            <h3>Hỗ trợ sinh viên</h3>
            <p>
              Cung cấp CV, tips phỏng vấn và định hướng nghề nghiệp miễn phí.
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about">
        <h2>Khám phá cơ hội nghề nghiệp tại Huế</h2>
        <p>
          HueJob không chỉ là nền tảng kết nối công việc, mà còn là người bạn
          đồng hành trên hành trình sự nghiệp của sinh viên. Với nguồn việc làm
          phong phú, doanh nghiệp tin cậy và những công cụ hỗ trợ hiện đại,
          chúng tôi mong muốn mang đến cho bạn hành trang vững chắc để bước vào
          thị trường lao động.
        </p>
        <p>
          Hãy bắt đầu từ hôm nay để tìm kiếm công việc mơ ước, xây dựng CV chuyên
          nghiệp và khám phá những cơ hội chỉ có tại Huế.
        </p>
        <Link to="/register" className="about-btn">
          🌟 Tham gia ngay
        </Link>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>©2025 HueJob - Website tìm kiếm việc làm cho sinh viên Huế</p>
      </footer>
    </div>
  );
}
