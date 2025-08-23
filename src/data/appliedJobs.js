// data/appliedJobs.js
const appliedJobs = [
    {
        userId: 1,
        jobId: 1,
        appliedAt: "2025-08-18T08:30:00Z",
        status: "Đã gửi" // mới ứng tuyển (chờ kết quả) applied
    },
    {
        userId: 2,
        jobId: 2,
        appliedAt: "2025-08-19T09:45:00Z",
        status: "Chấp nhận" //  accepted
    },
    {
        userId: 3,
        jobId: 1,
        appliedAt: "2025-08-20T10:15:00Z",
        status: "Chấp nhận" // được nhận
    },
    {
        userId: 1,
        jobId: 3,
        appliedAt: "2025-08-21T14:00:00Z",
        status: "Từ chối" // bị từ chối rejected
    },
    {
        userId: 1,
        jobId: 9,
        appliedAt: "2025-08-21T14:00:00Z",
        status: "Chấp nhận" // 
    },
    {
        userId: 5,
        jobId: 9,
        appliedAt: "2025-08-22T11:20:00Z",
        status: "Đã gửi" // mới ứng tuyển (chờ kết quả)
    },
    {
        userId: 4,
        jobId: 4,
        appliedAt: "2025-08-23T16:45:00Z",
        status: "Đã gửi" // mới ứng tuyển (chờ kết quả)
    },
    {
        userId: 4,
        jobId: 1,
        appliedAt: "2025-08-20T16:45:00Z",
        status: "Từ chối"
    },
    {
        userId: 7,
        jobId: 1,
        appliedAt: "2025-07-14T11:20:00Z",
        status: "Chấp nhận"
    },
];

// Lọc danh sách ứng tuyển theo userId
export function getUserAppliedJobs(userId) {
    return appliedJobs.filter(job => job.userId === userId);
}

// Lọc danh sách user ứng tuyển theo jobId
export function getJobApplicants(jobId) {
    return appliedJobs.filter(job => job.jobId === jobId);
}

// Cập nhật trạng thái đơn ứng tuyển (employer thao tác)
export function updateJobStatus(userId, jobId, newStatus) {
    const job = appliedJobs.find(
        (j) => j.userId === userId && j.jobId === jobId
    );
    if (job) {
        job.status = newStatus; // chỉ được set "accepted" hoặc "rejected"
        return job;
    }
    return null;
}

// Xóa đơn ứng tuyển (ứng viên hủy ứng tuyển)
export function removeAppliedJob(userId, jobId) {
    const index = appliedJobs.findIndex(
        (j) => j.userId === userId && j.jobId === jobId
    );
    if (index !== -1) {
        return appliedJobs.splice(index, 1)[0];
    }
    return null;
}

export default appliedJobs;
