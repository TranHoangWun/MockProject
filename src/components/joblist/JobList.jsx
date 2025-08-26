// components/joblist/JobList.jsx
import React, { useState, useEffect, useContext } from "react";
import { FaHeart, FaRegHeart, FaExclamationCircle } from "react-icons/fa";
import { Modal, Button, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import "./jobList.css";

import { AuthContext } from "../../context/AuthContext";
import usersData from "../../data/users";

const LS_SAVED_KEY = "savedJobs";
const LS_APPLIED_KEY = "appliedJobs";

function readLS(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function writeLS(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Badge màu theo trạng thái
const statusBadgeClass = (status) =>
  status === "Đã gửi"
    ? "bg-primary"
    : status === "Chấp nhận"
      ? "bg-success"
      : status === "Từ chối"
        ? "bg-danger"
        : "bg-secondary";

// Card
function JobCard({
  job,
  isSaved,
  appliedStatus,
  toggleFavorite,
  onReport,
  onApply,
  onCancelApply,
  onViewDetail,
  onContact
}) {
  return (
    <div className="card mb-3 shadow-sm job-card">
      <div className="card-body">
        {/* Logo + Title + Company */}
        <div className="d-flex align-items-start mb-3">
          <img
            src={job.logo || "/default-logo.png"}
            alt={job.company}
            className="job-logo-small me-3"
          />
          <div>
            <h5 className="card-title mb-1">{job.title}</h5>
            <p className="card-subtitle text-muted small company-name mb-0">
              {job.company}
            </p>
          </div>
        </div>

        {/* Tags */}
        <div className="mb-2 d-flex flex-wrap">
          <span className="badge1 me-2">{job.location}</span>
          <span className="badge1 me-2">{job.type}</span>
          <span className="badge1">{job.salary || "Thỏa thuận"}</span>
        </div>

        {/* Description */}
        <p className="card-text job-description">{job.description}</p>
        <p className="card-text text-muted small">
          Đăng ngày: {job.publication_date} - Hạn nộp: {job.deadline}
        </p>
      </div>

      {/* Buttons - Updated to ensure visibility */}
      <div className="job-actions">
        <div className="d-flex align-items-center flex-wrap button-container">
          {appliedStatus ? (
            <>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => onCancelApply(job)}
                className="action-button"
              >
                Hủy ứng tuyển
              </Button>
              <span className={`badge bg-secondary`}>{appliedStatus}</span>
            </>
          ) : (
            <Button 
              variant="success" 
              size="sm" 
              onClick={() => onApply(job)}
              className="action-button"
            >
              Ứng tuyển
            </Button>
          )}

          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => onViewDetail(job)}
            className="action-button"
          >
            Xem chi tiết
          </Button>

          <Button
            variant="outline-info"
            size="sm"
            onClick={() => onContact(job)}
            className="action-button"
          >
            Liên hệ
          </Button>
        </div>

        <div className="job-icons">
          {isSaved ? (
            <FaHeart
              className="me-3 text-danger job-icon"
              onClick={() => toggleFavorite(job.id)}
            />
          ) : (
            <FaRegHeart
              className="me-3 text-muted job-icon"
              onClick={() => toggleFavorite(job.id)}
            />
          )}
          <FaExclamationCircle
            className="text-danger job-icon"
            onClick={() => onReport(job)}
          />
        </div>
      </div>
    </div>
  );
}

function JobList({
  jobs,
  currentUserId = 1,
  activeTab = "all",
  userSavedIds = new Set(),
  appliedStatusByJobId = {},
  onDataChange,
}) {
  const { user } = useContext(AuthContext); 

  // Tìm user đang đăng nhập trong usersData
  const currentUser = usersData.find((u) => u.id === user?.id);

  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    setFavorites(Array.from(userSavedIds));
  }, [userSavedIds]);

  // Toggle save job
  const toggleFavorite = (jobId) => {
    const ls = readLS(LS_SAVED_KEY);
    const existIdx = ls.findIndex(
      (x) => x.userId === currentUserId && x.jobId === jobId
    );

    let nextFavorites;
    if (existIdx >= 0) {
      ls.splice(existIdx, 1);
      nextFavorites = favorites.filter((id) => id !== jobId);
    } else {
      ls.push({
        userId: currentUserId,
        jobId,
        savedAt: new Date().toISOString(),
      });
      nextFavorites = [...favorites, jobId];
    }
    writeLS(LS_SAVED_KEY, ls);
    setFavorites(nextFavorites);
    onDataChange?.();
  };

  // Report
  const [showReport, setShowReport] = useState(false);
  const [reportJob, setReportJob] = useState(null);
  const [reportForm, setReportForm] = useState({
    name: '',
    phone: '',
    address: '',
    email: '',
    content: ''
  });
  
  const onReport = (job) => {
    setReportJob(job);
    // Pre-fill form with user data if available
    if (user && user.profile) {
      setReportForm({
        name: user.profile.fullName || '',
        phone: user.profile.phone || '',
        address: user.profile.address || '',
        email: user.profile.email || '',
        content: ''
      });
    } else {
      setReportForm({
        name: '',
        phone: '',
        address: '',
        email: '',
        content: ''
      });
    }
    setShowReport(true);
  };
  
  const handleReportFormChange = (e) => {
    const { name, value } = e.target;
    setReportForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmitReport = () => {
    // Validate form
    if (!reportForm.name || !reportForm.email) {
      alert("Vui lòng điền đầy đủ họ tên và email!");
      return;
    }
    
    try {
      // Get existing reports or create new array
      const existingReports = JSON.parse(localStorage.getItem("jobReports") || "[]");
      
      // Create new report
      const newReport = {
        id: Date.now(),
        type: 'job',
        jobId: reportJob.id,
        jobTitle: reportJob.title,
        companyName: reportJob.company,
        reporterId: user ? user.id : 0,
        reportedUserId: reportJob.employerId,
        reason: reportForm.content || "Báo cáo tin tuyển dụng",
        description: `Người báo cáo: ${reportForm.name}, SĐT: ${reportForm.phone}, Email: ${reportForm.email}, Địa chỉ: ${reportForm.address}`,
        createdAt: new Date().toISOString(),
        status: 'pending'
      };
      
      // Add to reports
      existingReports.push(newReport);
      
      // Save to localStorage
      localStorage.setItem("jobReports", JSON.stringify(existingReports));
      
      // Show success message
      alert("Cảm ơn bạn đã báo cáo! Quản trị viên sẽ xem xét và xử lý sớm nhất có thể.");
      
      // Close modal
      handleCloseReport();
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Có lỗi xảy ra khi gửi báo cáo. Vui lòng thử lại sau!");
    }
  };
  
  const handleCloseReport = () => {
    setShowReport(false);
    setReportJob(null);
  };

  // Apply
  const [showApply, setShowApply] = useState(false);
  const [applyJob, setApplyJob] = useState(null);
  const [userProfile, setUserProfile] = useState(null); 
  // Thêm state mới để theo dõi trạng thái phóng to ảnh
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  // Thêm state mới để theo dõi mức độ phóng to
  const [zoomLevel, setZoomLevel] = useState(1);
  
  const onApply = (job) => {
    setApplyJob(job);
    // Lấy thông tin mới nhất từ localStorage khi mở modal ứng tuyển
    if (user && user.id) {
      try {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const currentUserData = users.find(u => u.id === user.id);
        if (currentUserData && currentUserData.profile) {
          setUserProfile(currentUserData.profile);
        } else {
          // Nếu không tìm thấy trong localStorage, dùng thông tin hiện tại
          setUserProfile(user.profile || {});
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
        setUserProfile(user.profile || {});
      }
    }
    setShowApply(true);
  };
  
  const handleCloseApply = () => {
    setShowApply(false);
    setApplyJob(null);
  };
  
  const confirmApply = () => {
    if (applyJob) {
      const ls = readLS(LS_APPLIED_KEY);
      const exist = ls.find(
        (x) => x.userId === currentUserId && x.jobId === applyJob.id
      );
      
      // Nếu chưa từng ứng tuyển vào công việc này trước đây
      if (!exist) {
        // Thêm vào danh sách ứng tuyển
        ls.push({
          userId: currentUserId,
          jobId: applyJob.id,
          appliedAt: new Date().toISOString(),
          status: "applied",
        });
        writeLS(LS_APPLIED_KEY, ls);
        
        // Cập nhật số lượng ứng viên trong tin tuyển dụng
        updateJobApplicantCount(applyJob.id);
      }
      
      alert("Đã lưu vào tin đã ứng tuyển!");
      onDataChange?.();
    }
    handleCloseApply();
  };
  
  // Thêm hàm để cập nhật số lượng ứng viên
  const updateJobApplicantCount = (jobId) => {
    try {
      // Lấy danh sách tin tuyển dụng
      const allJobs = JSON.parse(localStorage.getItem('employerJobs') || '[]');
      
      // Tìm tin tuyển dụng cần cập nhật
      const jobIndex = allJobs.findIndex(job => job.id === jobId);
      
      if (jobIndex !== -1) {
        // Tăng số lượng ứng viên lên 1
        allJobs[jobIndex].applicants = (allJobs[jobIndex].applicants || 0) + 1;
        
        // Lưu lại danh sách đã cập nhật
        localStorage.setItem('employerJobs', JSON.stringify(allJobs));
        console.log(`Đã cập nhật số lượng ứng viên cho tin tuyển dụng ID ${jobId}`);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật số lượng ứng viên:", error);
    }
  };

  // Sửa hàm xử lý phóng to ảnh
  const toggleImageZoom = (e) => {
    e.preventDefault();
    if (isImageZoomed) {
      setIsImageZoomed(false);
      setZoomLevel(1);
    } else {
      setIsImageZoomed(true);
      setZoomLevel(2); // Tăng từ 1.5 lên 2 (200%)
    }
  };
  
  // Thêm hàm tăng/giảm mức độ phóng to
  const adjustZoom = (amount) => {
    setZoomLevel(prev => {
      const newZoom = prev + amount;
      // Giới hạn mức zoom từ 1 đến 3
      return Math.max(1, Math.min(3, newZoom));
    });
  };

  // Cancel Apply
  const onCancelApply = (job) => {
    if (window.confirm("Bạn có chắc muốn hủy ứng tuyển công việc này?")) {
      let ls = readLS(LS_APPLIED_KEY);
      ls = ls.filter(
        (x) => !(x.userId === currentUserId && x.jobId === job.id)
      );
      writeLS(LS_APPLIED_KEY, ls);
      onDataChange?.();
    }
  };

  // Detail
  const [showDetail, setShowDetail] = useState(false);
  const [detailJob, setDetailJob] = useState(null);
  // Nếu có job chi tiết, tìm employer của job đó
  const employer = usersData.find((u) => u.id === detailJob?.employerId);
  
  const onViewDetail = (job) => {
    setDetailJob(job);
    setShowDetail(true);
  };
  const handleCloseDetail = () => {
    setShowDetail(false);
    setDetailJob(null);
  };

  // Sửa hàm handleContactEmployer để sử dụng ID hội thoại thống nhất
  const handleContactEmployer = (job) => {
    if (!user) {
      alert("Vui lòng đăng nhập để liên hệ với nhà tuyển dụng");
      return;
    }
    
    try {
      // Lưu thông tin công việc chi tiết vào localStorage
      const contactJobData = {
        jobId: job.id,
        jobTitle: job.title,
        employerId: job.employerId,
        companyName: job.company || "Nhà tuyển dụng",
        location: job.location || "",
        type: job.type || "",
        salary: job.salary || "Thỏa thuận"
      };
      
      // Lưu thông tin công việc
      localStorage.setItem('contactJob', JSON.stringify(contactJobData));
      
      // Kiểm tra xem đã có hội thoại với nhà tuyển dụng này chưa
      const allConversations = JSON.parse(localStorage.getItem('conversations') || '[]');
      
      // Tạo ID base dựa trên ID của hai người dùng
      const participantIds = [user.id, job.employerId].sort();
      const conversationBaseId = `conversation-${participantIds[0]}-${participantIds[1]}`;
      
      // Tìm hội thoại với người dùng này
      const existingConversation = allConversations.find(c => 
        c && c.id && c.id.startsWith(conversationBaseId)
      );
      
      // Chuyển hướng đến trang tin nhắn
      if (existingConversation) {
        // Nếu đã có hội thoại, chuyển đến hội thoại đó
        window.location.href = `/messages/${existingConversation.id}?jobId=${job.id}`;
      } else {
        // Nếu chưa có, tạo hội thoại mới
        window.location.href = `/messages/new?employerId=${job.employerId}&jobId=${job.id}`;
      }
    } catch (error) {
      console.error("Lỗi khi liên hệ nhà tuyển dụng:", error);
      alert("Có lỗi xảy ra. Vui lòng thử lại sau.");
    }
  };

  return (
    <>
      <div className="row">
        {jobs.map((job) => {
          const isSaved = favorites.includes(job.id);
          const appliedStatus = appliedStatusByJobId[job.id];
          return (
            <div key={job.id} className="col-md-4 mb-4">
              <JobCard
                job={job}
                isSaved={isSaved}
                appliedStatus={appliedStatus}
                activeTab={activeTab}
                toggleFavorite={toggleFavorite}
                onReport={onReport}
                onApply={onApply}
                onCancelApply={onCancelApply}
                onViewDetail={onViewDetail}
                onContact={handleContactEmployer}
              />
            </div>
          );
        })}
      </div>

      {/* Modal Báo cáo */}
      <Modal show={showReport} onHide={handleCloseReport} centered>
        <Modal.Header closeButton>
          <Modal.Title>Phản ánh tin tuyển dụng không chính xác</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Tin tuyển dụng: <b>{reportJob?.title}</b> - {reportJob?.company}
          </p>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>Họ và tên <span className="text-danger">*</span></Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Họ và tên" 
                name="name"
                value={reportForm.name}
                onChange={handleReportFormChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Số điện thoại</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="0123xxxxxxx" 
                name="phone"
                value={reportForm.phone}
                onChange={handleReportFormChange}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Địa chỉ</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Địa chỉ" 
                name="address"
                value={reportForm.address}
                onChange={handleReportFormChange}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Địa chỉ email <span className="text-danger">*</span></Form.Label>
              <Form.Control 
                type="email" 
                placeholder="Email" 
                name="email"
                value={reportForm.email}
                onChange={handleReportFormChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Nội dung</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Cung cấp thêm chi tiết..."
                name="content"
                value={reportForm.content}
                onChange={handleReportFormChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseReport}>
            Đóng
          </Button>
          <Button variant="primary" onClick={handleSubmitReport}>
            Gửi
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Ứng tuyển */}
      <Modal show={showApply} onHide={handleCloseApply} centered>
        <Modal.Header closeButton>
          <Modal.Title>Ứng tuyển công việc</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Bạn đang ứng tuyển vào công việc: <b>{applyJob?.title}</b> - {applyJob?.company}</p>
          <hr />
          <h6>Thông tin ứng viên</h6>
          <p><b>Họ tên:</b> {userProfile?.fullName || "Chưa cập nhật"}</p>
          <p><b>Email:</b> {userProfile?.email || "Chưa cập nhật"}</p>
          <p><b>Số điện thoại:</b> {userProfile?.phone || "Chưa cập nhật"}</p>
          <p><b>Trường học:</b> {userProfile?.school || "Chưa cập nhật"}</p>
          <p><b>Địa chỉ:</b> {userProfile?.address || "Chưa cập nhật"}</p>
          
          {/* Hiển thị CV - Đã chỉnh sửa phần này */}
          <div className="cv-preview">
            <p><b>CV:</b></p>
            {userProfile?.cv ? (
              <>
                {userProfile.cv.startsWith('data:image') || 
                 userProfile.cv.match(/\.(jpeg|jpg|gif|png)$/) ? (
                  <div className="cv-image-container position-relative">
                    <img 
                      src={userProfile.cv} 
                      alt="CV Preview" 
                      className={`img-fluid cv-preview-image ${isImageZoomed ? 'zoomed' : ''}`}
                      style={{
                        cursor: 'pointer',
                        maxHeight: isImageZoomed ? "none" : "300px",
                        border: "1px solid #ddd", 
                        borderRadius: "4px",
                        transition: "transform 0.3s ease"
                      }}
                      onClick={toggleImageZoom}
                    />
                    {isImageZoomed && (
                      <div 
                        className="zoomed-overlay" 
                        onClick={toggleImageZoom}
                        style={{
                          position: "fixed",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: "rgba(0,0,0,0.9)",
                          zIndex: 9999,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          padding: "10px", // Giảm padding
                          flexDirection: "column"
                        }}
                      >
                        <div className="zoom-controls mb-3">
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
                          className="zoomed-image-container" 
                          style={{
                            overflow: "auto",
                            width: "100%",
                            height: "calc(100vh - 80px)", // Tăng không gian hiển thị
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center"
                          }}
                        >
                          <img 
                            src={userProfile.cv} 
                            alt="CV Preview Zoomed" 
                            style={{
                              transform: `scale(${zoomLevel})`,
                              transformOrigin: "center",
                              maxWidth: "98%", // Tăng kích thước hiển thị
                              maxHeight: "none", // Loại bỏ giới hạn chiều cao
                              transition: "transform 0.2s ease"
                            }}
                          />
                        </div>
                        
                        <button 
                          className="btn btn-light position-absolute" 
                          style={{top: "20px", right: "20px"}}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleImageZoom(e);
                          }}
                        >
                          Đóng
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <a href={userProfile.cv} target="_blank" rel="noreferrer" className="btn btn-outline-primary">
                    Xem CV
                  </a>
                )}
              </>
            ) : (
              <div className="alert alert-warning">
                <span className="text-danger">Bạn chưa cập nhật CV</span>
                <div className="mt-2">
                  <Link to="/profile" className="btn btn-sm btn-outline-primary">
                    Cập nhật CV ngay
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          {(!userProfile?.fullName || !userProfile?.email || !userProfile?.phone) && (
            <div className="alert alert-warning mt-3">
              <b>Lưu ý:</b> Bạn nên cập nhật đầy đủ thông tin cá nhân trước khi ứng tuyển.
              <div className="mt-2">
                <Link to="/profile" className="btn btn-sm btn-outline-primary">
                  Cập nhật hồ sơ
                </Link>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseApply}>Hủy</Button>
          <Button 
            variant="success" 
            onClick={confirmApply}
            disabled={!userProfile?.fullName || !userProfile?.email || !userProfile?.phone}
          >
            Xác nhận
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Xem chi tiết */}
      <Modal show={showDetail} onHide={handleCloseDetail} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{detailJob?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {(() => {
            // Lấy thông tin nhà tuyển dụng mới nhất từ employerProfiles
            let employerInfo = null;
            try {
              if (detailJob?.employerId) {
                const employerId = parseInt(detailJob.employerId);
                const profiles = JSON.parse(localStorage.getItem('employerProfiles') || '{}');
                employerInfo = profiles[employerId];
              }
            } catch (error) {
              console.error("Lỗi khi lấy thông tin nhà tuyển dụng:", error);
            }
            
            return (
              <>
                <h5>Thông tin nhà tuyển dụng</h5>
                <div className="d-flex align-items-center mb-2">
                  <img
                    src={employerInfo?.profileImage || employer?.profile?.image || "/default-logo.png"}
                    alt={employerInfo?.companyName || employer?.profile?.companyName || detailJob?.company}
                    className="job-logo-small me-2"
                  />
                  <span className="fw-bold">
                    {employerInfo?.companyName || employer?.profile?.companyName || detailJob?.company}
                  </span>
                </div>
                
                {/* Hiển thị email */}
                <p>
                  <b>Email:</b> {employerInfo?.contactEmail || employer?.profile?.email || detailJob?.contactEmail || "Không có thông tin"}
                </p>
                
                {/* Hiển thị số điện thoại */}
                <p>
                  <b>Điện thoại:</b> {employerInfo?.contactPhone || detailJob?.contactPhone || employer?.profile?.phone || "Không có thông tin"}
                </p>
                
                {/* Địa chỉ */}
                <p>
                  <b>Địa chỉ:</b> {employerInfo?.address || employer?.profile?.address || detailJob?.location || "Không có thông tin"}
                </p>
                
                {/* Các thông tin khác của công việc */}
                <hr />
                <h5>Mô tả công việc</h5>
                <p>{detailJob?.description}</p>
                
                <h5>Bản đồ</h5>
                <iframe
                  width="100%"
                  height="250"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  src={`https://www.google.com/maps?q=${encodeURIComponent(detailJob?.location || "Thừa Thiên Huế")}&output=embed`}
                  title="Job location map"
                />
              </>
            );
          })()}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDetail}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default JobList;
