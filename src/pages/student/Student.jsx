// pages/Student.jsx
import React, { useState, useMemo, useEffect } from "react";
import Banner from "components/layout/banner/Banner.jsx";
import JobList from "components/joblist/JobList.jsx";
import Pagination from "components/pagination/Pagination.jsx";
import jobs from "data/jobs";
import savedJobsSeed from "data/savedJobs";
import appliedJobsSeed from "data/appliedJobs";
import SearchBar from "components/searchbar/SearchBar.jsx";
import { useAuth } from "context/AuthContext.js";
import "bootstrap/dist/css/bootstrap.min.css";
import { filterInvalidStaticJobs, cleanupDeletedJobApplications } from "../../utils/jobUtils";

// Utils localStorage
const LS_SAVED_KEY = "savedJobs";
const LS_APPLIED_KEY = "appliedJobs";

function readLS(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}
function mergeSeedWithLS(seedArr, lsArr, makeKey) {
  const map = new Map();
  seedArr.forEach((x) => map.set(makeKey(x), x));
  lsArr.forEach((x) => map.set(makeKey(x), x)); // LS ghi đè seed nếu trùng
  return Array.from(map.values());
}

function StudentDashboard() {
  const { user } = useAuth();
  const currentUserId = user?.id ?? 1;

  const [keyword, setKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 9;

  const [filters, setFilters] = useState({
    location: "Tất cả",
    category: "Tất cả",
    salary: "Tất cả",
    sort: "default",
  });

  // Tab: all | saved | applied
  const [activeTab, setActiveTab] = useState("all");
  // token để JobList báo thay đổi (tim/ứng tuyển) -> re-render & tính lại lọc/phân trang
  const [changeToken, setChangeToken] = useState(0);
  const handleDataChange = () => setChangeToken((t) => t + 1);

  // Thêm state để lưu trữ công việc từ employerJobs
  const [employerJobs, setEmployerJobs] = useState([]);

  // Tải dữ liệu công việc từ localStorage khi component mounts hoặc changeToken thay đổi
  useEffect(() => {
    try {
      const allEmployerJobs = JSON.parse(localStorage.getItem('employerJobs') || '[]');
      // Get IDs of both deleted jobs and permanently deleted jobs
      const deletedJobIds = JSON.parse(localStorage.getItem('deletedJobs') || '[]')
        .map(job => job.id);
      
      // Also check for individually marked permanently deleted jobs
      const permanentlyDeletedJobIds = [];
      for(let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if(key && key.startsWith('job_') && key.endsWith('_permanently_deleted')) {
          const jobId = parseInt(key.replace('job_', '').replace('_permanently_deleted', ''));
          if(!isNaN(jobId)) {
            permanentlyDeletedJobIds.push(jobId);
          }
        }
      }
      
      // Combine all deleted job IDs
      const allDeletedJobIds = [...new Set([...deletedJobIds, ...permanentlyDeletedJobIds])];
      
      // Get list of active employers
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const activeEmployerIds = users
        .filter(u => u.role === 'employer' && !u.isLocked)
        .map(u => u.id.toString());
      
      // Filter active jobs more strictly
      const activeJobs = allEmployerJobs.filter(job => {
        const jobEmployerId = job.employerId?.toString();
        const isActive = job.status === 'Đang đăng';
        const hasValidEmployer = jobEmployerId && activeEmployerIds.includes(jobEmployerId);
        const isNotDeleted = !allDeletedJobIds.includes(job.id);
        
        return isActive && hasValidEmployer && isNotDeleted;
      });
      
      console.log("Active jobs after strict filtering:", activeJobs.length, "jobs");
      
      // Chuyển đổi định dạng để phù hợp với cấu trúc dữ liệu công việc hiện có
      const formattedJobs = activeJobs.map(job => ({
        id: job.id,
        title: job.jobTitle || job.title, // Accept both field names
        company: job.companyName || "Nhà tuyển dụng",
        type: job.employmentType || "Toàn thời gian",
        location: job.location || job.district || "Huế",
        description: job.description || "Không có mô tả",
        salary: job.salaryRange || "Thỏa thuận",
        requirements: job.requirements || "",
        employerId: job.employerId,
        logo: job.companyLogo || null,
        deadline: job.deadline || "Chưa cập nhật",
        publication_date: job.date || "Chưa cập nhật",
        contactEmail: job.contactEmail,
        contactPhone: job.contactPhone
      }));
      
      console.log("Formatted jobs for display:", formattedJobs.length, "jobs");
      
      setEmployerJobs(formattedJobs);
    } catch (error) {
      console.error("Lỗi khi tải công việc từ nhà tuyển dụng:", error);
    }
  }, [changeToken]);

  // Add a useEffect to listen for user data changes and refresh jobs
  useEffect(() => {
    // Listen for data changes from any component
    const handleDataChange = () => {
      console.log("Data change detected, refreshing jobs");
      setChangeToken(prev => prev + 1);
    };

    // Listen for storage changes (in case another tab changes user data)
    const handleStorageChange = (e) => {
      if (e.key === 'users' || e.key === 'employerJobs' || e.key === 'jobsLastUpdated') {
        console.log("Storage change detected, refreshing jobs");
        setChangeToken(prev => prev + 1);
      }
    };

    // Add event listeners
    window.addEventListener('dataChanged', handleDataChange);
    window.addEventListener('storage', handleStorageChange);

    // Run cleanup once on mount
    const cleanupOnMount = async () => {
      const { cleanupOrphanedJobs } = await import('../../utils/storageCleanup');
      const result = cleanupOrphanedJobs();
      if (result.removed > 0) {
        console.log(`Cleanup removed ${result.removed} jobs, refreshing...`);
        setChangeToken(prev => prev + 1);
      }
    };
    
    cleanupOnMount();

    return () => {
      window.removeEventListener('dataChanged', handleDataChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Kết hợp dữ liệu công việc từ cả hai nguồn
  const allJobs = useMemo(() => {
    // Filter out static jobs that don't have valid employers
    const validStaticJobs = filterInvalidStaticJobs(jobs);
    console.log(`Filtered static jobs: ${validStaticJobs.length}/${jobs.length}`);
    
    // Sử dụng Map để xử lý trùng lặp (nếu có) dựa trên ID
    const jobMap = new Map();
    
    // Thêm jobs từ dữ liệu tĩnh (đã lọc)
    validStaticJobs.forEach(job => jobMap.set(job.id, job));
    
    // Thêm hoặc ghi đè với jobs từ nhà tuyển dụng
    employerJobs.forEach(job => jobMap.set(job.id, job));
    
    return Array.from(jobMap.values());
  }, [employerJobs]);

  // Add a useEffect to perform complete cleanup on mount
  useEffect(() => {
    const { completeJobDataCleanup } = require("../../utils/jobUtils");
    const result = completeJobDataCleanup();
    if (result.removedJobs > 0) {
      console.log(`Cleaned up ${result.removedJobs} orphaned jobs`);
      setChangeToken(prev => prev + 1);
    }
  }, []);

  // Reset filter khi là student (giống code gốc)
  React.useEffect(() => {
    if (user?.role === "student") {
      setKeyword("");
      setFilters({
        location: "Tất cả",
        category: "Tất cả",
        salary: "Tất cả",
        sort: "default",
      });
    }
  }, [user]);

  const handleSearch = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const lowerKeyword = keyword.toLowerCase();

  // ====== Load & hợp nhất saved/applied (seed + localStorage) ======
  const allSaved = useMemo(() => {
    const ls = readLS(LS_SAVED_KEY);
    return mergeSeedWithLS(savedJobsSeed || [], ls, (x) => `${x.userId}-${x.jobId}`);
  }, [changeToken]);

  const allApplied = useMemo(() => {
    const ls = readLS(LS_APPLIED_KEY);
    return mergeSeedWithLS(appliedJobsSeed || [], ls, (x) => `${x.userId}-${x.jobId}`);
  }, [changeToken]);

  // Tập jobId đã lưu & map trạng thái ứng tuyển của user hiện tại
  const userSavedIds = useMemo(() => {
    return new Set(
      allSaved.filter((s) => s.userId === currentUserId).map((s) => s.jobId)
    );
  }, [allSaved, currentUserId]);

  const appliedStatusByJobId = useMemo(() => {
    const obj = {};
    allApplied
      .filter((a) => a.userId === currentUserId)
      .forEach((a) => (obj[a.jobId] = a.status || "applied"));
    return obj;
  }, [allApplied, currentUserId]);

  // ====== Lọc & sắp xếp như cũ ======
  let filteredJobs = allJobs.filter(
    (job) =>
      (job.title.toLowerCase().includes(lowerKeyword) ||
        job.company.toLowerCase().includes(lowerKeyword) ||
        job.type.toLowerCase().includes(lowerKeyword) ||
        job.location.toLowerCase().includes(lowerKeyword)) &&
      (filters.location === "Tất cả" ||
        job.location.toLowerCase().includes(filters.location.toLowerCase())) &&
      (filters.salary === "Tất cả" ||
        (job.salary && job.salary.includes(filters.salary))) &&
      (filters.category === "Tất cả" || job.category === filters.category)
  );

  if (filters.sort === "salary_asc") {
    filteredJobs.sort((a, b) => {
      const salaryA = parseFloat((a.salary || "").match(/\d+/)?.[0]) || 0;
      const salaryB = parseFloat((b.salary || "").match(/\d+/)?.[0]) || 0;
      return salaryA - salaryB;
    });
  } else if (filters.sort === "salary_desc") {
    filteredJobs.sort((a, b) => {
      const salaryA = parseFloat((a.salary || "").match(/\d+/)?.[0]) || 0;
      const salaryB = parseFloat((b.salary || "").match(/\d+/)?.[0]) || 0;
      return salaryB - salaryA;
    });
  } else if (filters.sort === "title_asc") {
    filteredJobs.sort((a, b) => a.title.localeCompare(b.title));
  } else if (filters.sort === "title_desc") {
    filteredJobs.sort((a, b) => b.title.localeCompare(a.title));
  }

  // ====== Lọc theo TAB ======
  if (activeTab === "saved") {
    filteredJobs = filteredJobs.filter((job) => userSavedIds.has(job.id));
  } else if (activeTab === "applied") {
    filteredJobs = filteredJobs.filter((job) => appliedStatusByJobId[job.id]);
  }

  // ====== Phân trang như cũ ======
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage) || 1;
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);

  // Khi đổi tab / đổi filter -> về trang 1
  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, JSON.stringify(filters), keyword]);

  return (
    <div className="student-dashboard">
      <Banner keyword={keyword} setKeyword={setKeyword} />
      <div className="container my-4">
        {/* Make sure these filter tabs are visible */}
        <div className="job-filter-tabs mb-3">
          <button 
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} 
            onClick={() => setActiveTab('all')}
          >
            Tất cả
          </button>
          <button 
            className={`tab-btn ${activeTab === 'saved' ? 'active' : ''}`} 
            onClick={() => setActiveTab('saved')}
          >
            Đã lưu
          </button>
          <button 
            className={`tab-btn ${activeTab === 'applied' ? 'active' : ''}`} 
            onClick={() => setActiveTab('applied')}
          >
            Đã ứng tuyển
          </button>
        </div>

        <SearchBar keyword={keyword} setKeyword={setKeyword} onSearch={handleSearch} />
        {currentJobs.length > 0 ? (
          <>
            <JobList
              jobs={currentJobs}
              currentUserId={currentUserId}
              activeTab={activeTab}
              userSavedIds={userSavedIds}
              appliedStatusByJobId={appliedStatusByJobId}
              onDataChange={handleDataChange}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                if (page >= 1 && page <= totalPages) {
                  setCurrentPage(page);
                }
              }}
            />
          </>
        ) : (
          <div className="text-center my-5">
            <h3>Không tìm thấy công việc nào phù hợp.</h3>
            <p>Vui lòng thử lại với từ khóa khác hoặc thay đổi bộ lọc.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentDashboard;
