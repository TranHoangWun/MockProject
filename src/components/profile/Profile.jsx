import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { updateUser } from "../../services/authService";

export default function Profile() {
  const { user, setUser } = useAuth(); // login -> setUser
  const [editing, setEditing] = useState(false);
  const [showChangePass, setShowChangePass] = useState(false);

  // Chuẩn hóa socialLinks về dạng [{name, url}]
  const normalizeLinks = (links) => {
    if (!links) return [];
    if (!Array.isArray(links)) return [];
    return links
      .map((l) => {
        if (typeof l === "string") return { name: l, url: l };
        if (l && (l.name || l.url)) return { name: l.name || l.url, url: l.url || l.name };
        return null;
      })
      .filter(Boolean);
  };

  const [form, setForm] = useState(() => {
    const base = user?.profile || {};
    return {
      ...base,
      socialLinks: normalizeLinks(base.socialLinks),
    };
  });

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

  // Chỉ dùng cho sinh viên
  const handleCVFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setForm({ ...form, cv: reader.result });
      reader.readAsDataURL(file);
    }
  };

  // CRUD cho social links
  const addLink = () =>
    setForm({
      ...form,
      socialLinks: [...(form.socialLinks || []), { name: "", url: "" }],
    });

  const removeLink = (idx) =>
    setForm({
      ...form,
      socialLinks: (form.socialLinks || []).filter((_, i) => i !== idx),
    });

  const changeLink = (idx, field, value) =>
    setForm({
      ...form,
      socialLinks: (form.socialLinks || []).map((l, i) =>
        i === idx ? { ...l, [field]: value } : l
      ),
    });

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

    const updatedUser = {
      ...user,
      profile: {
        ...form,
        // đảm bảo socialLinks đã chuẩn hóa
        socialLinks: normalizeLinks(form.socialLinks),
      },
      password: showChangePass && newPassword ? newPassword : user.password,
    };

    updateUser(updatedUser); // Lưu localStorage
    setUser(updatedUser); // Update UI ngay

    // reset
    setEditing(false);
    setShowChangePass(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
  };

  const isStudent = user.role === "student";

  return (
    <div className="container mt-4">
      <h2>
        Thông tin cá nhân ({isStudent ? "Sinh viên" : "Nhà tuyển dụng"})
      </h2>

      {!editing ? (
        <>
          {/* Avatar */}
          {form.image && (
            <img
              src={form.image}
              alt="avatar"
              className="rounded-circle mb-3"
              style={{ width: 100, height: 100, objectFit: "cover" }}
            />
          )}

          {/* Thông tin xem */}
          <ul className="list-group col-lg-8">
            {isStudent ? (
              <>
                <li className="list-group-item">
                  <strong>Họ và tên:</strong> {form.fullName}
                </li>
                <li className="list-group-item">
                  <strong>Giới tính:</strong> {form.gender}
                </li>
                <li className="list-group-item">
                  <strong>Ngày sinh:</strong> {form.dob}
                </li>
                <li className="list-group-item">
                  <strong>Số điện thoại:</strong> {form.phone}
                </li>
                <li className="list-group-item">
                  <strong>Trường học:</strong> {form.school}
                </li>
                <li className="list-group-item">
                  <strong>Địa chỉ:</strong> {form.address}
                </li>
                <li className="list-group-item">
                  <strong>Email:</strong> {form.email}
                </li>
              </>
            ) : (
              <>
                <li className="list-group-item">
                  <strong>Tên công ty:</strong> {form.companyName}
                </li>
                <li className="list-group-item">
                  <strong>Số điện thoại:</strong> {form.phone}
                </li>
                <li className="list-group-item">
                  <strong>Địa chỉ:</strong> {form.address}
                </li>
                <li className="list-group-item">
                  <strong>Email:</strong> {form.email}
                </li>
              </>
            )}

            {/* Social links cho cả 2 role */}
            <li className="list-group-item">
              <strong>Mạng xã hội:</strong>
              <div className="mt-2">
                {form.socialLinks && form.socialLinks.length > 0 ? (
                  form.socialLinks.map((l, i) => (
                    <div key={i}>
                      <a
                        href={l.url || l.name}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {l.name || l.url}
                      </a>
                    </div>
                  ))
                ) : (
                  <em>Chưa có</em>
                )}
              </div>
            </li>

            {/* CV chỉ hiển thị cho sinh viên */}
            {isStudent && (
              <li className="list-group-item">
                <strong>CV:</strong>
                <div className="mt-2">
                  {form.cv ? (
                    form.cv.startsWith("data:image") ? (
                      <img
                        src={form.cv}
                        alt="cv"
                        style={{ width: "100%", maxWidth: "320px" }}
                      />
                    ) : (
                      <a href={form.cv} target="_blank" rel="noreferrer">
                        Xem CV
                      </a>
                    )
                  ) : (
                    <em>Chưa có CV</em>
                  )}
                </div>
              </li>
            )}
          </ul>

          <button
            className="btn btn-primary mt-3"
            onClick={() => setEditing(true)}
          >
            Chỉnh sửa
          </button>
        </>
      ) : (
        <div className="col-lg-8">
          {/* Avatar */}
          <div className="mb-3">
            <label className="form-label">Avatar</label>
            <input type="file" className="form-control" onChange={handleImageChange} />
            {form.image && (
              <img
                src={form.image}
                alt="avatar"
                className="rounded-circle mt-2"
                style={{ width: 100, height: 100, objectFit: "cover" }}
              />
            )}
          </div>

          {/* Form theo role */}
          {isStudent ? (
            <>
              <div className="mb-3">
                <label className="form-label">Họ và tên</label>
                <input
                  type="text"
                  className="form-control"
                  name="fullName"
                  value={form.fullName || ""}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Giới tính</label>
                <select
                  className="form-select"
                  name="gender"
                  value={form.gender || ""}
                  onChange={handleChange}
                >
                  <option value="">-- Chọn --</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Ngày sinh</label>
                <input
                  type="date"
                  className="form-control"
                  name="dob"
                  value={form.dob || ""}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Số điện thoại</label>
                <input
                  type="text"
                  className="form-control"
                  name="phone"
                  value={form.phone || ""}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Trường học</label>
                <input
                  type="text"
                  className="form-control"
                  name="school"
                  value={form.school || ""}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Địa chỉ</label>
                <input
                  type="text"
                  className="form-control"
                  name="address"
                  value={form.address || ""}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={form.email || ""}
                  onChange={handleChange}
                />
              </div>
            </>
          ) : (
            <>
              <div className="mb-3">
                <label className="form-label">Tên công ty</label>
                <input
                  type="text"
                  className="form-control"
                  name="companyName"
                  value={form.companyName || ""}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Số điện thoại</label>
                <input
                  type="text"
                  className="form-control"
                  name="phone"
                  value={form.phone || ""}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Địa chỉ</label>
                <input
                  type="text"
                  className="form-control"
                  name="address"
                  value={form.address || ""}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={form.email || ""}
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          {/* Social links cho cả 2 role */}
          <div className="mb-3">
            <label className="form-label">Mạng xã hội</label>
            {(form.socialLinks || []).map((l, idx) => (
              <div key={idx} className="row g-2 align-items-center mb-2">
                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Tên (VD: LinkedIn)"
                    value={l.name || ""}
                    onChange={(e) => changeLink(idx, "name", e.target.value)}
                  />
                </div>
                <div className="col-md-7">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="URL (https://...)"
                    value={l.url || ""}
                    onChange={(e) => changeLink(idx, "url", e.target.value)}
                  />
                </div>
                <div className="col-md-1 d-grid">
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={() => removeLink(idx)}
                    title="Xóa"
                  >
                    &times;
                  </button>
                </div>
              </div>
            ))}
            <button type="button" className="btn btn-outline-primary" onClick={addLink}>
              + Thêm liên kết
            </button>
          </div>

          {/* CV chỉ cho sinh viên */}
          {isStudent && (
            <div className="mb-3">
              <label className="form-label">CV</label>
              <input
                type="file"
                className="form-control mb-2"
                onChange={handleCVFileChange}
              />
              <input
                type="text"
                className="form-control"
                placeholder="Hoặc nhập link Google Drive/Dropbox"
                value={form.cv || ""}
                onChange={(e) => setForm({ ...form, cv: e.target.value })}
              />
              {form.cv &&
                (form.cv.startsWith?.("data:image") ? (
                  <img
                    src={form.cv}
                    alt="cv"
                    className="mt-2"
                    style={{ width: "100%", maxWidth: "320px" }}
                  />
                ) : (
                  <a href={form.cv} target="_blank" rel="noreferrer" className="d-inline-block mt-2">
                    Xem CV
                  </a>
                ))}
            </div>
          )}

          <hr />

          {/* Đổi mật khẩu */}
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
            </>
          )}

          {/* Buttons */}
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
                // reset form về profile hiện tại nếu cần
                setForm({
                  ...(user.profile || {}),
                  socialLinks: normalizeLinks(user.profile?.socialLinks),
                });
              }}
            >
              Hủy
            </button>
          </div>
        </div>
      )}


    </div>
  );
}
