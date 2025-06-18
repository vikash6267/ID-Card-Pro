import { useEffect, useRef, useState } from "react";

const PhotoMask = ({ 
  src, 
  maskSrc, 
  onMaskApply, 
  rotation = 0, // This is the element rotation
  galleryRotation = 0, // This is the separate gallery rotation 
  maskScale = 1, 
  maskOffsetX = 0, 
  maskOffsetY = 0, 
  className = "", 
  elementStyle = {}
}) => {
  const canvasRef = useRef(null);
  const [maskedImage, setMaskedImage] = useState(null);
  const totalRotation = (rotation || 0) + (galleryRotation || 0);

  useEffect(() => {
    if (!src || !maskSrc) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const img = new Image();
    const mask = new Image();

    let isMounted = true;

    img.crossOrigin = "anonymous";
    mask.crossOrigin = "anonymous";

    img.src = src;
    mask.src = maskSrc;

    let imagesLoaded = 0;

    const applyMask = () => {
      if (imagesLoaded === 2 && isMounted) {
        const dpi = window.devicePixelRatio || 1;
        canvas.width = img.width * dpi;
        canvas.height = img.height * dpi;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.scale(dpi, dpi);

        // FIRST draw the original image
        ctx.drawImage(img, 0, 0, img.width, img.height);

        // THEN apply the mask using destination-in
        ctx.globalCompositeOperation = "destination-in";
        ctx.drawImage(
          mask, 
          maskOffsetX, 
          maskOffsetY, 
          img.width * maskScale, 
          img.height * maskScale
        );

        // Reset composite operation
        ctx.globalCompositeOperation = "source-over";

        const newMaskedImage = canvas.toDataURL("image/png");
        if (newMaskedImage !== maskedImage) {
          setMaskedImage(newMaskedImage);
        }
      }
    };

    img.onload = () => {
      imagesLoaded++;
      applyMask();
    };

    mask.onload = () => {
      imagesLoaded++;
      applyMask();
    };

    img.onerror = () => {
      console.error("Failed to load image:", src);
      imagesLoaded++;
    };

    mask.onerror = () => {
      console.error("Failed to load mask:", maskSrc);
      imagesLoaded++;
    };

    return () => {
      isMounted = false;
    };
  }, [src, maskSrc, maskScale, maskOffsetX, maskOffsetY]);

  const dropShadowStyle = elementStyle?.strokeWidth > 0
    ? `drop-shadow(${elementStyle.strokeWidth}px 0 ${elementStyle.strokeColor}) 
       drop-shadow(-${elementStyle.strokeWidth}px 0 ${elementStyle.strokeColor}) 
       drop-shadow(0 ${elementStyle.strokeWidth}px ${elementStyle.strokeColor}) 
       drop-shadow(0 -${elementStyle.strokeWidth}px ${elementStyle.strokeColor})`
    : "none";

  useEffect(() => {
    if (!maskedImage || !onMaskApply) return;
    if (src && typeof src === 'string' && !src.startsWith('custom_image_')) {
      onMaskApply(maskedImage, src);
    }
  }, [maskedImage, onMaskApply, src]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <canvas ref={canvasRef} className="hidden" />
      {maskedImage && (
        <img
          src={maskedImage}
          alt="Masked Image"
          className="w-full h-full object-cover absolute top-0 left-0 transition-transform duration-300 ease-in-out"
          style={{
            transform: `rotate(${totalRotation}deg)`, // Use total rotation
            filter: elementStyle.strokeWidth > 0
              ? `drop-shadow(${elementStyle.strokeWidth}px 0 ${elementStyle.strokeColor}) 
                 drop-shadow(-${elementStyle.strokeWidth}px 0 ${elementStyle.strokeColor}) 
                 drop-shadow(0 ${elementStyle.strokeWidth}px ${elementStyle.strokeColor}) 
                 drop-shadow(0 -${elementStyle.strokeWidth}px ${elementStyle.strokeColor}) 
                 ${elementStyle.shadowBlur > 0 ? `drop-shadow(${elementStyle.shadowOffsetX}px ${elementStyle.shadowOffsetY}px ${elementStyle.shadowBlur}px ${elementStyle.shadowColor})` : ""}`
              : "none"
        
          }}
        />
      )}
    </div>
  );
};
export default PhotoMask;
