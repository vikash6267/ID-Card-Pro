"use client"
import { useState, useEffect } from "react";
import { Button } from "./ui/button"
import { Label } from "./ui/label"
import JSZip from "jszip"
import QRCode from "qrcode"
import JsBarcode from "jsbarcode"
import BwipJS from "bwip-js";  // Import bwip-js for generating barcodes including DataMatrix
import { X, Search, Loader2, ChevronLeft, ChevronRight, Check, ChevronDown, ChevronUp } from 'lucide-react';

const PAGE_SIZES = [
  { label: "A4", width: 210, height: 297 },
  { label: "A5", width: 148, height: 210 },
  { label: "Letter", width: 216, height: 279 },
  { label: "Legal", width: 216, height: 356 },
  { label: "A3", width: 297, height: 420 },
  { label: "B5", width: 176, height: 250 },
  { label: "Tabloid", width: 279, height: 432 },
  { label: "C5", width: 162, height: 229 },
]

export default function CardGenerator({ 
  template, 
  excelData, 
  photos, 
  applyMask, 
  maskSrc,
  projects = [],
  currentProject = null 
}) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState(null)
  const [leftMargin, setLeftMargin] = useState(2); // Add this with other margin states
  const [rightMargin, setRightMargin] = useState(2); // Add this with other margin states
  const [topMargin, setTopMargin] = useState(2)
  const [bottomMargin, setBottomMargin] = useState(2)
  const [verticalSpacing, setVerticalSpacing] = useState(2)
  const [horizontalSpacing, setHorizontalSpacing] = useState(2)
  const [selectedPageSize, setSelectedPageSize] = useState(PAGE_SIZES[0])
  const [saveSeparately, setSaveSeparately] = useState(false)
  const [customPageSize, setCustomPageSize] = useState({ width: 210, height: 297 })
  const [cardRange, setCardRange] = useState("1-0")
  const [groupGenerationMode, setGroupGenerationMode] = useState('by-group')
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState(
    currentProject ? [currentProject.id] : []
  );
  const [isRangeInputDisabled, setIsRangeInputDisabled] = useState(false);
  const [projectSearch, setProjectSearch] = useState('');
  const [filteredProjects, setFilteredProjects] = useState(projects);
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 3;
  const toggleModal = () => setIsModalOpen(!isModalOpen);
  const dpi = 300
  const cardWidthPx = template.size.width * dpi
  const cardHeightPx = template.size.height * dpi
  const mmToPx = (mm) => Math.round((mm / 25.4) * dpi)
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [currentSide, setCurrentSide] = useState('front'); // or whatever default makes sense

  
  useEffect(() => {
    if (projectSearch.trim() === '') {
      setFilteredProjects(projects);
      setCurrentPage(1);
    } else {
      const filtered = projects.filter(project =>
        project.name.toLowerCase().includes(projectSearch.toLowerCase())
      );
      setFilteredProjects(filtered);
      setCurrentPage(1);
    }
  }, [projectSearch, projects]);

  // Pagination logic
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = filteredProjects.slice(indexOfFirstProject, indexOfLastProject);
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);



  const toggleProjectModal = () => {
    setIsProjectModalOpen(!isProjectModalOpen);
    setProjectSearch('');
  };

  const handleProjectSelect = (projectId) => {
    const newSelectedProjects = selectedProjects.includes(projectId)
      ? selectedProjects.filter(id => id !== projectId)
      : [...selectedProjects, projectId];
    
    setSelectedProjects(newSelectedProjects);
    setIsRangeInputDisabled(newSelectedProjects.length > 1);
  };

  const selectAllOnPage = () => {
    const pageProjectIds = currentProjects.map(p => p.id);
    const newSelected = Array.from(new Set([...selectedProjects, ...pageProjectIds]));
    setSelectedProjects(newSelected);
    setIsRangeInputDisabled(newSelected.length > 1);
  };

  const deselectAllOnPage = () => {
    const pageProjectIds = currentProjects.map(p => p.id);
    const newSelected = selectedProjects.filter(id => !pageProjectIds.includes(id));
    setSelectedProjects(newSelected);
    setIsRangeInputDisabled(newSelected.length > 1);
  };


  useEffect(() => {
    if (excelData.rows.length > 0) {
      setCardRange(`1-${excelData.rows.length}`)
    }
  }, [excelData])

// When left margin input changes
const handleLeftMarginChange = (newLeftMargin) => {
  setLeftMargin(newLeftMargin);
  
  // Calculate what right margin should be
  const totalWidth = sheetWidthMm - (cardWidthMm * cardsPerRow + horizontalSpacingMm * (cardsPerRow - 1));
  setRightMargin(totalWidth - newLeftMargin);
};

  const calculateCardPositions = (
    sheetWidthMm,
    sheetHeightMm,
    topMarginMm,
    bottomMarginMm,
    leftMarginMm,
    rightMarginMm,
    verticalSpacingMm,
    horizontalSpacingMm,
    cardWidthPx,
    cardHeightPx
  ) => {
    
    // Convert all measurements to pixels
    const sheetWidthPx = mmToPx(sheetWidthMm);
    const sheetHeightPx = mmToPx(sheetHeightMm);
    const cardWidth = cardWidthPx;
    const cardHeight = cardHeightPx;
  
    // Convert spacing to pixels (these are fixed values)
    const horizontalSpacingPx = mmToPx(horizontalSpacingMm);
    const verticalSpacingPx = mmToPx(verticalSpacingMm);
  
    // 1. First calculate how many cards fit with the fixed spacing
    const cardsPerRow = Math.max(1, Math.floor(
      (sheetWidthPx + horizontalSpacingPx) / 
      (cardWidth + horizontalSpacingPx)
    ));
    
    const cardsPerColumn = Math.max(1, Math.floor(
      (sheetHeightPx + verticalSpacingPx) / 
      (cardHeight + verticalSpacingPx)
    ));
  
    // 2. Calculate total width/height occupied by cards + fixed spacing
    const totalWidth = cardsPerRow * cardWidth + (cardsPerRow - 1) * horizontalSpacingPx;
    const totalHeight = cardsPerColumn * cardHeight + (cardsPerColumn - 1) * verticalSpacingPx;
  
    // 3. Calculate remaining space that will become margins
    const remainingWidth = sheetWidthPx - totalWidth;
    const remainingHeight = sheetHeightPx - totalHeight;
  
    // 4. Distribute remaining space to margins based on user preference
    //    While maintaining the ratio between left/right and top/bottom
    const leftRatio = leftMarginMm / (leftMarginMm + rightMarginMm) || 0.5;
    const topRatio = topMarginMm / (topMarginMm + bottomMarginMm) || 0.5;
  
    const leftMarginPx = remainingWidth * leftRatio;
    const rightMarginPx = remainingWidth * (1 - leftRatio);
    const topMarginPx = remainingHeight * topRatio;
    const bottomMarginPx = remainingHeight * (1 - topRatio);
  
    // 5. Generate positions
    const positions = [];
    for (let row = 0; row < cardsPerColumn; row++) {
      for (let col = 0; col < cardsPerRow; col++) {
        positions.push({
          x: Math.round(leftMarginPx + col * (cardWidth + horizontalSpacingPx)),
          y: Math.round(topMarginPx + row * (cardHeight + verticalSpacingPx)),
          // Additional metadata
          row: row + 1,
          column: col + 1,
          actualHorizontalSpacing: horizontalSpacingPx,
          actualVerticalSpacing: verticalSpacingPx
        });
      }
    }
  
    return {
      positions,
      calculatedMargins: {
        left: leftMarginPx / (dpi / 25.4), // Convert back to mm
        right: rightMarginPx / (dpi / 25.4),
        top: topMarginPx / (dpi / 25.4),
        bottom: bottomMarginPx / (dpi / 25.4)
      }
    };
  };
  


const generateQRCode = async (content, width, height, qrConfig = {}) => {
  try {
    const { format = "qrcode" } = qrConfig;
    
    if (format === "qrcode") {
      return await QRCode.toDataURL(content, {
        errorCorrectionLevel: "H",
        margin: 1,
        width: Math.min(width, height),
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });
    } else {
      // Handle other formats (DataMatrix, Code128, etc.)
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      
      await new Promise((resolve) => {
        BwipJS.toCanvas(canvas, {
          bcid: format,
          text: content,
          scale: 3,
          height: height * 0.8,
          includetext: true,
        }, resolve);
      });
      
      return canvas.toDataURL("image/png");
    }
  } catch (error) {
    console.error("Error generating QR/Barcode:", error);
    return null;
  }
};


  const generateBarcode = async (content, width, height) => {
    try {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
      svg.setAttribute("width", width)
      svg.setAttribute("height", height)
      document.body.appendChild(svg)

      JsBarcode(svg, content, {
        format: "CODE128",
        width: 2,
        height: height * 0.6,
        displayValue: true,
        fontSize: Math.max(10, height * 0.1),
        margin: 5,
        background: "#ffffff",
        lineColor: "#000000",
      })

      const svgData = new XMLSerializer().serializeToString(svg)
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
      const svgUrl = URL.createObjectURL(svgBlob)

      const img = await loadImage(svgUrl)

      document.body.removeChild(svg)
      URL.revokeObjectURL(svgUrl)

      return img
    } catch (error) {
      console.error("Error generating barcode:", error)
      return null
    }
  }
  const handleProjectSelection = (projectId, isChecked) => {
    let newSelectedProjects;
    if (isChecked) {
      newSelectedProjects = [...selectedProjects, projectId];
    } else {
      newSelectedProjects = selectedProjects.filter(id => id !== projectId);
    }
    setSelectedProjects(newSelectedProjects);
    
    // Disable range input when more than one project is selected
    setIsRangeInputDisabled(newSelectedProjects.length > 1);
  };
  const renderCardElements = async (ctx, elements, row, offsetX, offsetY, options = {}) => {
    const { 
      applyMask = false, 
      maskSrc = null,
      rotations = { elements: {}, gallery: {} }, // Receive rotations
      photoInstanceRotations = {} // Receive instance rotations
    } = options;
    const dpi = 300;
    const strokeScaleFactor = dpi / 96;
  
    // Add text case transformation function
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
  
    const wrapText = (ctx, text, x, y, maxWidth, lineHeight) => {
      const words = text.split(' ');
      const lines = [];
      let currentLine = words[0];
    
      for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const testLine = currentLine + ' ' + word;
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width <= maxWidth) {
          currentLine = testLine;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      }
    
      lines.push(currentLine);
    
      return lines.map((line, index) => ({
        text: line,
        x: x,
        y: y + index * lineHeight
      }));
    };
  
    const calculateOptimalFontSize = (element, content, width, height) => {
      const style = element.style || {};
      const testElement = document.createElement('div');
      testElement.style.position = 'absolute';
      testElement.style.visibility = 'hidden';
      testElement.style.whiteSpace = 'pre-wrap';
      testElement.style.wordBreak = 'break-word';
      testElement.style.fontFamily = style.fontFamily || 'sans-serif';
      testElement.style.fontWeight = style.isBold ? 'bold' : 'normal';
      testElement.style.fontStyle = style.isItalic ? 'italic' : 'normal';
      testElement.style.width = `${width}px`;
      testElement.style.padding = '0';
      testElement.style.margin = '0';
      testElement.style.lineHeight = style.lineHeight || '1.2';
      testElement.textContent = content;
      
      document.body.appendChild(testElement);
  
      let minSize = 4;
      let maxSize = style.fontSize || 16;
      let optimalSize = maxSize;
      let optimalLineHeight = style.lineHeight || 1.2;
  
      testElement.style.fontSize = `${maxSize}px`;
      const initialHeight = testElement.offsetHeight;
  
      if (initialHeight <= height) {
        document.body.removeChild(testElement);
        return { fontSize: maxSize, lineHeight: optimalLineHeight };
      }
  
      while (minSize <= maxSize) {
        const midSize = Math.floor((minSize + maxSize) / 2);
        const midLineHeight = Math.max(1, (midSize / 16) * (style.lineHeight || 1.2));
        
        testElement.style.fontSize = `${midSize}px`;
        testElement.style.lineHeight = `${midLineHeight}`;
        
        const currentHeight = testElement.offsetHeight;
        
        if (currentHeight <= height) {
          optimalSize = midSize;
          optimalLineHeight = midLineHeight;
          minSize = midSize + 1;
        } else {
          maxSize = midSize - 1;
        }
      }
  
      document.body.removeChild(testElement);
      return { fontSize: optimalSize, lineHeight: optimalLineHeight };
    };
  
    const sortedElements = [...elements].sort((a, b) => {
      const aZIndex = a.style?.zIndex || 1;
      const bZIndex = b.style?.zIndex || 1;
      return aZIndex - bZIndex;
    });
  for (const element of sortedElements) {
    if (element.type === "text") {
      ctx.save();
      
      const posX = element.position.x + offsetX;
      const posY = element.position.y + offsetY;
      const width = element.size.width;
      const height = element.size.height;
      const rawContent = element.isStatic 
        ? element.content 
        : (row[element.heading]?.toString()?.trim() || element.content || "N/A"); // Fix here
      const style = element.style || {};
        
        // Apply text case transformation
        const content = style.textCase 
          ? transformTextCase(rawContent, style.textCase)
          : rawContent;
        
        // Calculate optimal font size
        const adjustedStyles = calculateOptimalFontSize(element, content, width, height);
        const fontSize = adjustedStyles.fontSize;
        const lineHeight = adjustedStyles.lineHeight;
  
        const rectX = posX;
        const rectY = posY;
        const rectWidth = width;
        const rectHeight = height;
        const rotation = (element.rotation || 0) * (Math.PI / 180);
  
        // Set up font and basic styles
        ctx.font = `${style.isBold ? "bold " : ""}${style.isItalic ? "italic " : ""}${fontSize}px ${style.fontFamily || "Arial"}`;
        ctx.strokeStyle = style.strokeColor || "transparent";
        ctx.lineWidth = (style.strokeWidth || 0) * strokeScaleFactor;
        ctx.textAlign = style.alignment || "left";
        
        // Calculate text baseline based on vertical alignment
        let textBaseline;
        switch (style.verticalAlignment) {
          case "top":
            textBaseline = "top";
            break;
          case "middle":
            textBaseline = "middle";
            break;
          case "bottom":
            textBaseline = "alphabetic"; // Use alphabetic for better bottom alignment
            break;
          default:
            textBaseline = "top";
        }
        ctx.textBaseline = textBaseline;
        
  
        if (style.shadowBlur > 0) {
          ctx.shadowColor = style.shadowColor || "transparent";
          ctx.shadowBlur = style.shadowBlur;
          ctx.shadowOffsetX = style.shadowOffsetX || 0;
          ctx.shadowOffsetY = style.shadowOffsetY || 0;
        
          // Apply gradient only to text, not container
          if (style.gradient) {
            let gradientFill;
            const colors = style.gradientColors || ["#ff0000", "#0000ff"];
  
            if (style.gradientType === "linear") {
              const angleRad = (style.gradientAngle || 90) * (Math.PI / 180);
              gradientFill = ctx.createLinearGradient(
                rectX,
                rectY,
                rectX + Math.cos(angleRad) * rectWidth,
                rectY + Math.sin(angleRad) * rectHeight
              );
            } else if (style.gradientType === "radial") {
              gradientFill = ctx.createRadialGradient(
                rectX + rectWidth / 2, rectY + rectHeight / 2, 0,
                rectX + rectWidth / 2, rectY + rectHeight / 2, Math.max(rectWidth, rectHeight) / 2
              );
            }
  
            if (gradientFill) {
              colors.forEach((color, index) => {
                gradientFill.addColorStop(index / (colors.length - 1), color);
              });
              ctx.fillStyle = gradientFill;
            }
          } else {
            ctx.fillStyle = style.color || "#000000";
          }
  

  const centerX = posX + width / 2;
  const centerY = posY + height / 2;

  ctx.translate(centerX, centerY);
  ctx.rotate(rotation);
  ctx.translate(-width / 2, -height / 2);

  // Wrap and draw text
  const wrappedLines = wrapText(ctx, content, 0, 0, width, fontSize * lineHeight);
  const totalTextHeight = wrappedLines.length * fontSize * lineHeight;
  
  let startY = 0;
  if (style.verticalAlignment === "middle") {
    startY = (height - totalTextHeight) / 2;
  } else if (style.verticalAlignment === "bottom") {
    startY = height - totalTextHeight;
  }
  
  ctx.globalAlpha = style.opacity ?? 1;
  
  wrappedLines.forEach((line, i) => {
    const currentY = startY + i * fontSize * lineHeight;
    let lineX = 0;
    const metrics = ctx.measureText(line.text);
  
    if (style.alignment === "center") {
      lineX = (width - metrics.width) / 2;
    } else if (style.alignment === "right") {
      lineX = width - metrics.width;
    }
  
    if (style.strokeWidth > 0 && style.strokeColor !== "transparent") {
      ctx.strokeText(line.text, lineX, currentY);
    }
  
    ctx.fillText(line.text, lineX, currentY);
          });
  
          // Handle underline with gradient if needed
          if (style.isUnderlined && wrappedLines.length > 0) {
            const lastLine = wrappedLines[wrappedLines.length - 1];
            const metrics = ctx.measureText(lastLine.text);
            
            let underlineX = lastLine.x;
            let underlineY = lastLine.y + fontSize + 2;
            
            if (ctx.textAlign === "center") {
              underlineX -= metrics.width / 2;
            } else if (ctx.textAlign === "right") {
              underlineX -= metrics.width;
            }
  
            ctx.save();
            if (style.gradient) {
              // Create gradient for underline that matches text gradient
              let underlineGradient;
              const colors = style.gradientColors || ["#ff0000", "#0000ff"];
              
              if (style.gradientType === "linear") {
                const angleRad = (style.gradientAngle || 90) * (Math.PI / 180);
                underlineGradient = ctx.createLinearGradient(
                  underlineX,
                  underlineY,
                  underlineX + metrics.width,
                  underlineY
                );
              } else {
                // For radial/conic, just use first color as fallback
                ctx.strokeStyle = colors[0];
              }
  
              if (underlineGradient) {
                colors.forEach((color, index) => {
                  underlineGradient.addColorStop(index / (colors.length - 1), color);
                });
                ctx.strokeStyle = underlineGradient;
              }
            } else {
              ctx.strokeStyle = style.color || "#000000";
            }
            
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(underlineX, underlineY);
            ctx.lineTo(underlineX + metrics.width, underlineY);
            ctx.stroke();
            ctx.restore();
          }
  
          ctx.globalAlpha = 1;
          ctx.restore();
        } else {
          ctx.save();
  
          const centerX = rectX + rectWidth / 2;
          const centerY = rectY + rectHeight / 2;
          
          ctx.translate(centerX, centerY);
          ctx.rotate(rotation);
          ctx.translate(-rectWidth / 2, -rectHeight / 2);
          
          ctx.beginPath();
          ctx.rect(0, 0, rectWidth, rectHeight);
          ctx.clip();
          
          // Set up font and basic styles
          ctx.font = `${style.isBold ? "bold " : ""}${style.isItalic ? "italic " : ""}${fontSize}px ${style.fontFamily || "Arial"}`;
          ctx.strokeStyle = style.strokeColor || "transparent";
          ctx.lineWidth = (style.strokeWidth || 0) * strokeScaleFactor;
          ctx.textAlign = "left";
          ctx.textBaseline = "top";
          
          if (style.shadowBlur > 0) {
            ctx.shadowColor = style.shadowColor || "transparent";
            ctx.shadowBlur = style.shadowBlur;
            ctx.shadowOffsetX = style.shadowOffsetX || 0;
            ctx.shadowOffsetY = style.shadowOffsetY || 0;
          } else {
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
          }
          
          // Apply gradient only to text
          if (style.gradient) {
            let gradientFill;
            const colors = style.gradientColors || ["#ff0000", "#0000ff"];
  
            if (style.gradientType === "linear") {
              gradientFill = ctx.createLinearGradient(0, 0, rectWidth, rectHeight);
            } else if (style.gradientType === "radial") {
              gradientFill = ctx.createRadialGradient(
                rectWidth / 2, rectHeight / 2, 0,
                rectWidth / 2, rectHeight / 2, Math.max(rectWidth, rectHeight) / 2
              );
            }
  
            if (gradientFill) {
              colors.forEach((color, index) => {
                gradientFill.addColorStop(index / (colors.length - 1), color);
              });
              ctx.fillStyle = gradientFill;
            }
          } else {
            ctx.fillStyle = style.color || "#000000";
          }
          
          const wrappedLines = wrapText(ctx, content, 0, 0, rectWidth, fontSize * lineHeight);
          const totalTextHeight = wrappedLines.length * fontSize * lineHeight;
          
          let startY = 0;
          if (style.verticalAlignment === "middle") {
            startY = (rectHeight - totalTextHeight) / 2;
          } else if (style.verticalAlignment === "bottom") {
            startY = rectHeight - totalTextHeight;
          }
          
          ctx.globalAlpha = style.opacity ?? 1;
          
          wrappedLines.forEach((line, i) => {
            const currentY = startY + i * fontSize * lineHeight;
            let lineX = 0;
            const metrics = ctx.measureText(line.text);
          
            if (style.alignment === "center") {
              lineX = (rectWidth - metrics.width) / 2;
            } else if (style.alignment === "right") {
              lineX = rectWidth - metrics.width;
            }
          
            if (style.strokeWidth > 0 && style.strokeColor !== "transparent") {
              ctx.strokeText(line.text, lineX, currentY);
            }
          
            ctx.fillText(line.text, lineX, currentY);
          
            if (style.isUnderlined && i === wrappedLines.length - 1) {
              ctx.save();
              if (style.gradient) {
                // Create gradient for underline that matches text gradient
                let underlineGradient;
                const colors = style.gradientColors || ["#ff0000", "#0000ff"];
                
                if (style.gradientType === "linear") {
                  underlineGradient = ctx.createLinearGradient(
                    lineX, 
                    currentY + fontSize + 2,
                    lineX + metrics.width,
                    currentY + fontSize + 2
                  );
                } else {
                  // For radial/conic, just use first color as fallback
                  ctx.strokeStyle = colors[0];
                }
  
                if (underlineGradient) {
                  colors.forEach((color, index) => {
                    underlineGradient.addColorStop(index / (colors.length - 1), color);
                  });
                  ctx.strokeStyle = underlineGradient;
                }
              } else {
                ctx.strokeStyle = style.color || "#000000";
              }
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(lineX, currentY + fontSize + 2);
              ctx.lineTo(lineX + metrics.width, currentY + fontSize + 2);
              ctx.stroke();
              ctx.restore();
            }
          });
          
          ctx.globalAlpha = 1;
          ctx.restore();
        }
        ctx.restore();
      }
  

      if (element.type === "image") {
        // 1. Get the correct photo key (handles both custom and dynamic images)
        const photoKey = element.isCustomImage 
          ? element.content 
          : (row[element.heading]?.toString().trim() || element.content); // Fix here
        
        // 2. Get the image source (with fallback to placeholder)
        const originalImage = photos[photoKey] || '/placeholder.svg';
        
        // 3. Determine if we should apply mask (only for non-custom images when enabled)
        const shouldApplyMask = applyMask && maskSrc && !element.isCustomImage;
        
        // 4. Calculate all rotation components
        const elementRotation = element.rotation || 0; // Individual element rotation
        const galleryRotation = rotations.gallery[photoKey] || 0; // Gallery-wide rotation for this photo
        const instanceRotation = photoInstanceRotations[element.id]?.[photoKey] || 0; // Instance-specific rotation
        
        // 5. Calculate total rotation (sum of all applicable rotations)
        const totalRotation = elementRotation + galleryRotation + instanceRotation;
      
        // 6. Load the image (masked version if applicable)
        const imageUrl = shouldApplyMask 
          ? photos[`masked_${photoKey}`] || originalImage 
          : originalImage;
        
        const img = await loadImage(imageUrl);
        
        if (img) {
          // 7. Check for transparency (for proper stroke rendering)
          const isTransparent = await checkImageTransparency(img);
      
          ctx.save();
          ctx.globalAlpha = element.style?.opacity ?? 1;
      
          // 8. Set up transformation context (position + rotation)
          ctx.translate(
            element.position.x + offsetX + element.size.width / 2,
            element.position.y + offsetY + element.size.height / 2
          );
          ctx.rotate(totalRotation * (Math.PI / 180)); // Apply total rotation
      
          // 9. Calculate drawing area with padding
          const padding = 10;
          const strokeOffset = element.style?.strokeWidth 
            ? element.style.strokeWidth * strokeScaleFactor 
            : 0;
          const transparentStrokeScale = 0.5;
      
          const drawX = -element.size.width / 2 + padding + strokeOffset / 2;
          const drawY = -element.size.height / 2 + padding + strokeOffset / 2;
          const drawWidth = element.size.width - 2 * (padding + strokeOffset / 2);
          const drawHeight = element.size.height - 2 * (padding + strokeOffset / 2);
      
          // 10. Create intermediate canvas for image processing
          const finalImgCanvas = document.createElement("canvas");
          const finalImgCtx = finalImgCanvas.getContext("2d");
          finalImgCanvas.width = element.size.width;
          finalImgCanvas.height = element.size.height;
      
          // 11. Draw the base image
          finalImgCtx.drawImage(img, 0, 0, element.size.width, element.size.height);
      
          // 12. Apply mask if needed
          if (shouldApplyMask) {
            const maskImg = await loadImage(maskSrc);
            if (maskImg) {
              finalImgCtx.globalCompositeOperation = "destination-in";
              finalImgCtx.drawImage(maskImg, 0, 0, element.size.width, element.size.height);
              finalImgCtx.globalCompositeOperation = "source-over";
            }
          }
      
          // 13. Handle stroke for transparent images
          if (isTransparent && element.style?.strokeWidth > 0) {
            const adjustedStroke = strokeOffset * transparentStrokeScale;
      
            ctx.filter = `
              drop-shadow(${adjustedStroke}px 0 ${element.style.strokeColor}) 
              drop-shadow(-${adjustedStroke}px 0 ${element.style.strokeColor}) 
              drop-shadow(0 ${adjustedStroke}px ${element.style.strokeColor}) 
              drop-shadow(0 -${adjustedStroke}px ${element.style.strokeColor})
            `;
      
            const strokeCanvas = document.createElement("canvas");
            const strokeCtx = strokeCanvas.getContext("2d");
            strokeCanvas.width = element.size.width;
            strokeCanvas.height = element.size.height;
      
            strokeCtx.drawImage(finalImgCanvas, 0, 0, element.size.width, element.size.height);
            strokeCtx.globalCompositeOperation = "source-atop";
            strokeCtx.strokeStyle = element.style.strokeColor;
            strokeCtx.lineWidth = adjustedStroke;
            strokeCtx.strokeRect(0, 0, element.size.width, element.size.height);
            strokeCtx.globalCompositeOperation = "source-over";
      
            finalImgCtx.drawImage(strokeCanvas, 0, 0, element.size.width, element.size.height);
          }
      
          // 14. Handle stroke for opaque images
          if (!isTransparent && element.style?.strokeWidth > 0) {
            finalImgCtx.strokeStyle = element.style.strokeColor;
            finalImgCtx.lineWidth = strokeOffset;
            finalImgCtx.strokeRect(0, 0, element.size.width, element.size.height);
          }
      
          // 15. Apply shadows if needed
          ctx.save();
          if (element.style?.shadowBlur > 0) {
            ctx.shadowColor = element.style.shadowColor || "black";
            ctx.shadowBlur = element.style.shadowBlur;
            ctx.shadowOffsetX = element.style.shadowOffsetX || 0;
            ctx.shadowOffsetY = element.style.shadowOffsetY || 0;
          } else {
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
          }
      
          // 16. Draw the final image
          ctx.drawImage(finalImgCanvas, drawX, drawY, drawWidth, drawHeight);
          ctx.restore();
      
          // 17. Restore context
          ctx.restore();
        }
      }}}
    

  const checkImageTransparency = (image) => {
    return new Promise((resolve) => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        canvas.width = image.width
        canvas.height = image.height
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data
        for (let i = 3; i < imageData.length; i += 4) {
            if (imageData[i] < 255) {
                resolve(true)
                return
            }
        }
        resolve(false)
    })
  }

  const parseCardRange = (range) => {
    const ranges = range.split('r').map(r => r.trim())
    const indices = new Set()

    ranges.forEach(r => {
        if (r.includes('-')) {
            const [start, end] = r.split('-').map(Number)
            for (let i = start; i <= end; i++) {
                indices.add(i)
            }
        } else {
            const num = Number(r)
            if (!isNaN(num)) {
                indices.add(num)
            }
        }
    })

    return Array.from(indices).sort((a, b) => a - b)
  }

  const generateProjectCards = async (project, zipFolder) => {
    const { 
      template, 
      excelData, 
      photos, 
      applyMask: projectApplyMask,  
      maskSrc: projectMaskSrc,
      elements,
      rotations: projectRotations, // Get project-specific rotations
      photoInstanceRotations: projectPhotoInstanceRotations // Get instance rotations
    } = project;
    
    const projectCardWidthPx = template.size.width * dpi;
    const projectCardHeightPx = template.size.height * dpi;
    
    // Only apply mask if:
    // 1. The project has applyMask set to true AND
    // 2. There's a mask source available
    const currentApplyMask = typeof projectApplyMask !== 'undefined' ? projectApplyMask : applyMask;
    const currentMaskSrc = projectMaskSrc || maskSrc;
    const { width, height } = selectedPageSize.label === "custom" ? customPageSize : selectedPageSize;
    
    // Use ALL rows from the project's excelData, not just the selected range
    const selectedCardIndices = isRangeInputDisabled 
    ? Array.from({ length: excelData.rows.length }, (_, i) => i + 1)
    : parseCardRange(cardRange);
    
    // Calculate adjusted page size based on THIS project's card orientation
    const isCardPortrait = projectCardWidthPx > projectCardHeightPx;
    let adjustedPageSize = isCardPortrait ? { width, height } : { width: height, height: width };
    
    const mainFolder = zipFolder.folder(project.name.replace(/[^a-zA-Z0-9]/g, "_"));

    const getBackgroundGroupForRow = (side, row) => {
      const sideData = template[side];
      if (!sideData || sideData.backgroundMode !== 'dynamic') return null;
      
      const currentValue = row?.[sideData.backgroundColumn]?.toString().trim();
      return sideData.backgroundGroups.find(group => 
        group.values.includes(currentValue) || 
        group.values.includes('__ALL__') ||
        (currentValue === '' && group.values.includes('__BLANK__'))
      );
    };

    const getBackgroundUrl = (side, row) => {
      const sideData = template[side];
      if (!sideData) return null;
      
      if (sideData.backgroundMode === 'dynamic') {
        const group = getBackgroundGroupForRow(side, row);
        return group?.image || sideData.background;
      }
      return sideData.background;
    };

    const hasValidBackground = (side) => {
      const sideData = template[side];
      if (!sideData) return false;
      
      if (sideData.backgroundMode === 'static') {
        return !!sideData.background;
      } else {
        return sideData.backgroundGroups?.some(g => g.image) || !!sideData.background;
      }
    };

    for (const side of ['front', 'back']) {
      const sideData = template[side];
      if (!sideData || !hasValidBackground(side)) continue;

      if (sideData.backgroundMode === 'static') {
        if (saveSeparately) {
          for (let i of selectedCardIndices) {
            const row = excelData.rows[i - 1];
            const backgroundUrl = sideData.background;
            if (!backgroundUrl) continue;

            const canvas = document.createElement("canvas");
            canvas.width = projectCardWidthPx;
            canvas.height = projectCardHeightPx;
            const ctx = canvas.getContext("2d");
            
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            const backgroundImg = await loadImage(backgroundUrl);
            if (backgroundImg) {
              ctx.drawImage(backgroundImg, 0, 0, projectCardWidthPx, projectCardHeightPx);
            }
            
            await renderCardElements(ctx, sideData.elements, row, 0, 0, {
              applyMask: currentApplyMask,
              maskSrc: currentMaskSrc,
              rotations: projectRotations, // Pass element rotations
              galleryRotations: project.galleryRotations || {}, // Pass gallery rotations
              photoInstanceRotations: projectPhotoInstanceRotations // Pass instance rotations
            });
          
            
            const folder = mainFolder.folder(`${side}/static`);
            const blob = await canvasToBlob(canvas);
            folder.file(`card_${i}.jpeg`, blob);
          }
        } else {
          const sheetWidthMm = adjustedPageSize.width;
          const sheetHeightMm = adjustedPageSize.height;
          const { positions, calculatedMargins } = calculateCardPositions(
            sheetWidthMm, 
            sheetHeightMm,
            topMargin,
            bottomMargin,
            leftMargin,    // Add this
            rightMargin,   // Add this
            verticalSpacing,
            horizontalSpacing,
            projectCardWidthPx,
            projectCardHeightPx
          );

          let sheetIndex = 1;
          let cardIndex = 0;
          
          while (cardIndex < selectedCardIndices.length) {
            const cardsPerSheet = positions.length;
            const cardsOnCurrentSheet = Math.min(cardsPerSheet, selectedCardIndices.length - cardIndex);
            
            const canvas = document.createElement("canvas");
            canvas.width = mmToPx(sheetWidthMm);
            canvas.height = mmToPx(sheetHeightMm);
            const ctx = canvas.getContext("2d");
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            for (let i = 0; i < cardsOnCurrentSheet; i++) {
              const row = excelData.rows[selectedCardIndices[cardIndex + i] - 1];
              const position = positions[i];
              
              const backgroundImg = await loadImage(sideData.background);
              if (backgroundImg) {
                ctx.drawImage(backgroundImg, position.x, position.y, projectCardWidthPx, projectCardHeightPx);
              }
              await renderCardElements(ctx, sideData.elements, row, position.x, position.y, {
                applyMask: currentApplyMask,
                maskSrc: currentMaskSrc,
                rotations: projectRotations, // Pass element rotations
                galleryRotations: project.galleryRotations || {}, // Pass gallery rotations
                photoInstanceRotations: projectPhotoInstanceRotations // Pass instance rotations
              });
            }
            const folder = mainFolder.folder(`${side}/static`);
            const blob = await canvasToBlob(canvas);
            folder.file(`sheet_${sheetIndex}.jpeg`, blob);
            
            cardIndex += cardsOnCurrentSheet;
            sheetIndex++;
          }
        }
      } else if (sideData.backgroundMode === 'dynamic') {
        if (groupGenerationMode === 'by-group') {
          const groups = sideData.backgroundGroups || [];
          
          for (const group of groups) {
            if (!group.image) continue;
            
            const groupName = group.name.replace(/[^a-zA-Z0-9]/g, "_");
            const groupFolder = mainFolder.folder(`${side}/${groupName}`);
            
            const groupRows = excelData.rows.filter((row, index) => {
              if (!selectedCardIndices.includes(index + 1)) return false;
              const rowGroup = getBackgroundGroupForRow(side, row);
              return rowGroup?.name === group.name;
            });

            if (saveSeparately) {
              for (let i = 0; i < groupRows.length; i++) {
                const row = groupRows[i];
                const canvas = document.createElement("canvas");
                canvas.width = projectCardWidthPx;
                canvas.height = projectCardHeightPx;
                const ctx = canvas.getContext("2d");
                
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                const backgroundImg = await loadImage(group.image);
                if (backgroundImg) {
                  ctx.drawImage(backgroundImg, 0, 0, projectCardWidthPx, projectCardHeightPx);
                }
                
                await renderCardElements(ctx, sideData.elements, row, 0, 0, {
                  applyMask: currentApplyMask,
                  maskSrc: currentMaskSrc,
                  rotations: projectRotations, // Pass element rotations
                  galleryRotations: project.galleryRotations || {}, // Pass gallery rotations
                  photoInstanceRotations: projectPhotoInstanceRotations // Pass instance rotations
                });
              
                
                const blob = await canvasToBlob(canvas);
                groupFolder.file(`card_${i + 1}.jpeg`, blob);
              }
            } else {
              const sheetWidthMm = adjustedPageSize.width;
              const sheetHeightMm = adjustedPageSize.height;
              const { positions, calculatedMargins } = calculateCardPositions(
                sheetWidthMm, 
                sheetHeightMm,
                topMargin,
                bottomMargin,
                leftMargin,    // Add this
                rightMargin,   // Add this
                verticalSpacing,
                horizontalSpacing,
                projectCardWidthPx,
                projectCardHeightPx
              );

              let sheetIndex = 1;
              let cardIndex = 0;
              
              while (cardIndex < groupRows.length) {
                const cardsPerSheet = positions.length;
                const cardsOnCurrentSheet = Math.min(cardsPerSheet, groupRows.length - cardIndex);
                
                const canvas = document.createElement("canvas");
                canvas.width = mmToPx(sheetWidthMm);
                canvas.height = mmToPx(sheetHeightMm);
                const ctx = canvas.getContext("2d");
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                for (let i = 0; i < cardsOnCurrentSheet; i++) {
                  const row = groupRows[cardIndex + i];
                  const position = positions[i];
                  
                  const backgroundImg = await loadImage(group.image);
                  if (backgroundImg) {
                    ctx.drawImage(backgroundImg, position.x, position.y, projectCardWidthPx, projectCardHeightPx);
                  }
                  await renderCardElements(ctx, sideData.elements, row, position.x, position.y, {
                    applyMask: currentApplyMask,
                    maskSrc: currentMaskSrc,
                    rotations: projectRotations, // Pass element rotations
                    galleryRotations: project.galleryRotations || {}, // Pass gallery rotations
                    photoInstanceRotations: projectPhotoInstanceRotations // Pass instance rotations
                  });
                }
                
                const blob = await canvasToBlob(canvas);
                groupFolder.file(`sheet_${sheetIndex}.jpeg`, blob);
                
                cardIndex += cardsOnCurrentSheet;
                sheetIndex++;
              }
            }
          }
        } else {
          // Continuous mode
          if (saveSeparately) {
            const sideFolder = mainFolder.folder(side);
            
            const recordsByGroup = {};
            const groupOrder = [];

            if (sideData.backgroundGroups) {
              sideData.backgroundGroups.forEach(group => {
                recordsByGroup[group.name] = [];
                groupOrder.push(group.name);
              });
            }
            recordsByGroup['_ungrouped'] = [];
            groupOrder.push('_ungrouped');

            selectedCardIndices.forEach(index => {
              const row = excelData.rows[index - 1];
              const group = getBackgroundGroupForRow(side, row);
              const groupName = group?.name || '_ungrouped';
              if (!recordsByGroup[groupName]) {
                recordsByGroup[groupName] = [];
              }
              recordsByGroup[groupName].push({ row, originalIndex: index });
            });

            for (const groupName of groupOrder) {
              const groupRecords = recordsByGroup[groupName] || [];
              const group = sideData.backgroundGroups?.find(g => g.name === groupName);
              
              for (const { row, originalIndex } of groupRecords) {
                const canvas = document.createElement("canvas");
                canvas.width = projectCardWidthPx;
                canvas.height = projectCardHeightPx;
                const ctx = canvas.getContext("2d");
                
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                const bgImage = group?.image || sideData.background;
                if (bgImage) {
                  const bgImg = await loadImage(bgImage);
                  if (bgImg) {
                    ctx.drawImage(bgImg, 0, 0, projectCardWidthPx, projectCardHeightPx);
                  }
                }
                
                await renderCardElements(ctx, sideData.elements, row, 0, 0, {
                  applyMask: currentApplyMask,
                  maskSrc: currentMaskSrc,
                  rotations: projectRotations, // Pass element rotations
                  galleryRotations: project.galleryRotations || {}, // Pass gallery rotations
                  photoInstanceRotations: projectPhotoInstanceRotations // Pass instance rotations
                });
              
                
                const blob = await canvasToBlob(canvas);
                sideFolder.file(`card_${originalIndex}.jpeg`, blob);
              }
            }
          } else {
            const sheetWidthMm = adjustedPageSize.width;
            const sheetHeightMm = adjustedPageSize.height;
            const { positions, calculatedMargins } = calculateCardPositions(
              sheetWidthMm, 
              sheetHeightMm,
              topMargin,
              bottomMargin,
              leftMargin,    // Add this
              rightMargin,   // Add this
              verticalSpacing,
              horizontalSpacing,
              projectCardWidthPx,
              projectCardHeightPx
            );

            const recordsByGroup = {};
            const groupOrder = [];

            if (sideData.backgroundGroups) {
              sideData.backgroundGroups.forEach(group => {
                recordsByGroup[group.name] = [];
                groupOrder.push(group.name);
              });
            }
            recordsByGroup['_ungrouped'] = [];
            groupOrder.push('_ungrouped');

            selectedCardIndices.forEach(index => {
              const row = excelData.rows[index - 1];
              const group = getBackgroundGroupForRow(side, row);
              const groupName = group?.name || '_ungrouped';
              if (!recordsByGroup[groupName]) {
                recordsByGroup[groupName] = [];
              }
              recordsByGroup[groupName].push(row);
            });

            let sheetIndex = 1;
            let currentPositionIndex = 0;
            let currentCanvas = null;
            let currentCtx = null;

            const startNewSheet = () => {
              currentCanvas = document.createElement("canvas");
              currentCanvas.width = mmToPx(sheetWidthMm);
              currentCanvas.height = mmToPx(sheetHeightMm);
              currentCtx = currentCanvas.getContext("2d");
              currentCtx.fillStyle = "#ffffff";
              currentCtx.fillRect(0, 0, currentCanvas.width, currentCanvas.height);
              currentPositionIndex = 0;
            };

            startNewSheet();

            for (const groupName of groupOrder) {
              const group = sideData.backgroundGroups?.find(g => g.name === groupName);
              const groupRows = recordsByGroup[groupName] || [];

              for (const row of groupRows) {
                if (currentPositionIndex >= positions.length) {
                  const blob = await canvasToBlob(currentCanvas);
                  mainFolder.file(`${side}/sheet_${sheetIndex}.jpeg`, blob);
                  sheetIndex++;
                  startNewSheet();
                }

                const position = positions[currentPositionIndex];
                const bgImage = group?.image || sideData.background;

                if (bgImage) {
                  const bgImg = await loadImage(bgImage);
                  if (bgImg) {
                    currentCtx.drawImage(bgImg, position.x, position.y, projectCardWidthPx, projectCardHeightPx);
                  }
                }

                await renderCardElements(currentCtx, sideData.elements, row, position.x, position.y, {
                  applyMask: currentApplyMask,
                  maskSrc: currentMaskSrc,
                  rotations: projectRotations, // Pass element rotations
                  galleryRotations: project.galleryRotations || {}, // Pass gallery rotations
                  photoInstanceRotations: projectPhotoInstanceRotations // Pass instance rotations
                });
              
                currentPositionIndex++;
              }
            }

            if (currentPositionIndex > 0) {
              const blob = await canvasToBlob(currentCanvas);
              mainFolder.file(`${side}/sheet_${sheetIndex}.jpeg`, blob);
            }
          }
        }
      }
    }
  };

  const generateMultipleProjects = async (projectsToGenerate) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const zip = new JSZip();
      const mainFolder = zip.folder("all_id_cards");

      for (const project of projectsToGenerate) {
        await generateProjectCards(project, mainFolder);
      }

      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = "multiple_projects_id_cards.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

    } catch (error) {
      console.error("Error generating multiple projects:", error);
      setError(error.message || "An error occurred while generating multiple projects.");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateJPEG = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const zip = new JSZip();
      const mainFolder = zip.folder("id_cards");
      
      await generateProjectCards({
        template,
        excelData,
        photos,
        applyMask, // Pass the current applyMask setting
        maskSrc,   // Pass the current maskSrc
        name: "current_project",
        elements: template[currentSide].elements // Pass elements to access isCustomImage
      }, mainFolder);

      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = "id_cards.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
  
    } catch (error) {
      console.error("Error generating JPEG:", error);
      setError(error.message || "An error occurred while generating the JPEG.");
    } finally {
      setIsGenerating(false);
    }
  };

  const canvasToBlob = (canvas) => {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, "image/jpeg", 0.9);
    });
  };

  const loadImage = (src) => {
    return new Promise((resolve) => {
        if (!src) return resolve(null)
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.src = src
        img.onload = () => resolve(img)
        img.onerror = () => {
            console.error(`Error loading image: ${src}`)
            resolve(null)
        }
    })
  }

  return (
    <div className="space-y-4 p-4 max-w-xl mx-auto">
      <div className="flex justify-end">
        <Button
          onClick={toggleModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Generate Cards
        </Button>
      </div>
  
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="p-6 pb-0 flex justify-between items-center border-b">
              <h3 className="text-lg font-semibold">ID Card Generator</h3>
              <button 
                onClick={toggleModal}
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
  
            <div className="overflow-y-auto flex-1 p-6 space-y-6">
              {/* Project Selection Section */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label className="font-medium">Select Projects</Label>
                  <div className="text-sm text-gray-500">
                    {selectedProjects.length} selected of {projects.length}
                  </div>
                </div>
                
                <div className="relative mb-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search projects..."
                      value={projectSearch}
                      onChange={(e) => setProjectSearch(e.target.value)}
                      className="w-full border rounded-md py-2 pl-10 pr-4"
                    />
                  </div>
                </div>
                
                <div className="border rounded-md overflow-hidden">
                  <div className="max-h-[300px] overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                            <input
                              type="checkbox"
                              checked={
                                currentProjects.length > 0 && 
                                currentProjects.every(project => 
                                  selectedProjects.includes(project.id)
                                )
                              }
                              onChange={(e) => {
                                if (e.target.checked) {
                                  selectAllOnPage();
                                } else {
                                  deselectAllOnPage();
                                }
                              }}
                              className="h-4 w-4 text-blue-600 rounded"
                            />
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Project Name
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                            Cards
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {currentProjects.length > 0 ? (
                          currentProjects.map((project) => (
                            <tr key={project.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 whitespace-nowrap">
                                <input
                                  type="checkbox"
                                  checked={selectedProjects.includes(project.id)}
                                  onChange={() => handleProjectSelect(project.id)}
                                  className="h-4 w-4 text-blue-600 rounded"
                                />
                              </td>
                              <td className="px-4 py-3">
                                <Label className="block truncate max-w-xs">
                                  {project.name}
                                </Label>
                              </td>
                              <td className="px-4 py-3 text-gray-500 text-center">
                                {project.excelData?.rows?.length || 0}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={3} className="px-4 py-4 text-center text-gray-500">
                              {projectSearch ? 'No matching projects found' : 'No projects available'}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Pagination Controls */}
                  {filteredProjects.length > projectsPerPage && (
                    <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="flex items-center px-3 py-1 text-sm text-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Previous
                      </button>
                      
                      <span className="text-sm text-gray-700">
                        Page {currentPage} of {totalPages}
                      </span>
                      
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="flex items-center px-3 py-1 text-sm text-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                  )}
                </div>
                
                {selectedProjects.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {projects
                      .filter(p => selectedProjects.includes(p.id))
                      .slice(0, 3)
                      .map(project => (
                        <span 
                          key={project.id}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {project.name}
                          <button
                            onClick={() => handleProjectSelect(project.id)}
                            className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </span>
                      ))}
                    {selectedProjects.length > 3 && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        +{selectedProjects.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
  
              <div className="space-y-6">
                <div>
                  <Label className="block mb-2 font-medium">Generation Mode</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setGroupGenerationMode('by-group')}
                      className={`py-2 px-4 rounded-md transition-colors flex items-center justify-center ${
                        groupGenerationMode === 'by-group'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      <span>By Group</span>
                    </button>
                    <button
                      onClick={() => setGroupGenerationMode('continuous')}
                      className={`py-2 px-4 rounded-md transition-colors flex items-center justify-center ${
                        groupGenerationMode === 'continuous'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      <span>Continuous</span>
                    </button>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {groupGenerationMode === 'by-group' 
                      ? "Cards will be grouped by project" 
                      : "All cards will be in continuous sequence"}
                  </div>
                </div>

  
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="save-separately"
                    checked={saveSeparately}
                    onChange={(e) => setSaveSeparately(e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <Label htmlFor="save-separately" className="font-medium">
                    Save cards as individual files
                  </Label>
                </div>
  
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Page Size</Label>
                    <select
                      value={selectedPageSize.label}
                      onChange={(e) => {
                        const selected = PAGE_SIZES.find((s) => s.label === e.target.value);
                        if (e.target.value === 'custom') {
                          setSelectedPageSize({ label: 'custom', ...customPageSize });
                        } else {
                          setSelectedPageSize(selected);
                          setCustomPageSize({ width: selected.width, height: selected.height });
                        }
                      }}
                      disabled={saveSeparately}
                      className="w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {PAGE_SIZES.map((size) => (
                        <option key={size.label} value={size.label}>
                          {size.label} ({size.width}mm × {size.height}mm)
                        </option>
                      ))}
                      <option value="custom">Custom size</option>
                    </select>
                  </div>
  
                  {selectedPageSize.label === 'custom' && (
                    <>
                      <div className="space-y-2">
                        <Label>Width (mm)</Label>
                        <input
                          type="number"
                          value={customPageSize.width}
                          onChange={(e) => setCustomPageSize({ ...customPageSize, width: Number(e.target.value) })}
                          className="w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Height (mm)</Label>
                        <input
                          type="number"
                          value={customPageSize.height}
                          onChange={(e) => setCustomPageSize({ ...customPageSize, height: Number(e.target.value) })}
                          className="w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </>
                  )}
                </div>
  
                <div className="space-y-2">
                  <Label>Card Range (e.g., 1-100)</Label>
                  <input
                    type="text"
                    value={cardRange}
                    onChange={(e) => setCardRange(e.target.value)}
                    disabled={isRangeInputDisabled}
                    className={`w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 ${
                      isRangeInputDisabled ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder={isRangeInputDisabled ? 'Disabled for multiple projects' : 'e.g. 1-100'}
                  />
                  {isRangeInputDisabled && (
                    <p className="text-xs text-gray-500 mt-1">
                      Card range is automatically set to all cards when multiple projects are selected
                    </p>
                  )}
                </div>
  
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Top Margin (mm)</Label>
                    <input
                      type="number"
                      value={topMargin}
                      onChange={(e) => setTopMargin(Number(e.target.value))}
                      className="w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bottom Margin (mm)</Label>
                    <input
                      type="number"
                      value={bottomMargin}
                      onChange={(e) => setBottomMargin(Number(e.target.value))}
                      className="w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
    <Label>Left Margin (mm)</Label>
    <input
      type="number"
      value={leftMargin}
      onChange={(e) => setLeftMargin(Number(e.target.value))}
      className="w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
    />
  </div>
  <div className="space-y-2">
    <Label>Right Margin (mm)</Label>
    <input
      type="number"
      value={rightMargin}
      onChange={(e) => setRightMargin(Number(e.target.value))}
      className="w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
    />
  </div>
                  <div className="space-y-2">
                    <Label>Vertical Spacing (mm)</Label>
                    <input
                      type="number"
                      value={verticalSpacing}
                      onChange={(e) => setVerticalSpacing(Number(e.target.value))}
                      className="w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Horizontal Spacing (mm)</Label>
                    <input
                      type="number"
                      value={horizontalSpacing}
                      onChange={(e) => setHorizontalSpacing(Number(e.target.value))}
                      className="w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
  
            <div className="p-6 border-t">
              {error && (
                <div className="text-red-500 text-sm py-2 px-3 bg-red-50 rounded-md mb-4">
                  {error}
                </div>
              )}
  
              <div className="flex justify-end space-x-3">
                <button
                  onClick={toggleModal}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (selectedProjects.length > 0 && projects.length > 0) {
                      const projectsToGenerate = projects.filter(p => 
                        selectedProjects.includes(p.id)
                      );
                      generateMultipleProjects(projectsToGenerate);
                    } else {
                      generateJPEG();
                    }
                  }}
                  disabled={isGenerating || selectedProjects.length === 0}
                  className={`px-4 py-2 rounded-md text-white transition-colors ${
                    isGenerating 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : selectedProjects.length === 0
                        ? 'bg-blue-300 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isGenerating ? (
                    <span className="flex items-center">
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      Generating...
                    </span>
                  ) : (
                    selectedProjects.length > 0 && projects.length > 0 
                      ? `Generate ${selectedProjects.length} Project${selectedProjects.length > 1 ? 's' : ''}`
                      : 'Generate Cards'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}