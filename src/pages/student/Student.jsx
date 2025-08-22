import React, { useState } from "react";
import Banner from "components/layout/banner/Banner.jsx";
import JobList from "components/joblist/JobList.jsx";
import Pagination from "components/pagination/Pagination.jsx";
import jobs from "data/jobs";
import SearchBar from "components/searchbar/SearchBar.jsx";
import { useAuth } from "context/AuthContext.js";
import "bootstrap/dist/css/bootstrap.min.css";

function StudentDashboard() {
  const { user } = useAuth();
  const [keyword, setKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 6;

  const [filters, setFilters] = useState({
    location: "Tất cả",
    category: "Tất cả",
    salary: "Tất cả",
    sort: "default",
  });

  // Đặt lại các bộ lọc khi người dùng là sinh viên để hiển thị tất cả công việc
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
    setCurrentPage(1); // Reset trang về 1 khi tìm kiếm
  };

  const lowerKeyword = keyword.toLowerCase();

  // Lọc và sắp xếp công việc dựa trên tất cả các lựa chọn
  let filteredJobs = jobs.filter(
    (job) =>
      (job.title.toLowerCase().includes(lowerKeyword) ||
        job.company.toLowerCase().includes(lowerKeyword) ||
        job.type.toLowerCase().includes(lowerKeyword) ||
        job.location.toLowerCase().includes(lowerKeyword)) &&
      (filters.location === "Tất cả" || job.location.toLowerCase().includes(filters.location.toLowerCase())) &&
      (filters.salary === "Tất cả" || (job.salary && job.salary.includes(filters.salary))) &&
      (filters.category === "Tất cả" || job.category === filters.category)
  );

  // Sắp xếp
  if (filters.sort === "salary_asc") {
    filteredJobs.sort((a, b) => {
      const salaryA = parseFloat(a.salary.match(/\d+/)) || 0;
      const salaryB = parseFloat(b.salary.match(/\d+/)) || 0;
      return salaryA - salaryB;
    });
  } else if (filters.sort === "salary_desc") {
    filteredJobs.sort((a, b) => {
      const salaryA = parseFloat(a.salary.match(/\d+/)) || 0;
      const salaryB = parseFloat(b.salary.match(/\d+/)) || 0;
      return salaryB - salaryA;
    });
  } else if (filters.sort === "title_asc") {
    filteredJobs.sort((a, b) => a.title.localeCompare(b.title));
  } else if (filters.sort === "title_desc") {
    filteredJobs.sort((a, b) => b.title.localeCompare(a.title));
  }
  


  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);

  return (
    <>
      <Banner keyword={keyword} setKeyword={setKeyword} />
      <div className="container my-4">
        <SearchBar keyword={keyword} setKeyword={setKeyword} onSearch={handleSearch} />
        {currentJobs.length > 0 ? (
          <>
            <JobList jobs={currentJobs} />
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
