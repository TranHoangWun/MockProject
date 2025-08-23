// pages/Student.jsx
import React, { useState, useMemo } from "react";
import Banner from "components/layout/banner/Banner.jsx";
import JobList from "components/joblist/JobList.jsx";
import Pagination from "components/pagination/Pagination.jsx";
import jobs from "data/jobs";
import savedJobsSeed from "data/savedJobs";
import appliedJobsSeed from "data/appliedJobs";
import SearchBar from "components/searchbar/SearchBar.jsx";
import { useAuth } from "context/AuthContext.js";
import "bootstrap/dist/css/bootstrap.min.css";

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
  let filteredJobs = jobs.filter(
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
    <>
      <Banner keyword={keyword} setKeyword={setKeyword} />
      <div className="container my-4">

        {/* Tabs: Tất cả / Đã lưu / Đã ứng tuyển */}
        <ul className="nav nav-tabs mb-3">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              Tất cả
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "saved" ? "active" : ""}`}
              onClick={() => setActiveTab("saved")}
            >
              Đã lưu
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "applied" ? "active" : ""}`}
              onClick={() => setActiveTab("applied")}
            >
              Đã ứng tuyển
            </button>
          </li>
        </ul>
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
    </>
  );
}

export default StudentDashboard;
