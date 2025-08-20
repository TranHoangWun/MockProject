// src/data/users.js
import students from "assets/images/student/student"
const users = [
  {
    id: 1,
    username: "student1@gmail.com",
    password: "123456",
    role: "student",
    profile: {
      fullName: "Nguyễn Văn A", 
      phone: "0123456789",
      school: "Đại học Khoa học Huế",
      address: "Thừa Thiên Huế",
      email: "student1@example.com",
      image: students.stu1,
    }
  },
  {
    id: 1,
    username: "employer1@gmail.com",
    password: "123456",
    role: "employer",
    profile: {
      companyName: "Công ty ABC",
      phone: "0987654321",
      address: "Hà Nội",
      email: "employer1@example.com",
      
    }
  },
  {
    id: 1,
    username: "admin1@gmail.com",
    password: "admin123",
    role: "admin",
    profile: {
      fullName: "Quản trị viên",
      email: "admin@example.com"
    }
  }
];

export default users;

/*const users =[
  {
    "id": 1,
    "role": "student",
    "username": "sv_hue01@gmail.com",
    "password": "123456",
    "name": "Nguyễn Văn A",
    "skills": ["JavaScript", "React"],
    "cv": "link_cv.pdf"
  },
  {
    "id": 2,
    "role": "employer",
    "username": "congtyABC",
    "password": "abc123",
    "company": "Công ty ABC",
    "jobs_posted": [1, 2]
  },
  {
    "id": 3,
    "role": "admin",
    "username": "admin",
    "password": "admin123"
  }
]
export default users; */
