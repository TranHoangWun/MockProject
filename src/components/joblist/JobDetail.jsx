import React, { useEffect, useState } from 'react';
import './JobDetail.css';

const JobDetail = ({ job, onClose }) => {
  const [employerProfile, setEmployerProfile] = useState(null);
  
  // Lấy thông tin hồ sơ nhà tuyển dụng mới nhất khi component được render
  useEffect(() => {
    if (job && job.employerId) {
      try {
        const profiles = JSON.parse(localStorage.getItem('employerProfiles') || '{}');
        const employerId = parseInt(job.employerId);
        const profile = profiles[employerId];
        
        if (profile) {
          console.log(`Tìm thấy hồ sơ cho employerId ${employerId}:`, profile);
          setEmployerProfile(profile);
        }
      } catch (error) {
        console.error("Lỗi khi lấy hồ sơ nhà tuyển dụng:", error);
      }
    }
  }, [job]);

  if (!job) return null;

  return (
    <div className="job-detail-modal">
      <div className="job-detail-content">
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>{job.title}</h2>
        <p><strong>Công ty:</strong> {job.company}</p>
        <p><strong>Địa điểm:</strong> {job.location}</p>
        <p><strong>Hình thức:</strong> {job.type}</p>
        <p><strong>Mức lương:</strong> {job.salary}</p>
        <p><strong>Ngày đăng:</strong> {job.publication_date}</p>
        <p><strong>Hạn nộp hồ sơ:</strong> {job.deadline}</p>
        
        <div className="job-description">
          <h4>Mô tả công việc</h4>
          <p>{job.description}</p>
        </div>
        
        <div className="job-requirements">
          <h4>Yêu cầu công việc</h4>
          <p>{job.requirements}</p>
        </div>
        
        <div className="contact-info">
          <h4>Thông tin liên hệ</h4>
          
          {/* Ưu tiên hiển thị thông tin từ job (vì đã được cập nhật mới nhất khi đăng tin) */}
          <p><strong>Email:</strong> {job.contactEmail || employerProfile?.contactEmail || "Không có thông tin"}</p>
          <p><strong>Điện thoại:</strong> {job.contactPhone || employerProfile?.contactPhone || "Không có thông tin"}</p>
          <p><strong>Địa chỉ:</strong> {job.location || employerProfile?.address || "Không có thông tin"}</p>
        </div>
        
        {/* Hiển thị bản đồ */}
        <div className="job-map">
          <h4>Vị trí trên bản đồ</h4>
          <iframe
            width="100%"
            height="250"
            frameBorder="0"
            style={{ border: 0 }}
            src={`https://www.google.com/maps?q=${encodeURIComponent(
              job.location || "Thừa Thiên Huế"
            )}&output=embed`}
            allowFullScreen
            title="Job location"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
