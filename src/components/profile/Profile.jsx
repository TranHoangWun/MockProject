import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function Profile() {
  const { user, login } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(user?.profile || {});
  const [showChangePass, setShowChangePass] = useState(false);

  // State đổi mật khẩu
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  if (!user) return <p>Vui lòng đăng nhập để xem thông tin cá nhân.</p>;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setForm({ ...form, image: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    // Kiểm tra đổi mật khẩu
    if (showChangePass) {
      if (currentPassword !== user.password) {
        setError("Mật khẩu hiện tại không đúng!");
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("Mật khẩu xác nhận không khớp!");
        return;
      }
    }

    // Lưu thay đổi
    login({
      ...user,
      profile: form,
      password: showChangePass && newPassword ? newPassword : user.password,
    });

    // Reset state
    setEditing(false);
    setShowChangePass(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
  };

  // Nhãn tiếng Việt
  const fieldLabels = {
    fullName: "Họ và tên",
    phone: "Số điện thoại",
    school: "Trường học",
    address: "Địa chỉ",
    email: "Email",
    companyName: "Tên công ty",
  };

  // Field theo role
  const studentFields = ["fullName", "phone", "school", "address", "email"];
  const employerFields = ["companyName", "phone", "address", "email"];
  const fieldsToRender = user.role === "student" ? studentFields : employerFields;

  return (
    <div className="container mt-4">
      <h2>
        Thông tin cá nhân (
        {user.role === "student" ? "Sinh viên" : "Nhà tuyển dụng"})
      </h2>

      {!editing ? (
        <>
          {form.image && (
            <img
              src={form.image}
              alt="avatar"
              className="rounded-circle mb-3"
              style={{ width: 100, height: 100, objectFit: "cover" }}
            />
          )}
          <ul className="list-group col-lg-6">
            {fieldsToRender.map((key) => (
              <li key={key} className="list-group-item">
                <strong>{fieldLabels[key]}:</strong> {form[key]}
              </li>
            ))}
          </ul>
          <button
            className="btn btn-primary mt-3"
            onClick={() => setEditing(true)}
          >
            Chỉnh sửa
          </button>
        </>
      ) : (
        <div className="col-lg-6">
          <div className="mb-3">
            <label className="form-label">Avatar</label>
            <input
              type="file"
              className="form-control"
              onChange={handleImageChange}
            />
            {form.image && (
              <img
                src={form.image}
                alt="avatar"
                className="rounded-circle mt-2"
                style={{ width: 100, height: 100, objectFit: "cover" }}
              />
            )}
          </div>

          {fieldsToRender.map((key) => (
            <div key={key} className="mb-3">
              <label className="form-label">{fieldLabels[key]}</label>
              <input
                type="text"
                className="form-control"
                name={key}
                value={form[key] || ""}
                onChange={handleChange}
              />
            </div>
          ))}

          <hr />
          {!showChangePass ? (
            <button
              className="btn btn-warning mb-3"
              onClick={() => setShowChangePass(true)}
            >
              Đổi mật khẩu
            </button>
          ) : (
            <>
              <h5 className="mb-3">Đổi mật khẩu</h5>
              <div className="mb-3">
                <label className="form-label">Mật khẩu hiện tại</label>
                <input
                  type="password"
                  className="form-control"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>

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

              {/* Các nút căn ngang hàng */}
              <div className="d-flex gap-2">
                <button className="btn btn-success" onClick={handleSave}>
                  Lưu
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setEditing(false);
                    setError("");
                    setShowChangePass(false);
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                >
                  Hủy
                </button>
              </div>
            </>
          )}

          {!showChangePass && (
            <div className="d-flex gap-2">
              <button className="btn btn-success" onClick={handleSave}>
                Lưu
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setEditing(false);
                  setError("");
                  setShowChangePass(false);
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
              >
                Hủy
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
