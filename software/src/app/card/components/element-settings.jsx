"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { QrCode, Barcode, Type, ImageIcon, Settings, RotateCw } from "lucide-react";
import { ElementStyleSettings } from "./element-style-settings";
import { Alignment } from "./alignment";


// Enhanced Slider Component
const PrecisionSlider = ({ min = 0, max = 360, step = 0.5, value, onValueChange, className }) => {
  const handleChange = (e) => {
    const newValue = parseFloat(e.target.value);
    onValueChange(newValue);
  };

  return (
    <div className={`relative flex items-center w-full ${className}`}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className={`
          w-full h-2 rounded-full appearance-none cursor-pointer bg-gray-200
          focus:outline-none focus:ring-2 focus:ring-blue-500
          [&::-webkit-slider-thumb]:appearance-none 
          [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
          [&::-webkit-slider-thumb]:rounded-full 
          [&::-webkit-slider-thumb]:bg-blue-600
          [&::-webkit-slider-thumb]:hover:bg-blue-700
          [&::-webkit-slider-thumb]:transition-all
          [&::-webkit-slider-thumb]:duration-100
        `}
      />
    </div>
  );
};

export function ElementSettings({ elements, onUpdate, excelHeaders, excelData, currentRecordIndex }) {
  const [content, setContent] = useState(elements.length === 1 ? elements[0].heading || elements[0].content : "");
  const [elementType, setElementType] = useState(elements.length === 1 ? elements[0].type : "text");
  const [showStyleSettings, setShowStyleSettings] = useState(false);
  const [rotationValue, setRotationValue] = useState(0);
  const [zIndex, setZIndex] = useState(elements.length > 0 ? elements[0].style?.zIndex || 1 : 1);
  
    // Update z-index when the value changes
    const handleZIndexChange = (newZIndex) => {
      setZIndex(newZIndex);
  
      const updatedElements = elements.map((el) => ({
        ...el,
        style: {
          ...el.style,
          zIndex: newZIndex,
        },
      }));
  
      onUpdate(updatedElements);
    };

  // Initialize values
  useEffect(() => {
    if (elements.length === 1) {
      setContent(elements[0].heading || elements[0].content || "");
      setElementType(elements[0].type || "text");
      setRotationValue(roundToHalf(elements[0]?.rotation || 0));
    } else {
      setContent("");
      setElementType("text");
      setRotationValue(0);
    }
  }, [elements]);

  // Helper function to round to nearest 0.5
  const roundToHalf = (value) => Math.round(value * 2) / 2;

  const handleRotationChange = useCallback((value) => {
    const roundedValue = roundToHalf(value);  // Round the value to the nearest 0.5
    
    setRotationValue(roundedValue);
  
    // Apply the new rotation to all selected elements
    const updatedElements = elements.map((el) => ({
      ...el,
      rotation: roundedValue,  // Set the rotation value for each element
    }));
  
    // Ensure the parent component's onUpdate method updates all elements
    onUpdate(updatedElements);
  }, [elements, onUpdate]);

  
  
  const handleContentChange = (selectedHeader) => {
    setContent(selectedHeader);  // Set the selected header
  
    // Ensure excelData and currentRecordIndex are passed as props
    if (!excelData || !excelData.rows || currentRecordIndex === undefined) return;
  
    // Get the row data for the current record
    const rowData = excelData.rows[currentRecordIndex];
  
    // Get the data for the selected header
    const contentData = rowData ? rowData[selectedHeader] : '';
  
    // Update the element with the actual data from the row
    const updatedElements = elements.map((el) => ({
      ...el,
      content: contentData,  // Set the content to the data from the selected header
      heading: selectedHeader,  // Keep the heading unchanged
    }));
  
    // Pass the updated elements back to the parent to update the UI
    onUpdate(updatedElements);
  };
  
 
  

  const handleTypeChange = (newType) => {
    setElementType(newType);
    elements.forEach((el) => {
      onUpdate({
        ...el,
        type: newType,
      });
    });
  };

  const handleAlignmentChange = (horizontal, vertical) => {
    elements.forEach((el) => {
      onUpdate({
        ...el,
        style: {
          ...el.style,
          alignment: horizontal,
          verticalAlignment: vertical,
        },
      });
    });
  };

  // Handle input box changes
  const handleInputChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    const clampedValue = Math.min(360, Math.max(0, value));
    handleRotationChange(clampedValue);
  };

  // Handle keyboard arrow key adjustments
  const handleKeyDown = (e, delta) => {
    e.preventDefault();
    const newValue = Math.min(360, Math.max(0, roundToHalf(rotationValue + delta)));
    handleRotationChange(newValue);
  };
  

  return (
    <div className="space-y-4">
      {/* Z-Index Control */}
      <div className="p-4 bg-gray-50 rounded-lg shadow-md border border-gray-200">
        <Label className="font-semibold">Z-Index</Label>
        
        {/* Z-Index Slider */}
        <div className="flex items-center gap-4">
          <Button
            onClick={() => handleZIndexChange(zIndex - 1)}
            className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            ⬇
          </Button>

          <div className="flex items-center gap-2 w-full">
            <span className="font-medium text-lg">{zIndex}</span>
          </div>

          <Button
            onClick={() => handleZIndexChange(zIndex + 1)}
            className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            ⬆
          </Button>
        </div>

        {/* Slider to Adjust Z-Index */}
        <input
          type="range"
          min="1"
          max="100"
          value={zIndex}
          onChange={(e) => handleZIndexChange(Number(e.target.value))}
          className="w-full mt-2 h-2 bg-blue-100 rounded-lg cursor-pointer"
        />
      </div>

      <Label>Change Data</Label>
      <select 
        value={content} 
        onChange={(e) => handleContentChange(e.target.value)} 
        className="border rounded px-4 py-2 w-full"
      >
        <option value="custom">Custom</option>
        {excelHeaders.map((header) => (
          <option key={header} value={header}>
            {header}
          </option>
        ))}
      </select>

      {elements.length > 0 && (
        <div className="mt-4">
          <Label className="font-semibold">Text Alignment</Label>
          <Alignment elements={elements} onUpdate={onUpdate} />
        </div>
      )}

      {elements.length > 0 && (
        <div className="mt-4">
          <Label className="font-semibold">Rotation (Degrees)</Label>
          <div className="flex items-center gap-2">
            <PrecisionSlider
              min={0}
              max={360}
              step={0.5}
              value={rotationValue}
              onValueChange={handleRotationChange}
              className="flex-1"
            />
            <div className="relative">
              <Input
                type="number"
                min={0}
                max={360}
                step={0.5}
                value={rotationValue.toFixed(1)}
                onChange={handleInputChange}
                className="w-25 text-center px-2 py-1"
              />
              <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex flex-col">
                <button 
                  onClick={(e) => handleKeyDown(e, 0.5)}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  ▲
                </button>
                <button 
                  onClick={(e) => handleKeyDown(e, -0.5)}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  ▼
                </button>
              </div>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              className="p-2"
              onClick={() => handleRotationChange(0)}
              aria-label="Reset rotation"
            >
              <RotateCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
        
      <div className="relative">
        <Button 
          onClick={() => setShowStyleSettings(!showStyleSettings)} 
          className="mt-4 flex items-center"
        >
          <Settings className="w-4 h-4 mr-1" />
          Style Settings
        </Button>
  
        {showStyleSettings && (
          <div className="absolute top-full left-0 mt-2 w-80 bg-white p-4 rounded shadow-lg border z-50">
            <ElementStyleSettings 
              elements={elements} 
              onUpdate={(updatedElements) => {
                onUpdate(updatedElements);
              }} 
            />
            <Button 
              onClick={() => setShowStyleSettings(false)} 
              className="mt-4 w-full"
            >
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}