/**
 * Utility functions for job and application management
 */

/**
 * Check if a job should be displayed (not deleted and has valid employer)
 * @param {Object} job - The job to check
 * @returns {boolean} - Whether the job should be displayed
 */
export function isJobActive(job) {
  try {
    if (!job || !job.id) return false;
    
    // Check if job is in deletedJobs list
    const deletedJobs = JSON.parse(localStorage.getItem('deletedJobs') || '[]');
    if (deletedJobs.some(deletedJob => deletedJob.id === job.id)) {
      return false;
    }
    
    // Check if job has been marked as permanently deleted
    if (localStorage.getItem(`job_${job.id}_permanently_deleted`) === 'true') {
      return false;
    }
    
    // Check if employer exists and is active
    if (job.employerId) {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const employer = users.find(u => u.id === parseInt(job.employerId));
      if (!employer || employer.isLocked) {
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error checking job status:", error);
    return false;
  }
}

/**
 * Clean up applications for deleted jobs
 * @returns {Object} - Statistics about cleaned up applications
 */
export function cleanupDeletedJobApplications() {
  try {
    // Get all job IDs that shouldn't be displayed
    const deletedJobIds = new Set();
    
    // Add jobs from deletedJobs list
    const deletedJobs = JSON.parse(localStorage.getItem('deletedJobs') || '[]');
    deletedJobs.forEach(job => deletedJobIds.add(job.id));
    
    // Add jobs marked as permanently deleted
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('job_') && key.endsWith('_permanently_deleted')) {
        const jobId = parseInt(key.replace('job_', '').replace('_permanently_deleted', ''));
        if (!isNaN(jobId)) {
          deletedJobIds.add(jobId);
        }
      }
    }
    
    // Clean up saved jobs
    const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
    const validSavedJobs = savedJobs.filter(item => !deletedJobIds.has(item.jobId));
    localStorage.setItem('savedJobs', JSON.stringify(validSavedJobs));
    
    // Clean up applied jobs
    const appliedJobs = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
    const validAppliedJobs = appliedJobs.filter(item => !deletedJobIds.has(item.jobId));
    localStorage.setItem('appliedJobs', JSON.stringify(validAppliedJobs));
    
    return {
      savedJobs: {
        before: savedJobs.length,
        after: validSavedJobs.length,
        removed: savedJobs.length - validSavedJobs.length
      },
      appliedJobs: {
        before: appliedJobs.length,
        after: validAppliedJobs.length,
        removed: appliedJobs.length - validAppliedJobs.length
      }
    };
  } catch (error) {
    console.error("Error cleaning up applications for deleted jobs:", error);
    return { error: error.message };
  }
}

/**
 * Cancel a job application
 * @param {number} userId - The user ID
 * @param {number} jobId - The job ID 
 * @returns {Object} - Result of the operation
 */
export function cancelJobApplication(userId, jobId) {
  try {
    // Get applied jobs
    const appliedJobs = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
    
    // Filter out this specific application
    const updatedAppliedJobs = appliedJobs.filter(
      app => !(app.userId === userId && app.jobId === jobId)
    );
    
    // If no changes were made, the application wasn't found
    if (updatedAppliedJobs.length === appliedJobs.length) {
      return { success: false, message: "Không tìm thấy đơn ứng tuyển" };
    }
    
    // Save updated list
    localStorage.setItem('appliedJobs', JSON.stringify(updatedAppliedJobs));
    
    // Update job applicant count
    decreaseJobApplicantCount(jobId);
    
    return { 
      success: true, 
      message: "Đã hủy đơn ứng tuyển thành công" 
    };
  } catch (error) {
    console.error("Error canceling job application:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Decrease the applicant count for a job
 * @param {number} jobId - The job ID
 */
function decreaseJobApplicantCount(jobId) {
  try {
    const allJobs = JSON.parse(localStorage.getItem('employerJobs') || '[]');
    const jobIndex = allJobs.findIndex(job => job.id === jobId);
    
    if (jobIndex !== -1 && allJobs[jobIndex].applicants > 0) {
      allJobs[jobIndex].applicants -= 1;
      localStorage.setItem('employerJobs', JSON.stringify(allJobs));
    }
  } catch (error) {
    console.error("Error decreasing job applicant count:", error);
  }
}

/**
 * Completely clean up all job data related to deleted employers
 * @returns {Object} - Statistics about cleaned data
 */
export function completeJobDataCleanup() {
  try {
    // Get active employer IDs
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const activeEmployerIds = users
      .filter(u => u.role === 'employer' && !u.isLocked)
      .map(u => u.id);
    
    console.log(`Found ${activeEmployerIds.length} active employers`);
    
    // Step 1: Clean employerJobs - remove jobs from inactive employers
    let employerJobs = JSON.parse(localStorage.getItem('employerJobs') || '[]');
    const validEmployerJobs = employerJobs.filter(job => 
      job && job.employerId && activeEmployerIds.includes(parseInt(job.employerId))
    );
    
    // Step 2: Move jobs from deleted employers to deletedJobs
    const orphanedJobs = employerJobs.filter(job => 
      job && job.employerId && !activeEmployerIds.includes(parseInt(job.employerId))
    );
    
    if (orphanedJobs.length > 0) {
      console.log(`Found ${orphanedJobs.length} jobs from deleted employers`);
      
      // Add these to deleted jobs
      let deletedJobs = JSON.parse(localStorage.getItem('deletedJobs') || '[]');
      const now = new Date().toLocaleDateString('vi-VN');
      
      orphanedJobs.forEach(job => {
        // Check if this job isn't already in deletedJobs
        if (!deletedJobs.some(dJob => dJob.id === job.id)) {
          deletedJobs.push({
            ...job,
            deletedAt: now,
            reason: "Tài khoản nhà tuyển dụng đã bị xóa",
            deletedBy: "system"
          });
        }
      });
      
      // Save updated deleted jobs
      localStorage.setItem('deletedJobs', JSON.stringify(deletedJobs));
    }
    
    // Save updated employer jobs
    localStorage.setItem('employerJobs', JSON.stringify(validEmployerJobs));
    
    // Step 3: Mark the removed jobs as permanently deleted
    // This ensures hardcoded jobs with the same IDs won't reappear
    const invalidJobIds = employerJobs
      .filter(job => job && job.employerId && !activeEmployerIds.includes(parseInt(job.employerId)))
      .map(job => job.id);
    
    invalidJobIds.forEach(jobId => {
      localStorage.setItem(`job_${jobId}_permanently_deleted`, 'true');
    });
    
    // Step 4: Clean up saved and applied jobs that reference deleted jobs
    cleanupDeletedJobApplications();
    
    return {
      validJobs: validEmployerJobs.length,
      removedJobs: orphanedJobs.length,
      markedIds: invalidJobIds.length
    };
  } catch (error) {
    console.error("Error in complete job data cleanup:", error);
    return { error: error.message };
  }
}

/**
 * Clean up static jobs from jobs.js that don't have valid employers
 * @param {Array} staticJobs - The array of static jobs from jobs.js
 * @returns {Array} - Filtered array of valid jobs
 */
export function filterInvalidStaticJobs(staticJobs) {
  try {
    // Get active employer IDs
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const activeEmployerIds = users
      .filter(u => u.role === 'employer' && !u.isLocked)
      .map(u => u.id);
    
    // Also check for permanently deleted job markers
    return staticJobs.filter(job => {
      // Skip jobs marked as permanently deleted
      if (localStorage.getItem(`job_${job.id}_permanently_deleted`) === 'true') {
        return false;
      }
      
      // Skip jobs with invalid employers
      if (job.employerId && !activeEmployerIds.includes(parseInt(job.employerId))) {
        return false;
      }
      
      return true;
    });
  } catch (error) {
    console.error("Error filtering static jobs:", error);
    return staticJobs; // Return original array in case of error
  }
}
