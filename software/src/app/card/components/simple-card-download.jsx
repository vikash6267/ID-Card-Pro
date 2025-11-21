"use client"

import { useState } from "react";
import { Button } from "./ui/button";
import { Download, Loader2 } from "lucide-react";
import JSZip from "jszip";

export function SimpleCardDownload({ template, excelData, photos, currentProject }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const dpi = 300;
  
  // Image cache to avoid reloading same images
  const imageCache = new Map();

  const mmToPx = (mm) => Math.round((mm / 25.4) * dpi);

  const loadImage = async (src) => {
    if (!src) return null;
    
    // Check cache first
    if (imageCache.has(src)) {
      return imageCache.get(src);
    }
    
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = src;
      img.onload = () => {
        imageCache.set(src, img);
        resolve(img);
      };
      img.onerror = () => {
        console.error(`Error loading image: ${src}`);
        resolve(null);
      };
    });
  };

  const canvasToBlob = (canvas) => {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, "image/jpeg", 0.95);
    });
  };

  const renderText = (ctx, element, row) => {
    const content = element.isStatic 
      ? element.content 
      : (row[element.heading]?.toString() || element.content || "");
    
    const style = element.style || {};
    
    ctx.save();
    
    // Set font
    ctx.font = `${style.isBold ? "bold " : ""}${style.isItalic ? "italic " : ""}${style.fontSize || 16}px ${style.fontFamily || "Arial"}`;
    
    // Handle gradient or solid color
    if (style.gradient && style.gradientColors) {
      const gradient = ctx.createLinearGradient(
        element.position.x,
        element.position.y,
        element.position.x + element.size.width,
        element.position.y
      );
      style.gradientColors.forEach((color, i) => {
        gradient.addColorStop(i / (style.gradientColors.length - 1), color);
      });
      ctx.fillStyle = gradient;
    } else {
      ctx.fillStyle = style.color || "#000000";
    }
    
    ctx.textAlign = style.alignment || "left";
    ctx.textBaseline = "top";
    ctx.globalAlpha = style.opacity ?? 1;
    
    // Add shadow if needed
    if (style.shadowBlur > 0) {
      ctx.shadowColor = style.shadowColor || "rgba(0,0,0,0.5)";
      ctx.shadowBlur = style.shadowBlur;
      ctx.shadowOffsetX = style.shadowOffsetX || 0;
      ctx.shadowOffsetY = style.shadowOffsetY || 0;
    }
    
    // Add stroke if needed
    if (style.strokeWidth > 0) {
      ctx.strokeStyle = style.strokeColor || "#000000";
      ctx.lineWidth = style.strokeWidth;
      ctx.strokeText(content, element.position.x, element.position.y);
    }
    
    ctx.fillText(content, element.position.x, element.position.y);
    ctx.restore();
  };

  const renderImage = async (ctx, element, row) => {
    const photoKey = element.isCustomImage 
      ? element.content 
      : (row[element.heading]?.toString().trim() || element.content);
    
    const imageUrl = photos[photoKey] || '/placeholder.svg';
    const img = await loadImage(imageUrl);
    
    if (img) {
      ctx.save();
      ctx.globalAlpha = element.style?.opacity ?? 1;
      
      // Apply rotation if needed
      if (element.rotation) {
        ctx.translate(
          element.position.x + element.size.width / 2,
          element.position.y + element.size.height / 2
        );
        ctx.rotate((element.rotation * Math.PI) / 180);
        ctx.drawImage(
          img,
          -element.size.width / 2,
          -element.size.height / 2,
          element.size.width,
          element.size.height
        );
      } else {
        ctx.drawImage(
          img,
          element.position.x,
          element.position.y,
          element.size.width,
          element.size.height
        );
      }
      
      ctx.restore();
    }
  };

  const generateCard = async (side, row) => {
    const sideData = template[side];
    if (!sideData) return null;

    const cardWidthPx = mmToPx(template.size.width);
    const cardHeightPx = mmToPx(template.size.height);

    const canvas = document.createElement("canvas");
    canvas.width = cardWidthPx;
    canvas.height = cardHeightPx;
    const ctx = canvas.getContext("2d");

    // Fill background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw background image if exists
    if (sideData.background) {
      const bgImg = await loadImage(sideData.background);
      if (bgImg) {
        ctx.drawImage(bgImg, 0, 0, cardWidthPx, cardHeightPx);
      }
    }

    // Render elements
    const sortedElements = [...(sideData.elements || [])].sort((a, b) => {
      const aZ = a.style?.zIndex || 1;
      const bZ = b.style?.zIndex || 1;
      return aZ - bZ;
    });

    for (const element of sortedElements) {
      if (element.type === "text") {
        renderText(ctx, element, row);
      } else if (element.type === "image") {
        await renderImage(ctx, element, row);
      }
    }

    return canvas;
  };

  const handleDownload = async () => {
    setIsGenerating(true);
    setProgress(0);
    setError(null);

    try {
      if (!excelData?.rows || excelData.rows.length === 0) {
        throw new Error("No data available. Please upload Excel data first.");
      }

      const zip = new JSZip();
      const folder = zip.folder("id_cards");
      const totalCards = excelData.rows.length;
      
      // Preload all background images
      setProgress(5);
      const bgPromises = [];
      if (template.front?.background) {
        bgPromises.push(loadImage(template.front.background));
      }
      if (template.back?.background) {
        bgPromises.push(loadImage(template.back.background));
      }
      await Promise.all(bgPromises);
      
      setProgress(10);

      // Process cards in batches for better performance
      const BATCH_SIZE = 5;
      for (let batchStart = 0; batchStart < totalCards; batchStart += BATCH_SIZE) {
        const batchEnd = Math.min(batchStart + BATCH_SIZE, totalCards);
        const batchPromises = [];

        for (let i = batchStart; i < batchEnd; i++) {
          const row = excelData.rows[i];

          // Generate front
          if (template.front) {
            batchPromises.push(
              generateCard("front", row).then(canvas => {
                if (canvas) {
                  return canvasToBlob(canvas).then(blob => {
                    folder.file(`front/card_${i + 1}.jpg`, blob);
                  });
                }
              })
            );
          }

          // Generate back
          if (template.back) {
            batchPromises.push(
              generateCard("back", row).then(canvas => {
                if (canvas) {
                  return canvasToBlob(canvas).then(blob => {
                    folder.file(`back/card_${i + 1}.jpg`, blob);
                  });
                }
              })
            );
          }
        }

        await Promise.all(batchPromises);
        
        // Update progress (10% to 90%)
        const progressPercent = 10 + Math.floor((batchEnd / totalCards) * 80);
        setProgress(progressPercent);
      }

      // Generate and download zip
      setProgress(95);
      const content = await zip.generateAsync({ 
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 6 }
      });
      
      setProgress(100);
      
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = `${currentProject?.name || "cards"}_${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

    } catch (err) {
      console.error("Download error:", err);
      setError(err.message);
    } finally {
      setIsGenerating(false);
      setProgress(0);
      imageCache.clear(); // Clear cache after generation
    }
  };

  return (
    <div className="space-y-3">
      <Button
        onClick={handleDownload}
        disabled={isGenerating || !excelData?.rows || excelData.rows.length === 0}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-6 text-lg shadow-lg hover:shadow-xl transition-all"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Generating... {progress}%
          </>
        ) : (
          <>
            <Download className="mr-2 h-5 w-5" />
            Download All Cards ({excelData?.rows?.length || 0})
          </>
        )}
      </Button>
      
      {isGenerating && (
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-green-600 h-full transition-all duration-300 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-center text-gray-600">
            {progress < 10 ? "Preparing..." : 
             progress < 90 ? `Generating cards... ${Math.floor((progress - 10) / 80 * excelData.rows.length)} of ${excelData.rows.length}` :
             progress < 100 ? "Creating ZIP file..." : "Complete!"}
          </p>
        </div>
      )}
      
      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {!isGenerating && excelData?.rows?.length > 0 && (
        <div className="text-xs text-gray-500 text-center">
          ✓ Ready to generate {excelData.rows.length} cards
          {template?.front && template?.back ? " (Front & Back)" : template?.front ? " (Front only)" : " (Back only)"}
        </div>
      )}
    </div>
  );
}
