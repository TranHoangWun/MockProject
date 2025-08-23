// src/pages/student/PostDetail.jsx
import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import postsData from "../../../data/posts";
import defaultAvatar from "../../../assets/images/student/student1.jpg";
import { normalizePosts } from "../../../utils/normalizePosts";
import CommentItem from "components/CommentItem";

export default function PostDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [posts, setPosts] = useState(() => {
        const saved = localStorage.getItem("posts");
        const raw = saved ? JSON.parse(saved) : postsData;
        return normalizePosts(raw);
    });

    const postIndex = posts.findIndex((p) => String(p.id) === String(id));
    const post = posts[postIndex];

    const [newComment, setNewComment] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(post?.content || "");
    const [newImages, setNewImages] = useState([]);

    if (!post) return <p>Bài viết không tồn tại.</p>;

    const isAuthor =
        user &&
        (post.author?.name === user.profile?.fullName || post.authorId === user.id);

    // Format ngày
    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return date.toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Xóa bài viết
    const handleDelete = () => {
        if (!isAuthor) {
            alert("Bạn không có quyền xóa bài viết này!");
            return;
        }
        const updated = posts.filter((p) => p.id !== post.id);
        setPosts(updated);
        localStorage.setItem("posts", JSON.stringify(updated));
        alert("Đã xóa bài viết!");
        navigate("/posts");
    };

    // Thêm bình luận
    const handleAddComment = (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        const newCmt = {
            user: {
                id: user?.id || Date.now(),
                name: user?.profile?.fullName || "Người dùng ẩn danh",
                avatar: user?.profile?.image || user?.avatar || defaultAvatar,
            },
            text: newComment.trim(),
            date: new Date().toLocaleString("sv-SE"),   // new Date().toISOString() luôn trả về UTC.
        };

        const updatedPosts = [...posts];
        updatedPosts[postIndex] = {
            ...post,
            comments: [...(post.comments || []), newCmt],
        };

        setPosts(updatedPosts);
        localStorage.setItem("posts", JSON.stringify(updatedPosts));
        setNewComment("");
    };

    // Xóa bình luận
    const handleDeleteComment = (index) => {
        const updatedComments = post.comments.filter((_, i) => i !== index);

        const updatedPosts = [...posts];
        updatedPosts[postIndex] = {
            ...post,
            comments: updatedComments,
        };

        setPosts(updatedPosts);
        localStorage.setItem("posts", JSON.stringify(updatedPosts));
    };

    // Sửa bài viết (lưu)
    const handleSaveEdit = () => {
        const updatedPosts = [...posts];
        updatedPosts[postIndex] = {
            ...post,
            content: editedContent,
            images: newImages.length > 0 ? newImages : post.images || [], // nếu có ảnh mới thì thay thế 
        };
        setPosts(updatedPosts);
        localStorage.setItem("posts", JSON.stringify(updatedPosts));
        setIsEditing(false);
    };

    // Upload ảnh mới
    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const urls = files.map((file) => URL.createObjectURL(file));
        setNewImages(urls); // set chứ không nối thêm
    };

    return (
        <div className="container my-4" style={{ maxWidth: "700px" }}>
            <div className="card shadow p-3">
                {/* Thông tin tác giả */}
                <div className="d-flex align-items-center mb-3">
                    <img
                        src={post.author?.avatar || defaultAvatar}
                        alt="avatar"
                        className="rounded-circle me-2"
                        style={{ width: "50px", height: "50px", objectFit: "cover" }}
                    />
                    <div>
                        <h6 className="mb-0">{post.author?.name}</h6>
                        <small className="text-muted">Ngày đăng: {formatDate(post.date)}</small>
                    </div>
                </div>

                {/* Nội dung bài viết */}
                <h4>{post.jobTitle}</h4>
                <p className="text-muted">{post.company}</p>

                {isEditing ? (
                    <>
                        <textarea
                            className="form-control mb-2"
                            rows={4}
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                        />
                        <input
                            type="file"
                            multiple
                            className="form-control mb-2"
                            onChange={handleImageUpload}
                        />
                        <div className="d-flex gap-2">
                            <button
                                className="btn btn-success px-4 shadow-sm"
                                onClick={handleSaveEdit}
                            >
                                Lưu
                            </button>
                            <button
                                className="btn btn-outline-secondary px-4  shadow-sm"
                                onClick={() => setIsEditing(false)}
                            >
                                Hủy
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <p>{post.content}</p>
                        {post.images?.length > 0 && (
                            <div className="mb-3">
                                {post.images.map((img, idx) => (
                                    <img
                                        key={idx}
                                        src={img}
                                        alt="post"
                                        className="img-fluid rounded mb-2"
                                        style={{
                                            maxHeight: "300px",
                                            width: "100%",
                                            objectFit: "cover",
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                        {isAuthor && (
                            <div className="d-flex gap-2">
                                <button className="btn btn-warning" onClick={() => setIsEditing(true)}>
                                    Sửa
                                </button>
                                <button className="btn btn-danger" onClick={handleDelete}>
                                    Xóa
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Comments */}
            <div className="comments-section mt-4">
                <h5>Bình luận</h5>
                {post.comments && post.comments.length > 0 ? (
                    post.comments.map((cmt, index) => (
                        <CommentItem
                            key={index}
                            cmt={{ ...cmt, date: formatDate(cmt.date) }}
                            user={user}
                            index={index}
                            onDelete={handleDeleteComment}
                        />
                    ))
                ) : (
                    <p>Chưa có bình luận nào.</p>
                )}

                {/* Form nhập bình luận */}
                <form onSubmit={handleAddComment} className="comment-form d-flex mt-2">
                    <input
                        type="text"
                        className="form-control me-2"
                        placeholder="Viết bình luận..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary">
                        Gửi
                    </button>
                </form>
            </div>
        </div>
    );
}
