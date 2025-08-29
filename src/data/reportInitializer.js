// Utility để tạo dữ liệu báo cáo mẫu

// Hàm để khởi tạo dữ liệu báo cáo mẫu
export function initializeSampleReports() {
  try {
    // Kiểm tra xem đã có báo cáo mẫu chưa
    const jobReports = JSON.parse(localStorage.getItem('jobReports') || '[]');
    const postReports = JSON.parse(localStorage.getItem('postReports') || '[]');

    // Nếu đã có dữ liệu, không khởi tạo nữa
    if (jobReports.length > 0 || postReports.length > 0) {
      console.log("Reports data already exists");
      return { 
        success: true, 
        message: "Reports data already exists",
        counts: {
          job: jobReports.length,
          post: postReports.length
        }
      };
    }

    console.log("Initializing sample reports data...");

    // Lấy danh sách người dùng từ localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    // Lọc ra sinh viên và nhà tuyển dụng
    const students = users.filter(user => user.role === 'student');
    const employers = users.filter(user => user.role === 'employer');

    // Lấy các job từ localStorage
    const jobs = JSON.parse(localStorage.getItem('employerJobs') || '[]');
    
    // Lấy các bài viết từ localStorage nếu có
    const posts = JSON.parse(localStorage.getItem('posts') || '[]');

    // Mẫu lý do báo cáo việc làm
    const jobReportReasons = [
      "Thông tin không chính xác",
      "Việc làm lừa đảo",
      "Nội dung không phù hợp",
      "Mức lương không như cam kết",
      "Địa điểm công ty không đúng"
    ];

    // Mẫu lý do báo cáo bài viết
    const postReportReasons = [
      "Nội dung không phù hợp",
      "Thông tin sai lệch",
      "Vi phạm quyền tác giả",
      "Ngôn từ không phù hợp",
      "Quấy rối, xúc phạm người khác"
    ];

    // Tạo báo cáo việc làm mẫu
    const sampleJobReports = [];

    if (students.length > 0 && employers.length > 0 && jobs.length > 0) {
      // Tạo 5-10 báo cáo việc làm
      const jobReportCount = 5 + Math.floor(Math.random() * 6);
      
      for (let i = 0; i < jobReportCount; i++) {
        const randomStudent = students[Math.floor(Math.random() * students.length)];
        const randomJob = jobs[Math.floor(Math.random() * jobs.length)];
        const randomReason = jobReportReasons[Math.floor(Math.random() * jobReportReasons.length)];
        
        // Tìm nhà tuyển dụng của job
        const jobEmployer = employers.find(emp => emp.id === parseInt(randomJob.employerId));
        
        if (!jobEmployer) continue;
        
        // Tạo thời gian báo cáo ngẫu nhiên trong 30 ngày gần đây
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30));
        
        const jobReport = {
          id: Date.now() + i,
          type: 'job',
          jobId: randomJob.id,
          jobTitle: randomJob.jobTitle || randomJob.title,
          companyName: randomJob.companyName || randomJob.company,
          reporterId: randomStudent.id,
          reportedUserId: jobEmployer.id,
          reason: randomReason,
          description: `Tôi phát hiện vấn đề với bài đăng việc làm này: ${randomReason.toLowerCase()}. Mong BQT kiểm tra và xử lý.`,
          createdAt: createdAt.toISOString(),
          status: Math.random() > 0.7 ? 'resolved' : 'pending', // 30% resolved
          resolvedAt: Math.random() > 0.7 ? new Date().toISOString() : null
        };
        
        sampleJobReports.push(jobReport);
      }
    }

    // Tạo báo cáo bài viết mẫu
    const samplePostReports = [];

    if (students.length > 1 && posts.length > 0) {
      // Tạo 3-8 báo cáo bài viết
      const postReportCount = 3 + Math.floor(Math.random() * 6);
      
      for (let i = 0; i < postReportCount; i++) {
        const reporterIndex = Math.floor(Math.random() * students.length);
        const reportedUserIndex = (reporterIndex + 1) % students.length; // Đảm bảo khác người báo cáo
        
        const randomStudent = students[reporterIndex];
        const randomReportedStudent = students[reportedUserIndex];
        const randomPost = posts[Math.floor(Math.random() * posts.length)];
        const randomReason = postReportReasons[Math.floor(Math.random() * postReportReasons.length)];
        
        // Tạo thời gian báo cáo ngẫu nhiên trong 30 ngày gần đây
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30));
        
        const postReport = {
          id: Date.now() + 100 + i,
          type: 'post',
          postId: randomPost.id || i,
          postTitle: randomPost.title || "Bài viết sinh viên",
          postContent: randomPost.content || "Nội dung bài viết...",
          reporterId: randomStudent.id,
          reportedUserId: randomPost.authorId || randomReportedStudent.id,
          reason: randomReason,
          description: `Bài viết này có vấn đề: ${randomReason.toLowerCase()}. Cần xem xét nội dung.`,
          createdAt: createdAt.toISOString(),
          status: Math.random() > 0.8 ? 'resolved' : 'pending', // 20% resolved
          resolvedAt: Math.random() > 0.8 ? new Date().toISOString() : null
        };
        
        samplePostReports.push(postReport);
      }
    }

    // Lưu dữ liệu vào localStorage
    localStorage.setItem('jobReports', JSON.stringify(sampleJobReports));
    localStorage.setItem('postReports', JSON.stringify(samplePostReports));

    console.log(`Successfully initialized sample reports: ${sampleJobReports.length} job reports, ${samplePostReports.length} post reports`);

    return {
      success: true,
      message: "Sample reports initialized",
      counts: {
        job: sampleJobReports.length,
        post: samplePostReports.length
      }
    };
  } catch (error) {
    console.error("Error initializing sample reports:", error);
    return { 
      success: false, 
      message: error.message 
    };
  }
}

// Kiểm tra và khởi tạo báo cáo mẫu nếu cần
export function checkAndInitializeReports() {
  const jobReports = JSON.parse(localStorage.getItem('jobReports') || '[]');
  const postReports = JSON.parse(localStorage.getItem('postReports') || '[]');
  
  if (jobReports.length === 0 && postReports.length === 0) {
    return initializeSampleReports();
  }
  
  return { 
    success: true, 
    message: "Reports already exist", 
    counts: {
      job: jobReports.length,
      post: postReports.length
    }
  };
}
