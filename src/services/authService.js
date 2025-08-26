import users from "../data/users";

// Lấy danh sách user từ localStorage, nếu chưa có thì dùng data/users.js
let currentUsers = JSON.parse(localStorage.getItem("users")) || [...users];

// Ensure users are saved to localStorage initially
if (!localStorage.getItem("users")) {
  localStorage.setItem("users", JSON.stringify(users));
}

// Expose currentUsers to other components for direct access when needed
export { currentUsers };

// Cập nhật danh sách user vào localStorage
function saveUsers() {
  localStorage.setItem("users", JSON.stringify(currentUsers));
}

// Đăng nhập
export function login(username, password) {
  console.log("Login attempt:", { username, password });
  
  // Check if user exists first (before checking credentials)
  const userExists = currentUsers.some(
    (u) => u.username === username || u.profile?.email === username
  );
  
  if (!userExists) {
    return { error: "deleted", message: "Tài khoản này không tồn tại hoặc đã bị xóa." };
  }
  
  // First check for admin logins
  const adminUser = currentUsers.find(
    (u) => u.username === username && u.password === password && u.role === "admin"
  );
  
  if (adminUser) {
    localStorage.setItem("currentUser", JSON.stringify(adminUser));
    return adminUser;
  }

  // Regular login with username or email
  const user = currentUsers.find(
    (u) => (u.username === username || u.profile?.email === username) && u.password === password
  );
  
  if (user) {
    // Check if user account is locked
    if (user.isLocked) {
      return { error: "locked", message: "Tài khoản của bạn đã bị khóa bởi admin." };
    }
    
    localStorage.setItem("currentUser", JSON.stringify(user));
    return user;
  }
  
  return null; // Invalid credentials
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

// Xóa tài khoản người dùng (chỉ admin mới có quyền)
export function deleteUser(userId) {
  try {
    console.log("Deleting user with ID:", userId, "Type:", typeof userId);
    
    // Ensure userId is treated as a number for comparison
    const numericUserId = parseInt(userId);
    
    // Không cho xóa tài khoản admin
    const userToDelete = currentUsers.find((u) => parseInt(u.id) === numericUserId);
    console.log("User to delete:", userToDelete);
    
    if (!userToDelete) {
      return { success: false, message: "Không tìm thấy tài khoản!" };
    }
    
    if (userToDelete.role === "admin") {
      return { success: false, message: "Không thể xóa tài khoản admin!" };
    }
    
    // Xử lý dữ liệu liên quan trước khi xóa người dùng
    try {
      if (userToDelete.role === "employer") {
        // 1. Xóa tất cả tin tuyển dụng của nhà tuyển dụng này
        let employerJobs = JSON.parse(localStorage.getItem('employerJobs') || '[]');
        let deletedJobs = JSON.parse(localStorage.getItem('deletedJobs') || '[]');
        
        // Tìm tất cả công việc của employer này
        const employerJobsToDelete = employerJobs.filter(job => parseInt(job.employerId) === numericUserId);
        console.log("Jobs to delete:", employerJobsToDelete.length);
        
        // Thêm vào danh sách đã xóa với lý do
        if (employerJobsToDelete.length > 0) {
          employerJobsToDelete.forEach(job => {
            deletedJobs.push({
              ...job,
              deletedAt: new Date().toLocaleDateString('vi-VN'),
              reason: "Tài khoản nhà tuyển dụng đã bị xóa"
            });
          });
        }
        
        // Xóa các công việc của employer này khỏi danh sách chính
        employerJobs = employerJobs.filter(job => parseInt(job.employerId) !== numericUserId);
        
        // Lưu cập nhật vào localStorage
        localStorage.setItem('employerJobs', JSON.stringify(employerJobs));
        localStorage.setItem('deletedJobs', JSON.stringify(deletedJobs));
        
      } else if (userToDelete.role === "student") {
        // 1. Xóa tất cả đơn ứng tuyển của sinh viên này
        let appliedJobs = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
        
        // Lưu danh sách các công việc cần giảm số lượng ứng viên
        const jobsToUpdate = new Set();
        appliedJobs.forEach(app => {
          if (parseInt(app.userId) === numericUserId) {
            jobsToUpdate.add(app.jobId);
          }
        });
        
        // Xóa đơn ứng tuyển
        appliedJobs = appliedJobs.filter(app => parseInt(app.userId) !== numericUserId);
        localStorage.setItem('appliedJobs', JSON.stringify(appliedJobs));
        
        // Giảm số lượng ứng viên trong các công việc
        if (jobsToUpdate.size > 0) {
          let employerJobs = JSON.parse(localStorage.getItem('employerJobs') || '[]');
          employerJobs = employerJobs.map(job => {
            if (jobsToUpdate.has(job.id) && job.applicants > 0) {
              return { ...job, applicants: job.applicants - 1 };
            }
            return job;
          });
          localStorage.setItem('employerJobs', JSON.stringify(employerJobs));
        }
      }
    } catch (relatedDataError) {
      console.error("Error cleaning up related data:", relatedDataError);
      // Continue with user deletion even if related data cleanup fails
    }
    
    // Add post cleanup when deleting users
    try {
      // Clean up posts collection
      const posts = JSON.parse(localStorage.getItem('posts') || '[]');
      const updatedPosts = posts.filter(post => {
        // Check multiple possible ID fields
        const postAuthorId = post.author?.id || post.authorId || post.userId;
        return postAuthorId !== numericUserId;
      });
      localStorage.setItem('posts', JSON.stringify(updatedPosts));
      
      // Also clean up any user posts collection if it exists
      const userPosts = JSON.parse(localStorage.getItem('userPosts') || '[]');
      const updatedUserPosts = userPosts.filter(post => {
        const postUserId = post.userId || post.authorId;
        return postUserId !== numericUserId;
      });
      localStorage.setItem('userPosts', JSON.stringify(updatedUserPosts));
      
      console.log(`Removed posts for deleted user ID: ${numericUserId}`);
    } catch (postCleanupError) {
      console.error("Error cleaning up posts for deleted user:", postCleanupError);
    }
    
    // Xóa người dùng khỏi danh sách
    const updatedUsers = currentUsers.filter((u) => parseInt(u.id) !== numericUserId);
    
    if (updatedUsers.length === currentUsers.length) {
      console.error("No user was removed from the array!");
      return { success: false, message: "Lỗi: Không thể xóa tài khoản khỏi hệ thống!" };
    }
    
    currentUsers = updatedUsers;
    saveUsers();
    
    return { success: true, message: "Đã xóa tài khoản thành công!" };
  } catch (error) {
    console.error("Lỗi khi xóa tài khoản:", error);
    return { success: false, message: "Đã xảy ra lỗi khi xóa tài khoản" };
  }
}

// Khóa/mở khóa tài khoản người dùng (chỉ admin mới có quyền)
export function toggleUserStatus(userId) {
  try {
    // Không cho khóa tài khoản admin
    const userIndex = currentUsers.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      return { success: false, message: "Không tìm thấy tài khoản!" };
    }
    
    const user = currentUsers[userIndex];
    if (user.role === "admin") {
      return { success: false, message: "Không thể thay đổi trạng thái tài khoản admin!" };
    }
    
    // Toggle trạng thái khóa
    currentUsers[userIndex] = {
      ...user,
      isLocked: !user.isLocked
    };
    
    saveUsers();
    
    return { success: true };
  } catch (error) {
    console.error("Lỗi khi thay đổi trạng thái tài khoản:", error);
    return { success: false, message: "Đã xảy ra lỗi khi thay đổi trạng thái tài khoản" };
  }
}
