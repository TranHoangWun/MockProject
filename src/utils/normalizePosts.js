// src/utils/normalizePosts.js
import defaultAvatar from "../assets/images/student/student1.jpg";

export function normalizePosts(rawPosts) {
  return rawPosts.map((p, idx) => ({
    id: p.id || idx + 1,
    jobTitle: p.jobTitle || "Không có tiêu đề",
    company: p.company || "Chưa rõ công ty",
    content: p.content || "", // content
    images: p.images || [],
    author: {
      name:
        typeof p.author === "string"
          ? p.author
          : p.author?.name || "Người dùng",
      avatar: p.author?.avatar || defaultAvatar,
    },
    likes: Array.isArray(p.likes) ? p.likes : [],
    comments: p.comments || [],
    date: p.date || new Date().toISOString().split("T")[0],
  }));
}
