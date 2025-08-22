// posts.js
import stu1 from "../../src/assets/images/student/student1.jpg";
import stu2 from "../../src/assets/images/student/student2.jpg";
import may1 from "../../src/assets/images/posts/may1.jpg";
import may2 from "../../src/assets/images/posts/may2.jpg";
import stuimg from "assets/images/student/student";
import { students } from "./users";
import react2 from "../assets/images/posts/react2.webp"
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
    images: [],
    comments: [{ user: { id: 3, name: "Trần Thị B", avatar: stuimg.stu3 }, text: "Cảm ơn bạn đã chia sẻ, rất hữu ích!", date: "2025-08-18T07:14" },
    ],
    likes: [1, 2, 3], // userID đã like 
    date: "2025-08-10 05:14",
  },
  {
    id: 2,
    jobTitle: "Nhân viên phục vụ quán cà phê",
    company: "Cafe Mây",
    author: {
      name: "Lê Văn Lâm",
      avatar: stuimg.stu7,
    },
    content: "Công việc khá vui, môi trường năng động, học được cách giao tiếp với khách hàng.. hahahahhaahahah fdddddddddddddddddddddddddddd .",
    images: [may1, may2],
    comments: [
      { user: { id: 3, name: "Trần Thị B", avatar: stuimg.stu3 }, text: "Cảm ơn bạn đã chia sẻ, rất hữu ích!", date: "2025-08-18T09:18" },
      { user: { id: 1, name: "Nguyễn Văn A", avatar: stuimg.stu1 }, text: "Mình cũng từng làm ở đây, trải nghiệm khá tốt.", date: "2025-08-19T22:30" }

    ],
    likes: [2, 3],
    date: "2025-08-18 06:06",
  },
  {
    id: 3,
    jobTitle: "Thực tập lập trình React",
    company: "Công ty Phần mềm ABC",
    author: {
      name: "Lý Ngọc Thiên",
      avatar: stuimg.stu5,
    },
    content: "Được học thêm các kiến thức, công nghệ mới, tham gia các dự án thực tế, được làm quen với môi trường doanh nghiệp công nghệ thông tin",
    images: [react2],
    comments: [
      { user: { id: 3, name: "Trần Thị B", avatar: stuimg.stu3 }, text: "Cảm ơn bạn đã chia sẻ, rất hữu ích!", date: "2025-08-18T09:18" },
      { user: { id: 2, name: "Tran Cam Tu", avatar: stuimg.stu2 }, text: "Mình cũng từng làm ở đây, trải nghiệm khá tốt.", date: "2025-08-18T22:30" }

    ],
    likes: [2, 3, 4],
    date: "2025-08-08 16:06",
  },
];

export default posts;
//{ user: "Lê Văn C", text: "Mình cũng từng làm ở đây, trải nghiệm khá tốt." }