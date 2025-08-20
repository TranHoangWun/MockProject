// components/JobList.jsx

import React, { useState } from "react";
import { FaHeart, FaRegHeart, FaExclamationCircle } from "react-icons/fa";
import { Modal, Button, Form } from "react-bootstrap";
import "./jobList.css"

function JobCard({ job, favorites, toggleFavorite, onReport, onApply, onViewDetail }) {
  return (
    <div className="card mb-1 shadow-sm job-card">
  <div className="row g-0 h-100 align-items-center">
    {/* Logo */}
    <div className="col-md-3 d-flex justify-content-center align-items-center">
      <img
        src={job.logo || "/default-logo.png"}
        alt={job.company}
        className="job-logo"
      />
    </div>

    {/* Nội dung */}
    <div className="col-md-9 d-flex">
      <div className="card-body d-flex flex-column justify-content-between w-100">
        <div>
          <h5 className="card-title mb-1">{job.title}</h5>
          <p className="card-subtitle text-muted small mb-2">
            {job.company} - {job.salary || "Thỏa thuận"}
          </p>

          {/* Tag */}
          <div className="mb-2">
            <span className="badge bg-light text-dark me-2">{job.location}</span>
            <span className="badge bg-light text-dark">{job.type}</span>
          </div>
        </div>

        {/* Button + Icon */}
        <div className="d-flex justify-content-between align-items-center mt-2">
          <div>
            <Button variant="success" size="sm" className="me-2">
              Ứng tuyển
            </Button>
            <Button variant="outline-primary" size="sm">
              Xem chi tiết
            </Button>
          </div>

          <div>
            {favorites.includes(job.id) ? (
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
    </div>
  </div>
</div>

  );
}

function JobList({ jobs }) {
  const [favorites, setFavorites] = useState([]);
  const [showReport, setShowReport] = useState(false);
  const [reportJob, setReportJob] = useState(null);

  const [showApply, setShowApply] = useState(false);
  const [applyJob, setApplyJob] = useState(null);

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  const onReport = (job) => {
    setReportJob(job);
    setShowReport(true);
  };

  const onApply = (job) => {
    setApplyJob(job);
    setShowApply(true);
  };

  const onViewDetail = (job) => {
    // Sau này code chuyển trang chi tiết ở đây
    alert("Đi tới trang chi tiết: " + job.title);
  };

  const handleCloseReport = () => {
    setShowReport(false);
    setReportJob(null);
  };

  const handleCloseApply = () => {
    setShowApply(false);
    setApplyJob(null);
  };

  return (
    <>
      <div className="row">
        {jobs.map((job) => (
          <div key={job.id} className="col-md-4 mb-4">
            <JobCard
              job={job}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              onReport={onReport}
              onApply={onApply}
              onViewDetail={onViewDetail}
            />
          </div>
        ))}
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
              <Form.Control as="textarea" rows={3} placeholder="Cung cấp thêm chi tiết..." />
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
          <Modal.Title>Xác nhận ứng tuyển</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bạn có chắc chắn muốn ứng tuyển vào công việc:{" "}
          <b>{applyJob?.title}</b> - {applyJob?.company} ?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseApply}>
            Hủy
          </Button>
          <Button
            variant="success"
            onClick={() => {
              alert("Đã lưu vào tin đã ứng tuyển!");
              handleCloseApply();
            }}
          >
            Xác nhận
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default JobList;


/*import React from "react";

function JobList({ jobs }) {
  return (
    <div className="row">
      {jobs.map((job) => (
        <div className="col-md-4 mb-4" key={job.id}>
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">{job.title}</h5>
              <h6 className="card-subtitle mb-2 text-muted">{job.company}</h6>
              <p className="card-text">
                <strong>Lương:</strong> {job.salary} <br />
                <strong>Loại:</strong> {job.type} <br />
                <strong>Địa điểm:</strong> {job.location}
              </p>
              <a href="#" className="btn btn-primary btn-sm">
                Xem chi tiết
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default JobList;*/
