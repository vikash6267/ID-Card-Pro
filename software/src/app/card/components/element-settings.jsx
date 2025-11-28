"use client";

import { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Settings, RotateCw } from "lucide-react";
import { ElementStyleSettings } from "./element-style-settings";
import { Alignment } from "./alignment";

const PrecisionSlider = ({ min = 0, max = 360, step = 0.5, value, onValueChange }) => (
  <input
    type="range"
    min={min}
    max={max}
    step={step}
    value={value}
    onChange={(e) => onValueChange(parseFloat(e.target.value))}
    className="w-full h-2 rounded-full cursor-pointer bg-gray-200 accent-blue-600"
  />
);

export function ElementSettings({ elements, onUpdate, excelHeaders, excelData, currentRecordIndex }) {
  const [content, setContent] = useState(elements[0]?.heading || "");
  const [rotationValue, setRotationValue] = useState(0);
  const [zIndex, setZIndex] = useState(elements[0]?.style?.zIndex || 1);
  const [showStyleSettings, setShowStyleSettings] = useState(false);
  
  // Auto-open settings panel when text element is selected
  useEffect(() => {
    if (elements.length === 1 && elements[0]?.type === "text") {
      setShowStyleSettings(true);
    }
  }, [elements]);

  const roundToHalf = (v) => Math.round(v * 2) / 2;

  useEffect(() => {
    if (elements.length === 1) {
      setContent(elements[0]?.heading || "");
      setRotationValue(roundToHalf(elements[0]?.rotation || 0));
      setZIndex(elements[0]?.style?.zIndex || 1);
    }
  }, [elements]);

  const handleContentChange = (selectedHeader) => {
    setContent(selectedHeader);

    const rowData = excelData?.rows?.[currentRecordIndex];
    const updatedContent = rowData?.[selectedHeader] || "";

    const updated = elements.map((el) => ({
      ...el,
      content: updatedContent,
      heading: selectedHeader,
    }));

    onUpdate(updated);
  };

  const handleRotationChange = (value) => {
    const r = roundToHalf(value);
    setRotationValue(r);

    const updated = elements.map((el) => ({
      ...el,
      rotation: r,
    }));

    onUpdate(updated);
  };

  const handleZIndexChange = (value) => {
    const v = Number.isNaN(Number(value)) ? 0 : Math.max(0, Math.min(999, Number(value)));
    setZIndex(v);

    const updated = elements.map((el) => ({
      ...el,
      style: {
        ...el.style,
        zIndex: v,
      },
    }));

    onUpdate(updated);
  };

  // Check if selected element is image type
  const isImageElement = elements.length > 0 && elements.every(el => el.type === "image");
  const isTextElement = elements.length > 0 && elements.every(el => el.type === "text");

  return (
    <div className="space-y-2 text-sm relative">
      {/* ---------------- Line 1: Z-Index + Data + Align + Settings --------------- */}
      <div className="flex items-start gap-2 flex-wrap w-full">
        {/* Z-Index */}
        <div className="flex flex-col items-center gap-1">
          <Label className="text-xs font-semibold">Z-Index</Label>
          <Input
            type="number"
            min={0}
            max={999}
            value={zIndex}
            onChange={(e) => handleZIndexChange(e.target.value)}
            className="w-16 text-center px-2 py-1 text-xs"
          />
        </div>

        {/* Data Dropdown */}
        <div className="flex flex-col flex-1 min-w-[120px]">
          <Label className="text-xs font-medium mb-1">Change Data</Label>
          <select 
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            className="border rounded px-2 py-1 text-xs bg-white"
          >
            <option value="">Custom</option>
            {excelHeaders.map((header) => (
              <option key={header} value={header}>{header}</option>
            ))}
          </select>
        </div>

        {/* Alignment - Only show for text elements */}
        {isTextElement && (
          <div className="flex flex-col items-center">
            <Label className="text-xs font-medium mb-1">Alignment</Label>
            <div className="flex gap-0.5">
              <Alignment elements={elements} onUpdate={onUpdate} />
            </div>
          </div>
        )}

        {/* Settings Icon */}
        <div className="ml-auto">
          <Button 
            size="icon" 
            onClick={() => setShowStyleSettings(!showStyleSettings)}
            className={`p-2 rounded border transition-colors ${
              showStyleSettings 
                ? 'bg-blue-500 text-white border-blue-600' 
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            }`}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* ---------------- Line 2: Rotation ---------------- */}
      <div className="flex items-center gap-2">
        <Label className="text-xs font-semibold whitespace-nowrap">Rotation:</Label>

        <PrecisionSlider
          min={0}
          max={360}
          step={0.5}
          value={rotationValue}
          onValueChange={handleRotationChange}
        />

        <Input
          type="number"
          min={0}
          max={360}
          step={0.5}
          value={rotationValue.toFixed(1)}
          onChange={(e) => handleRotationChange(Number(e.target.value))}
          className="w-14 text-center px-1 py-1 text-xs"
        />

        <Button 
          size="icon"
          onClick={() => handleRotationChange(0)}
          className="p-1.5 bg-gray-200 rounded hover:bg-gray-300"
          title="Reset rotation"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Style Settings Panel - Fixed positioning for small screens */}
      {showStyleSettings && (
        <div className="fixed lg:absolute left-4 right-4 lg:left-auto lg:right-0 top-20 lg:top-auto lg:mt-1 w-auto lg:w-72 max-w-md bg-white p-4 rounded-lg shadow-2xl border-2 border-gray-200 z-50 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">Style Settings</h3>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => setShowStyleSettings(false)}
              className="h-6 w-6 p-0"
            >
              ✕
            </Button>
          </div>
          
          <ElementStyleSettings 
            elements={elements} 
            onUpdate={onUpdate}
            isImageElement={isImageElement}
            isTextElement={isTextElement}
          />
          
          <Button 
            size="sm" 
            className="w-full mt-3 bg-blue-500 hover:bg-blue-600" 
            onClick={() => setShowStyleSettings(false)}
          >
            Done
          </Button>
        </div>
      )}
      
      {/* Backdrop for mobile */}
      {showStyleSettings && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setShowStyleSettings(false)}
        />
      )}
    </div>
  );
}
