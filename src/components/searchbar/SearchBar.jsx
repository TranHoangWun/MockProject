// src/components/SearchBar.jsx
import React, { useState } from "react";

// Dữ liệu giả lập cho Vị trí và Danh mục
import locations from "data/locations.js";
import categories from "data/categories";

function SearchBar({ keyword, setKeyword, onSearch }) {
  const [selectedLocation, setSelectedLocation] = useState("Tất cả");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [selectedSalary, setSelectedSalary] = useState("Tất cả");
  const [sortOrder, setSortOrder] = useState("default");

  const handleSearch = () => {
    onSearch({
      keyword,
      location: selectedLocation,
      category: selectedCategory,
      salary: selectedSalary,
      sort: sortOrder,
    });
  };

  return (
    <div className="container mt-4 mb-5">
      <div className="row g-2 align-items-center">
        {/* Tìm kiếm chung */}
        <div className="col-lg-3 col-md-6 col-sm-12">
          <input
            type="text"
            className="form-control"
            placeholder="Tìm kiếm công việc..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        {/* Lựa chọn Vị trí */}
        <div className="col-lg-2 col-md-3 col-sm-6">
          <select
            className="form-select"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
          >
            <option disabled>Vị trí</option>
            {locations.map((location, index) => (
              <option key={index} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        {/* Lựa chọn Mức lương */}
        <div className="col-lg-2 col-md-3 col-sm-6">
          <select
            className="form-select"
            value={selectedSalary}
            onChange={(e) => setSelectedSalary(e.target.value)}
          >
            <option disabled>Mức lương</option>
            <option value="Tất cả">Tất cả</option>
            <option value="Dưới 5 triệu">Dưới 5 triệu</option>
            <option value="5 - 10 triệu">5 - 10 triệu</option>
            <option value="10 - 15 triệu">10 - 15 triệu</option>
            <option value="Thỏa thuận">Thỏa thuận</option>
          </select>
        </div>

        {/* Lựa chọn Sắp xếp */}
        <div className="col-lg-2 col-md-3 col-sm-6">
          <select
            className="form-select"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option disabled>Sắp xếp</option>
            <option value="default">Mới nhất</option>
            <option value="salary_asc">Lương thấp đến cao</option>
            <option value="salary_desc">Lương cao đến thấp</option>
            <option value="title_asc">Tên A-Z</option>
            <option value="title_desc">Tên Z-A</option>
          </select>
        </div>

        {/* Lựa chọn Danh mục */}
        <div className="col-lg-2 col-md-3 col-sm-6">
          <select
            className="form-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option disabled>Danh mục</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Nút tìm kiếm */}
        <div className="col-lg-1 col-md-3 col-sm-6">
          <button className="btn btn-primary w-100" onClick={handleSearch}>
            Tìm kiếm
          </button>
        </div>
      </div>
    </div>
  );
}

export default SearchBar;
