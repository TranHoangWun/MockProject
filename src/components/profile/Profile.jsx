import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function Profile() {
  const { user, login } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(user?.profile || {});
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  if (!user) return <p>Vui lòng đăng nhập để xem thông tin cá nhân.</p>;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setForm({ ...form, image: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (newPassword && newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }

    // Tạm thời sử dụng login để cập nhật dữ liệu giả lập, real thì cần yêu cầu API đến server
    login({
      ...user,
      profile: form,
      password: newPassword || user.password,
    });

    setEditing(false);
    setNewPassword("");
    setConfirmPassword("");
    setError("");
  };

  return (
    <div className="container mt-4">
      <h2>Thông tin cá nhân ({user.role})</h2>

      {!editing ? (
        <>
          {/* Chỉ hiển thị avatar khi ở chế độ xem */}
          {form.image && (
            <img
              src={form.image}
              alt="avatar"
              className="rounded-circle mb-3"
              style={{ width: 80, height: 80 }}
            />
          )}
          <ul className="list-group col-lg-6 ">
            {Object.entries(form).map(([key, value]) => key !== "image" && (
              <li key={key} className="list-group-item">
                <strong>{key}:</strong> {value}
              </li>
            ))}
          </ul>
          <button className="btn btn-primary mt-3" onClick={() => setEditing(true)}>
            Chỉnh sửa
          </button>
        </>
      ) : (
        <>
          <div className="mb-3">
            <label className="form-label">Avatar</label>
            <input type="file" className="form-control" onChange={handleImageChange} />
            {/* Chỉ hiển thị avatar khi ở chế độ chỉnh sửa */}
            {form.image && (
              <img
                src={form.image}
                alt="avatar"
                className="rounded-circle mt-2"
                style={{ width: 80, height: 80 }}
              />
            )}
          </div>

          <div className="col-lg-6">
            {Object.keys(form).map((key) => key !== "image" && (
              <div key={key} className="mb-3">
                <label className="form-label">{key}</label>
                <input
                  type="text"
                  className="form-control"
                  name={key}
                  value={form[key]}
                  onChange={handleChange}
                />
              </div>
            ))}

            <div className="mb-3">
              <label className="form-label">Mật khẩu mới</label>
              <input
                type="password"
                className="form-control"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Xác nhận mật khẩu</label>
              <input
                type="password"
                className="form-control"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {error && <div className="text-danger mb-2">{error}</div>}

            <button className="btn btn-success" onClick={handleSave}>
              Lưu
            </button>
            <button className="btn btn-secondary ms-2" onClick={() => { setEditing(false); setError(""); }}>
              Hủy
            </button>
          </div>
        </>
      )}
    </div>
  );
}
