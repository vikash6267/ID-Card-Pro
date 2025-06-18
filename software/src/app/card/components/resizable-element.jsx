"use client"

import { useState, useRef, useEffect } from "react";
import { ImageIcon } from "lucide-react";
import { Input } from "./ui/input";
import PhotoMask from "./photo-mask";
import QRCodeElement from "./qr-code-element";
import BarcodeElement from "./barcode-element";
import { useGroupResize } from "./useGroupResize";


export function ResizableElement({
  element,
  onUpdate,
  containerRef,
  onSelect,
  isSelected,
  photos,
  applyMask,
  maskSrc,
  zoomLevel,// ✅ Add this
  onPhotosChange = () => {},
  excelHeaders, // Ensure this prop is received
  currentRecord, // ✅ Add this
  children,
    // ✅ Add these:
    selectedElements,
    setSelectedElements,
    galleryRotation = 0, // Add this prop
    photoInstanceRotations = {}, 
  rotations = { elements: {}, gallery: {} },
  Photos

}) {
    // Calculate total rotation (element + gallery)
    const totalRotation = (element.rotation || 0) + 
    (rotations.gallery[element.content] || 0) + 
    (photoInstanceRotations[element.id]?.[element.content] || 0);
  const instanceRotation = photoInstanceRotations[element.id]?.[element.content] || 0;
  const currentZIndex = element.style?.zIndex || 1;
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [rotation, setRotation] = useState(element.rotation || 0); // Local rotation only
  const [imageSrc, setImageSrc] = useState(null);
  const [isRotating, setIsRotating] = useState(false);
  const [rotationInput, setRotationInput] = useState("");
  const [hasImageTransparency, setHasImageTransparency] = useState(false);
  const [hasMaskTransparency, setHasMaskTransparency] = useState(false);
  const elementRef = useRef(null);
  const inputRef = useRef(null);
  const initialPositionsRef = useRef({});
  const dragStartRef = useRef(null);
  const stillSelected = selectedElements.some((el) => el.id === element.id);
  
  
  const { startGroupResize, resizeGroup } = useGroupResize(containerRef, onUpdate, {
    snapToGrid: 10,
    lockAspectRatio: "shiftKey", // <-- enable shift-key based locking
  });


  
  const transformTextCase = (text, caseType) => {
    if (!text || typeof text !== 'string') return text;
  
    switch (caseType) {
      case 'uppercase':
        return text.toUpperCase();
      case 'lowercase':
        return text.toLowerCase();
      case 'capitalize': // Proper case
        return text
          .toLowerCase()
          .replace(/(?:^|\s|['-])\w/g, match => match.toUpperCase());
      case 'toggle':
        return text
          .split('')
          .map(char => 
            char === char.toUpperCase() && char !== char.toLowerCase() 
              ? char.toLowerCase() 
              : char.toUpperCase()
          )
          .join('');
      case 'sentence':
        return text
          .toLowerCase()
          .replace(/(^\s*\w|[.!?]\s*\w)/g, match => match.toUpperCase());
      default:
        return text;
    }
  };
    // Add these at the top level with your other hooks
    const textContainerRef = useRef(null);
    const [adjustedStyles, setAdjustedStyles] = useState({
      fontSize: element.style?.fontSize || 16,
      lineHeight: element.style?.lineHeight || 1.2
    });

    
  
    // Move the text adjustment effect to the top level
    useEffect(() => {
      if (element.type !== "text" || !textContainerRef.current || !element.content || isEditing) return;
  
      const adjustTextSize = () => {
        const container = textContainerRef.current;
        if (!container) return;
  
        const content = element.content;
        const style = element.style || {};
        const maxWidth = element.size.width;
        const maxHeight = element.size.height;
        
        // Create a test element with identical styling
        const testElement = document.createElement('div');
        testElement.style.position = 'absolute';
        testElement.style.visibility = 'hidden';
        testElement.style.whiteSpace = 'pre-wrap';
        testElement.style.wordBreak = 'break-word';
        testElement.style.fontFamily = style.fontFamily || 'sans-serif';
        testElement.style.fontWeight = style.isBold ? 'bold' : 'normal';
        testElement.style.fontStyle = style.isItalic ? 'italic' : 'normal';
        testElement.style.width = `${maxWidth}px`;
        testElement.style.padding = '0';
        testElement.style.margin = '0';
        testElement.style.lineHeight = style.lineHeight || '1.2';
        testElement.textContent = content;
        
        document.body.appendChild(testElement);
  
        // Binary search for optimal font size
        let minSize = 4; // Minimum font size
        let maxSize = style.originalFontSize || style.fontSize || 16;
        let optimalSize = maxSize;
        let optimalLineHeight = style.lineHeight || 1.2;
  
        // Check if text fits at original size
        testElement.style.fontSize = `${maxSize}px`;
        const initialHeight = testElement.offsetHeight;
  
        if (initialHeight <= maxHeight) {
          // Text fits at original size
          document.body.removeChild(testElement);
          setAdjustedStyles({
            fontSize: maxSize,
            lineHeight: optimalLineHeight
          });
          return;
        }
  
        // Adjust both font size and line height proportionally
        while (minSize <= maxSize) {
          const midSize = Math.floor((minSize + maxSize) / 2);
          const midLineHeight = Math.max(1, (midSize / (style.originalFontSize || 16)) * (style.lineHeight || 1.2))
          
          testElement.style.fontSize = `${midSize}px`;
          testElement.style.lineHeight = `${midLineHeight}`;
          
          const currentHeight = testElement.offsetHeight;
          
          if (currentHeight <= maxHeight) {
            optimalSize = midSize;
            optimalLineHeight = midLineHeight;
            minSize = midSize + 1;
          } else {
            maxSize = midSize - 1;
          }
        }
  
        document.body.removeChild(testElement);
        
        setAdjustedStyles({
          fontSize: optimalSize,
          lineHeight: optimalLineHeight
        });
      };
  
      adjustTextSize();
      const resizeObserver = new ResizeObserver(adjustTextSize);
      if (textContainerRef.current) {
        resizeObserver.observe(textContainerRef.current);
      }
  
      return () => {
        resizeObserver.disconnect();
      };
    }, [element.content, element.size.width, element.size.height, element.style, isEditing]);
  // Sensitivity factor for rotation speed
  const rotationSensitivity = 0.5;

  useEffect(() => {
    // Update rotation state when element rotation changes
    setRotation(element.rotation || 0);
  }, [element.rotation]);

  useEffect(() => {
    if (applyMask && maskSrc && photos[element.content]) {
      handleMaskApply(photos[element.content]);
    }
    
 function getRotatedBoundingBox(x, y, width, height, angleDeg) {
  const angle = angleDeg * (Math.PI / 180);
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  const cx = x + width / 2;
  const cy = y + height / 2;

  const corners = [
    { x: -width / 2, y: -height / 2 },
    { x: width / 2, y: -height / 2 },
    { x: width / 2, y: height / 2 },
    { x: -width / 2, y: height / 2 },
  ];

  const rotatedCorners = corners.map(({ x, y }) => ({
    x: cx + x * cos - y * sin,
    y: cy + x * sin + y * cos,
  }));

  const xs = rotatedCorners.map(p => p.x);
  const ys = rotatedCorners.map(p => p.y);

  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
}
 

    const handleMouseMove = (e) => {
      if (!containerRef.current || !elementRef.current) return;
    
      const containerRect = containerRef.current.getBoundingClientRect();
      const elementRect = elementRef.current.getBoundingClientRect();
    
      const currentX = e.clientX;
      const currentY = e.clientY;
    
      const mouseX = (currentX - containerRect.left) / zoomLevel;
      const mouseY = (currentY - containerRect.top) / zoomLevel;
    
      const deltaX = dragStartRef.current ? (e.clientX - dragStartRef.current.x) / zoomLevel : 0;
      const deltaY = dragStartRef.current ? (e.clientY - dragStartRef.current.y) / zoomLevel : 0;
      
    
      if (isRotating) {
        const centerX = elementRect.left + elementRect.width / 2;
        const centerY = elementRect.top + elementRect.height / 2;
        const angle = Math.atan2(currentY - centerY, currentX - centerX) * (180 / Math.PI);
        const initialAngle = Math.atan2(
          dragStartRef.current.y - centerY,
          dragStartRef.current.x - centerX
        ) * (180 / Math.PI);
    
        const angleDiff = (angle - initialAngle) * rotationSensitivity;
        const newRotation = (dragStartRef.current.rotation + angleDiff) % 360;
    
        if (selectedElements.length > 1) {
          applyGroupRotation(newRotation, selectedElements);
        } else {
          setRotation(newRotation);
          onUpdate({
            ...element,
            rotation: newRotation,
          });
        }
    
      } else if (isDragging) {
        if (!dragStartRef.current) return;
    
        if (selectedElements.length > 1) {
          const groupBounds = selectedElements.reduce(
            (acc, el) => {
              const init = initialPositionsRef.current[el.id];
              if (!init) return acc;
              const right = init.x + el.size.width;
              const bottom = init.y + el.size.height;
              return {
                minX: Math.min(acc.minX, init.x),
                minY: Math.min(acc.minY, init.y),
                maxX: Math.max(acc.maxX, right),
                maxY: Math.max(acc.maxY, bottom),
              };
            },
            {
              minX: Infinity,
              minY: Infinity,
              maxX: -Infinity,
              maxY: -Infinity,
            }
          );
    
          const canvasWidth = containerRect.width / zoomLevel;
          const canvasHeight = containerRect.height / zoomLevel;
    
          const maxDeltaX = canvasWidth - groupBounds.maxX;
          const maxDeltaY = canvasHeight - groupBounds.maxY;
          const minDeltaX = -groupBounds.minX;
          const minDeltaY = -groupBounds.minY;
    
          const clampedDeltaX = Math.min(Math.max(deltaX, minDeltaX), maxDeltaX);
          const clampedDeltaY = Math.min(Math.max(deltaY, minDeltaY), maxDeltaY);
    
          const updatedElements = selectedElements.map((el) => {
            const init = initialPositionsRef.current[el.id];
            if (!init) return el;
    
            return {
              ...el,
              position: {
                x: init.x + clampedDeltaX,
                y: init.y + clampedDeltaY,
              },
            };
          });
    
          onUpdate(updatedElements);
    
        } else {
const halfW = element.size.width / 2;
const halfH = element.size.height / 2;
const desiredX = mouseX - halfW;
const desiredY = mouseY - halfH;

const rotatedBox = getRotatedBoundingBox(
  desiredX, desiredY,
  element.size.width, element.size.height,
  element.rotation || 0
);

const canvasWidth = containerRect.width / zoomLevel;
const canvasHeight = containerRect.height / zoomLevel;

let offsetX = desiredX;
let offsetY = desiredY;

// Clamp rotated box within container
if (rotatedBox.minX < 0) offsetX += -rotatedBox.minX;
if (rotatedBox.maxX > canvasWidth) offsetX -= rotatedBox.maxX - canvasWidth;
if (rotatedBox.minY < 0) offsetY += -rotatedBox.minY;
if (rotatedBox.maxY > canvasHeight) offsetY -= rotatedBox.maxY - canvasHeight;

onUpdate({
  ...element,
  position: { x: offsetX, y: offsetY },
});
        }
    
      } else if (isResizing) {
        // ✅ Stop resize if current element is no longer selected
        const stillSelected = selectedElements.some((el) => el.id === element.id);
        if (!stillSelected) {
          setIsResizing(false);
          return; // 🛑 Exit the mouse move
        }
      
        if (selectedElements.length > 1) {
          resizeGroup(e, selectedElements, zoomLevel);
        } else {
          const startX = element.position.x;
          const startY = element.position.y;
      
          const rawX = (e.clientX - containerRect.left) / zoomLevel;
          const rawY = (e.clientY - containerRect.top) / zoomLevel;
      
          const newWidth = Math.max(20, rawX - startX);
          const newHeight = Math.max(20, rawY - startY);
      
          const canvasWidth = containerRect.width / zoomLevel;
          const canvasHeight = containerRect.height / zoomLevel;
      
          const newFontSize =
            element.type !== "text"
              ? (element.style?.fontSize || 16) * (newWidth / element.size.width)
              : element.style?.fontSize || 16;
      
          onUpdate({
            ...element,
            size: {
              width: Math.min(newWidth, canvasWidth - startX),
              height: Math.min(newHeight, canvasHeight - startY),
            },
            style: {
              ...element.style,
              fontSize: newFontSize,
            },
          });
        }
      }
      
    };
   

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setIsRotating(false);
    };

    if (isDragging || isResizing || isRotating) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }
    
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isResizing, isRotating, element, onUpdate, containerRef, applyMask, maskSrc, photos]);

  const handleDoubleClick = () => {
    if (element.type === "text") {
      setIsEditing(true);
      setTimeout(() => inputRef.current?.focus(), 0);
    } else if (element.type === "image") {
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = "image/*";
      fileInput.onchange = (e) => handleImageUpload(e);
      fileInput.click();
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageKey = `custom_image_${Date.now()}`;
        const base64Data = event.target.result; // This is the base64 encoded image
        
        // Update the element and photos state
        onUpdate({ 
          ...element, 
          content: imageKey,
          isCustomImage: true
        });
        
        onPhotosChange({
          ...photos,
          [imageKey]: base64Data // Store as base64
        });
      };
      reader.readAsDataURL(file); // Read as data URL
    }
  };
  

  const handleInputBlur = () => {
    setIsEditing(false);
    if (inputRef.current) {
      onUpdate({ ...element, content: inputRef.current.value });
    }
  };

const handleTextChange = (e) => {
  const newContent = e.target.value;
  const transformedContent = element.style?.textCase 
    ? transformTextCase(newContent, element.style.textCase)
    : newContent;

  onUpdate({ ...element, content: transformedContent });

  // ✅ Update Excel data if it's a data field (not static)
  if (!element.isStatic && element.heading && currentRecord) {
    currentRecord[element.heading] = transformedContent;
  }
};


  const handleMaskApply = (maskedImage, isApplyingMask) => {
    if (!element.content) return;
  
    console.log("✅ Mask applied for:", element.content);
  
    // Prevent unnecessary state updates by checking if the image is already masked
    if (photos[element.content] === maskedImage) return; // Skip if no change
  
    const updatedPhotos = { ...photos, [element.content]: maskedImage };
    onPhotosChange(updatedPhotos);
  
    console.log("📸 Updated Photos State:", updatedPhotos);
  };
  
  
  const getContent = () => {
    try {
      if (imageSrc) return imageSrc;
      if (element.type === "text") return element.content;
      
      if (element.type === "image") {
        const photoKey = element.content;
        
        // For custom images, check photos first
        if (element.isCustomImage) {
          return photos[photoKey] || "/placeholder.svg";
        }
        
        // For dynamic images, try both direct and excel-based references
        const excelValue = excelData.rows[currentRecordIndex]?.[element.heading];
        return photos[excelValue] || photos[photoKey] || "/placeholder.svg";
      }
      
      return element.content || "/placeholder.svg";
    } catch (error) {
      console.warn("Error getting content:", error);
      return "/placeholder.svg";
    }
  };
  
  const renderElementContent = () => {
    if (element.type === "text") {
      const contentToRender = element.style?.textCase 
        ? transformTextCase(element.content, element.style.textCase)
        : element.content;
  
      if (isEditing) {
        return (
          <Input
            ref={inputRef}
            className="w-full h-full p-1 text-sm"
            value={contentToRender}
            onChange={handleTextChange}
            onBlur={handleInputBlur}
            autoFocus
            style={{
              display: "block",
              lineHeight: "1.2",
              padding: "0px",
              margin: "0px",
              verticalAlign: "top",
              textAlign: element.style?.alignment || "start",
              overflow: "hidden",
              fontSize: `${element.style?.originalFontSize || element.style?.fontSize || 16}px`,
              fontFamily: element.style?.fontFamily,
              fontWeight: element.style?.isBold ? "bold" : "normal",
              fontStyle: element.style?.isItalic ? "italic" : "normal",
              wordBreak: "break-word",
              whiteSpace: "pre-wrap",
              textTransform: "none", // Disable CSS text-transform since we're handling it manually
            }}
          />
        );
      } else {
        return (
          <div
            className="w-full h-full flex"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: element.style?.verticalAlignment || "flex-start",
              alignItems: element.style?.alignment || "flex-start",
              height: "100%",
              opacity: element.style?.opacity ?? 1,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div
              ref={textContainerRef}
              className="w-full h-full flex"
              style={{
                textAlign: element.style?.alignment || "left",
                lineHeight: adjustedStyles.lineHeight,
                padding: "0px",
                margin: "0px",
                overflow: "hidden",
                display: "flex",
                justifyContent: element.style?.alignment || "flex-start",
                alignItems:
                  element.style?.verticalAlignment === "top"
                    ? "flex-start"
                    : element.style?.verticalAlignment === "bottom"
                    ? "flex-end"
                    : "center",
                flexGrow: 1,
                wordBreak: "break-word",
                whiteSpace: "pre-wrap",
              }}
            >
              <span
                key={`text-span-${element.id}`}
                style={{
                  fontSize: `${adjustedStyles.fontSize}px`,
                  fontFamily: element.style?.fontFamily,
                  fontWeight: element.style?.isBold ? "bold" : "normal",
                  fontStyle: element.style?.isItalic ? "italic" : "normal",
                  position: "relative",
                  display: "inline-block",
                  color: element.style?.gradient ? undefined : element.style?.color || "#000",
                  backgroundImage: element.style?.gradient
                    ? element.style?.gradientType === "radial"
                      ? `radial-gradient(circle at center, ${element.style?.gradientColors?.join(", ")})`
                      : element.style?.gradientType === "conic"
                        ? `conic-gradient(from ${element.style?.gradientAngle || 90}deg at center, ${element.style?.gradientColors?.join(", ")})`
                        : `linear-gradient(${element.style?.gradientAngle || 90}deg, ${element.style?.gradientColors?.join(", ")})`
                    : "none",
                  backgroundSize: element.style?.gradient ? "100% 100%" : undefined,
                  backgroundRepeat: element.style?.gradient ? "no-repeat" : undefined,
                  WebkitBackgroundClip: element.style?.gradient ? "text" : undefined,
                  WebkitTextFillColor: element.style?.gradient ? "transparent" : element.style?.color || "#000",
                  WebkitTextStroke: Number(element.style?.strokeWidth) > 0
                    ? `${element.style.strokeWidth}px ${element.style.strokeColor || "transparent"}`
                    : "0 transparent",
                  textShadow:
                    element.style?.shadowBlur > 0
                      ? `${element.style?.shadowOffsetX}px ${element.style?.shadowOffsetY}px ${element.style?.shadowBlur}px ${element.style?.shadowColor}`
                      : "none",
                }}
              >
                <span style={{ display: "inline-block", minWidth: "100%" }}>
                  {contentToRender}
                </span>

  {/* Fake underline with gradient support */}
  {element.style?.isUnderlined && (
    <span
      aria-hidden="true"
      style={{
        position: "absolute",
        bottom: "0",
        left: 0,
        width: "100%",
        height: "1.5px",
        backgroundImage: element.style?.gradient
          ? element.style?.gradientType === "radial"
            ? `radial-gradient(circle at center, ${element.style?.gradientColors?.join(", ")})`
            : element.style?.gradientType === "conic"
              ? `conic-gradient(from ${element.style?.gradientAngle || 90}deg at center, ${element.style?.gradientColors?.join(", ")})`
              : `linear-gradient(${element.style?.gradientAngle || 90}deg, ${element.style?.gradientColors?.join(", ")})`
          : "none",
        backgroundColor: element.style?.gradient
          ? "transparent"
          : element.style?.color || "#000",
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
        pointerEvents: "none",
      }}
    />
  )}
  
</span>


            </div>
          </div>
        );
      }

   } else if (element.type === "image") {
      return (
        
        <div 
          className="w-full h-full flex items-center justify-center rounded overflow-hidden bg-gray-200"
          style={{
            padding: "10px", // ✅ Only affects container, not image stroke
            backgroundImage: "none",
            WebkitBackgroundClip: "border-box", 
            backgroundClip: "border-box",
           
          }}
        >
{getContent() ? (
  applyMask && maskSrc && !element.isCustomImage ? (
    <PhotoMask
      src={photos[element.content] || "/placeholder.svg"}
      maskSrc={maskSrc}
      onMaskApply={() => handleMaskApply(photos[element.content], true)}
      rotation={totalRotation} // Pass combined rotation
      className="w-full h-full object-cover"
      elementStyle={element.style}
    />
  ) : (
    <div className="relative w-full h-full flex items-center justify-center">
      <img
        src={applyMask 
          ? photos[element.content] 
          : photos[`original_${element.content}`] || photos[element.content] || "/placeholder.svg"
        }
        alt="Element Image"
        className="w-full h-full object-cover"
        onLoad={(e) => checkTransparency(e.target, setHasImageTransparency)}
        style={{
          transform: `rotate(${totalRotation}deg)`, // Apply combined rotation
          transformOrigin: "center center",
          transition: 'transform 0.2s ease',
          opacity: element.style?.opacity ?? 1,
          ...(hasImageTransparency
            ? { 
                filter: `drop-shadow(${element.style.strokeWidth}px 0 ${element.style.strokeColor}) 
                         drop-shadow(-${element.style.strokeWidth}px 0 ${element.style.strokeColor}) 
                         drop-shadow(0 ${element.style.strokeWidth}px ${element.style.strokeColor}) 
                         drop-shadow(0 -${element.style.strokeWidth}px ${element.style.strokeColor}) 
                         drop-shadow(${element.style.shadowOffsetX}px ${element.style.shadowOffsetY}px ${element.style.shadowBlur}px ${element.style.shadowColor})`
              }
            : { 
                border: `${element.style?.strokeWidth || 0}px solid ${element.style?.strokeColor || "transparent"}`,
                boxShadow: element.style?.shadowBlur
                  ? `${element.style.shadowOffsetX}px ${element.style.shadowOffsetY}px ${element.style.shadowBlur}px ${element.style.shadowColor}`
                  : "none"
              }
          )
        }}
      />
    </div>
  )
) : (
  <ImageIcon className="w-6 h-6 text-gray-400" />
)}
       
        </div>
      );

    
    }else if (element.type === "qrcode") {
        return (
          <div 
            className="w-full h-full flex items-center justify-center overflow-hidden"
            style={{
              padding: "2px", // Padding for the border effect
              boxShadow: element.style?.shadowBlur
                ? `${element.style?.shadowOffsetX}px ${element.style?.shadowOffsetY}px ${element.style?.shadowBlur}px ${element.style?.shadowColor}`
                : "none", // Apply shadow if needed
              backgroundImage: element.style?.gradient
                ? `${element.style?.gradientType}-gradient(${element.style?.gradientAngle || 90}deg, ${element.style?.gradientColors?.join(", ")})`
                : "none", // Apply gradient if enabled
              border: `${element.style?.strokeWidth || 2}px solid ${element.style?.strokeColor || "#000000"}`, // Apply border (stroke)
              borderRadius: "8px", // Optional: Adds rounded corners to the border if you want
              opacity: element.style?.opacity ?? 1, // Add this line
            }}
          >
      <QRCodeElement
        size={{ width: element.size.width, height: element.size.height }}
        rotation={rotation}
        excelHeaders={excelHeaders}
        currentRecord={currentRecord}
        // Add these new props:
        qrConfig={element.qrConfig || {}}
        onConfigChange={(newConfig) => {
          // Update the element's QR config when settings change
          const updatedElement = {
            ...element,
            qrConfig: newConfig
          };
          onUpdate(updatedElement);
        }}
      />
    </div>
  );
}
      
  
      
    
    else if (element.type === "barcode") {
      return (
        <div
          className="w-full h-full flex items-center justify-center"
          style={{
            width: "100%", 
            height: "100%",
            padding: "0", // Ensure no extra space
          }}
        >
          <BarcodeElement 
            content={element.content || "123456789012"} 
            size={{ width: "100%", height: "100%" }} // Ensure it fills the container
            rotation={rotation} 
          />
        </div>
      );
    }
    
    return null;
    };
    const checkTransparency = (image, setTransparency) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let hasTransparency = false;
    
      // Check for transparent pixels
      for (let i = 3; i < imageData.length; i += 4) {
        if (imageData[i] < 255) {
          hasTransparency = true;
          break;
        }
      }
    
      setTransparency(hasTransparency);
    };
    
   
    
    return (
      
<div
  ref={elementRef}
  className={`absolute cursor-move transition-all duration-100`}
  style={{
    left: `${element.position.x}px`,
    top: `${element.position.y}px`,
    width: `${element.size.width}px`,
    height: `${element.size.height}px`,
    // Base style (always visible)
    backgroundColor: 'hsla(0, 1.60%, 63.30%, 0.40)', // Very subtle grey always visible
    border: '1px dashed rgba(200, 200, 200, 0.6)', // Subtle dashed border
    // Selected style (overrides base when selected)
    ...(isSelected && {
      backgroundColor: 'rgba(200, 230, 255, 0.4)', // Light blue fill
      border: '2px solid #3b82f6', // Bright blue border
      boxShadow: '0 0 0 1px white inset', // Inner white border for contrast
    }),
    boxSizing: "border-box",
    borderRadius: "2px",
    position: "absolute",
    zIndex: currentZIndex,
    transform: `rotate(${rotation}deg)`,
    transformOrigin: "center center",
    opacity: element.style?.opacity ?? 1,

  }}
        onMouseDown={(e) => {
          e.stopPropagation();
        
          // Right-click → Rotate
          if (e.button === 2) {
            e.preventDefault();
            setIsRotating(true);
            return; // 🛑 Prevents triggering resize/drag on right-click
          }
          
        
          const isCtrlPressed = e.ctrlKey || e.metaKey;
          const isAlreadySelected = selectedElements.some((el) => el.id === element.id);
        
          if (isCtrlPressed) {
            // Ctrl+Click toggles the element in selection
            setSelectedElements((prev) => {
              if (isAlreadySelected) {
                return prev.filter((el) => el.id !== element.id);
              } else {
                return [...prev, element];
              }
            });
          } else {
            // Regular click replaces selection if not already selected
            if (!isAlreadySelected) {
              setSelectedElements([element]);
            }
          }
        
          // ✅ Setup for dragging
          const elementsToMove = isAlreadySelected ? selectedElements : [element];
          const containerRect = containerRef.current?.getBoundingClientRect();
        
          if (!containerRect) return;
        
          // Save initial mouse position relative to container
          dragStartRef.current = {
            x: e.clientX,
            y: e.clientY,
          };
        
          // Save initial element positions
          initialPositionsRef.current = {};
          elementsToMove.forEach((el) => {
            initialPositionsRef.current[el.id] = {
              x: el.position.x,
              y: el.position.y,
            };
          });
        
          setIsDragging(true);
          onSelect?.(e); // Safe call if onSelect is defined
        }}
        
        
        
        onContextMenu={(e) => {
          e.preventDefault(); // Prevent context menu
          return false;
        }}
        onDoubleClick={handleDoubleClick}
      >
        <div
          className="w-full h-full flex items-center justify-center"
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",

          }}
        >
          {renderElementContent()}
        </div>

        {/* Resize handle */}
{/* Resize handle - only shown if element is selected */}
{selectedElements.some((el) => el.id === element.id) && (
  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 group">
    {/* Horizontal cut line */}
    <div
      className="absolute bottom-0 right-0 w-2 h-0.5 bg-neutral-500 group-hover:bg-black transition-colors duration-150 cursor-se-resize"
      onMouseDown={(e) => {
        e.stopPropagation();
        e.preventDefault();
        setIsResizing(true);

        const elementsToResize = selectedElements;
        setTimeout(() => {
          startGroupResize(elementsToResize, zoomLevel);
        }, 0);
      }}
    />
    {/* Vertical cut line */}
    <div
      className="absolute bottom-0 right-0 w-0.5 h-2 bg-neutral-500 group-hover:bg-black transition-colors duration-150 cursor-se-resize"
      onMouseDown={(e) => {
        e.stopPropagation();
        e.preventDefault();
        setIsResizing(true);

        const elementsToResize = selectedElements;
        setTimeout(() => {
          startGroupResize(elementsToResize, zoomLevel);
        }, 0);
      }}
    />
  </div>
)}


      </div>
    );
}
    