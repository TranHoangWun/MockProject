import React, { useEffect, useState } from "react";
import "./About.css";
import img1 from "../../assets/images/logo/HueCity.jpg";
import img2 from "../../assets/images/logo/heroS.jpg";
import img3 from "../../assets/images/logo/tt.jpg";

export default function About() {
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
        <div className="about-container">
            {/* Hero Section */}
            <section
                className="hero"
                style={{ backgroundImage: `url(${images[current]})` }}
            >
                <div className="hero-content">
                    <h1 className="hero-title">Về HueJob</h1>
                    <p className="hero-subtitle">
                        Kết nối sinh viên Huế với cơ hội việc làm
                    </p>
                </div>
            </section>

            {/* About Content */}
            <section className="about-content">
                <h2>Giới thiệu</h2>
                <p>
                    HueJob được xây dựng nhằm hỗ trợ sinh viên tại Huế dễ dàng tìm kiếm cơ hội
                    việc làm, thực tập và kết nối với doanh nghiệp uy tín.
                </p>
                <p>
                    Với mục tiêu trở thành cầu nối giữa nhà tuyển dụng và sinh viên,
                    chúng tôi cung cấp các thông tin việc làm đa dạng, công cụ hỗ trợ CV,
                    cũng như chia sẻ kiến thức và kỹ năng nghề nghiệp.
                </p>

                <div className="about-extra">
                    <div className="about-card">
                        <h3>Sứ mệnh</h3>
                        <p>
                            Giúp sinh viên Huế có thêm cơ hội việc làm, nâng cao kỹ năng,
                            từ đó góp phần phát triển nguồn nhân lực chất lượng cao cho địa phương.
                        </p>
                    </div>
                    <div className="about-card">
                        <h3>Giá trị cốt lõi</h3>
                        <p>
                            Minh bạch – Tin cậy – Thân thiện. Chúng tôi hướng đến xây dựng một
                            môi trường tuyển dụng an toàn và uy tín.
                        </p>
                    </div>
                    <div className="about-card">
                        <h3>Tầm nhìn</h3>
                        <p>
                            Trở thành nền tảng tìm việc hàng đầu cho sinh viên tại miền Trung,
                            đặc biệt là thành phố Huế.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
