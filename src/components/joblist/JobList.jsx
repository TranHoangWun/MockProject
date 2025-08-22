// components/JobList.jsx

import React, { useState } from "react";
import { FaHeart, FaRegHeart, FaExclamationCircle } from "react-icons/fa";
import { Modal, Button, Form } from "react-bootstrap";
import "./jobList.css"

function JobCard({ job, favorites, toggleFavorite, onReport, onApply, onViewDetail }) {
  return (
    <div className="card mb-1 shadow-sm job-card d-flex flex-column justify-content-between">
      <div className="card-body">
        {/* Logo và Tiêu đề/Tên công ty */}
        <div className="d-flex align-items-start mb-2">
          <img
            src={job.logo || "/default-logo.png"}
            alt={job.company}
            className="job-logo-small me-3"
          />
          <div>
            <h5 className="card-title mb-0">{job.title}</h5>
            <p className="card-subtitle text-muted small text-truncate m-0">
              {job.company}
            </p>
          </div>
        </div>

        {/* Tag */}
        <div className="mb-2 d-flex flex-wrap">
          <span className="badge bg-light text-dark me-2">{job.location}</span>
          <span className="badge bg-light text-dark me-2">{job.type}</span>
          <span className="badge bg-light text-dark">{job.salary || "Thỏa thuận"}</span>
        </div>

        {/* Mô tả ngắn gọn chỉ 1 dòng */}
        <p className="card-text description-text text-truncate mt-2 mb-1">
          {job.description}
        </p>
        <p className="card-text text-muted small">
          Đăng ngày: {job.publication_date}
        </p>
      </div>

      {/* Button + Icon */}
      <div className="d-flex justify-content-between align-items-center p-3 pt-0">
        <div>
          <Button variant="success" size="sm" className="me-2" onClick={() => onApply(job)}>
            Ứng tuyển
          </Button>
          <Button variant="outline-primary" size="sm" onClick={() => onViewDetail(job)}>
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
  );
}

function JobList({ jobs }) {
  const [favorites, setFavorites] = useState([]);
  const [showReport, setShowReport] = useState(false);
  const [reportJob, setReportJob] = useState(null);

  const [showApply, setShowApply] = useState(false);
  const [applyJob, setApplyJob] = useState(null);

  const [showDetail, setShowDetail] = useState(false);
  const [detailJob, setDetailJob] = useState(null);


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
    setDetailJob(job);
    setShowDetail(true);
  };

  const handleCloseReport = () => {
    setShowReport(false);
    setReportJob(null);
  };

  const handleCloseApply = () => {
    setShowApply(false);
    setApplyJob(null);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setDetailJob(null);
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

      {/* Modal Xem chi tiết */}
      <Modal show={showDetail} onHide={handleCloseDetail} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{detailJob?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5>Thông tin chung</h5>
          <p>
            <b>Công ty:</b> {detailJob?.company}
          </p>
          <p>
            <b>Mức lương:</b> {detailJob?.salary}
          </p>
          <p>
            <b>Loại hình:</b> {detailJob?.type}
          </p>
          <p>
            <b>Địa điểm:</b> {detailJob?.location}
          </p>
          <p>
            <b>Ngày đăng:</b> {detailJob?.publication_date}
          </p>

          <hr />
          <h5>Mô tả công việc</h5>
          <p>{detailJob?.description}</p>
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