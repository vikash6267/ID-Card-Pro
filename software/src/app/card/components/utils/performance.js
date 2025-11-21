// Performance optimization utilities

/**
 * Throttle function - limits how often a function can be called
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in ms
 */
export function throttle(func, limit) {
  let inThrottle;
  let lastResult;
  
  return function(...args) {
    if (!inThrottle) {
      lastResult = func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
    return lastResult;
  };
}

/**
 * Debounce function - delays execution until after wait time
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 */
export function debounce(func, wait) {
  let timeout;
  
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

/**
 * RequestAnimationFrame wrapper for smooth updates
 * @param {Function} callback - Function to call on next frame
 */
export function rafThrottle(callback) {
  let rafId = null;
  let lastArgs = null;
  
  const throttled = (...args) => {
    lastArgs = args;
    
    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        callback(...lastArgs);
        rafId = null;
      });
    }
  };
  
  throttled.cancel = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };
  
  return throttled;
}

/**
 * Batch state updates to reduce re-renders
 * @param {Function} callback - Function containing state updates
 */
export function batchUpdates(callback) {
  // React 18+ automatically batches updates
  // This is a placeholder for future optimization
  callback();
}
