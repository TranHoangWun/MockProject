/**
 * Utility functions to help manage localStorage more effectively
 * and handle quota issues
 */

/**
 * Check available localStorage space
 * @returns {Object} Space information
 */
export function checkStorageSpace() {
  try {
    // Try to estimate available localStorage space
    const testKey = '__storage_test__';
    const oneKB = 'A'.repeat(1024); // 1KB of data
    let usedSpace = 0;
    
    // Calculate current usage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      usedSpace += (localStorage.getItem(key) || '').length;
    }
    
    // Try to add data until we hit quota
    let i = 0;
    try {
      while (i < 4096) { // Safety limit - assume we have at least 4MB
        localStorage.setItem(testKey + i, oneKB);
        i++;
      }
    } catch (e) {
      console.log("Hit quota at iteration:", i);
    }
    
    // Cleanup test data
    for (let j = 0; j < i; j++) {
      localStorage.removeItem(testKey + j);
    }
    
    // Estimate total space (in MB)
    const totalSpaceMB = (usedSpace + (i * 1024)) / (1024 * 1024);
    const usedSpaceMB = usedSpace / (1024 * 1024);
    
    return {
      total: totalSpaceMB.toFixed(2),
      used: usedSpaceMB.toFixed(2),
      available: (totalSpaceMB - usedSpaceMB).toFixed(2)
    };
  } catch (e) {
    // If we hit quota during testing
    console.error("Error checking storage space:", e);
    return { error: "Cannot determine storage space" };
  }
}

/**
 * Compress base64 image data to reduce size
 * @param {string} base64Image - The original base64 image
 * @param {number} maxWidth - Maximum width for the compressed image
 * @param {number} quality - JPEG quality (0-1)
 * @returns {Promise<string>} - Compressed base64 image
 */
export function compressImage(base64Image, maxWidth = 800, quality = 0.7) {
  return new Promise((resolve, reject) => {
    try {
      // Check if input is valid
      if (!base64Image || typeof base64Image !== 'string') {
        return resolve(base64Image);
      }
      
      // Skip if not a data URL
      if (!base64Image.startsWith('data:image')) {
        return resolve(base64Image);
      }
      
      const img = new Image();
      img.src = base64Image;
      
      img.onload = function() {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions
        if (width > maxWidth) {
          height = Math.round(height * maxWidth / width);
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Get compressed image with specified quality
        const compressedImage = canvas.toDataURL('image/jpeg', quality);
        
        // Log compression results
        console.log(`Image compressed: ${(base64Image.length/1024).toFixed(2)}KB → ${(compressedImage.length/1024).toFixed(2)}KB`);
        
        resolve(compressedImage);
      };
      
      img.onerror = function() {
        console.warn("Failed to load image for compression");
        resolve(base64Image); // Return original on error
      };
    } catch (error) {
      console.error("Error compressing image:", error);
      resolve(base64Image); // Return original on error
    }
  });
}

/**
 * Clean up localStorage by removing unused items
 */
export function cleanupStorage() {
  try {
    // List of keys to check for orphaned data
    const orphanedPrefixes = [
      'user_',    // User images and CVs
      'job_',     // Job related data
      'temp_'     // Any temporary storage
    ];
    
    // Get all localStorage keys
    const allKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      allKeys.push(localStorage.key(i));
    }
    
    // Find orphaned keys to remove
    const keysToRemove = [];
    
    // Process user-related orphaned data
    if (localStorage.getItem('users')) {
      const users = JSON.parse(localStorage.getItem('users'));
      const userIds = users.map(u => u.id);
      
      // Find user-related data without a corresponding user
      orphanedPrefixes.forEach(prefix => {
        allKeys.forEach(key => {
          if (key.startsWith(prefix)) {
            // Extract user ID from key (format: user_123_image)
            const parts = key.split('_');
            if (parts.length >= 2) {
              const id = parseInt(parts[1]);
              if (!isNaN(id) && !userIds.includes(id)) {
                keysToRemove.push(key);
              }
            }
          }
        });
      });
    }
    
    // Remove orphaned keys
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log(`Removed orphaned storage item: ${key}`);
    });
    
    return {
      success: true,
      removed: keysToRemove.length
    };
  } catch (error) {
    console.error("Error cleaning up storage:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Emergency storage cleanup when quota is exceeded
 * @returns {boolean} - Success status
 */
export function emergencyStorageCleanup() {
  try {
    console.log("Performing emergency storage cleanup");
    
    // List of prefixes that might contain large data
    const largeDataPrefixes = ['user_', 'temp_', 'image_', 'cv_'];
    
    // Count before cleanup
    const beforeCount = localStorage.length;
    
    // Clean up large data items
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      
      // Skip essential keys
      if (key === 'users' || key === 'currentUser') continue;
      
      // Check if this is a large data item
      if (largeDataPrefixes.some(prefix => key.startsWith(prefix))) {
        localStorage.removeItem(key);
      }
    }
    
    // Count after cleanup
    const afterCount = localStorage.length;
    console.log(`Cleanup removed ${beforeCount - afterCount} items`);
    
    return true;
  } catch (error) {
    console.error("Error during emergency cleanup:", error);
    return false;
  }
}

/**
 * Store large data separately and return a reference
 * @param {string} key - Storage key
 * @param {string} data - Data to store
 * @returns {string} - Reference to stored data
 */
export function storeDataWithReference(key, data) {
  try {
    localStorage.setItem(key, data);
    return `__ref__${key}`;
  } catch (error) {
    console.error(`Error storing data for ${key}:`, error);
    return null;
  }
}

/**
 * Safely store currentUser in localStorage with reference handling
 * @param {Object} user - The user object to store 
 * @returns {boolean} Success status
 */
export function safelyStoreCurrentUser(user) {
  if (!user) return false;
  
  try {
    // Create a copy to avoid modifying the original
    const userCopy = JSON.parse(JSON.stringify(user));
    
    // Handle large profile data
    if (userCopy.profile) {
      // Handle profile image
      if (userCopy.profile.image && typeof userCopy.profile.image === 'string') {
        if (userCopy.profile.image.length > 10000) {
          const imageKey = `current_user_${userCopy.id}_image`;
          try {
            localStorage.setItem(imageKey, userCopy.profile.image);
            userCopy.profile.image = `__ref__${imageKey}`;
          } catch (err) {
            console.warn("Cannot store profile image, using minimal reference");
            userCopy.profile.image = null;
          }
        }
      }
      
      // Handle CV data
      if (userCopy.profile.cv && typeof userCopy.profile.cv === 'string') {
        if (userCopy.profile.cv.length > 10000) {
          const cvKey = `current_user_${userCopy.id}_cv`;
          try {
            localStorage.setItem(cvKey, userCopy.profile.cv);
            userCopy.profile.cv = `__ref__${cvKey}`;
          } catch (err) {
            console.warn("Cannot store CV data, using minimal reference");
            userCopy.profile.cv = null;
          }
        }
      }
    }
    
    // Try to save the user with references
    try {
      localStorage.setItem("currentUser", JSON.stringify(userCopy));
      return true;
    } catch (error) {
      // If that still fails, use a minimal user object
      console.error("Failed to store full user, falling back to minimal user");
      const minimalUser = {
        id: user.id,
        username: user.username,
        role: user.role,
        profile: {
          fullName: user.profile?.fullName || '',
          email: user.profile?.email || user.username,
          companyName: user.profile?.companyName || ''
        }
      };
      
      localStorage.setItem("currentUser", JSON.stringify(minimalUser));
      return true;
    }
  } catch (error) {
    console.error("Fatal error storing current user:", error);
    return false;
  }
}

/**
 * Clean up current user related storage items
 */
export function cleanupCurrentUserStorage() {
  // Find and remove any currentUser related keys
  const keysToCheck = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('current_user_')) {
      keysToCheck.push(key);
    }
  }
  
  // Remove all except the most recent ones (keep one per user)
  const validKeys = new Set();
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  
  if (currentUser && currentUser.id) {
    // Keep only latest references for current user
    validKeys.add(`current_user_${currentUser.id}_image`);
    validKeys.add(`current_user_${currentUser.id}_cv`);
  }
  
  // Remove older references
  keysToCheck.forEach(key => {
    if (!validKeys.has(key)) {
      localStorage.removeItem(key);
      console.log(`Removed old currentUser reference: ${key}`);
    }
  });
}
