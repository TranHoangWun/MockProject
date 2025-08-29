import React, { useState, useContext, useEffect } from "react";
import postsData from "../data/posts";
import Pagination from "./pagination/Pagination";
import { AuthContext } from "../context/AuthContext";
import defaultAvatar from "../assets/images/student/student1.jpg";
import { Link } from "react-router-dom";
import { normalizePosts } from "../utils/normalizePosts";
import "./Posts.css";

export default function Posts() {
  const { user } = useContext(AuthContext);

  const [posts, setPosts] = useState(() => {
    const saved = localStorage.getItem("posts");
    return saved ? normalizePosts(JSON.parse(saved)) : normalizePosts(postsData);
  });

  useEffect(() => {
    localStorage.setItem("posts", JSON.stringify(posts));
  }, [posts]);

  /* --- CSS cho NÚT TĨNH (không phụ thuộc bootstrap) --- */
  const STATIC_ACTIONS_CSS = `
    .pa-row{ display:flex!important; flex-wrap:wrap!important; gap:8px!important; margin-top:12px!important; align-items:center; }
    .pa-btn{
      display:inline-flex!important; align-items:center; justify-content:center;
      padding:6px 12px; border-radius:8px; font-size:14px; line-height:1;
      border:1px solid transparent; text-decoration:none; cursor:pointer;
      user-select:none; white-space:nowrap; flex:0 0 auto;
      opacity:1!important; visibility:visible!important;
    }
    .pa-btn--view{ background:#eaf2ff; border-color:#eaf2ff; color:#0d6efd; }
    .pa-btn--like{ background:#eaf7ee; border-color:#eaf7ee; color:#198754; }
    .pa-btn--like.is-on{ background:#198754; border-color:#198754; color:#fff; }
    .pa-btn--report{ background:#fdebed; border-color:#fdebed; color:#dc3545; }
    .card .card-body{ overflow:visible!important; }
  `;

  /* --- CSS cho TABS TĨNH (không hiệu ứng) --- */
  const STATIC_TABS_CSS = `
    .ptabs{ display:flex; gap:8px; margin-bottom:12px; }
    .ptab{
      border:1px solid #e5e7eb; background:#fff; color:#0d6efd;
      padding:8px 12px; border-radius:10px 10px 0 0; font-weight:600; cursor:pointer;
    }
    .ptab.active{
      background:#fff; color:#0d6efd; border-bottom-color:#fff;
      box-shadow: inset 0 -2px 0 0 #0d6efd;
    }
  `;

  const [sortOption, setSortOption] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // all | mine | useful
  
  // Add new state variables for report functionality
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState({
    postId: null,
    reason: "",
  });

  const [formData, setFormData] = useState({
    jobTitle: "",
    company: "",
    content: "",
    images: [],
  });

  const postsPerPage = 3;

  const handleLike = (id) => {
    if (!user) {
      alert("Bạn cần đăng nhập để bấm Hữu ích!");
      return;
    }
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const likesArray = Array.isArray(p.likes) ? p.likes : [];
        const already = likesArray.includes(user.id);
        return {
          ...p,
          likes: already
            ? likesArray.filter((uid) => uid !== user.id)
            : [...likesArray, user.id],
        };
      })
    );
  };

  const handleReport = (id) => {
    if (!user) {
      alert("Bạn cần đăng nhập để báo cáo bài viết!");
      return;
    }
    // Open report modal instead of showing alert
    setReportData({ postId: id, reason: "" });
    setShowReportModal(true);
  };

  const handleReportSubmit = (e) => {
    e.preventDefault();
    
    if (!reportData.reason.trim()) {
      alert("Vui lòng nhập lý do báo cáo!");
      return;
    }

    // Get existing reports or create new array
    const existingReports = JSON.parse(localStorage.getItem("postReports") || "[]");
    
    // Add new report with timestamp
    const newReport = {
      ...reportData,
      userId: user.id,
      userName: user.profile?.fullName || user.username,
      timestamp: new Date().toISOString()
    };
    
    existingReports.push(newReport);
    
    // Save to localStorage (in a real app, this would be sent to a server)
    localStorage.setItem("postReports", JSON.stringify(existingReports));
    
    alert(`Cảm ơn bạn đã báo cáo. Quản trị viên sẽ xem xét báo cáo của bạn.`);
    setShowReportModal(false);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const readers = files.map(
      (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
    );
    Promise.all(readers).then((base64Images) => {
      setFormData((prev) => ({ ...prev, images: [...prev.images, ...base64Images] }));
    });
  };

  const handleSubmitPost = (e) => {
    e.preventDefault();
    if (!user) {
      alert("Bạn cần đăng nhập để đăng bài!");
      return;
    }
    if (!formData.jobTitle || !formData.company || !formData.content) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    const newPost = {
      id: Date.now(),
      author: {
        name: user.profile?.fullName || user.username || "Người dùng",
        avatar: user.profile?.image || defaultAvatar,
      },
      jobTitle: formData.jobTitle,
      company: formData.company,
      content: formData.content,
      images: formData.images,
      likes: [],
      comments: [],
      date: new Date().toISOString(),
    };

    setPosts((prev) => [newPost, ...prev]);
    setFormData({ jobTitle: "", company: "", content: "", images: [] });
    setShowModal(false);
    setCurrentPage(1);
  };

  // chuyển tab (nếu chưa đăng nhập mà bấm vào "mine"/"useful" thì nhắc và ở lại tab hiện tại)
  const switchTab = (key) => {
    if (!user && (key === "mine" || key === "useful")) {
      alert("Vui lòng đăng nhập để dùng mục này.");
      return;
    }
    setActiveTab(key);
    setCurrentPage(1);
  };

  // lọc theo tab
  let filteredPosts = posts;
  if (activeTab === "mine") {
    filteredPosts = user
      ? posts.filter((p) => p.author?.name === (user.profile?.fullName || user.username))
      : [];
  } else if (activeTab === "useful") {
    filteredPosts = user
      ? posts.filter((p) => Array.isArray(p.likes) && p.likes.includes(user.id))
      : [];
  }

  // search
  filteredPosts = filteredPosts.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.jobTitle.toLowerCase().includes(q) ||
      p.company.toLowerCase().includes(q) ||
      p.content.toLowerCase().includes(q)
    );
  });

  // sort
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortOption === "newest") return new Date(b.date) - new Date(a.date);
    if (sortOption === "oldest") return new Date(a.date) - new Date(b.date);
    if (sortOption === "alphabet") return a.jobTitle.localeCompare(b.jobTitle);
    if (sortOption === "useful") return (b.likes?.length || 0) - (a.likes?.length || 0);
    return 0;
  });

  // paging
  const indexOfLast = currentPage * postsPerPage;
  const indexOfFirst = indexOfLast - postsPerPage;
  const currentPosts = sortedPosts.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(sortedPosts.length / postsPerPage);

  return (
    <div className="container my-4">
      {/* Chèn CSS tĩnh */}
      <style>{STATIC_ACTIONS_CSS + STATIC_TABS_CSS}</style>

      <h3 className="mb-4">Chia sẻ trải nghiệm</h3>

      <button className="btn btn-primary mb-3" onClick={() => setShowModal(true)}>
        Đăng bài
      </button>

      {/* Tabs tĩnh (không hiệu ứng) */}
      <div className="ptabs" role="tablist">
        <button
          type="button"
          className={`ptab ${activeTab === "all" ? "active" : ""}`}
          onClick={() => switchTab("all")}
        >
          Tất cả
        </button>
        <button
          type="button"
          className={`ptab ${activeTab === "mine" ? "active" : ""}`}
          onClick={() => switchTab("mine")}
        >
          Bài viết của tôi
        </button>
        <button
          type="button"
          className={`ptab ${activeTab === "useful" ? "active" : ""}`}
          onClick={() => switchTab("useful")}
        >
          Bài viết hữu ích
        </button>
      </div>

      {/* Danh sách bài viết */}
      {currentPosts.map((post) => {
        const likesArray = Array.isArray(post.likes) ? post.likes : [];
        const isLiked = !!user && likesArray.includes(user.id);

        return (
          <div
            key={post.id}
            className="card mb-3 shadow-sm"
            style={{ maxWidth: "600px", margin: "0 auto" }}
          >
            <div className="card-body" style={{ overflow: "visible" }}>
              <div className="d-flex align-items-center mb-2">
                <img
                  src={post.author.avatar || defaultAvatar}
                  alt="avatar"
                  className="rounded-circle me-2"
                  style={{ width: "40px", height: "40px", objectFit: "cover" }}
                />
                <div>
                  <strong>{post.author.name}</strong>
                  <br />
                  <small className="text-muted">
                    {new Date(post.date).toLocaleString("vi-VN")}
                  </small>
                </div>
              </div>

              <h5>{post.jobTitle}</h5>
              <p className="text-muted">{post.company}</p>
              <p>{post.content.slice(0, 100)}...</p>

              {post.images?.length > 0 && (
                <img
                  src={post.images[0]}
                  alt="Post"
                  className="img-fluid rounded mb-2"
                  style={{
                    maxHeight: "200px",
                    width: "100%",
                    objectFit: "cover",
                    borderRadius: "12px",
                  }}
                />
              )}

              {/* 3 nút tĩnh */}
              <div className="pa-row">
                <Link to={`/posts/${post.id}`} className="pa-btn pa-btn--view">
                  Xem chi tiết
                </Link>

                <button
                  className={`pa-btn pa-btn--like ${isLiked ? "is-on" : ""}`}
                  onClick={() => handleLike(post.id)}
                >
                  Hữu ích ({likesArray.length})
                </button>

                <button
                  className="pa-btn pa-btn--report"
                  onClick={() => handleReport(post.id)}
                >
                  Báo cáo
                </button>
              </div>
            </div>
          </div>
        );
      })}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* Modal đăng bài */}
      {showModal && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleSubmitPost}>
                <div className="modal-header">
                  <h5 className="modal-title">Đăng bài mới</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Tiêu đề công việc</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.jobTitle}
                      onChange={(e) =>
                        setFormData({ ...formData, jobTitle: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Công ty</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.company}
                      onChange={(e) =>
                        setFormData({ ...formData, company: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Nội dung</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={formData.content}
                      onChange={(e) =>
                        setFormData({ ...formData, content: e.target.value })
                      }
                      required
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Ảnh minh họa</label>
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                    />
                    {formData.images.length > 0 && (
                      <div className="mt-2 d-flex flex-wrap gap-2">
                        {formData.images.map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt="preview"
                            className="rounded"
                            style={{ maxHeight: "100px" }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Đăng
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleReportSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">Báo cáo bài viết</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowReportModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Lý do báo cáo</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      value={reportData.reason}
                      onChange={(e) =>
                        setReportData({ ...reportData, reason: e.target.value })
                      }
                      placeholder="Vui lòng mô tả chi tiết lý do báo cáo bài viết này..."
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowReportModal(false)}
                  >
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-danger">
                    Gửi báo cáo
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
