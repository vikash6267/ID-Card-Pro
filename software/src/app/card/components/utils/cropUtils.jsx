import { toast } from 'sonner';

// Create image from URL with proper error handling
export const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

// Convert millimeters to pixels based on DPI
export const mmToPixels = (mm, dpi = 300) => {
  return Math.round((mm * dpi) / 25.4);
};

// Convert pixels to millimeters based on DPI
export const pixelsToMm = (pixels, dpi = 300) => {
  return Math.round((pixels * 25.4) / dpi * 100) / 100;
};

// Calculate crop area dimensions
export const calculateCropArea = (width, height, dpi = 300) => {
  return {
    pixelWidth: mmToPixels(width, dpi),
    pixelHeight: mmToPixels(height, dpi),
    mmWidth: width,
    mmHeight: height
  };
};

// Enhanced cropping function with manual measurements
export async function getCroppedImg(
  imageSrc,
  cropArea,
  options = {
    rotation: 0,
    quality: 1,
    dpi: 300,
    format: 'png',
    preserveTransparency: true
  }
) {
  try {
    console.log('Starting crop operation with:', { cropArea, options });
    
    const image = await createImage(imageSrc);
    console.log('Image loaded:', { width: image.width, height: image.height });
    
    // Create temporary canvas for scaling calculations
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = image.width;
    tempCanvas.height = image.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    if (!tempCtx) {
      throw new Error('Could not get temporary canvas context');
    }
    
    // Draw original image to temp canvas
    tempCtx.drawImage(image, 0, 0, image.width, image.height);
    
    // Create output canvas
    const outputCanvas = document.createElement('canvas');
    const ctx = outputCanvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get output canvas context');
    }
    
    // Set output canvas size to match crop area
    outputCanvas.width = cropArea.width;
    outputCanvas.height = cropArea.height;
    
    // Clear canvas
    if (options.preserveTransparency) {
      ctx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
    } else {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, outputCanvas.width, outputCanvas.height);
    }
    
    // Handle rotation by rotating the image on an offscreen canvas first
    let rotatedImageCanvas = document.createElement('canvas');
    let rotatedCtx = rotatedImageCanvas.getContext('2d');
    
    if (!rotatedCtx) {
      throw new Error('Could not get rotated canvas context');
    }
    
    // Calculate rotation radians
    const rotationRadians = (options.rotation * Math.PI) / 180;
    
    // Calculate new canvas size to fit rotated image
    const sin = Math.abs(Math.sin(rotationRadians));
    const cos = Math.abs(Math.cos(rotationRadians));
    const rotatedWidth = Math.floor(image.width * cos + image.height * sin);
    const rotatedHeight = Math.floor(image.width * sin + image.height * cos);
    
    rotatedImageCanvas.width = rotatedWidth;
    rotatedImageCanvas.height = rotatedHeight;
    
    // Translate and rotate context
    rotatedCtx.translate(rotatedWidth / 2, rotatedHeight / 2);
    rotatedCtx.rotate(rotationRadians);
    rotatedCtx.drawImage(image, -image.width / 2, -image.height / 2);
    
    // Calculate crop coordinates relative to rotated image
    // Adjust cropArea.x and y by image offset and scale
    const scale = Math.min(
      rotatedWidth / image.width,
      rotatedHeight / image.height
    );
    
    const imageOffsetX = (rotatedWidth - image.width * scale) / 2;
    const imageOffsetY = (rotatedHeight - image.height * scale) / 2;
    
    const sourceX = (cropArea.x - imageOffsetX) / scale;
    const sourceY = (cropArea.y - imageOffsetY) / scale;
    const sourceWidth = cropArea.width / scale;
    const sourceHeight = cropArea.height / scale;
    
    // Clamp source coordinates
    const clampedSourceX = Math.max(0, Math.min(sourceX, rotatedWidth));
    const clampedSourceY = Math.max(0, Math.min(sourceY, rotatedHeight));
    const clampedSourceWidth = Math.min(sourceWidth, rotatedWidth - clampedSourceX);
    const clampedSourceHeight = Math.min(sourceHeight, rotatedHeight - clampedSourceY);
    
    // Draw cropped portion from rotated image to output canvas
    ctx.drawImage(
      rotatedImageCanvas,
      clampedSourceX,
      clampedSourceY,
      clampedSourceWidth,
      clampedSourceHeight,
      0,
      0,
      outputCanvas.width,
      outputCanvas.height
    );
    
    console.log('Image cropped successfully');
    
    // Convert to blob with specified format and quality
const mimeType = options.format === 'jpg' ? 'image/jpeg' : 'image/png';
const dataUrl = outputCanvas.toDataURL(mimeType, options.quality);
return dataUrl;
  } catch (error) {
    console.error('Error in getCroppedImg:', error);
    toast.error('Failed to crop image');
    throw error;
  }
}

// Manual crop area handler
export class ManualCropHandler {
  constructor(canvas, image, options = {}) {
    console.log('ManualCropHandler constructor called', {
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      imageWidth: image.width,
      imageHeight: image.height
    });
    
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.image = image;
    
    // Calculate image scaling to fit canvas
    const scale = Math.min(
      canvas.width / image.width,
      canvas.height / image.height
    );
    
    const scaledWidth = image.width * scale;
    const scaledHeight = image.height * scale;
    
    console.log('Calculated scaling:', {
      scale,
      scaledWidth,
      scaledHeight
    });
    
    // Center the image
    const offsetX = (canvas.width - scaledWidth) / 2;
    const offsetY = (canvas.height - scaledHeight) / 2;
    
    // Initialize crop area in the center with 80% of scaled image size
    this.cropArea = {
      x: offsetX + scaledWidth * 0.1,
      y: offsetY + scaledHeight * 0.1,
      width: scaledWidth * 0.8,
      height: scaledHeight * 0.8
    };
    
    console.log('Initial crop area:', this.cropArea);
    
    this.isDragging = false;
    this.isResizing = false;
    this.dragStart = { x: 0, y: 0 };
    this.resizeHandle = null;
    this.options = {
      handleSize: 10,
      borderColor: '#ffffff',
      guideColor: 'rgba(255, 255, 255, 0.5)',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      lockAspectRatio: true,
      aspectRatio: 1, // width/height ratio
      ...options
    };

    this.setupEventListeners();
    this.draw(); // Initial render
  }

  setupEventListeners() {
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.canvas.addEventListener('dblclick', this.handleDoubleClick.bind(this));
  }

  handleMouseDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking on resize handle
    const handle = this.getResizeHandle(x, y);
    if (handle) {
      this.isResizing = true;
      this.resizeHandle = handle;
    } else if (this.isInsideCropArea(x, y)) {
      this.isDragging = true;
    }

    this.dragStart = { x, y };
  }

  handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (this.isResizing) {
      this.resizeCropArea(x, y);
    } else if (this.isDragging) {
      this.moveCropArea(x, y);
    }

    // Update cursor based on position
    this.updateCursor(x, y);

    // Redraw
    this.draw();
  }

  handleMouseUp() {
    this.isDragging = false;
    this.isResizing = false;
    this.resizeHandle = null;
  }

  handleDoubleClick() {
    // Trigger crop completion
    if (this.options.onCropComplete) {
      this.options.onCropComplete(this.cropArea);
    }
  }

  isInsideCropArea(x, y) {
    return (
      x >= this.cropArea.x &&
      x <= this.cropArea.x + this.cropArea.width &&
      y >= this.cropArea.y &&
      y <= this.cropArea.y + this.cropArea.height
    );
  }

  getResizeHandle(x, y) {
    const handles = [
      { x: this.cropArea.x, y: this.cropArea.y, cursor: 'nw-resize' },
      { x: this.cropArea.x + this.cropArea.width, y: this.cropArea.y, cursor: 'ne-resize' },
      { x: this.cropArea.x, y: this.cropArea.y + this.cropArea.height, cursor: 'sw-resize' },
      { x: this.cropArea.x + this.cropArea.width, y: this.cropArea.y + this.cropArea.height, cursor: 'se-resize' }
    ];

    for (const handle of handles) {
      if (
        Math.abs(x - handle.x) <= this.options.handleSize &&
        Math.abs(y - handle.y) <= this.options.handleSize
      ) {
        return handle;
      }
    }
    return null;
  }

  updateCursor(x, y) {
    const handle = this.getResizeHandle(x, y);
    if (handle) {
      this.canvas.style.cursor = handle.cursor;
    } else if (this.isInsideCropArea(x, y)) {
      this.canvas.style.cursor = 'move';
    } else {
      this.canvas.style.cursor = 'default';
    }
  }

  moveCropArea(x, y) {
    const dx = x - this.dragStart.x;
    const dy = y - this.dragStart.y;

    this.cropArea.x = Math.max(0, Math.min(this.canvas.width - this.cropArea.width, this.cropArea.x + dx));
    this.cropArea.y = Math.max(0, Math.min(this.canvas.height - this.cropArea.height, this.cropArea.y + dy));

    this.dragStart = { x, y };
  }

  resizeCropArea(x, y) {
    const dx = x - this.dragStart.x;
    const dy = y - this.dragStart.y;

    // Store original dimensions for aspect ratio calculations
    const originalWidth = this.cropArea.width;
    const originalHeight = this.cropArea.height;
    const originalX = this.cropArea.x;
    const originalY = this.cropArea.y;

    // Update crop area based on resize handle
    if (this.options.lockAspectRatio) {
      // When aspect ratio is locked, use the larger change (dx or dy) to determine both dimensions
      if (this.resizeHandle.cursor.includes('n') || this.resizeHandle.cursor.includes('s')) {
        // Vertical resize - calculate width based on height change
        const heightChange = this.resizeHandle.cursor.includes('n') ? -dy : dy;
        const newHeight = Math.max(10, originalHeight + heightChange);
        const newWidth = newHeight * this.options.aspectRatio;

        if (this.resizeHandle.cursor.includes('n')) {
          this.cropArea.y = Math.max(0, originalY + originalHeight - newHeight);
          this.cropArea.height = newHeight;
          this.cropArea.width = newWidth;
          this.cropArea.x = originalX + (originalWidth - newWidth) / 2;
        } else {
          this.cropArea.height = newHeight;
          this.cropArea.width = newWidth;
          this.cropArea.x = originalX + (originalWidth - newWidth) / 2;
        }
      } else {
        // Horizontal resize - calculate height based on width change
        const widthChange = this.resizeHandle.cursor.includes('w') ? -dx : dx;
        const newWidth = Math.max(10, originalWidth + widthChange);
        const newHeight = newWidth / this.options.aspectRatio;

        if (this.resizeHandle.cursor.includes('w')) {
          this.cropArea.x = Math.max(0, originalX + originalWidth - newWidth);
          this.cropArea.width = newWidth;
          this.cropArea.height = newHeight;
          this.cropArea.y = originalY + (originalHeight - newHeight) / 2;
        } else {
          this.cropArea.width = newWidth;
          this.cropArea.height = newHeight;
          this.cropArea.y = originalY + (originalHeight - newHeight) / 2;
        }
      }
    } else {
      // Free resize when aspect ratio is not locked
      if (this.resizeHandle.cursor.includes('n')) {
        this.cropArea.y = Math.max(0, this.cropArea.y + dy);
        this.cropArea.height = Math.max(10, this.cropArea.height - dy);
      }
      if (this.resizeHandle.cursor.includes('s')) {
        this.cropArea.height = Math.max(10, this.cropArea.height + dy);
      }
      if (this.resizeHandle.cursor.includes('w')) {
        this.cropArea.x = Math.max(0, this.cropArea.x + dx);
        this.cropArea.width = Math.max(10, this.cropArea.width - dx);
      }
      if (this.resizeHandle.cursor.includes('e')) {
        this.cropArea.width = Math.max(10, this.cropArea.width + dx);
      }
    }

    // Ensure crop area stays within canvas bounds
    this.cropArea.x = Math.max(0, Math.min(this.canvas.width - this.cropArea.width, this.cropArea.x));
    this.cropArea.y = Math.max(0, Math.min(this.canvas.height - this.cropArea.height, this.cropArea.y));

    this.dragStart = { x, y };
  }

  draw() {
    try {
      // Clear canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Calculate image scaling to fit canvas while maintaining aspect ratio
      const scale = Math.min(
        this.canvas.width / this.image.width,
        this.canvas.height / this.image.height
      );
      
      const scaledWidth = this.image.width * scale;
      const scaledHeight = this.image.height * scale;
      
      // Center the image
      const offsetX = (this.canvas.width - scaledWidth) / 2;
      const offsetY = (this.canvas.height - scaledHeight) / 2;

      // First, draw the full image
      this.ctx.drawImage(
        this.image,
        offsetX,
        offsetY,
        scaledWidth,
        scaledHeight
      );

      // Draw semi-transparent overlay outside crop area
      this.ctx.fillStyle = this.options.backgroundColor;
      this.ctx.beginPath();
      this.ctx.rect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.moveTo(this.cropArea.x, this.cropArea.y);
      this.ctx.lineTo(this.cropArea.x + this.cropArea.width, this.cropArea.y);
      this.ctx.lineTo(this.cropArea.x + this.cropArea.width, this.cropArea.y + this.cropArea.height);
      this.ctx.lineTo(this.cropArea.x, this.cropArea.y + this.cropArea.height);
      this.ctx.closePath();
      this.ctx.fill('evenodd');

      // Draw crop border
      this.ctx.strokeStyle = this.options.borderColor;
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(
        this.cropArea.x,
        this.cropArea.y,
        this.cropArea.width,
        this.cropArea.height
      );

      // Draw grid lines for better visual guidance
      this.ctx.strokeStyle = this.options.guideColor;
      this.ctx.lineWidth = 1;
      
      // Rule of thirds grid
      for (let i = 1; i < 3; i++) {
        // Vertical lines
        const x = this.cropArea.x + (this.cropArea.width * i) / 3;
        this.ctx.beginPath();
        this.ctx.moveTo(x, this.cropArea.y);
        this.ctx.lineTo(x, this.cropArea.y + this.cropArea.height);
        this.ctx.stroke();
        
        // Horizontal lines
        const y = this.cropArea.y + (this.cropArea.height * i) / 3;
        this.ctx.beginPath();
        this.ctx.moveTo(this.cropArea.x, y);
        this.ctx.lineTo(this.cropArea.x + this.cropArea.width, y);
        this.ctx.stroke();
      }

      // Draw resize handles
      this.drawResizeHandles();

      // Draw measurement guides
      this.drawMeasurementGuides();
      
    } catch (error) {
      console.error('Error in draw method:', error);
    }
  }

  drawResizeHandles() {
    const handles = [
      { x: this.cropArea.x, y: this.cropArea.y },
      { x: this.cropArea.x + this.cropArea.width, y: this.cropArea.y },
      { x: this.cropArea.x, y: this.cropArea.y + this.cropArea.height },
      { x: this.cropArea.x + this.cropArea.width, y: this.cropArea.y + this.cropArea.height }
    ];

    this.ctx.fillStyle = this.options.borderColor;
    handles.forEach(handle => {
      this.ctx.fillRect(
        handle.x - this.options.handleSize / 2,
        handle.y - this.options.handleSize / 2,
        this.options.handleSize,
        this.options.handleSize
      );
    });
  }

  drawMeasurementGuides() {
    const mmWidth = pixelsToMm(this.cropArea.width);
    const mmHeight = pixelsToMm(this.cropArea.height);

    this.ctx.fillStyle = this.options.guideColor;
    this.ctx.font = '12px Arial';
    this.ctx.fillText(
      `${mmWidth.toFixed(1)}mm × ${mmHeight.toFixed(1)}mm`,
      this.cropArea.x + 5,
      this.cropArea.y + 20
    );
  }

  setCropArea(width, height) {
    // Convert mm to pixels
    const pixelWidth = mmToPixels(width);
    const pixelHeight = mmToPixels(height);

    // Calculate image scaling to fit canvas
    const scale = Math.min(
      this.canvas.width / this.image.width,
      this.canvas.height / this.image.height
    );
    
    const scaledWidth = this.image.width * scale;
    const scaledHeight = this.image.height * scale;
    
    // Calculate image offset to center it
    const offsetX = (this.canvas.width - scaledWidth) / 2;
    const offsetY = (this.canvas.height - scaledHeight) / 2;

    // Set aspect ratio based on provided dimensions
    this.options.aspectRatio = width / height;

    // Calculate dimensions that maintain aspect ratio and fit within bounds
    let finalWidth, finalHeight;
    
    if (this.options.lockAspectRatio) {
      // Use the more constraining dimension to determine size
      const widthRatio = pixelWidth / scaledWidth;
      const heightRatio = pixelHeight / scaledHeight;
      
      if (widthRatio > heightRatio) {
        finalWidth = Math.min(pixelWidth, scaledWidth);
        finalHeight = finalWidth / this.options.aspectRatio;
      } else {
        finalHeight = Math.min(pixelHeight, scaledHeight);
        finalWidth = finalHeight * this.options.aspectRatio;
      }
    } else {
      finalWidth = Math.min(pixelWidth, scaledWidth);
      finalHeight = Math.min(pixelHeight, scaledHeight);
    }

    // Center the crop area within the image
    this.cropArea = {
      x: offsetX + (scaledWidth - finalWidth) / 2,
      y: offsetY + (scaledHeight - finalHeight) / 2,
      width: finalWidth,
      height: finalHeight
    };

    console.log('Setting crop area:', {
      mmWidth: width,
      mmHeight: height,
      pixelWidth,
      pixelHeight,
      finalWidth,
      finalHeight,
      aspectRatio: this.options.aspectRatio,
      scale,
      offsetX,
      offsetY,
      cropArea: this.cropArea
    });

    this.draw();
  }

  getCropArea() {
    // Calculate the actual crop coordinates relative to the original image
    const scale = Math.min(
      this.canvas.width / this.image.width,
      this.canvas.height / this.image.height
    );
    
    const scaledWidth = this.image.width * scale;
    const scaledHeight = this.image.height * scale;
    const offsetX = (this.canvas.width - scaledWidth) / 2;
    const offsetY = (this.canvas.height - scaledHeight) / 2;
    
    return {
      x: this.cropArea.x,
      y: this.cropArea.y,
      width: this.cropArea.width,
      height: this.cropArea.height,
      // Add image display properties for proper cropping
      imageScale: scale,
      imageOffsetX: offsetX,
      imageOffsetY: offsetY,
      mmWidth: pixelsToMm(this.cropArea.width),
      mmHeight: pixelsToMm(this.cropArea.height)
    };
  }
}

export const initializeCropper = (canvas, image, options) => {
  return new ManualCropHandler(canvas, image, options);
};