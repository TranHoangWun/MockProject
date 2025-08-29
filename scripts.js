// Simple script for interactive features

document.addEventListener('DOMContentLoaded', function() {
    // Logout button functionality
    const logoutButton = document.querySelector('.btn-primary');
    if(logoutButton) {
        logoutButton.addEventListener('click', function() {
            if(confirm('Bạn có chắc chắn muốn đăng xuất?')) {
                alert('Đăng xuất thành công!');
                // In a real application, redirect to login page
                // window.location.href = 'login.html';
            }
        });
    }

    // Delete job buttons
    const deleteButtons = document.querySelectorAll('.btn-danger');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const jobRow = this.closest('tr');
            const jobTitle = jobRow.querySelector('td').textContent;
            
            if(confirm(`Bạn có chắc chắn muốn xóa tin tuyển dụng "${jobTitle}"?`)) {
                // In a real application, you would send an AJAX request to delete the job
                // For demo purposes, just hide the row
                jobRow.style.display = 'none';
                alert('Đã xóa tin tuyển dụng!');
            }
        });
    });
    
    // View applicants links
    const viewButtons = document.querySelectorAll('.view-button');
    viewButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const applicantCount = this.textContent.match(/\d+/)[0];
            if(applicantCount > 0) {
                // In a real application, navigate to applicants page
                alert(`Xem danh sách ${applicantCount} ứng viên`);
            } else {
                e.preventDefault();
                alert('Không có ứng viên nào cho tin tuyển dụng này');
            }
        });
    });
});
