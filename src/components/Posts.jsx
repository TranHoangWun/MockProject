import React, { useState, useContext, useEffect } from "react";
import postsData from "../data/posts";
import Pagination from "./pagination/Pagination";
import { AuthContext } from "../context/AuthContext";
import defaultAvatar from "../assets/images/student/student1.jpg";

export default function Posts() {
    const { user } = useContext(AuthContext);

    // Khi khởi tạo state, chuẩn hóa author thành object
    const [posts, setPosts] = useState(() => {
        const saved = localStorage.getItem("posts");
        if (saved) {
            return JSON.parse(saved);
        } else {
            return postsData.map((p, idx) => ({
                id: p.id || idx + 1,
                jobTitle: p.jobTitle,
                company: p.company,
                content: p.content,
                images: p.images || [],
                author: {
                    name: typeof p.author === "string" ? p.author : p.author?.name || "Người dùng",
                    avatar: p.author?.avatar || defaultAvatar,
                },

                liked: false,
                likes: p.likes || 0,
            }));
        }
    });

    // Mỗi lần posts thay đổi thì lưu lại localStorage
    useEffect(() => {
        localStorage.setItem("posts", JSON.stringify(posts));
    }, [posts]);

    const [sortOption, setSortOption] = useState("newest");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [showModal, setShowModal] = useState(false);

    const [formData, setFormData] = useState({
        jobTitle: "",
        company: "",
        content: "",
        images: [],
    });

    const postsPerPage = 3;

    const handleLike = (id) => {
        setPosts((prev) =>
            prev.map((p) =>
                p.id === id
                    ? {
                        ...p,
                        likes: p.liked ? p.likes - 1 : p.likes + 1,
                        liked: !p.liked,
                    }
                    : p
            )
        );
    };

    // khi chọn ảnh
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const newImages = files.map((file) => URL.createObjectURL(file));
        setFormData({ ...formData, images: [...formData.images, ...newImages] });
    };

    // Thêm bài viết mới
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
            id: posts.length ? posts[0].id + 1 : 1,
            author: {
                name: user.profile?.fullName || user.username || "Người dùng",
                avatar: user.profile?.image || defaultAvatar,
            },
            jobTitle: formData.jobTitle,
            company: formData.company,
            content: formData.content,
            images: formData.images,
            likes: 0,
            liked: false,
            date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
        };

        setPosts([newPost, ...posts]);
        setFormData({ jobTitle: "", company: "", content: "", images: [] });
        setShowModal(false);
        setCurrentPage(1);
    };

    const filteredPosts = posts.filter(
        (p) =>
            p.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const sortedPosts = [...filteredPosts].sort((a, b) => {
        //if (sortOption === "newest") return b.id - a.id;
        if (sortOption === "newest") {
            return new Date(b.date) - new Date(a.date); // so sánh theo ngày
        }
        if (sortOption === "alphabet") return a.jobTitle.localeCompare(b.jobTitle);
        if (sortOption === "useful") return b.likes - a.likes;
        return 0;
    });

    const indexOfLast = currentPage * postsPerPage;
    const indexOfFirst = indexOfLast - postsPerPage;
    const currentPosts = sortedPosts.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(sortedPosts.length / postsPerPage);

    return (
        <div className="container my-4">
            <h3 className="mb-4">Chia sẻ trải nghiệm</h3>

            <button className="btn btn-primary mb-3" onClick={() => setShowModal(true)}>
                + Đăng bài
            </button>

            <div className="d-flex justify-content-between align-items-center mb-3">
                <input
                    type="text"
                    className="form-control w-50"
                    placeholder="Tìm kiếm..."
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                    }}
                />
                <select
                    className="form-select w-auto ms-2"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                >
                    <option value="newest">Mới nhất</option>
                    <option value="alphabet">Theo chữ cái</option>
                    <option value="useful">Hữu ích nhất</option>
                </select>
            </div>

            {/* hiển thị posts */}
            {currentPosts.map((post) => (
                <div
                    key={post.id}
                    className="card mb-3 shadow-sm"
                    style={{ maxWidth: "650px", margin: "0 auto" }}
                >
                    <div className="card-body">
                        <div className="d-flex align-items-center mb-2">
                            <img
                                src={post.author.avatar || defaultAvatar}
                                alt="avatar"
                                className="rounded-circle me-2"
                                style={{ width: "40px", height: "40px", objectFit: "cover" }}
                            />
                            <strong>{post.author.name}</strong>
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
                                    maxHeight: "300px",
                                    width: "100%",
                                    objectFit: "cover",
                                    borderRadius: "12px",
                                }}
                            />
                        )}

                        <div className="d-flex gap-2">
                            <button className="btn btn-outline-primary btn-sm">Xem chi tiết</button>
                            <button
                                className={`btn btn-sm ${post.liked ? "btn-success" : "btn-outline-success"
                                    }`}
                                onClick={() => handleLike(post.id)}
                            >
                                Hữu ích ({post.likes})
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />

            {/* Modal */}
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

                                    {/* upload nhiều ảnh */}
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
                                        className="btn btn-secondary"
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
        </div>
    );
}
