import { employers } from "./users";

// Function to initialize job data for all employers
export function initializeEmployerJobs() {
  try {
    // Check if jobs already exist
    const existingJobs = JSON.parse(localStorage.getItem('employerJobs') || '[]');
    
    if (existingJobs.length > 0) {
      console.log(`Found ${existingJobs.length} existing job listings. No need to initialize.`);
      return { success: true, message: `Found ${existingJobs.length} existing jobs` };
    }
    
    console.log("No job listings found. Initializing sample job data...");
    
    // Sample job descriptions
    const jobDescriptions = [
      "Chúng tôi đang tìm kiếm ứng viên nhiệt huyết, có kỹ năng giao tiếp tốt và sẵn sàng học hỏi để tham gia vào đội ngũ năng động của chúng tôi. Đây là cơ hội tuyệt vời để phát triển sự nghiệp của bạn trong một môi trường chuyên nghiệp và thân thiện.",
      "Ứng viên sẽ được đào tạo và phát triển kỹ năng chuyên môn trong lĩnh vực này. Chúng tôi cung cấp môi trường làm việc năng động, cơ hội thăng tiến và các chế độ phúc lợi hấp dẫn.",
      "Đây là cơ hội tuyệt vời để bạn phát triển sự nghiệp trong một công ty đang phát triển mạnh mẽ. Chúng tôi tìm kiếm người có kỹ năng giao tiếp tốt, chăm chỉ và có tinh thần trách nhiệm cao.",
      "Công việc yêu cầu sự tỉ mỉ, trách nhiệm và khả năng làm việc độc lập cũng như làm việc nhóm tốt. Ứng viên sẽ được đào tạo các kỹ năng cần thiết và phát triển trong môi trường chuyên nghiệp.",
    ];

    // Sample job requirements
    const jobRequirements = [
      "- Tốt nghiệp THPT trở lên\n- Giao tiếp tốt, thân thiện\n- Có tinh thần trách nhiệm cao\n- Sẵn sàng học hỏi và phát triển",
      "- Sinh viên năm cuối hoặc mới tốt nghiệp\n- Kỹ năng giao tiếp tốt\n- Có khả năng làm việc nhóm\n- Sử dụng thành thạo Microsoft Office",
      "- Không yêu cầu kinh nghiệm, sẽ được đào tạo\n- Ngoại hình ưa nhìn, giao tiếp tốt\n- Chăm chỉ, siêng năng, có trách nhiệm\n- Sẵn sàng làm việc theo ca",
      "- Tối thiểu 6 tháng kinh nghiệm trong lĩnh vực tương tự\n- Sử dụng thành thạo các công cụ liên quan\n- Kỹ năng giao tiếp và xử lý tình huống tốt"
    ];

    // Sample employment types
    const employmentTypes = ["full-time", "part-time", "internship", "remote"];
    
    // Sample salary ranges
    const salaryRanges = ["negotiable", "3-5", "5-7", "7-10", "10-15"];
    
    // Sample districts in Hue
    const districts = [
      "TP. Huế", "Huyện Phong Điền", "Huyện Quảng Điền", 
      "Thị xã Hương Thủy", "Thị xã Hương Trà"
    ];
    
    // Sample job categories
    const jobCategories = [
      "marketing", "công nghệ thông tin", "kinh doanh / bán hàng",
      "dịch vụ", "nhà hàng / khách sạn", "giáo dục / đào tạo",
      "giao hàng / vận chuyển", "y tế / chăm sóc sức khỏe"
    ];
    
    // Sample job titles based on categories
    const jobTitles = {
      "marketing": ["Nhân viên Marketing Online", "Nhân viên Content Marketing", "Thiết kế Đồ họa Marketing"],
      "công nghệ thông tin": ["Lập trình viên Frontend", "Chuyên viên IT Support", "Thực tập sinh lập trình"],
      "kinh doanh / bán hàng": ["Nhân viên Kinh doanh", "Tư vấn bán hàng", "Chăm sóc khách hàng"],
      "dịch vụ": ["Nhân viên phục vụ quán cà phê", "Nhân viên dịch vụ khách hàng", "Lễ tân"],
      "nhà hàng / khách sạn": ["Đầu bếp", "Nhân viên phục vụ nhà hàng", "Quản lý nhà hàng"],
      "giáo dục / đào tạo": ["Gia sư Toán cấp 2", "Trợ giảng tiếng Anh", "Nhân viên tư vấn giáo dục"],
      "giao hàng / vận chuyển": ["Nhân viên giao hàng", "Nhân viên kho vận", "Tài xế giao hàng"],
      "y tế / chăm sóc sức khỏe": ["Nhân viên y tế", "Hỗ trợ chăm sóc người cao tuổi", "Tư vấn dinh dưỡng"]
    };
    
    // Generate dates for the past month to the next two months
    const generateDate = (offsetDays) => {
      const date = new Date();
      date.setDate(date.getDate() + offsetDays);
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    };

    // Create sample jobs for each employer
    const sampleJobs = [];
    
    employers.forEach((employer, index) => {
      // Each employer gets 2-4 job listings
      const jobCount = 2 + Math.floor(Math.random() * 3);
      
      for (let i = 0; i < jobCount; i++) {
        // Generate job ID
        const jobId = Date.now() + i + index * 100;
        
        // Skip if this job was permanently deleted before
        if (localStorage.getItem(`job_${jobId}_permanently_deleted`) === 'true') {
          continue;
        }
        
        // Select random category
        const category = jobCategories[Math.floor(Math.random() * jobCategories.length)];
        
        // Select a job title based on the category
        const titles = jobTitles[category];
        const jobTitle = titles[Math.floor(Math.random() * titles.length)];
        
        // Generate publication date (-15 to 0 days from today)
        const pubDateOffset = -Math.floor(Math.random() * 16);
        const publicationDate = generateDate(pubDateOffset);
        
        // Generate deadline (7 to 30 days from publication date)
        const deadlineOffset = pubDateOffset + 7 + Math.floor(Math.random() * 24);
        const deadline = generateDate(deadlineOffset);
        
        // Create the job object
        const job = {
          id: jobId,
          jobTitle: jobTitle,
          title: jobTitle,
          employerId: employer.id,
          companyName: employer.profile?.companyName || "Nhà tuyển dụng",
          company: employer.profile?.companyName || "Nhà tuyển dụng",
          companyLogo: employer.profile?.image || null,
          jobCategory: category,
          employmentType: employmentTypes[Math.floor(Math.random() * employmentTypes.length)],
          salaryRange: salaryRanges[Math.floor(Math.random() * salaryRanges.length)],
          district: districts[Math.floor(Math.random() * districts.length)],
          location: `Số ${Math.floor(Math.random() * 200) + 1} Đường ${Math.floor(Math.random() * 30) + 1}, ${districts[Math.floor(Math.random() * districts.length)]}`,
          description: jobDescriptions[Math.floor(Math.random() * jobDescriptions.length)],
          requirements: jobRequirements[Math.floor(Math.random() * jobRequirements.length)],
          date: publicationDate,
          publication_date: publicationDate,
          deadline: deadline,
          status: 'Đang đăng',
          applicants: Math.floor(Math.random() * 4), // 0-3 applicants per job
          contactEmail: employer.profile?.email || employer.username,
          contactPhone: employer.profile?.phone || "0987654321",
          contactAddress: employer.profile?.address || districts[Math.floor(Math.random() * districts.length)]
        };
        
        sampleJobs.push(job);
      }
    });
    
    // Sort jobs by date (newest first)
    sampleJobs.sort((a, b) => {
      const dateA = a.date.split('/').reverse().join('');
      const dateB = b.date.split('/').reverse().join('');
      return dateB.localeCompare(dateA);
    });
    
    // Save jobs to localStorage
    localStorage.setItem('employerJobs', JSON.stringify(sampleJobs));
    
    console.log(`Successfully initialized ${sampleJobs.length} sample job listings.`);
    
    return { 
      success: true, 
      message: `Created ${sampleJobs.length} sample job listings`, 
      jobCount: sampleJobs.length 
    };
  } catch (error) {
    console.error("Error initializing job data:", error);
    return { success: false, message: error.message };
  }
}

// Check if we need to initialize job data and do it automatically
export function checkAndInitializeJobs() {
  const existingJobs = JSON.parse(localStorage.getItem('employerJobs') || '[]');
  if (existingJobs.length === 0) {
    return initializeEmployerJobs();
  }
  return { success: true, message: "Jobs already exist", jobCount: existingJobs.length };
}
