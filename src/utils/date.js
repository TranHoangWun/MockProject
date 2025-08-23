export function formatDate(dateString) {
  if (!dateString) return "";

  // Nếu có khoảng trắng thay bằng "T"
  let fixedDate = dateString.replace(" ", "T");

  const d = new Date(fixedDate);
  if (isNaN(d)) return dateString; // fallback: trả lại chuỗi gốc

  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
