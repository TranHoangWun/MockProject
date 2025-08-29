import React, { useState, useEffect } from 'react';
import { getCurrentUser, logout, currentUsers, deleteUser, toggleUserStatus } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import "./Admin.css";
import { FaTrash, FaLock, FaLockOpen, FaEye, FaSync, FaCheck } from "react-icons/fa";
import { cleanupOrphanedJobs } from "../../utils/storageCleanup";
import { initializeEmployerJobs } from "../../data/jobInitializer";
import { checkAndInitializeReports } from "../../data/reportInitializer";

function AdminDashboard() {
  const adminUser = getCurrentUser();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('students');
  const [jobListings, setJobListings] = useState([]);
  const [jobStats, setJobStats] = useState({ total: 0, active: 0, deleted: 0 });
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [jobFilter, setJobFilter] = useState('all'); // 'all', 'active', 'deleted'
  const [isInitializing, setIsInitializing] = useState(false);
  // Thêm state cho quản lý báo cáo
  const [reportType, setReportType] = useState('job');  // 'job', 'post', 'message'
  const [reports, setReports] = useState({ job: [], post: [], message: [] });
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportDetails, setShowReportDetails] = useState(false);
  const [isInitializingReports, setIsInitializingReports] = useState(false);

  // Load all data on component mount
  useEffect(() => {
    loadUsers();
    loadJobListings();
    loadAllReports();
  }, []);

  const loadUsers = () => {
    const loadedUsers = JSON.parse(localStorage.getItem("users")) || currentUsers;
    setUsers(loadedUsers);
  };

  const loadJobListings = () => {
    try {
      const allJobs = JSON.parse(localStorage.getItem("employerJobs") || '[]');
      const deletedJobs = JSON.parse(localStorage.getItem("deletedJobs") || '[]');
      const allUsers = JSON.parse(localStorage.getItem("users") || '[]');
      const employerUsers = allUsers.filter(user => user.role === "employer");

      const jobsWithEmployerInfo = allJobs.map(job => {
        const employer = employerUsers.find(user => user.id === parseInt(job.employerId));
        return {
          ...job,
          employerUsername: employer ? employer.username : 'Unknown',
          employerCompany: employer?.profile?.companyName || job.companyName || 'Unknown',
          status: job.status || 'Đang đăng'
        };
      });

      const deletedJobsWithEmployerInfo = deletedJobs.map(job => {
        const employer = employerUsers.find(user => user.id === parseInt(job.employerId));
        return {
          ...job,
          employerUsername: employer ? employer.username : 'Unknown',
          employerCompany: employer?.profile?.companyName || job.companyName || 'Unknown',
          status: 'Đã xóa'
        };
      });

      const combinedJobs = [...jobsWithEmployerInfo, ...deletedJobsWithEmployerInfo];

      setJobStats({
        total: combinedJobs.length,
        active: jobsWithEmployerInfo.length,
        deleted: deletedJobsWithEmployerInfo.length
      });

      setJobListings(combinedJobs);
    } catch (error) {
      console.error("Error loading job listings:", error);
      setJobListings([]);
    }
  };

  const handleInitializeJobs = () => {
    setIsInitializing(true);
    try {
      const result = initializeEmployerJobs();
      if (result.success) {
        alert(`Thành công! Đã tạo ${result.jobCount || 'nhiều'} tin tuyển dụng mẫu.`);
        loadJobListings();
      } else {
        alert(`Không thể tạo dữ liệu mẫu: ${result.message}`);
      }
    } catch (error) {
      console.error("Error initializing job data:", error);
      alert("Có lỗi xảy ra khi tạo dữ liệu mẫu!");
    }
    setIsInitializing(false);
  };

  const handleInitializeReports = () => {
    setIsInitializingReports(true);
    try {
      const result = checkAndInitializeReports();
      if (result.success) {
        alert(`Thành công! Đã tạo dữ liệu báo cáo mẫu:\n- Báo cáo bài đăng: ${result.counts.job}\n- Báo cáo bài viết: ${result.counts.post}\n- Báo cáo tin nhắn: ${result.counts.message}`);
        loadAllReports();
      } else {
        alert(`Không thể tạo dữ liệu báo cáo mẫu: ${result.message}`);
      }
    } catch (error) {
      console.error("Error initializing report data:", error);
      alert("Có lỗi xảy ra khi tạo dữ liệu báo cáo mẫu!");
    }
    setIsInitializingReports(false);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tài khoản này?")) {
      try {
        const result = deleteUser(userId);
        if (result.success) {
          alert("Đã xóa tài khoản thành công!");
          loadUsers();
        } else {
          alert(result.message || "Không thể xóa tài khoản!");
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Có lỗi xảy ra khi xóa tài khoản!");
      }
    }
  };

  const handleToggleUserStatus = (userId) => {
    const user = users.find(u => u.id === userId);
    const action = user.isLocked ? "mở khóa" : "khóa";
    if (window.confirm(`Bạn có chắc chắn muốn ${action} tài khoản này?`)) {
      try {
        const result = toggleUserStatus(userId);
        if (result.success) {
          alert(`Đã ${action} tài khoản thành công!`);
          loadUsers();
        } else {
          alert(result.message || `Không thể ${action} tài khoản!`);
        }
      } catch (error) {
        console.error(`Error ${action} tài khoản:`, error);
        alert(`Có lỗi xảy ra khi ${action} tài khoản!`);
      }
    }
  };

  const handleViewJobDetails = (job) => {
    setSelectedJob(job);
    setShowJobDetails(true);
  };

  const handleDeleteJob = (jobId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tin tuyển dụng này?")) {
      try {
        const allJobs = JSON.parse(localStorage.getItem("employerJobs") || '[]');
        const jobToDelete = allJobs.find(job => job.id === jobId);
        if (!jobToDelete) {
          alert("Không tìm thấy tin tuyển dụng!");
          return;
        }
        const updatedJobs = allJobs.filter(job => job.id !== jobId);
        const deletedJob = {
          ...jobToDelete,
          deletedAt: new Date().toLocaleDateString('vi-VN'),
          reason: "Quản trị viên hệ thống đã xóa tin này",
          deletedBy: "admin"
        };
        const deletedJobs = JSON.parse(localStorage.getItem("deletedJobs") || '[]');
        const updatedDeletedJobs = [...deletedJobs, deletedJob];
        localStorage.setItem("employerJobs", JSON.stringify(updatedJobs));
        localStorage.setItem("deletedJobs", JSON.stringify(updatedDeletedJobs));
        alert("Đã xóa tin tuyển dụng thành công!");
        loadJobListings();
      } catch (error) {
        console.error("Error deleting job:", error);
        alert("Có lỗi xảy ra khi xóa tin tuyển dụng!");
      }
    }
  };

  const filteredJobs = jobFilter === 'all'
    ? jobListings
    : jobFilter === 'active'
      ? jobListings.filter(job => job.status !== 'Đã xóa')
      : jobListings.filter(job => job.status === 'Đã xóa');

  // Filter users by role - Define these variables
  const students = users.filter(user => user.role === "student");
  const employers = users.filter(user => user.role === "employer");

  // Add loadAllReports function
  const loadAllReports = () => {
    try {
      // Tải báo cáo bài đăng
      const jobReports = JSON.parse(localStorage.getItem("jobReports") || '[]');
      // Tải báo cáo bài viết
      const postReports = JSON.parse(localStorage.getItem("postReports") || '[]');
      // Tải báo cáo tin nhắn
      const messageReports = JSON.parse(localStorage.getItem("messageReports") || '[]');

      // Làm giàu dữ liệu báo cáo với thông tin người dùng
      const allUsers = JSON.parse(localStorage.getItem("users") || '[]');

      const enrichedJobReports = jobReports.map(report => ({
        ...report,
        reporter: allUsers.find(u => u.id === report.reporterId) || { username: "Người dùng không xác định" },
        reportedUser: allUsers.find(u => u.id === report.reportedUserId) || { username: "Người dùng không xác định" }
      }));

      const enrichedPostReports = postReports.map(report => ({
        ...report,
        reporter: allUsers.find(u => u.id === report.reporterId) || { username: "Người dùng không xác định" },
        reportedUser: allUsers.find(u => u.id === report.reportedUserId) || { username: "Người dùng không xác định" }
      }));

      const enrichedMessageReports = messageReports.map(report => ({
        ...report,
        reporter: allUsers.find(u => u.id === report.reporterId) || { username: "Người dùng không xác định" },
        reportedUser: allUsers.find(u => u.id === report.reportedUserId) || { username: "Người dùng không xác định" }
      }));

      // Cập nhật state
      setReports({
        job: enrichedJobReports,
        post: enrichedPostReports,
        message: enrichedMessageReports
      });

    } catch (error) {
      console.error("Error loading reports:", error);
    }
  };

  // Add formatDate utility function
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Add handleViewReportDetails function
  const handleViewReportDetails = (report) => {
    setSelectedReport(report);
    setShowReportDetails(true);
  };

  // Add handleMarkReportAsResolved function
  const handleMarkReportAsResolved = (report) => {
    try {
      const reportId = report.id;
      const reportCollection = 
        reportType === 'job' ? 'jobReports' :
        reportType === 'post' ? 'postReports' : 'messageReports';

      const allReports = JSON.parse(localStorage.getItem(reportCollection) || '[]');
      
      // Tìm và cập nhật báo cáo
      const updatedReports = allReports.map(r => 
        r.id === reportId ? {...r, status: 'resolved', resolvedAt: new Date().toISOString()} : r
      );
      
      // Lưu lại
      localStorage.setItem(reportCollection, JSON.stringify(updatedReports));
      
      // Cập nhật state
      loadAllReports();
      
      alert("Đã đánh dấu báo cáo là đã xử lý!");
      
    } catch (error) {
      console.error("Error resolving report:", error);
      alert("Có lỗi xảy ra khi cập nhật trạng thái báo cáo!");
    }
  };

  // Add handleDeleteReport function
  const handleDeleteReport = (report) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa báo cáo này?")) {
      try {
        const reportId = report.id;
        const reportCollection = 
          reportType === 'job' ? 'jobReports' :
          reportType === 'post' ? 'postReports' : 'messageReports';

        const allReports = JSON.parse(localStorage.getItem(reportCollection) || '[]');
        
        // Lọc bỏ báo cáo cần xóa
        const updatedReports = allReports.filter(r => r.id !== reportId);
        
        // Lưu lại
        localStorage.setItem(reportCollection, JSON.stringify(updatedReports));
        
        // Cập nhật state
        loadAllReports();
        
        alert("Đã xóa báo cáo thành công!");
        
      } catch (error) {
        console.error("Error deleting report:", error);
        alert("Có lỗi xảy ra khi xóa báo cáo!");
      }
    }
  };

  // Define handleLogout function
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="admin-dashboard-container">
      <div className="admin-header">
        <h2>Dashboard Quản trị</h2>
        <div className="admin-info">
          <span>
            <strong>Admin ID:</strong> {adminUser?.id} | 
            <strong>Tên đăng nhập:</strong> {adminUser?.username} | 
            <strong>Họ tên:</strong> {adminUser?.profile?.fullName}
          </span>
        </div>
      </div>

      <div className="admin-stats">
        <div className="stat-card">
          <h3>Sinh viên</h3>
          <div className="stat-number">{students.length}</div>
        </div>
        <div className="stat-card">
          <h3>Nhà tuyển dụng</h3>
          <div className="stat-number">{employers.length}</div>
        </div>
        <div className="stat-card">
          <h3>Công việc</h3>
          <div className="stat-number">{jobStats.active}</div>
        </div>
        <div className="stat-card">
          <h3>Đã xóa</h3>
          <div className="stat-number">{jobStats.deleted}</div>
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-section user-management-section">
          <h3>Quản lý người dùng</h3>
          
          <div className="user-tabs">
            <button 
              className={`tab-btn ${activeTab === 'students' ? 'active' : ''}`}
              onClick={() => setActiveTab('students')}
            >
              Sinh viên ({students.length})
            </button>
            <button 
              className={`tab-btn ${activeTab === 'employers' ? 'active' : ''}`}
              onClick={() => setActiveTab('employers')}
            >
              Nhà tuyển dụng ({employers.length})
            </button>
          </div>

          <div className="users-table-container">
            {activeTab === 'students' ? (
              <table className="users-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tài khoản</th>
                    <th>Mật khẩu</th>
                    <th>Họ tên</th>
                    <th>Email</th>
                    <th>Trường học</th>
                    <th>Số điện thoại</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(student => (
                    <tr key={student.id} className={student.isLocked ? "user-locked" : ""}>
                      <td>{student.id}</td>
                      <td><strong>{student.username}</strong></td>
                      <td><strong>{student.password}</strong></td>
                      <td>{student.profile?.fullName || 'Không có'}</td>
                      <td>{student.profile?.email || student.username}</td>
                      <td>{student.profile?.school || 'Không có'}</td>
                      <td>{student.profile?.phone || 'Không có'}</td>
                      <td>
                        {student.isLocked ?
                          <span className="status-badge locked">Đã khóa</span> :
                          <span className="status-badge active">Đang hoạt động</span>
                        }
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            onClick={() => handleToggleUserStatus(student.id)}
                            className={`btn-sm ${student.isLocked ? "btn-unlock" : "btn-lock"}`}
                            title={student.isLocked ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                          >
                            {student.isLocked ? <FaLockOpen /> : <FaLock />}
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(student.id)}
                            className="btn-delete btn-sm"
                            title="Xóa tài khoản"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="users-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tài khoản</th>
                    <th>Mật khẩu</th>
                    <th>Tên công ty</th>
                    <th>Email</th>
                    <th>Số điện thoại</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {employers.map(employer => (
                    <tr key={employer.id} className={employer.isLocked ? "user-locked" : ""}>
                      <td>{employer.id}</td>
                      <td><strong>{employer.username}</strong></td>
                      <td><strong>{employer.password}</strong></td>
                      <td>{employer.profile?.companyName || 'Không có'}</td>
                      <td>{employer.profile?.email || employer.username}</td>
                      <td>{employer.profile?.phone || 'Không có'}</td>
                      <td>
                        {employer.isLocked ?
                          <span className="status-badge locked">Đã khóa</span> :
                          <span className="status-badge active">Đang hoạt động</span>
                        }
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            onClick={() => handleToggleUserStatus(employer.id)}
                            className={`btn-sm ${employer.isLocked ? "btn-unlock" : "btn-lock"}`}
                            title={employer.isLocked ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                          >
                            {employer.isLocked ? <FaLockOpen /> : <FaLock />}
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(employer.id)}
                            className="btn-delete btn-sm"
                            title="Xóa tài khoản"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="admin-section job-management-section">
          <div className="job-header-row">
            <h3>Quản lý tin tuyển dụng</h3>

            {/* Thêm nút tạo dữ liệu mẫu */}
            {jobStats.active === 0 && (
              <button 
                className="btn btn-primary btn-initialize"
                onClick={handleInitializeJobs}
                disabled={isInitializing}
              >
                <FaSync className={isInitializing ? "fa-spin me-2" : "me-2"} />
                {isInitializing ? "Đang tạo..." : "Tạo dữ liệu mẫu"}
              </button>
            )}
          </div>

          <div className="job-tabs">
            <button 
              className={`tab-btn ${jobFilter === 'all' ? 'active' : ''}`}
              onClick={() => setJobFilter('all')}
            >
              Tất cả tin ({jobListings.length})
            </button>
            <button 
              className={`tab-btn ${jobFilter === 'active' ? 'active' : ''}`}
              onClick={() => setJobFilter('active')}
            >
              Đang đăng ({jobStats.active})
            </button>
            <button 
              className={`tab-btn ${jobFilter === 'deleted' ? 'active' : ''}`}
              onClick={() => setJobFilter('deleted')}
            >
              Đã xóa ({jobStats.deleted})
            </button>
          </div>

          <div className="jobs-table-container">
            <table className="jobs-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tiêu đề</th>
                  <th>Công ty</th>
                  <th>Địa điểm</th>
                  <th>Ngày đăng</th>
                  <th>Trạng thái</th>
                  <th>Nhà tuyển dụng</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.length > 0 ? (
                  filteredJobs.map(job => (
                    <tr key={job.id} className={job.status === 'Đã xóa' ? 'job-deleted' : ''}>
                      <td>{job.id}</td>
                      <td>{job.jobTitle || job.title || "Không có tiêu đề"}</td>
                      <td>{job.companyName || job.company || "Không có tên công ty"}</td>
                      <td>{job.location || "Không có địa điểm"}</td>
                      <td>{job.date || "N/A"}</td>
                      <td>
                        <span className={`status-badge ${job.status === 'Đã xóa' ? 'deleted' : 'active'}`}>
                          {job.status}
                        </span>
                      </td>
                      <td>{job.employerCompany} ({job.employerUsername})</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            onClick={() => handleViewJobDetails(job)}
                            className="btn-sm btn-view"
                            title="Xem chi tiết"
                          >
                            <FaEye />
                          </button>
                          {job.status !== 'Đã xóa' && (
                            <button 
                              onClick={() => handleDeleteJob(job.id)}
                              className="btn-delete btn-sm"
                              title="Xóa tin tuyển dụng"
                            >
                              <FaTrash />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center">Không có tin tuyển dụng nào</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="admin-section report-management-section">
          <h3>Quản lý báo cáo</h3>
          
          <div className="report-tabs">
            <button 
              className={`tab-btn ${reportType === 'job' ? 'active' : ''}`}
              onClick={() => setReportType('job')}
            >
              Báo cáo bài đăng ({reports.job.length})
            </button>
            <button 
              className={`tab-btn ${reportType === 'post' ? 'active' : ''}`}
              onClick={() => setReportType('post')}
            >
              Báo cáo bài viết ({reports.post.length})
            </button>
            <button 
              className={`tab-btn ${reportType === 'message' ? 'active' : ''}`}
              onClick={() => setReportType('message')}
            >
              Báo cáo tin nhắn ({reports.message.length})
            </button>
          </div>

          <div className="reports-table-container">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nội dung</th>
                  <th>Người báo cáo</th>
                  <th>Người bị báo cáo</th>
                  <th>Thời gian</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {reports[reportType].length > 0 ? (
                  reports[reportType].map(report => (
                    <tr key={report.id} className={report.status === 'resolved' ? 'report-resolved' : ''}>
                      <td>{report.id}</td>
                      <td>{report.reason.length > 30 ? report.reason.substring(0, 30) + '...' : report.reason}</td>
                      <td>{report.reporter.username || 'Không xác định'}</td>
                      <td>{report.reportedUser.username || 'Không xác định'}</td>
                      <td>{formatDate(report.createdAt)}</td>
                      <td>
                        <span className={`status-badge ${report.status === 'resolved' ? 'resolved' : 'pending'}`}>
                          {report.status === 'resolved' ? 'Đã xử lý' : 'Đang chờ'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            onClick={() => handleViewReportDetails(report)}
                            className="btn-sm btn-view"
                            title="Xem chi tiết"
                          >
                            <FaEye />
                          </button>
                          {report.status !== 'resolved' && (
                            <button 
                              onClick={() => handleMarkReportAsResolved(report)}
                              className="btn-sm btn-resolve"
                              title="Đánh dấu đã xử lý"
                            >
                              <FaCheck />
                            </button>
                          )}
                          <button 
                            onClick={() => handleDeleteReport(report)}
                            className="btn-delete btn-sm"
                            title="Xóa báo cáo"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center">Không có báo cáo nào</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="admin-section">
          <h3>Cài đặt hệ thống</h3>
          <p>Chức năng đang phát triển...</p>
        </div>
      </div>

      <button className="btn btn-danger mt-3" onClick={handleLogout}>
        Đăng xuất
      </button>
    </div>
  );
}

export default AdminDashboard;