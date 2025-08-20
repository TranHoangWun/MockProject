
import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import ttLogo from "../../../assets/images/logo/tt.jpg";

export default function Banner({ keyword, setKeyword, onSearch }) {
  return (
   <div
  className="text-white text-center d-flex align-items-center justify-content-center "
  style={{
    backgroundImage: `url(${ttLogo})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    height: "300px",
  }}
>
  {/*  */}
  <div className="bg-dark bg-opacity-50 p-5 rounded w-75">
    <h3 
      className="fw-medium mb-4 " 
      style={{ letterSpacing: "1px" }}
    >
      Tìm việc làm cho sinh viên Huế
    </h3>

    <div className="input-group w-75 w-md-50 mx-auto">
      <input
        type="text"
        className="form-control"
        placeholder="Nhập từ khóa..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />
      <button className="btn btn-warning" onClick={onSearch}>
        Tìm kiếm
      </button>
    </div>
  </div>
</div>

  );
}

/*import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Banner() {
  return (
    <div
      className="bg-primary text-white text-center p-5"
      style={{ backgroundImage: "url('https://source.unsplash.com/1600x500/?hue,vietnam')", backgroundSize: "cover" }}
    >
      <div className="bg-dark bg-opacity-50 p-5 rounded">
        <h1 className="mb-3">Tìm việc làm cho sinh viên Huế</h1>
        <div className="input-group w-50 mx-auto">
          <input type="text" className="form-control" placeholder="Nhập từ khóa..." />
          <button className="btn btn-warning">Tìm kiếm</button>
        </div>
      </div>
    </div>
  );
}*/