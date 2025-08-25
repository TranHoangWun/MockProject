import React, { useState, useEffect } from "react";
import { getCurrentUser, logout } from "../../services/authService";
import { useNavigate, Link } from "react-router-dom";
import "./Employer.css";
import empimg from "../../assets/images/employer/employer"; // Import employer images

export default function EmployerDashboard() {
  const user = getCurrentUser();
  const navigate = useNavigate();
  const [jobListings, setJobListings] = useState([]);
  const [deletedJobs, setDeletedJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobDetails, setShowJobDetails] = useState(false);
  
  // State mới cho modal danh sách ứng viên
  const [showApplicants, setShowApplicants] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [applicants, setApplicants] = useState([]);
  
  // Thêm state để quản lý modal xem CV
  const [showCV, setShowCV] = useState(false);
  const [currentCV, setCurrentCV] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  
  // Load job listings when component mounts
  useEffect(() => {
    loadJobListings();
  }, []);
  
  // Function to load job listings from localStorage
  const loadJobListings = () => {
    try {
      // Make sure we have a valid user
      if (!user || !user.id) {
        console.error("Cannot load jobs: No user information");
        return;
      }
      
      const employerId = parseInt(user.id);
      console.log(`Loading jobs for employer ID: ${employerId}`);
      
      // Get all jobs from localStorage
      const allJobs = JSON.parse(localStorage.getItem('employerJobs') || '[]');
      
      // Filter jobs to only show this employer's jobs
      const myJobs = allJobs.filter(job => parseInt(job.employerId) === employerId);
      
      console.log(`Found ${myJobs.length} jobs for employer ID ${employerId}`);
      setJobListings(myJobs);
      
      // Load deleted jobs as well
      const allDeletedJobs = JSON.parse(localStorage.getItem('deletedJobs') || '[]');
      const myDeletedJobs = allDeletedJobs.filter(job => parseInt(job.employerId) === employerId);
      setDeletedJobs(myDeletedJobs);
      
    } catch (error) {
      console.error("Error loading job listings:", error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Hàm xem chi tiết tin tuyển dụng
  const handleViewJobDetails = (job) => {
    console.log("Xem chi tiết job:", job);
    setSelectedJob(job);
    setShowJobDetails(true);
  };
  
  // Hàm xóa tin tuyển dụng
  const handleDeleteJob = (jobId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tin tuyển dụng này?')) {
      try {
        // Get all jobs from localStorage
        const allJobs = JSON.parse(localStorage.getItem('employerJobs') || '[]');
        
        // Find the job to delete
        const jobToDelete = allJobs.find(job => job.id === jobId);
        
        if (!jobToDelete) {
          alert('Không tìm thấy tin tuyển dụng!');
          return;
        }
        
        // Remove job from active listings
        const updatedAllJobs = allJobs.filter(job => job.id !== jobId);
        
        // Add deleted information to the job
        const deletedJob = {
          ...jobToDelete,
          deletedAt: new Date().toLocaleDateString('vi-VN'),
          reason: "Nhà tuyển dụng đã xóa"
        };
        
        // Get all deleted jobs
        const allDeletedJobs = JSON.parse(localStorage.getItem('deletedJobs') || '[]');
        const updatedDeletedJobs = [...allDeletedJobs, deletedJob];
        
        // Update localStorage
        localStorage.setItem('employerJobs', JSON.stringify(updatedAllJobs));
        localStorage.setItem('deletedJobs', JSON.stringify(updatedDeletedJobs));
        
        // Update component state
        loadJobListings();
        
        alert('Đã xóa tin tuyển dụng thành công!');
      } catch (error) {
        console.error("Error deleting job:", error);
        alert('Có lỗi xảy ra khi xóa tin tuyển dụng!');
      }
    }
  };

  // Hàm xử lý khi nhấp vào xem ứng viên
  const handleViewApplicants = (jobId) => {
    setSelectedJobId(jobId);
    loadApplicants(jobId);
    setShowApplicants(true);
  };
  
  // Hàm tải danh sách ứng viên cho công việc
  const loadApplicants = (jobId) => {
    try {
      // Lấy danh sách ứng viên từ localStorage
      const appliedJobs = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
      
      // Lọc các đơn ứng tuyển cho công việc này
      const jobApplicants = appliedJobs.filter(application => application.jobId === jobId);
      
      if (jobApplicants.length > 0) {
        // Lấy thông tin chi tiết về từng ứng viên
        const applicantsWithDetails = jobApplicants.map(application => {
          // Lấy thông tin người dùng từ localStorage users
          const users = JSON.parse(localStorage.getItem('users') || '[]');
          const applicantUser = users.find(user => user.id === application.userId);
          
          return {
            id: application.userId,
            applicationId: `${application.userId}-${jobId}`,
            name: applicantUser?.profile?.fullName || "Không xác định",
            email: applicantUser?.profile?.email || "Không có email",
            phone: applicantUser?.profile?.phone || "Không có SĐT",
            cv: applicantUser?.profile?.cv || null,
            status: application.status || "Đã gửi",
            appliedAt: application.appliedAt || new Date().toISOString(),
          };
        });
        
        setApplicants(applicantsWithDetails);
      } else {
        setApplicants([]);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách ứng viên:", error);
      setApplicants([]);
    }
  };
  
  // Hàm xử lý cập nhật trạng thái ứng tuyển
  const handleUpdateApplicantStatus = (applicationId, newStatus) => {
    try {
      // Lấy danh sách đơn ứng tuyển
      const appliedJobs = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
      
      // Tìm đơn ứng tuyển cần cập nhật
      const [userId, jobId] = applicationId.split('-').map(Number);
      const applicationIndex = appliedJobs.findIndex(
        app => app.userId === userId && app.jobId === jobId
      );
      
      if (applicationIndex !== -1) {
        // Cập nhật trạng thái
        appliedJobs[applicationIndex].status = newStatus;
        
        // Lưu lại vào localStorage
        localStorage.setItem('appliedJobs', JSON.stringify(appliedJobs));
        
        // Cập nhật state hiển thị
        setApplicants(prev => prev.map(app => 
          app.applicationId === applicationId 
            ? {...app, status: newStatus} 
            : app
        ));
        
        alert(`Đã cập nhật trạng thái ứng viên thành: ${newStatus}`);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái ứng viên:", error);
    }
  };

  // Thêm hàm để mở modal xem CV với zoom lớn hơn
  const handleViewCV = (cvUrl) => {
    setCurrentCV(cvUrl);
    setShowCV(true);
    setZoomLevel(2); // Tăng từ 1 lên 2 (200%)
  };
  
  // Thêm hàm để điều chỉnh mức độ phóng to
  const adjustZoom = (amount) => {
    setZoomLevel(prev => {
      const newZoom = prev + amount;
      // Giới hạn mức zoom từ 1 đến 3
      return Math.max(1, Math.min(3, newZoom));
    });
  };

  // Cải thiện hàm sắp xếp tin tuyển dụng
  const sortedJobListings = React.useMemo(() => {
    return [...jobListings].sort((a, b) => {
      // Nếu có ngày dạng DD/MM/YYYY, chuyển sang Date để so sánh
      if (a.date && b.date) {
        // Xử lý định dạng DD/MM/YYYY
        const parseDate = (dateStr) => {
          const [day, month, year] = dateStr.split('/').map(Number);
          return new Date(year, month - 1, day);
        };
        
        return parseDate(b.date) - parseDate(a.date);
      }
      // Nếu không có date hoặc format khác, dùng id để sắp xếp (ID lớn hơn = mới hơn)
      return b.id - a.id;
    });
  }, [jobListings]);

  // Thêm hàm để tính tổng số ứng viên
  const totalApplicants = React.useMemo(() => {
    return jobListings.reduce((total, job) => total + (job.applicants || 0), 0);
  }, [jobListings]);

  // Thêm hàm mới để xóa đơn ứng tuyển
  const handleRemoveApplication = (applicationId) => {
    if (window.confirm('Bạn có chắc muốn hủy đơn ứng tuyển của sinh viên này?')) {
      try {
        // Lấy danh sách đơn ứng tuyển
        const appliedJobs = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
        
        // Tìm đơn ứng tuyển cần xóa
        const [userId, jobId] = applicationId.split('-').map(Number);
        
        // Lọc ra các đơn không phải đơn cần xóa
        const updatedAppliedJobs = appliedJobs.filter(
          app => !(app.userId === userId && app.jobId === jobId)
        );
        
        // Lưu lại vào localStorage
        localStorage.setItem('appliedJobs', JSON.stringify(updatedAppliedJobs));
        
        // Cập nhật hiển thị trong UI
        setApplicants(prev => prev.filter(app => app.applicationId !== applicationId));
        
        // Giảm số lượng ứng viên trong job
        decreaseJobApplicantCount(jobId);
        
        alert('Đã hủy đơn ứng tuyển thành công!');
      } catch (error) {
        console.error("Lỗi khi xóa đơn ứng tuyển:", error);
        alert('Có lỗi xảy ra khi xóa đơn ứng tuyển!');
      }
    }
  };
  
  // Hàm để giảm số lượng ứng viên trong job
  const decreaseJobApplicantCount = (jobId) => {
    try {
      const allJobs = JSON.parse(localStorage.getItem('employerJobs') || '[]');
      const jobIndex = allJobs.findIndex(job => job.id === jobId);
      
      if (jobIndex !== -1 && allJobs[jobIndex].applicants > 0) {
        allJobs[jobIndex].applicants -= 1;
        localStorage.setItem('employerJobs', JSON.stringify(allJobs));
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật số lượng ứng viên:", error);
    }
  };

  // Hàm từ chối và hủy đơn ứng tuyển
  const handleRejectAndRemove = (applicationId) => {
    // Đầu tiên cập nhật trạng thái thành "Từ chối"
    handleUpdateApplicantStatus(applicationId, "Từ chối");
    
    // Sau đó xóa đơn ứng tuyển
    setTimeout(() => {
      handleRemoveApplication(applicationId);
    }, 500);
  };

  return (
    <div>
      {/* Header */}
      <header className="header">
        
      </header>

      {/* Dashboard Content */}
      <div className="dashboard-container">
        <div className="role-info">
          Bạn đang đăng nhập với vai trò <strong>Nhà tuyển dụng</strong>.
        </div>
        
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-number">{jobListings.length}</div>
            <div className="stat-label">Tổng số tin đăng</div>
          </div>
          <div className="stat-card green">
            <div className="stat-number">{totalApplicants}</div>
            <div className="stat-label">Ứng viên</div>
          </div>
          <div className="stat-card pink">
            <div className="stat-number">{deletedJobs.length}</div>
            <div className="stat-label">Đã xóa (do nhà tuyển dụng)</div>
          </div>
        </div>
        
        <div className="dashboard-content">
          <div className="management-section">
            <h3>Quản lý tuyển dụng</h3>
            <ul className="action-links">
              <li>
                <Link to="/employer/post-job">Đăng tin tuyển dụng mới</Link>
              </li>
              <li>
                <a href="#">Quản lý tin tuyển dụng đã đăng</a>
              </li>
              <li>
                <a href="#">Xem danh sách ứng viên</a>
              </li>
            </ul>
          </div>
          
          <div className="account-section">
            <h3>Thông tin tài khoản</h3>
            <ul className="action-links">
              <li><Link to="/profile">Cập nhật hồ sơ công ty</Link></li>
              <li><a href="#">Nâng cấp gói dịch vụ</a></li>
              <li><a href="#">Cài đặt tài khoản</a></li>
            </ul>
          </div>
        </div>
        
        <div className="job-listings-section">
          <h3>Tin tuyển dụng đã đăng</h3>
          <table className="job-table">
            <thead>
              <tr>
                <th>Tiêu đề</th>
                <th>Ngày đăng</th>
                <th>Trạng thái</th>
                <th>Ứng viên</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {sortedJobListings.length > 0 ? (
                sortedJobListings.map(job => (
                  <tr key={job.id}>
                    <td>{job.jobTitle || "Không có tiêu đề"}</td>
                    <td>{job.date || "N/A"}</td>
                    <td>
                      <span className={`status ${job.status === "Đang đăng" ? "active" : ""}`}>
                        {job.status === "approved" ? "approved" : job.status || "Đang đăng"}
                      </span>
                    </td>
                    <td>
                      <a 
                        href="#" 
                        className="view-link" 
                        onClick={(e) => {
                          e.preventDefault();
                          handleViewApplicants(job.id);
                        }}
                      >
                        Xem ({job.applicants || 0})
                      </a>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="view-details-btn" 
                          onClick={() => handleViewJobDetails(job)}
                        >
                          Chi tiết
                        </button>
                        <button className="delete-btn" onClick={() => handleDeleteJob(job.id)}>Xóa</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">Không có tin tuyển dụng nào</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="deleted-jobs-section">
          <h3>Các tin đã xóa</h3>
          <table className="job-table">
            <thead>
              <tr>
                <th>Tiêu đề</th>
                <th>Ngày đăng</th>
                <th>Lý do</th>
              </tr>
            </thead>
            <tbody>
              {deletedJobs.length > 0 ? (
                deletedJobs.map(job => (
                  <tr key={job.id}>
                    <td>{job.jobTitle || "Không có tiêu đề"}</td>
                    <td>{job.date || "N/A"}</td>
                    <td><span className="reason">{job.reason || "Không có lý do"}</span></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center">Không có tin tuyển dụng nào đã xóa</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Xem danh sách ứng viên */}
      {showApplicants && (
        <div className="modal-overlay">
          <div className="applicants-modal">
            <div className="modal-header">
              <h3>Danh sách ứng viên</h3>
              <button className="close-modal-btn" onClick={() => setShowApplicants(false)}>×</button>
            </div>
            <div className="modal-content">
              {applicants.length > 0 ? (
                <table className="applicants-table">
                  <thead>
                    <tr>
                      <th>Họ tên</th>
                      <th>Email</th>
                      <th>Số điện thoại</th>
                      <th>CV</th>
                      <th>Ngày ứng tuyển</th>
                      <th>Trạng thái</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applicants.map((applicant) => (
                      <tr key={applicant.applicationId}>
                        <td>{applicant.name}</td>
                        <td>{applicant.email}</td>
                        <td>{applicant.phone}</td>
                        <td>
                          {applicant.cv ? (
                            <a href="#" onClick={(e) => {
                              e.preventDefault();
                              handleViewCV(applicant.cv);
                            }}>Xem CV</a>
                          ) : (
                            "Không có CV"
                          )}
                        </td>
                        <td>
                          {new Date(applicant.appliedAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td>
                          <span className={`status-badge ${applicant.status.toLowerCase()}`}>
                            {applicant.status}
                          </span>
                        </td>
                        <td>
                          {applicant.status === "Đã gửi" ? (
                            <div className="applicant-actions">
                              <button 
                                className="accept-btn"
                                onClick={() => handleUpdateApplicantStatus(applicant.applicationId, "Chấp nhận")}
                              >
                                Chấp nhận
                              </button>
                              <button 
                                className="reject-btn"
                                onClick={() => handleRejectAndRemove(applicant.applicationId)}
                              >
                                Từ chối
                              </button>
                            </div>
                          ) : (
                            <div className="applicant-actions">
                              <button 
                                className="cancel-btn"
                                onClick={() => handleRemoveApplication(applicant.applicationId)}
                              >
                                Hủy ứng tuyển
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="no-applicants">Chưa có ứng viên nào ứng tuyển vào vị trí này.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Thêm Modal xem CV */}
      {showCV && currentCV && (
        <div 
          className="modal-overlay" 
          onClick={() => setShowCV(false)}
          style={{ zIndex: 1100 }}
        >
          <div 
            className="cv-modal" 
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "rgba(0,0,0,0.9)",
              maxWidth: "98%", // Tăng từ 95% lên 98%
              maxHeight: "98%", // Tăng từ 95% lên 98%
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "10px", // Giảm padding từ 20px xuống 10px để tăng không gian hiển thị
              borderRadius: "8px"
            }}
          >
            <div className="zoom-controls mb-2">
              <button 
                className="btn btn-sm btn-light me-2" 
                onClick={(e) => {
                  e.stopPropagation();
                  adjustZoom(-0.25);
                }}
              >
                -
              </button>
              <span className="text-light mx-2">{Math.round(zoomLevel * 100)}%</span>
              <button 
                className="btn btn-sm btn-light ms-2" 
                onClick={(e) => {
                  e.stopPropagation();
                  adjustZoom(0.25);
                }}
              >
                +
              </button>
            </div>
            
            <div 
              className="cv-image-container" 
              style={{
                overflow: "auto",
                width: "100%",
                height: "calc(100vh - 80px)", // Tăng từ 120px lên 80px để có nhiều không gian hơn
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              <img 
                src={currentCV} 
                alt="CV Preview" 
                style={{
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: "center",
                  maxWidth: "98%", // Tăng từ 95% lên 98%
                  maxHeight: "none",
                  transition: "transform 0.2s ease",
                  backgroundColor: "#fff",
                  borderRadius: "4px"
                }}
              />
            </div>
            
            <button 
              className="btn btn-light position-absolute" 
              style={{top: "10px", right: "10px"}} // Giảm từ 20px xuống 10px
              onClick={() => setShowCV(false)}
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Job Details Modal */}
      {showJobDetails && selectedJob && (
        <div className="modal-overlay" onClick={() => setShowJobDetails(false)}>
          <div className="job-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết tin tuyển dụng</h3>
              <button className="close-modal-btn" onClick={() => setShowJobDetails(false)}>×</button>
            </div>
            <div className="modal-content">
              <div className="job-detail-section">
                <h4>Thông tin cơ bản</h4>
                <table className="detail-table">
                  <tbody>
                    <tr>
                      <td><strong>Tiêu đề:</strong></td>
                      <td>{selectedJob.jobTitle || selectedJob.title || "Không có tiêu đề"}</td>
                    </tr>
                    <tr>
                      <td><strong>Ngày đăng:</strong></td>
                      <td>{selectedJob.date || "N/A"}</td>
                    </tr>
                    <tr>
                      <td><strong>Hình thức làm việc:</strong></td>
                      <td>{selectedJob.employmentType || "Không có thông tin"}</td>
                    </tr>
                    <tr>
                      <td><strong>Mức lương:</strong></td>
                      <td>{selectedJob.salaryRange || selectedJob.salary || "Thỏa thuận"}</td>
                    </tr>
                    <tr>
                      <td><strong>Địa điểm:</strong></td>
                      <td>{selectedJob.location || "Không có thông tin"}</td>
                    </tr>
                    <tr>
                      <td><strong>Trạng thái:</strong></td>
                      <td>
                        <span className={`status ${selectedJob.status === "Đang đăng" ? "active" : ""}`}>
                          {selectedJob.status || "Đang đăng"}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td><strong>Số lượng ứng viên:</strong></td>
                      <td>{selectedJob.applicants || 0}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="job-detail-section">
                <h4>Mô tả công việc</h4>
                <p>{selectedJob.description || "Không có mô tả"}</p>
              </div>
              
              <div className="job-detail-section">
                <h4>Yêu cầu công việc</h4>
                <p>{selectedJob.requirements || "Không có yêu cầu"}</p>
              </div>
              
              <div className="job-detail-section">
                <h4>Thông tin liên hệ</h4>
                <p><strong>Email:</strong> {selectedJob.contactEmail || "Không có thông tin"}</p>
                <p><strong>Điện thoại:</strong> {selectedJob.contactPhone || "Không có thông tin"}</p>
              </div>
              
              {/* Thêm Google Maps hiển thị địa điểm làm việc */}
              <div className="job-detail-section">
                <h4>Vị trí trên bản đồ</h4>
                <div className="map-container">
                  <iframe
                    width="100%"
                    height="300"
                    frameBorder="0"
                    src={`https://www.google.com/maps?q=${encodeURIComponent(
                      (selectedJob.location || '') + ', ' + (selectedJob.district || 'Thừa Thiên Huế')
                    )}&output=embed`}
                    allowFullScreen
                    title="Địa điểm làm việc"
                  ></iframe>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-close" onClick={() => setShowJobDetails(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
