/**
 * Utility to notify components about data changes
 */

// Key for storing last update timestamp in localStorage
const LAST_UPDATE_KEY = 'dataLastUpdated';

/**
 * Signal that data has changed and components should refresh
 * @param {string} dataType - Type of data that changed (e.g., 'jobs', 'profiles')
 */
export function notifyDataChanged(dataType) {
  const timestamp = Date.now();
  localStorage.setItem(LAST_UPDATE_KEY, timestamp.toString());
  localStorage.setItem(`${dataType}LastUpdated`, timestamp.toString());
  
  // Dispatch a custom event that components can listen for
  window.dispatchEvent(new CustomEvent('dataChanged', { 
    detail: { type: dataType, timestamp } 
  }));
}

/**
 * Get the timestamp of the last data update
 * @param {string} dataType - Optional type of data to check
 * @returns {number} Timestamp of last update
 */
export function getLastUpdateTime(dataType) {
  if (dataType) {
    return parseInt(localStorage.getItem(`${dataType}LastUpdated`) || '0');
  }
  return parseInt(localStorage.getItem(LAST_UPDATE_KEY) || '0');
}
