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
      gender: "Nam",
      dob: "2003-05-15", // YYYY-MM-DD
      phone: "0123456789",
      school: "Đại học Khoa học Huế",
      address: "Thừa Thiên Huế",
      email: "student1@gmail.com",
      socialLinks: [ // Đã đổi thành một mảng
        {
          name: "LinkedIn",
          url: "https://www.linkedin.com/in/nguyen-van-a-123456/"
        },
        {
          name: "GitHub",
          url: "https://github.com/nguyenvana"
        },
        {
          name: "Facebook",
          url: "https://facebook.com/nguyenvana/"
        }
      ],
      image: stuimg.stu1,
      cv: stuimg.cv[0], // CV có thể null nếu chưa upload
    }
  },
  {
    id: 2,
    username: "student2@gmail.com",
    password: "123456",
    role: "student",
    profile: {
      fullName: "Trần Cẩm Tú",
      gender: "Nữ",
      dob: "2006-11-20",
      phone: "0987654321",
      school: "Đại học Khoa học Huế",
      address: "Thừa Thiên Huế",
      email: "student2@gmail.com",
      socialLinks: [{
        name: "Facebook",
        url: "https://facebook.com/ctt/"
      }],
      image: stuimg.stu2,
      cv: null,
    }
  },
  {
    id: 3,
    username: "student3@gmail.com",
    password: "123456",
    role: "student",
    profile: {
      fullName: "Phạm Anh Anh",
      gender: "Nữ",
      dob: "2004-01-10",
      phone: "0911222333",
      school: "Đại học Du lịch Huế",
      address: "Thừa Thiên Huế",
      email: "student3@gmail.com",
      socialLinks: [],
      image: stuimg.stu3,
      cv: stuimg.cv[3],
    }
  },
  {
    id: 4,
    username: "student4@gmail.com",
    password: "123456",
    role: "student",
    profile: {
      fullName: "Trần Hưng Yên",
      gender: "Nam",
      dob: "2001-09-08",
      phone: "0933444555",
      school: "Đại học Kinh tế Huế",
      address: "Thừa Thiên Huế",
      email: "student4@gmail.com",
      socialLinks: [],
      image: stuimg.stu4,
      cv: null,
    }
  },
  {
    id: 5,
    username: "student5@gmail.com",
    password: "123456",
    role: "student",
    profile: {
      fullName: "Lý Ngọc Thiên",
      gender: "Nam",
      dob: "2003-03-25",
      phone: "0977666888",
      school: "Đại học Khoa học Huế",
      address: "Thừa Thiên Huế",
      email: "student5@gmail.com",
      socialLinks: [{
        name: "Facebook",
        url: "https://facebook.com/LyNgocThien/"
      }, {
        name: "Github",
        url: "https://github.com/ctt/"
      }],
      image: stuimg.stu5,
      cv: stuimg.cv[2],
    }
  },
  {
    id: 6,
    username: "student6@gmail.com", // sửa lại cho đúng
    password: "123456",
    role: "student",
    profile: {
      fullName: "Nguyễn Phước Quý",
      gender: "Nam",
      dob: "2002-07-30",
      phone: "0909090909",
      school: "Đại học Luật Huế",
      address: "Thừa Thiên Huế",
      email: "student6@gmail.com",
      socialLinks: [],
      image: stuimg.stu6,
      cv: null,
    }
  },
  {
    id: 7,
    username: "student7@gmail.com",
    password: "123456",
    role: "student",
    profile: {
      fullName: "Lê Văn Lâm",
      gender: "Nam",
      dob: "2001-12-05",
      phone: "0944556677",
      school: "Đại học Y Dược Huế",
      address: "Thừa Thiên Huế",
      email: "student7@gmail.com",
      socialLinks: [],
      image: stuimg.stu7,
      cv: stuimg.cv[4],
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
      email: "abc@gmail.com",
      socialLinks: [{
        name: "Facebook",
        url: "https://facebook.com/ABCcompany/"
      }],
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
      address: "Xã A Lưới 1",
      email: "cafemay@gmail.com",
      socialLinks: [{
        name: "Facebook",
        url: "https://facebook.com/cafeMay/"
      }],
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
      email: "giasu@gmail.com",
      socialLinks: [],
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
      email: "huong@gmail.com",
      socialLinks: [{
        name: "Facebook",
        url: "https://facebook.com/ctt/"
      }],
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
      email: "xyz@gmail.com",
      socialLinks: [{
        name: "XYZ Website",
        url: "https://XYZcompany.com"
      }],
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
      email: "coop@gmail.com",
      socialLinks: [{
        name: "Facebook",
        url: "https://facebook.com/coop/"
      }],
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
      email: "studio@gmail.com",
      socialLinks: [],
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
      email: "shopee@gmail.com",
      socialLinks: [],
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
      email: "cit@gmail.com",
      socialLinks: [
        {
          name: "CIT Website",
          url: "https://cit.com"
        }
      ],
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
      socialLinks: [],
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