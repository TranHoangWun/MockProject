import React, { useState } from "react";

function PostForm({ user, onSubmit }) {
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);

  // chọn ảnh
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => URL.createObjectURL(file));
    setImages((prev) => [...prev, ...newImages]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim() && images.length === 0) return;

    const newPost = {
      id: Date.now(),
      jobTitle: "Bài chia sẻ mới",
      company: "Người dùng",
      author: {
        name: user.name,
        avatar: user.avatar,
      },
      content,
      images,
      comments: [],
      likes: 0,
      date: new Date().toISOString().slice(0, 10),
    };

    onSubmit(newPost);
    setContent("");
    setImages([]);
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 border rounded mb-4">
      <textarea
        className="form-control mb-2"
        placeholder="Chia sẻ trải nghiệm việc làm..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      {/* chọn ảnh */}
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageChange}
        className="form-control mb-2"
      />

      {/* preview ảnh */}
      {images.length > 0 && (
        <div className="d-flex flex-wrap mb-2">
          {images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt="preview"
              className="me-2 mb-2"
              style={{ width: "100px", height: "100px", objectFit: "cover" }}
            />
          ))}
        </div>
      )}

      <button type="submit" className="btn btn-primary">
        Đăng bài
      </button>
    </form>
  );
}

export default PostForm;
