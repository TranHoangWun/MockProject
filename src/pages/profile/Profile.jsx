import React, { useState, useEffect } from 'react';
import { updateUser, getCurrentUser } from '../../services/authService';
import { compressImage, emergencyStorageCleanup } from '../../utils/storageHelper';
import './Profile.css';

const Profile = () => {
  const user = getCurrentUser();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Initialize with user data
    fullName: user?.profile?.fullName || '',
    email: user?.profile?.email || '',
    phone: user?.profile?.phone || '',
    address: user?.profile?.address || '',
    school: user?.profile?.school || '', // For students
    companyName: user?.profile?.companyName || '', // For employers
    image: user?.profile?.image || null,
    cv: user?.profile?.cv || null,
  });

  const handleImageChange = async (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    try {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert("Hình ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 5MB.");
        return;
      }
      
      // Read file as base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          // Compress image before setting in state
          const compressedImage = await compressImage(reader.result, 800, 0.7);
          setFormData(prev => ({ ...prev, image: compressedImage }));
        } catch (error) {
          console.error("Error compressing image:", error);
          // Fall back to uncompressed image
          setFormData(prev => ({ ...prev, image: reader.result }));
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error processing image:", error);
      alert("Có lỗi xảy ra khi xử lý hình ảnh.");
    }
  };

  const handleCVChange = async (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    try {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert("File CV quá lớn. Vui lòng chọn file nhỏ hơn 10MB.");
        return;
      }
      
      // Read file as base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        // If image file, compress it
        if (file.type.startsWith('image/')) {
          try {
            const compressedCV = await compressImage(reader.result, 1200, 0.8);
            setFormData(prev => ({ ...prev, cv: compressedCV }));
          } catch (error) {
            console.error("Error compressing CV image:", error);
            setFormData(prev => ({ ...prev, cv: reader.result }));
          }
        } else {
          // For non-image files, just store directly
          setFormData(prev => ({ ...prev, cv: reader.result }));
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error processing CV:", error);
      alert("Có lỗi xảy ra khi xử lý CV.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Clean up storage before saving to make space
      try {
        const { cleanupStorage } = await import('../../utils/storageHelper');
        cleanupStorage();
      } catch (cleanupError) {
        console.warn("Storage cleanup error:", cleanupError);
      }
      
      // Prepare updated user object
      const updatedUser = {
        ...user,
        profile: {
          ...user.profile,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          image: formData.image,
          cv: formData.cv
        }
      };
      
      // Add fields specific to user role
      if (user.role === 'student') {
        updatedUser.profile.school = formData.school;
      } else if (user.role === 'employer') {
        updatedUser.profile.companyName = formData.companyName;
      }
      
      // Update user
      const result = updateUser(updatedUser);
      
      if (result.success) {
        if (!result.pending) {
          alert("Cập nhật hồ sơ thành công!");
        } else {
          // Handle async result
          console.log("Đang xử lý cập nhật...");
          alert("Đang xử lý cập nhật hồ sơ, vui lòng đợi trong giây lát...");
        }
      } else {
        alert(result.message || "Không thể cập nhật hồ sơ. Vui lòng thử lại sau!");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      
      // Try emergency cleanup if we got a quota error
      if (error.name === 'QuotaExceededError' || error.toString().includes('quota')) {
        try {
          emergencyStorageCleanup();
          alert("Hệ thống đang đầy bộ nhớ. Đã thực hiện dọn dẹp, vui lòng thử lại.");
        } catch (emergencyError) {
          console.error("Emergency cleanup failed:", emergencyError);
        }
      } else {
        alert("Có lỗi xảy ra khi cập nhật hồ sơ. Vui lòng thử lại sau!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <h2>Cập nhật hồ sơ</h2>
      <form onSubmit={handleSubmit}>
        {/* Form fields here */}
        <div className="form-group">
          <label>Họ và tên</label>
          <input 
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            required
          />
        </div>
        
        {/* Add more fields based on user role */}
        
        <div className="form-group">
          <label>Ảnh đại diện</label>
          <input 
            type="file"
            onChange={handleImageChange}
            accept="image/*"
          />
          {formData.image && (
            <div className="image-preview">
              <img src={formData.image} alt="Preview" />
            </div>
          )}
        </div>
        
        {user.role === 'student' && (
          <div className="form-group">
            <label>CV</label>
            <input 
              type="file"
              onChange={handleCVChange}
              accept=".pdf,image/*"
            />
            {formData.cv && formData.cv.startsWith('data:image') && (
              <div className="image-preview">
                <img src={formData.cv} alt="CV Preview" />
              </div>
            )}
          </div>
        )}
        
        <button 
          type="submit" 
          className="submit-button"
          disabled={isLoading}
        >
          {isLoading ? "Đang cập nhật..." : "Cập nhật"}
        </button>
      </form>
    </div>
  );
};

export default Profile;
