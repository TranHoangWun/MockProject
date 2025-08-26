/**
 * Utility to clean up localStorage data when accounts are deleted
 */

/**
 * Utility function to clean up orphaned jobs from deleted employer accounts
 */
export function cleanupOrphanedJobs() {
  try {
    // Get all jobs
    const allJobs = JSON.parse(localStorage.getItem('employerJobs') || '[]');
    const deletedJobs = JSON.parse(localStorage.getItem('deletedJobs') || '[]');
    
    // Get all users
    const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Get all employer IDs
    const employerIds = allUsers
      .filter(user => user.role === 'employer')
      .map(user => user.id);
    
    // Find jobs with employers that don't exist anymore
    const orphanedJobs = allJobs.filter(job => 
      job.employerId && !employerIds.includes(parseInt(job.employerId))
    );
    
    // If we have orphaned jobs, move them to deleted jobs
    if (orphanedJobs.length > 0) {
      console.log(`Found ${orphanedJobs.length} orphaned jobs to clean up.`);
      
      // Remove orphaned jobs from active jobs
      const updatedJobs = allJobs.filter(job => 
        !orphanedJobs.some(orphan => orphan.id === job.id)
      );
      
      // Mark orphaned jobs as deleted and add them to deletedJobs
      const now = new Date().toLocaleDateString('vi-VN');
      
      const updatedDeletedJobs = [
        ...deletedJobs,
        ...orphanedJobs.map(job => ({
          ...job,
          deletedAt: now,
          reason: "Tài khoản nhà tuyển dụng đã bị xóa",
          deletedBy: "system"
        }))
      ];
      
      // Save back to localStorage
      localStorage.setItem('employerJobs', JSON.stringify(updatedJobs));
      localStorage.setItem('deletedJobs', JSON.stringify(updatedDeletedJobs));
      
      return { success: true, removed: orphanedJobs.length };
    }
    
    return { success: true, removed: 0 };
  } catch (error) {
    console.error("Error cleaning up orphaned jobs:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Clean up user posts from deleted accounts
 */
export function cleanupUserPosts() {
  try {
    // Get all active user IDs
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const activeUserIds = users.map(user => user.id.toString());
    
    // Clean up regular user posts collection if it exists
    try {
      const userPosts = JSON.parse(localStorage.getItem('userPosts') || '[]');
      console.log("Before cleanup, userPosts count:", userPosts.length);
      
      const validUserPosts = userPosts.filter(post => {
        const posterUserId = String(post.userId || post.authorId);
        return activeUserIds.includes(posterUserId);
      });
      
      console.log("After cleanup, userPosts count:", validUserPosts.length);
      localStorage.setItem('userPosts', JSON.stringify(validUserPosts));
    } catch (error) {
      console.error("Error cleaning userPosts:", error);
    }
    
    // Clean up posts collection (which appears to be used in the app)
    try {
      const posts = JSON.parse(localStorage.getItem('posts') || '[]');
      console.log("Before cleanup, posts count:", posts.length);
      
      const validPosts = posts.filter(post => {
        // Check both author.id and authorId fields
        const authorId = post.author?.id || post.authorId;
        if (!authorId) return true; // Keep posts without author info
        
        return activeUserIds.includes(String(authorId));
      });
      
      console.log("After cleanup, posts count:", validPosts.length);
      localStorage.setItem('posts', JSON.stringify(validPosts));
    } catch (error) {
      console.error("Error cleaning posts:", error);
    }
    
    return {
      message: "Posts cleanup completed"
    };
  } catch (error) {
    console.error("Error during posts cleanup:", error);
    return { error: error.message };
  }
}

/**
 * Clean up saved and applied jobs for deleted accounts
 */
export function cleanupUserJobInteractions() {
  try {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const activeUserIds = users.map(user => user.id.toString());
    
    // Clean up saved jobs
    const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
    const validSavedJobs = savedJobs.filter(item => 
      activeUserIds.includes(item.userId.toString())
    );
    localStorage.setItem('savedJobs', JSON.stringify(validSavedJobs));
    
    // Clean up applied jobs
    const appliedJobs = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
    const validAppliedJobs = appliedJobs.filter(item => 
      activeUserIds.includes(item.userId.toString())
    );
    localStorage.setItem('appliedJobs', JSON.stringify(validAppliedJobs));
    
    return {
      savedJobs: {
        before: savedJobs.length,
        after: validSavedJobs.length
      },
      appliedJobs: {
        before: appliedJobs.length,
        after: validAppliedJobs.length
      }
    };
  } catch (error) {
    console.error("Error during user job interactions cleanup:", error);
    return { error: error.message };
  }
}

/**
 * Run all cleanup operations
 */
export function runFullCleanup() {
  const jobCleanupResult = cleanupOrphanedJobs();
  const postsCleanupResult = cleanupUserPosts();
  const interactionsCleanupResult = cleanupUserJobInteractions();
  
  return {
    jobs: jobCleanupResult,
    posts: postsCleanupResult,
    interactions: interactionsCleanupResult
  };
}

// Export a default function that can be called when the app initializes
export default function initializeStorageCleanup() {
  // Run cleanup on app initialization
  const results = runFullCleanup();
  console.log("Storage cleanup results:", results);
  return results;
}
