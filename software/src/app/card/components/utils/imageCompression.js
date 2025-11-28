/**
 * Compress base64 image to reduce storage size
 * @param {string} base64Image - Base64 encoded image
 * @param {number} maxWidth - Maximum width (default 800)
 * @param {number} quality - JPEG quality 0-1 (default 0.7)
 * @returns {Promise<string>} Compressed base64 image
 */
export const compressImage = (base64Image, maxWidth = 800, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Calculate new dimensions
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to JPEG for better compression (unless it's PNG with transparency)
      const hasAlpha = base64Image.includes('data:image/png');
      const mimeType = hasAlpha ? 'image/png' : 'image/jpeg';
      
      const compressedBase64 = canvas.toDataURL(mimeType, quality);
      resolve(compressedBase64);
    };
    
    img.onerror = (error) => {
      console.error('Image compression failed:', error);
      reject(error);
    };
    
    img.src = base64Image;
  });
};

/**
 * Get size of base64 string in KB
 */
export const getBase64Size = (base64String) => {
  const sizeInBytes = (base64String.length * 3) / 4;
  return (sizeInBytes / 1024).toFixed(2);
};

/**
 * Check if localStorage has enough space
 */
export const checkStorageSpace = () => {
  try {
    const testKey = '__storage_test__';
    const testValue = 'x'.repeat(1024 * 1024); // 1MB test
    localStorage.setItem(testKey, testValue);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Get current localStorage usage
 */
export const getStorageUsage = () => {
  let total = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length;
    }
  }
  return {
    used: (total / 1024).toFixed(2) + ' KB',
    usedBytes: total
  };
};
