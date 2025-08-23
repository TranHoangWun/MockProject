import users from "../data/users";

// Lấy danh sách user từ localStorage, nếu chưa có thì dùng data/users.js
let currentUsers = JSON.parse(localStorage.getItem("users")) || [...users];

// Cập nhật danh sách user vào localStorage
function saveUsers() {
  localStorage.setItem("users", JSON.stringify(currentUsers));
}

// Đăng nhập
export function login(username, password) {
  const user = currentUsers.find(
    (u) => u.username === username && u.password === password
  );
  if (user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
    return user;
  }
  return null;
}

// Lấy user đang đăng nhập
export function getCurrentUser() {
  const user = localStorage.getItem("currentUser");
  return user ? JSON.parse(user) : null;
}

// Đăng xuất
export function logout() {
  localStorage.removeItem("currentUser");
}

// Đăng ký
export function register(newUser) {
  const exists = currentUsers.find((u) => u.username === newUser.username);
  if (exists) {
    return { success: false, message: "Tên đăng nhập đã tồn tại!" };
  }

  let profile = {};
  if (newUser.role === "student") {
    profile = {
      fullName: "",
      phone: "",
      school: "",
      address: "",
      email: newUser.username,
      image: null,
    };
  } else if (newUser.role === "employer") {
    profile = {
      companyName: "",
      phone: "",
      address: "",
      email: newUser.username,
      image: null,
    };
  } else if (newUser.role === "admin") {
    profile = {
      fullName: "Quản trị viên mới",
      email: newUser.username,
      image: null,
    };
  }

  const user = {
    id: currentUsers.length + 1,
    username: newUser.username,
    password: newUser.password,
    role: newUser.role,
    profile,
  };

  currentUsers.push(user);
  saveUsers(); //lưu vào localStorage

  return { success: true, user };
}

//Hàm update user (dùng khi sửa profile, avatar, ...)
export function updateUser(updatedUser) {
  const index = currentUsers.findIndex((u) => u.id === updatedUser.id);
  if (index !== -1) {
    currentUsers[index] = updatedUser;
    saveUsers();
    localStorage.setItem("currentUser", JSON.stringify(updatedUser)); // cập nhật luôn currentUser
    return { success: true, user: updatedUser };
  }
  return { success: false, message: "Không tìm thấy user!" };
}
