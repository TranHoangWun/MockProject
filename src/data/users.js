// src/data/users.js
import stuimg from "assets/images/student/student";
import empimg from "assets/images/employer/employer";
import admimg from "assets/images/admin/admin";
const students = [
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
      email: "student1@gmail.com",
      image: stuimg.stu1,
    }
  },
  {
    id: 2,
    username: "student2@gmail.com",
    password: "123456",
    role: "student",
    profile: {
      fullName: "Nguyễn Văn A",
      phone: "0123456789",
      school: "Đại học Khoa học Huế",
      address: "Thừa Thiên Huế",
      email: "student1@gmail.com",
      image: stuimg.stu2,
    }
  },
  {
    id: 1,
    username: "student3@gmail.com",
    password: "123456",
    role: "student",
    profile: {
      fullName: "Nguyễn Văn A",
      phone: "0123456789",
      school: "Đại học Khoa học Huế",
      address: "Thừa Thiên Huế",
      email: "student1@gmail.com",
      image: stuimg.stu3,
    }
  },
];
const employers = [
  {
  id: 101,
    username: "employer1@gmail.com",
      password: "123456",
        role: "employer",
          profile: {
    companyName: "Công ty ABC",
      phone: "0987654321",
        address: "Thành phố Huế",
          email: "employer1@gmail.com",
            image: empimg.abc,
    }
},
{
  id: 102,
    username: "cafemay@gmail.com",
      password: "123456",
        role: "employer",
          profile: {
    companyName: "Cafe Mây",
      phone: "0987654321",
        address: "Huyện A Lưới",
          email: "employer1@gmail.com",
            image: empimg.cafeMay,
    }
},
];
const admins = [
  {
  id: 201,
    username: "admin1@gmail.com",
      password: "admin123",
        role: "admin",
          profile: {
    fullName: "Quản trị viên",
      email: "admin@gmail.com",
        image: admimg.ad1,
    }
}
];


const users = [...students, ...employers, ...admins];

export { students, employers, admins };
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
