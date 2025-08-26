import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './EmployerPostJob.css';

const EmployerPostJob = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    jobTitle: '',
    jobCategory: '',
    employmentType: 'full-time',
    location: '',
    district: '',
    salary: '',
    salaryRange: '',
    deadline: '',
    description: '',
    requirements: '',
  });

  // State cho Google Maps preview
  const [mapUrl, setMapUrl] = useState('');

  // Thông tin liên hệ của nhà tuyển dụng - không hiển thị trong form nhưng sẽ được dùng khi submit
  const [contactInfo, setContactInfo] = useState({
    contactEmail: '',
    contactPhone: '',
    contactAddress: ''
  });

  const [errors, setErrors] = useState({});

  // Load employer profile when component mounts
  useEffect(() => {
    if (user && user.id) {
      try {
        const profiles = JSON.parse(localStorage.getItem('employerProfiles') || '{}');
        const employerId = parseInt(user.id);
        const profile = profiles[employerId];
        
        // Lấy thông tin liên hệ từ profile và lưu vào state
        if (profile) {
          setContactInfo({
            contactEmail: profile.contactEmail || user.profile?.email || '',
            contactPhone: profile.contactPhone || user.profile?.phone || '',
            contactAddress: profile.address || user.profile?.address || ''
          });
        } else if (user.profile) {
          setContactInfo({
            contactEmail: user.profile.email || '',
            contactPhone: user.profile.phone || '',
            contactAddress: user.profile.address || ''
          });
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin nhà tuyển dụng:", error);
      }
    }
  }, [user]);

  // Cập nhật Google Maps URL khi thay đổi địa chỉ hoặc khu vực
  useEffect(() => {
    if (formData.location || formData.district) {
      const searchQuery = `${formData.location ? formData.location + ', ' : ''}${formData.district || 'Thừa Thiên Huế'}`;
      setMapUrl(`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodeURIComponent(searchQuery)}`);
    }
  }, [formData.location, formData.district]);

  const jobCategories = [
    "Marketing",
    "Công nghệ thông tin",
    "Kinh doanh / Bán hàng",
    "Dịch vụ",
    "Nhà hàng / Khách sạn",
    "Giáo dục / Đào tạo",
    "Giao hàng / Vận chuyển",
    "Y tế / Chăm sóc sức khỏe",
    "Khác"
  ];

  const districts = [
    "TP. Huế",
    "Huyện Phong Điền",
    "Huyện Quảng Điền", 
    "Huyện Phú Lộc",
    "Huyện Phú Vang",
    "Huyện A Lưới",
    "Huyện Nam Đông",
    "Thị xã Hương Thủy",
    "Thị xã Hương Trà"
  ];

  const employmentTypes = [
    { value: "full-time", label: "Toàn thời gian" },
    { value: "part-time", label: "Bán thời gian" },
    { value: "internship", label: "Thực tập" },
    { value: "remote", label: "Làm từ xa" },
    { value: "contract", label: "Theo hợp đồng" }
  ];

  const salaryOptions = [
    { value: "negotiable", label: "Thỏa thuận" },
    { value: "3-5", label: "3-5 triệu/tháng" },
    { value: "5-7", label: "5-7 triệu/tháng" },
    { value: "7-10", label: "7-10 triệu/tháng" },
    { value: "10-15", label: "10-15 triệu/tháng" },
    { value: "15-20", label: "15-20 triệu/tháng" },
    { value: "20+", label: "Trên 20 triệu/tháng" }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate required fields
    if (!formData.jobTitle.trim()) newErrors.jobTitle = "Vui lòng nhập vị trí tuyển dụng";
    if (!formData.jobCategory) newErrors.jobCategory = "Vui lòng chọn ngành nghề";
    if (!formData.employmentType) newErrors.employmentType = "Vui lòng chọn hình thức làm việc";
    if (!formData.salaryRange) newErrors.salaryRange = "Vui lòng chọn mức lương";
    if (!formData.location.trim()) newErrors.location = "Vui lòng nhập địa điểm làm việc";
    if (!formData.district) newErrors.district = "Vui lòng chọn quận/huyện";
    if (!formData.description.trim()) newErrors.description = "Vui lòng nhập mô tả công việc";
    if (!formData.requirements.trim()) newErrors.requirements = "Vui lòng nhập yêu cầu công việc";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      window.scrollTo(0, 0);
      return;
    }
    
    // Get current date in DD/MM/YYYY format
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;
    
    // Validate user and get correct employer ID
    if (!user || !user.id) {
      alert('Vui lòng đăng nhập lại để đăng tin!');
      navigate('/login');
      return;
    }
    
    // Make sure employerId is a number and consistently stored
    const employerId = parseInt(user.id);

    // Get employer info from profile
    let companyName = "Nhà tuyển dụng";
    let companyLogo = null;
    
    try {
      const profiles = JSON.parse(localStorage.getItem('employerProfiles') || '{}');
      if (profiles[employerId]) {
        companyName = profiles[employerId].companyName || user.profile?.companyName || "Nhà tuyển dụng";
        companyLogo = profiles[employerId].profileImage;
      } else if (user.profile) {
        companyName = user.profile.companyName || "Nhà tuyển dụng";
        companyLogo = user.profile.image;
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin công ty:", error);
    }
    
    // Create job posting with contact info from profile
    const jobPosting = {
      ...formData,
      id: Date.now(),
      title: formData.jobTitle, // Add title field for consistency
      date: formattedDate,
      publication_date: formattedDate, // Add publication_date for consistency 
      status: 'Đang đăng',
      applicants: 0,
      employerId: employerId,
      companyName: companyName,
      companyLogo: companyLogo,
      // Tự động gán thông tin liên hệ từ profile
      contactEmail: contactInfo.contactEmail,
      contactPhone: contactInfo.contactPhone,
      contactAddress: contactInfo.contactAddress
    };
    
    console.log("Creating new job posting:", jobPosting);
    
    // Save to localStorage
    try {
      const existingJobs = JSON.parse(localStorage.getItem('employerJobs') || '[]');
      existingJobs.unshift(jobPosting); // Sắp xếp tin mới nhất lên đầu
      localStorage.setItem('employerJobs', JSON.stringify(existingJobs));
      
      // Force data reload in student view by updating a timestamp
      localStorage.setItem('jobsLastUpdated', Date.now().toString());
      
      alert('Đăng tin thành công!');
      navigate('/employer');
    } catch (error) {
      console.error("Lỗi khi lưu tin tuyển dụng:", error);
      alert('Có lỗi xảy ra khi đăng tin!');
    }
  };

  const handleCancel = () => {
    navigate('/employer');
  };

  return (
    <div className="post-job-container">
      <div className="post-job-header">
        <h2 className="post-job-title">Đăng tin tuyển dụng</h2>
      </div>
      
      <form onSubmit={handleSubmit}>
        {/* Thông tin đăng việc */}
        <div className="form-section">
          <h3 className="section-title">Thông tin đăng việc</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="jobCategory">Ngành nghề <span className="required">*</span></label>
              <select 
                id="jobCategory" 
                name="jobCategory" 
                value={formData.jobCategory} 
                onChange={handleChange} 
                className={errors.jobCategory ? "error" : ""}
              >
                <option value="">-- Chọn ngành nghề --</option>
                {jobCategories.map((category, index) => (
                  <option key={index} value={category.toLowerCase()}>{category}</option>
                ))}
              </select>
              {errors.jobCategory && <div className="error-message">{errors.jobCategory}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="jobTitle">Vị trí tuyển <span className="required">*</span></label>
              <input 
                type="text" 
                id="jobTitle" 
                name="jobTitle" 
                placeholder="Ví dụ: Nhân viên marketing" 
                value={formData.jobTitle}
                onChange={handleChange}
                className={errors.jobTitle ? "error" : ""}
              />
              {errors.jobTitle && <div className="error-message">{errors.jobTitle}</div>}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="employmentType">Hình thức làm việc <span className="required">*</span></label>
              <select
                id="employmentType"
                name="employmentType"
                value={formData.employmentType}
                onChange={handleChange}
                className={errors.employmentType ? "error" : ""}
              >
                {employmentTypes.map((type, index) => (
                  <option key={index} value={type.value}>{type.label}</option>
                ))}
              </select>
              {errors.employmentType && <div className="error-message">{errors.employmentType}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="salaryRange">Mức lương <span className="required">*</span></label>
              <select
                id="salaryRange"
                name="salaryRange"
                value={formData.salaryRange}
                onChange={handleChange}
                className={errors.salaryRange ? "error" : ""}
              >
                <option value="">-- Chọn mức lương --</option>
                {salaryOptions.map((option, index) => (
                  <option key={index} value={option.value}>{option.label}</option>
                ))}
              </select>
              {errors.salaryRange && <div className="error-message">{errors.salaryRange}</div>}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="district">Khu vực <span className="required">*</span></label>
              <select
                id="district"
                name="district"
                value={formData.district}
                onChange={handleChange}
                className={errors.district ? "error" : ""}
              >
                <option value="">-- Chọn khu vực --</option>
                {districts.map((district, index) => (
                  <option key={index} value={district}>{district}</option>
                ))}
              </select>
              {errors.district && <div className="error-message">{errors.district}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="location">Địa chỉ làm việc <span className="required">*</span></label>
              <input 
                type="text" 
                id="location" 
                name="location" 
                placeholder="Nhập địa chỉ cụ thể"
                value={formData.location}
                onChange={handleChange}
                className={errors.location ? "error" : ""}
              />
              {errors.location && <div className="error-message">{errors.location}</div>}
            </div>
          </div>
          
          {/* Xem trước Google Maps */}
          <div className="form-row">
            <div className="form-group full-width">
              <label>Xem trước vị trí trên bản đồ</label>
              <div className="map-preview">
                {(formData.location || formData.district) ? (
                  <iframe
                    width="100%"
                    height="300"
                    frameBorder="0"
                    src={`https://www.google.com/maps?q=${encodeURIComponent(
                      (formData.location ? formData.location + ', ' : '') + 
                      (formData.district || 'Thừa Thiên Huế')
                    )}&output=embed`}
                    allowFullScreen
                    title="Google Maps Preview"
                  ></iframe>
                ) : (
                  <div className="map-placeholder">
                    Nhập địa chỉ và khu vực để xem trên bản đồ
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="deadline">Hạn nộp hồ sơ</label>
              <input 
                type="date" 
                id="deadline" 
                name="deadline" 
                value={formData.deadline}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Mô tả công việc */}
        <div className="form-section">
          <h3 className="section-title">Mô tả công việc</h3>
          <div className="form-row">
            <div className="form-group full-width">
              <textarea 
                id="description" 
                name="description"
                placeholder="Mô tả chi tiết về công việc, trách nhiệm, yêu cầu..." 
                value={formData.description}
                onChange={handleChange}
                rows={8}
                className={errors.description ? "error" : ""}
              ></textarea>
              {errors.description && <div className="error-message">{errors.description}</div>}
            </div>
          </div>
        </div>

        {/* Yêu cầu công việc */}
        <div className="form-section">
          <h3 className="section-title">Yêu cầu công việc</h3>
          <div className="form-row">
            <div className="form-group full-width">
              <textarea 
                id="requirements" 
                name="requirements"
                placeholder="Các yêu cầu về kinh nghiệm, bằng cấp, kỹ năng..." 
                value={formData.requirements}
                onChange={handleChange}
                rows={6}
                className={errors.requirements ? "error" : ""}
              ></textarea>
              {errors.requirements && <div className="error-message">{errors.requirements}</div>}
            </div>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={handleCancel}>Quay lại</button>
          <button type="submit" className="btn-submit">Đăng tin</button>
        </div>
      </form>
    </div>
  );
};

export default EmployerPostJob;
