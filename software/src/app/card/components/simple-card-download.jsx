"use client"

import { useState } from "react";
import { Button } from "./ui/button";
import { Download, Loader2 } from "lucide-react";
import JSZip from "jszip";

export function SimpleCardDownload({ template, excelData, photos, currentProject }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const dpi = 300;

  const mmToPx = (mm) => Math.round((mm / 25.4) * dpi);

  const loadImage = (src) => {
    return new Promise((resolve) => {
      if (!src) return resolve(null);
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = src;
      img.onload = () => resolve(img);
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
    ctx.font = `${style.isBold ? "bold " : ""}${style.isItalic ? "italic " : ""}${style.fontSize || 16}px ${style.fontFamily || "Arial"}`;
    ctx.fillStyle = style.color || "#000000";
    ctx.textAlign = style.alignment || "left";
    ctx.textBaseline = "top";
    
    const x = element.position.x;
    const y = element.position.y;
    
    ctx.fillText(content, x, y);
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
      ctx.drawImage(
        img,
        element.position.x,
        element.position.y,
        element.size.width,
        element.size.height
      );
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
    setError(null);

    try {
      if (!excelData?.rows || excelData.rows.length === 0) {
        throw new Error("No data available. Please upload Excel data first.");
      }

      const zip = new JSZip();
      const folder = zip.folder("id_cards");

      // Generate cards for each row
      for (let i = 0; i < excelData.rows.length; i++) {
        const row = excelData.rows[i];

        // Generate front
        if (template.front) {
          const frontCanvas = await generateCard("front", row);
          if (frontCanvas) {
            const blob = await canvasToBlob(frontCanvas);
            folder.file(`front/card_${i + 1}.jpg`, blob);
          }
        }

        // Generate back
        if (template.back) {
          const backCanvas = await generateCard("back", row);
          if (backCanvas) {
            const blob = await canvasToBlob(backCanvas);
            folder.file(`back/card_${i + 1}.jpg`, blob);
          }
        }
      }

      // Download zip
      const content = await zip.generateAsync({ type: "blob" });
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
    }
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={handleDownload}
        disabled={isGenerating || !excelData?.rows || excelData.rows.length === 0}
        className="w-full bg-green-600 hover:bg-green-700 text-white"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            Download Cards ({excelData?.rows?.length || 0})
          </>
        )}
      </Button>
      
      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}
    </div>
  );
}
