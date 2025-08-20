import React from "react";

export default function JobCard({ job }) {
  return (
    <div className="col-md-4 mb-4">
      <div className="card shadow-sm h-100">
        <div className="card-body">
          <h5 className="card-title">{job.title}</h5>
          <h6 className="card-subtitle mb-2 text-muted">{job.company}</h6>
          <p className="card-text">
            <strong>Lương:</strong> {job.salary} <br />
            <strong>Loại:</strong> {job.type} <br />
            <strong>Địa điểm:</strong> {job.location}
          </p>
          <button className="btn btn-sm btn-primary">Xem chi tiết</button>
        </div>
      </div>
    </div>
  );
}
