// components/joblist/JobList.jsx
import React, { useState, useEffect, useContext } from "react";
import { FaHeart, FaRegHeart, FaExclamationCircle } from "react-icons/fa";
import { Modal, Button, Form } from "react-bootstrap";
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
  activeTab,
  toggleFavorite,
  onReport,
  onApply,
  onCancelApply,
  onViewDetail,
}) {
  return (
    <div className="card mb-1 shadow-sm job-card d-flex flex-column justify-content-between">
      <div className="card-body">
        {/* Logo + Tiêu đề/Tên công ty */}
        <div className="d-flex align-items-start mb-2">
          <img
            src={job.logo || "/default-logo.png"}
            alt={job.company}
            className="job-logo-small me-3"
          />
          <div>
            <h5 className="card-title mb-0">{job.title}</h5>
            <p className="card-subtitle text-muted small company-name m-0">
              {job.company}
            </p>
          </div>
        </div>

        {/* Tag */}
        <div className="mb-0 d-flex flex-wrap">
          <span className="badge1 me-2">{job.location}</span>
          <span className="badge1 me-2">{job.type}</span>
          <span className="badge1">
            {job.salary || "Thỏa thuận"}
          </span>
        </div>

        {/* Mô tả ngắn */}
        <p className="card-text job-description mt-2">
          {job.description}
        </p>
        <p className="card-text text-muted small mb-0">
          Đăng ngày: {job.publication_date} -  Hạn nộp: {job.deadline}
        </p>
      </div>

      {/* Buttons */}
      <div className="d-flex justify-content-between align-items-center p-3 pt-0">
        <div className="d-flex align-items-center gap-2 flex-wrap">
          {appliedStatus ? (
            <>
              {(appliedStatus === "applied" ||
                appliedStatus === "pending") && (
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => onCancelApply(job)}
                  >
                    Hủy ứng tuyển
                  </Button>
                )}
              <span className={`badge ${statusBadgeClass(appliedStatus)}`}>
                {appliedStatus}
              </span>
            </>
          ) : (
            <Button
              variant="success"
              size="sm"
              onClick={() => onApply(job)}
            >
              Ứng tuyển
            </Button>
          )}

          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => onViewDetail(job)}
          >
            Xem chi tiết
          </Button>
        </div>

        <div>
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
  const { user } = useContext(AuthContext); // ✅ gọi hook trong component


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
  const onReport = (job) => {
    setReportJob(job);
    setShowReport(true);
  };
  const handleCloseReport = () => {
    setShowReport(false);
    setReportJob(null);
  };

  // Apply
  const [showApply, setShowApply] = useState(false);
  const [applyJob, setApplyJob] = useState(null);
  const onApply = (job) => {
    setApplyJob(job);
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
      if (!exist) {
        ls.push({
          userId: currentUserId,
          jobId: applyJob.id,
          appliedAt: new Date().toISOString(),
          status: "applied",
        });
        writeLS(LS_APPLIED_KEY, ls);
      }
      alert("Đã lưu vào tin đã ứng tuyển!");
      onDataChange?.();
    }
    handleCloseApply();
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
              <Form.Label>Họ và tên *</Form.Label>
              <Form.Control type="text" placeholder="Họ và tên" />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Số điện thoại *</Form.Label>
              <Form.Control type="text" placeholder="0123xxxxxxx" />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Địa chỉ *</Form.Label>
              <Form.Control type="text" placeholder="Địa chỉ" />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Địa chỉ email *</Form.Label>
              <Form.Control type="email" placeholder="Email" />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Nội dung</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Cung cấp thêm chi tiết..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseReport}>
            Đóng
          </Button>
          <Button variant="primary">Gửi</Button>
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
          <p><b>Họ tên:</b> {currentUser?.profile.fullName}</p>
          <p><b>Email:</b> {currentUser?.profile.email}</p>
          <p><b>Số điện thoại:</b> {currentUser?.profile.phone}</p>
          {currentUser?.profile.cv && (
            <p>
              <b>CV:</b> <a href={currentUser?.profile.cv} target="_blank" rel="noreferrer">Xem CV</a>
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseApply}>Hủy</Button>
          <Button variant="success" onClick={confirmApply}>Xác nhận</Button>
        </Modal.Footer>
      </Modal>


      {/* Modal Xem chi tiết */}
      <Modal show={showDetail} onHide={handleCloseDetail} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{detailJob?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>

          <h5>Thông tin nhà tuyển dụng</h5>
          <div className="d-flex align-items-center mb-2">
            <img
              src={employer?.profile.image}
              alt={employer?.profile.companyName}
              className="job-logo-small me-2"
            />
            <a href={`/employer/${employer?.id}`} className="fw-bold">
              {employer?.profile.companyName}
            </a>
          </div>
          <p><b>Email:</b> {employer?.profile.email}</p>
          <p><b>Điện thoại:</b> {employer?.profile.phone}</p>
          {employer?.profile.socialLinks?.map((link, idx) => (
            <p key={idx}>
              <b>{link.name}:</b> <a href={link.url} target="_blank" rel="noreferrer">{link.url}</a>
            </p>
          ))}
          <h5>Mô tả công việc</h5>
          <p>{detailJob?.description}</p>
          <hr />
          <h5>Bản đồ</h5>
          <iframe
            width="100%"
            height="250"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            src={`https://www.google.com/maps?q=${encodeURIComponent(detailJob?.address)}&output=embed`}
          />
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
