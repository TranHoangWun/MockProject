

function App() {
  const [keyword, setKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 6;

  // Lọc công việc theo từ khóa
  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(keyword.toLowerCase()) ||
    job.company.toLowerCase().includes(keyword.toLowerCase())
  );

  // Tính số trang
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  // Lấy công việc cho trang hiện tại
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);

  // Xử lý chuyển trang
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
   /* <div className="container my-4">
      <h1 className="text-center mb-4">Việc làm cho sinh viên Huế</h1>
      <SearchBar keyword={keyword} setKeyword={setKeyword} />
      <JobList jobs={currentJobs} />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>*/
     <div>
      {/* Header */}
      <Header />

      {/* Banner */}
      <Banner keyword={keyword} setKeyword={setKeyword}/>

      {/* Nội dung chính */}
      <div className="container my-4">
        

        {/* Thanh tìm kiếm */}
        <SearchBar keyword={keyword} setKeyword={setKeyword} />

        {/* Danh sách công việc */}
        <JobList jobs={currentJobs} />

        {/* Phân trang */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Footer */}
      <Footer />
    </div>

  );
}

export default App; 


/*export default function App() {
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 6;

  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div>
      <Header />
      <Banner />
      <div className="container my-5">
        <h2 className="mb-4">Việc làm mới nhất</h2>
        <div className="row">
          {currentJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
        <Pagination
          jobsPerPage={jobsPerPage}
          totalJobs={jobs.length}
          paginate={paginate}
          currentPage={currentPage}
        />
      </div>
      <Footer />
    </div>
  );
} */
