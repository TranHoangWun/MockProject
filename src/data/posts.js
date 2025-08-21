// posts.js
import stu1 from "../../src/assets/images/student/student1.jpg";
import stu2 from "../../src/assets/images/student/student2.jpg";
import may1 from "../../src/assets/images/posts/may1.jpg";
import may2 from "../../src/assets/images/posts/may2.jpg";
const posts = [
  {
    id: 1,
    jobTitle: "Biên tập sách giáo trình tiếng Hàn",
    company: "Công ty TNHH Dasa Books",
    author: { 
      name: "Nguyễn Văn A", 
      avatar: stu1,
    },
    content: "Trong thời gian làm việc tôi học được rất nhiều điều bổ ích về cách biên tập và chỉnh sửa sách...",
    images: ["/assets/images/posts", "/images/post1_2.png"],
    comments: [
    ],
    likes: 3,
    date: "2025-08-10"
  },
  {
    id: 2,
    jobTitle: "Nhân viên phục vụ quán cà phê",
    company: "Cafe Mây",
    author: { 
      name: "Phạm Thị D", 
      avatar: stu2,
    },
    content: "Công việc khá vui, môi trường năng động, học được cách giao tiếp với khách hàng...",
    images: [may1, may2],
    comments: [
      { user: "Trần Thị B", text: "Cảm ơn bạn đã chia sẻ, rất hữu ích!" },
      { user: "Lê Văn C", text: "Mình cũng từng làm ở đây, trải nghiệm khá tốt." }
    ],
    likes: 5,
    date: "2025-08-18"
  }
];

export default posts;
