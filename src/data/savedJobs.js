// data/savedJobs.js
const savedJobs = [
    {
        userId: 1,
        jobId: 1,
        savedAt: "2025-08-18T08:00:00Z"
    },
    //  user 2 cũng lưu job 1
    {
        userId: 2,
        jobId: 1,
        savedAt: "2025-08-18T09:15:00Z"
    },
    // user 1 lưu thêm job 2
    {
        userId: 1,
        jobId: 2,
        savedAt: "2025-08-19T07:30:00Z"
    },
    {
        userId: 5,
        jobId: 9,
        savedAt: "2025-08-18T08:00:00Z"
    },
];

export default savedJobs;
