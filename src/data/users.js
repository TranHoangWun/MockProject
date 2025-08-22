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
      fullName: "Tran Cam Tu",
      phone: "0123456789",
      school: "Đại học Khoa học Huế",
      address: "Thừa Thiên Huế",
      email: "student2@gmail.com",
      image: stuimg.stu2,
    }
  },
  {
    id: 3,
    username: "student3@gmail.com",
    password: "123456",
    role: "student",
    profile: {
      fullName: "Phạm Anh Anh",
      phone: "0123456789",
      school: "Đại học Du Lịch Huế",
      address: "Thừa Thiên Huế",
      email: "student3@gmail.com",
      image: stuimg.stu3,
    }
  },
  {
    id: 4,
    username: "student4@gmail.com",
    password: "123456",
    role: "student",
    profile: {
      fullName: "Trần Hưng Yên",
      phone: "0123456789",
      school: "Đại học Kinh Tế Huế",
      address: "Thừa Thiên Huế",
      email: "student3@gmail.com",
      image: stuimg.stu4,
    }
  },
  {
    id: 5,
    username: "student5@gmail.com",
    password: "123456",
    role: "student",
    profile: {
      fullName: "Lý Ngọc Thiên",
      phone: "0123456789",
      school: "Đại học Khoa Học Huế",
      address: "Thừa Thiên Huế",
      email: "student5@gmail.com",
      image: stuimg.stu5,
    }
  },
  {
    id: 6,
    username: "student4@gmail.com",
    password: "123456",
    role: "student",
    profile: {
      fullName: "Nguyễn Phước Quý",
      phone: "0123456789",
      school: "Đại học Luật Huế",
      address: "Thừa Thiên Huế",
      email: "student6@gmail.com",
      image: stuimg.stu6,
    }
  },
  {
    id: 7,
    username: "student7@gmail.com",
    password: "123456",
    role: "student",
    profile: {
      fullName: "Lê Văn Lâm",
      phone: "0123456789",
      school: "Đại học Y Dược Huế",
      address: "Thừa Thiên Huế",
      email: "student7@gmail.com",
      image: stuimg.stu7,
    }
  },
];
const employers = [
  {
    id: 101,
    username: "abc@gmail.com",
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
      email: "employer2@gmail.com",
      image: empimg.cafeMay,
    }
  },
  {
    id: 103,
    username: "giasuminhtam@gmail.com",
    password: "123456",
    role: "employer",
    profile: {
      companyName: "Gia sư Minh Tâm",
      phone: "0987654321",
      address: "Thành Phố Huế",
      email: "employer2@gmail.com",
      image: empimg.giaSu,
    }
  },
  {
    id: 104,
    username: "songhuong@gmail.com",
    password: "123456",
    role: "employer",
    profile: {
      companyName: "Nhà hàng Sông Hương",
      phone: "0987654321",
      address: "Thị xã Hương Trà",
      email: "employer2@gmail.com",
      image: empimg.giaSu,
    }
  },
  {
    id: 105,
    username: "xyz@gmail.com",
    password: "123456",
    role: "employer",
    profile: {
      companyName: "Công ty TNHH XYZ",
      phone: "0987654321",
      address: "Huyện Phú Vang",
      email: "employer2@gmail.com",
      image: empimg.xyz,
    }
  },
  {
    id: 106,
    username: "coopmart@gmail.com",
    password: "123456",
    role: "employer",
    profile: {
      companyName: "Co.opmart Huế",
      phone: "0987654321",
      address: "Thành Phố Huế",
      email: "employer2@gmail.com",
      image: empimg.coopmart,
    }
  },
  {
    id: 107,
    username: "studio@gmail.com",
    password: "123456",
    role: "employer",
    profile: {
      companyName: "Creative Studio Huế",
      phone: "0987654321",
      address: "Thị xã Hương Thủy",
      email: "employer2@gmail.com",
      image: empimg.studio,
    }
  },
  {
    id: 108,
    username: "shopee@gmail.com",
    password: "123456",
    role: "employer",
    profile: {
      companyName: "Shopee Express",
      phone: "0987654321",
      address: "Thành phố Huế",
      email: "employer2@gmail.com",
      image: empimg.studio,
    }
  },
  {
    id: 109,
    username: "cit@gmail.com",
    password: "123456", 
    role: "employer",
    profile: {
      companyName: "Trung tâm Công nghệ thông tin thành phố Huế - Huecit",
      phone: "0987654321",
      address: "Thành phố Huế",
      email: "employer2@gmail.com",
      image: empimg.cit,
    }
  },
  {
    id: 110,
    username: "icp@gmail.com",
    password: "123456", 
    role: "employer",
    profile: {
      companyName: "Trung tâm Ngoại ngữ - Tin học Huế ICP",
      phone: "0987654321",
      address: "Thành phố Huế",
      email: "employer2@gmail.com",
      image: empimg.ipc,
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