import users from "../data/users";

// Giả lập DB local (cập nhật trong session)
let currentUsers = [...users];

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
  const user = {
    id: currentUsers.length + 1,
    ...newUser,
  };
  currentUsers.push(user);
  return { success: true, user };
}
