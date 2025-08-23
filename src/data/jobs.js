import employers from "assets/images/employer/employer";
import categories from "./categories";
const jobs = [
  {
    id: 1,
    employerId: 102, // liên kết nhà tuyển dụng
    title: "Nhân viên phục vụ quán cà phê",
    company: "Cafe Mây",
    logo: employers.cafeMay,
    salary: "Thỏa thuận",
    type: "Part-time",
    location: "Xã A Lưới 1", // để filter
    address: "Số 5, đường Hồng Trung, xã A Lưới 1, thành phố Huế", // địa chỉ cụ thể
    category: "Dịch vụ",
    description: "Tiếp đón và phục vụ khách hàng, giới thiệu đồ uống, nhận order và dọn dẹp khu vực làm việc. Đảm bảo vệ sinh quầy pha chế và không gian quán. Yêu cầu: Nhanh nhẹn, trung thực, có thái độ thân thiện và giao tiếp tốt. Ưu tiên có kinh nghiệm phục vụ.",
    publication_date: "2025-08-15", // ngày đăng
    deadline: "2025-09-01" //  ngày hết hạn
  },
  {
    id: 2,
    title: "Gia sư Toán cấp 2",
    employerId: 103,
    company: "Gia sư Minh Tâm",
    logo: employers.giaSu,
    salary: "100,000đ/buổi",
    type: "Part-time",
    location: "Phường Vĩnh Ninh",
    address: "Số 15, đường Nguyễn Huệ, phường Vĩnh Ninh, thành phố Huế",
    category: "Dịch vụ",
    description: "Dạy kèm môn Toán cho học sinh cấp 2. Lên kế hoạch giảng dạy, chuẩn bị tài liệu và bài tập. Đánh giá và theo dõi sự tiến bộ của học sinh. Yêu cầu: Nắm vững kiến thức Toán học, có kỹ năng sư phạm tốt. Tận tâm, kiên nhẫn và có trách nhiệm.",
    publication_date: "03/08/2025",
    deadline: "2025-09-28"
  },
  {
    id: 3,
    title: "Thực tập lập trình React",
    employerId: 101,
    company: "Công ty Phần mềm ABC",
    logo: employers.abc,
    salary: "Hỗ trợ 2 triệu/tháng",
    type: "Internship",
    location: "Phường Thuận Hóa",
    address: "Số 15, đường Nguyễn Huệ, phường Thuận Hóa, thành phố Huế",
    category: "IT & Phần mềm",
    description: "Tham gia vào các dự án phát triển ứng dụng web. Hỗ trợ team trong việc viết code, debug và kiểm tra sản phẩm. Học hỏi và áp dụng các công nghệ mới trong quá trình làm việc. Yêu cầu: Có kiến thức cơ bản về HTML, CSS, JavaScript và React. Có tinh thần học hỏi, chịu khó và khả năng làm việc nhóm.",
    publication_date: "20/07/2025",
    deadline: "2025-09-01"
  },
  {
    id: 4,
    title: "Nhân viên bán hàng siêu thị",
    employerId: 106,
    company: "Co.opmart Huế",
    logo: employers.coopmart,
    salary: "5-6 triệu/tháng",
    type: "Full-time",
    location: "Phường Phú Xuân",
    address: "Số 15, đường Trần Hưng Đạo, phường Phú Xuân, thành phố Huế",
    category: "Bán hàng",
    description: "Sắp xếp hàng hóa trên kệ, tư vấn và hỗ trợ khách hàng. Thực hiện các giao dịch thanh toán và đảm bảo quầy hàng luôn gọn gàng, sạch sẽ. Yêu cầu: Giao tiếp tốt, trung thực, chịu khó và có sức khỏe tốt.",
    publication_date: "18/08/2025",
    deadline: "2025-09-18"
  },
  {
    id: 5,
    title: "Nhân viên marketing online",
    employerId: 105,
    company: "Công ty TNHH XYZ",
    logo: employers.xyz,
    salary: "6-8 triệu/tháng",
    type: "Full-time",
    location: "Xã Phú Vang",
    address: "Xã Phú Vang, thành phố Huế",
    category: "Marketing",
    description: "Lên kế hoạch và triển khai các chiến dịch quảng cáo trên mạng xã hội và các nền tảng online khác. Viết content, quản lý fanpage và phân tích hiệu quả của chiến dịch. Yêu cầu: Có kiến thức về marketing online, sáng tạo, năng động và có khả năng làm việc độc lập.",
    publication_date: "05/08/2025",
    deadline: "2025-09-18"
  },
  {
    id: 6,
    title: "Nhân viên phục vụ nhà hàng",
    company: "Nhà hàng Sông Hương",
    employerId: 104,
    logo: employers.huong,
    salary: "22,000đ/giờ",
    type: "Part-time",
    location: "Phường Hương Trà",
    address: "101, đường Lý Thánh Tông, Phường Hương Trà, thành phố Huế",
    category: "Dịch vụ",
    description: "Chào đón khách, giới thiệu thực đơn, nhận và phục vụ các món ăn, đồ uống. Đảm bảo khu vực ăn uống sạch sẽ, gọn gàng. Yêu cầu: Nhanh nhẹn, có sức khỏe tốt, thái độ phục vụ chuyên nghiệp.",
    publication_date: "12/07/2025",
    deadline: "2025-09-18"
  },
  {
    id: 7,
    title: "Thực tập thiết kế đồ họa",
    company: "Creative Studio Huế",
    employerId: 107,
    logo: employers.studio,
    salary: "Hỗ trợ 1.5 triệu/tháng",
    type: "Internship",
    location: "Phường Hương Thủy",
    address: "Phường Hương Thủy, thành phố Huế",
    category: "Thiết kế",
    description: "Hỗ trợ thiết kế các ấn phẩm truyền thông, poster, banner, logo,... theo yêu cầu của team. Trao đổi ý tưởng và phối hợp với các thành viên khác để hoàn thành dự án. Yêu cầu: Có kiến thức cơ bản về Photoshop, Illustrator hoặc các phần mềm thiết kế khác. Có tinh thần cầu tiến và khả năng làm việc nhóm.",
    publication_date: "09/08/2025",
    deadline: "2025-09-18"
  },
  {
    id: 8,
    title: "Nhân viên giao hàng",
    company: "Shopee Express",
    employerId: 108,
    logo: employers.shopee,
    salary: "Thu nhập 8-12 triệu/tháng",
    type: "Part-time",
    location: "Phường Phú Bài",
    address: "Khu 8, phường Phú Bài, thành phố Huế",
    category: "Dịch vụ",
    description: "Nhận và giao các bưu kiện, hàng hóa đến tay khách hàng theo tuyến đường được phân công. Đảm bảo hàng hóa được giao đúng hẹn và an toàn. Yêu cầu: Có xe máy riêng, thông thạo đường phố, có điện thoại thông minh để sử dụng ứng dụng.",
    publication_date: "17/08/2025",
    deadline: "2025-09-18"
  },
  {
    id: 9,
    title: "Thực tập sinh CNTT",
    company: "Trung tâm Công nghệ thông tin thành phố Huế - Huecit",
    employerId: 109,
    logo: employers.cit,
    salary: "4000000",
    type: "Internship",
    location: "Phường Thuận Hóa",
    address: "Số 8, đường Lê Lợi, phường Thuận Hóa, thành phố Huế",
    category: categories[2],
    description: "Tham gia vào các dự án phần mềm của trung tâm. Hỗ trợ phát triển và bảo trì hệ thống. Áp dụng kiến thức đã học vào thực tế. Yêu cầu: Sinh viên ngành Công nghệ thông tin, có kiến thức cơ bản về lập trình. Có tinh thần học hỏi cao và khả năng làm việc nhóm.",
    publication_date: "22/07/2025",
    deadline: "2025-09-18"
  },
  {
    id: 10,
    title: "Thực tập sinh ngoại ngữ Anh",
    company: "Trung tâm Ngoại ngữ - Tin học Huế ICP",
    employerId: 110,
    logo: employers.ipc,
    salary: "3 - 6 triệu",
    type: "Internship",
    location: "Phường An Cựu",
    address: "Số 2/54, đường An Dương Vương, phường An Cựu, thành phố Huế",
    category: "Ngoại ngữ",
    description: "Hỗ trợ giảng dạy và biên soạn tài liệu cho các lớp học tiếng Anh. Tham gia các hoạt động ngoại khóa để trau dồi kỹ năng. Hỗ trợ các công việc hành chính. Yêu cầu: Có kiến thức vững về tiếng Anh, phát âm chuẩn. Có khả năng giao tiếp, truyền đạt tốt.",
    publication_date: "01/08/2025",
    deadline: "2025-09-18"
  }
];

export default jobs;

