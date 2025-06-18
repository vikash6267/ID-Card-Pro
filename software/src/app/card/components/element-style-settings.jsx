"use client";

import { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Bold, Italic, Underline, Droplet, Save } from "lucide-react";
import "react-range-slider-input/dist/style.css";
import { Alignment } from "./alignment"; // ✅ Import Alignment settings



export function ElementStyleSettings({ elements, onUpdate }) {
  const [style, setStyle] = useState(() => {
    if (elements.length === 0) return {}; // Prevent errors if no elements selected

    return {
      fontSize: elements[0]?.style?.fontSize ?? 16,
      fontFamily: elements[0]?.style?.fontFamily ?? "Arial",
      color: elements[0]?.style?.color ?? "#000000",
      strokeType: elements[0]?.style?.strokeType ?? "solid",
      strokeColor: elements[0]?.style?.strokeColor ?? "#FFFFFF",
      strokeWidth: elements[0]?.style?.strokeWidth ?? 0,
      isBold: elements.every(el => el.style?.isBold) ?? false,
      isItalic: elements.every(el => el.style?.isItalic) ?? false,
      isUnderlined: elements.every(el => el.style?.isUnderlined) ?? false,
      shadowColor: elements[0]?.style?.shadowColor ?? "#000000",
      shadowBlur: elements[0]?.style?.shadowBlur ?? 0,
      shadowOffsetX: elements[0]?.style?.shadowOffsetX ?? 0,
      shadowOffsetY: elements[0]?.style?.shadowOffsetY ?? 0,
      gradient: elements[0]?.style?.gradient ?? false,
      gradientColors: elements[0]?.style?.gradientColors ?? ["#ff0000", "#0000ff"],
      gradientType: elements[0]?.style?.gradientType ?? "linear",
      gradientAngle: elements[0]?.style?.gradientAngle ?? 90,
      alignment: elements[0]?.style?.alignment ?? "left",
      verticalAlignment: elements[0]?.style?.verticalAlignment ?? "top",
      opacity: elements[0]?.style?.opacity ?? 1, // Default to 1 if not set
      textCase: elements[0]?.style?.textCase ?? "none", // Ensure this is included
    };
  });
  const [showStyleSettings, setShowStyleSettings] = useState(false);
  
  const [savedGradients, setSavedGradients] = useState([]);
  useEffect(() => {
    const storedGradients = JSON.parse(localStorage.getItem("savedGradients")) || [];
    setSavedGradients(storedGradients);
  }, []);

  useEffect(() => {
    if (elements.length === 0) return;

    // Extract styles from all elements
    const styles = elements.map(el => el.style || {});

    // Check if all elements have the same value for a style property
    const getCommonValue = (key, defaultValue) => {
      const allValues = styles.map(style => style[key]).filter(val => val !== undefined);
      if (allValues.length === 0) return defaultValue;
      return allValues.every(val => val === allValues[0]) ? allValues[0] : defaultValue;
    };

    setStyle((prev) => ({
      fontSize: getCommonValue("fontSize", 16),
      fontFamily: getCommonValue("fontFamily", "Arial"),
      color: getCommonValue("color", "#000000"),
      strokeType: getCommonValue("strokeType", "solid"),
      strokeColor: getCommonValue("strokeColor", "#FFFFFF"),
      strokeWidth: getCommonValue("strokeWidth", 0),
      isBold: elements.every(el => el.style?.isBold === true),
      isItalic: elements.every(el => el.style?.isItalic === true),
      isUnderlined: elements.every(el => el.style?.isUnderlined === true),
      shadowColor: getCommonValue("shadowColor", "#000000"),
      shadowBlur: getCommonValue("shadowBlur", 0),
      shadowOffsetX: getCommonValue("shadowOffsetX", 0),
      shadowOffsetY: getCommonValue("shadowOffsetY", 0),
      gradient: getCommonValue("gradient", false),
      gradientColors: getCommonValue("gradientColors", ["#ff0000", "#0000ff"]),
      gradientType: getCommonValue("gradientType", "linear"),
      gradientAngle: getCommonValue("gradientAngle", 90),
      alignment: getCommonValue("alignment", "left"),
      verticalAlignment: getCommonValue("verticalAlignment", "top"),
    }));

  }, [elements, JSON.stringify(elements.map(el => el.style))]); // ✅ Ensure updates trigger re-render

/// Add this robust text transformation function
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
// Then modify the handleStyleChange function to transform the content
// In ElementStyleSettings.jsx
const handleStyleChange = (key, value) => {
  setStyle(prev => ({ ...prev, [key]: value }));

  if (elements.length === 0) return;

  const updatedElements = elements.map(el => {
    const updatedElement = {
      ...el,
      style: {
        ...el.style,
        [key]: value,
      },
    };

    // For text elements, update the content immediately when case changes
    if (key === 'textCase' && el.type === 'text') {
      return {
        ...updatedElement,
        content: transformTextCase(el.content, value),
      };
    }

    return updatedElement;
  });

  onUpdate(updatedElements);
};
  const handleAlignmentChange = (updatedAlignment) => {
    setStyle((prevStyle) => ({
      ...prevStyle,
      alignment: updatedAlignment.alignment ?? prevStyle.alignment,
      verticalAlignment: updatedAlignment.verticalAlignment ?? prevStyle.verticalAlignment,
    }));
  
    if (elements.length === 0) return;
  
    const updatedElements = elements.map((el) => ({
      ...el,
      style: {
        ...el.style,
        alignment: updatedAlignment.alignment ?? el.style?.alignment,
        verticalAlignment: updatedAlignment.verticalAlignment ?? el.style?.verticalAlignment,
      },
    }));
  
    onUpdate(updatedElements);
  };
  
  // Auto sync all style changes after they happen
  useEffect(() => {
    const timeout = setTimeout(() => {
      const updatedElements = elements.map((el) => ({
        ...el,
        style: {
          ...el.style,
          ...style,
        },
      }));
      onUpdate(updatedElements);
    }, 0);
    return () => clearTimeout(timeout);
  }, [style, elements]);
  

  
  const saveGradientStyle = () => {
    const newGradient = {
      gradient: true,
      gradientColors: [...style.gradientColors],
      gradientType: style.gradientType,
      gradientAngle: style.gradientAngle,
    };
  
    const newGradients = [...savedGradients, newGradient];
    setSavedGradients(newGradients);
    localStorage.setItem("savedGradients", JSON.stringify(newGradients));
  };
  
  const applySavedGradient = (gradient) => {
    handleStyleChange("gradient", true);
    handleStyleChange("gradientColors", gradient.gradientColors);
    handleStyleChange("gradientType", gradient.gradientType);
    handleStyleChange("gradientAngle", gradient.gradientAngle);
  };
  
  
  const removeSavedGradient = (index) => {
    const newGradients = savedGradients.filter((_, i) => i !== index);
    setSavedGradients(newGradients);
    localStorage.setItem("savedGradients", JSON.stringify(newGradients));
  };
  
<Alignment elements={elements} onUpdate={handleAlignmentChange} />

  return (
    
    <div className="space-y-4 max-h-96 overflow-y-auto p-6 bg-white rounded-lg shadow-lg border-2 border-blue-500 custom-scrollbar">

      {/* Font Settings Card */}
      <div className="p-4 bg-gray-100 rounded-lg shadow-md border border-gray-300">
        <Label className="font-semibold">Font Settings</Label>
        <div className="flex space-x-2">
          <Button onClick={() => handleStyleChange("isBold", !style.isBold, true)} variant={style.isBold ? "default" : "outline"}>
            <Bold className="w-4 h-4" />
          </Button>
          <Button onClick={() => handleStyleChange("isItalic", !style.isItalic)} variant={style.isItalic ? "default" : "outline"}>
            <Italic className="w-4 h-4" />
          </Button>
          <Button onClick={() => handleStyleChange("isUnderlined", !style.isUnderlined)} variant={style.isUnderlined ? "default" : "outline"}>
            <Underline className="w-4 h-4" />
          </Button>
          
        </div>
{/* Text Case Buttons */}
<div className="space-y-2">
  <Label className="block">Text Case</Label>
  <div className="grid grid-cols-3 gap-2">
    <Button 
      onClick={() => handleStyleChange("textCase", "none")} 
      variant={style.textCase === "none" ? "default" : "outline"}
      size="sm"
      className="h-9"
    >
      None
    </Button>
    <Button 
      onClick={() => handleStyleChange("textCase", "uppercase")} 
      variant={style.textCase === "uppercase" ? "default" : "outline"}
      size="sm"
      className="h-9"
    >
      UPPER
    </Button>
    <Button 
      onClick={() => handleStyleChange("textCase", "lowercase")} 
      variant={style.textCase === "lowercase" ? "default" : "outline"}
      size="sm"
      className="h-9"
    >
      lower
    </Button>
    <Button 
      onClick={() => handleStyleChange("textCase", "capitalize")} 
      variant={style.textCase === "capitalize" ? "default" : "outline"}
      size="sm"
      className="h-9"
    >
      Proper
    </Button>
    <Button 
      onClick={() => handleStyleChange("textCase", "sentence")} 
      variant={style.textCase === "sentence" ? "default" : "outline"}
      size="sm"
      className="h-9"
    >
      Sentence
    </Button>
    <Button 
      onClick={() => handleStyleChange("textCase", "toggle")} 
      variant={style.textCase === "toggle" ? "default" : "outline"}
      size="sm"
      className="h-9"
    >
      Toggle
    </Button>
  </div>
</div>

        <Label>Opacity</Label>
        <Label>Opacity</Label>
  <div className="flex items-center gap-2">
    <input
      type="range"
      min="0"
      max="1"
      step="0.1"
      value={style.opacity ?? 1} // Fallback to 1 if undefined
      onChange={(e) => handleStyleChange("opacity", parseFloat(e.target.value))}
      className="w-full"
    />
    <span className="text-sm w-8">
      {(style.opacity ?? 1).toFixed(1)} {/* Safe call to toFixed() */}
    </span>
  </div>


        <Label>Font Size</Label>
        <Input type="number" value={style.fontSize}  onChange={(e) => handleStyleChange("fontSize", Number(e.target.value), true)} className="border rounded px-2 py-1" />

        <Label>Font Family</Label>
        <select value={style.fontFamily} onChange={(e) => handleStyleChange("fontFamily", e.target.value)} className="border rounded px-4 py-2 w-full">
          {["Arial", "Times New Roman", "Courier New", "Georgia", "Verdana", "Roboto", "Open Sans", "Lato", "Montserrat", "Poppins", "Raleway", "Merriweather", "Oswald", "Source Sans Pro", "Noto Sans", "Ubuntu", "Playfair Display", "Dancing Script"].map((font) => (
            <option key={font} value={font}>{font}</option>
          ))}
        </select>

        <Label>Text Color</Label>
        <Input type="color" value={style.color} onChange={(e) => handleStyleChange("color", e.target.value, true)} className="border rounded" />
      </div>

{/* Stroke Settings Card */}
<div className="p-4 bg-gray-100 rounded-lg shadow-md border border-gray-300">
  <Label className="font-semibold">Stroke Settings</Label>
  
  {/* Directly show Stroke Color and Stroke Width without dropdown */}
  <Label>Stroke Color</Label>
  <Input 
    type="color" 
    value={style.strokeColor} 
    onChange={(e) => handleStyleChange("strokeColor", e.target.value)} 
    className="border rounded" 
  />
  
  <Label>Stroke Width</Label>
<div className="flex items-center gap-2">
  <input
    type="range"
    min="0"
    max="10"
    step="0.1"
    value={style.strokeWidth}
    onChange={(e) => handleStyleChange("strokeWidth", parseFloat(e.target.value))}
    className="w-full"
  />
  <Input
    type="number"
    min="0"
    max="10"
    step="0.1"
    value={style.strokeWidth}
    onChange={(e) => handleStyleChange("strokeWidth", parseFloat(e.target.value))}
    className="w-20 text-center px-2 py-1"
  />
</div>

</div>

      {/* Shadow Settings Card */}
      <div className="p-4 bg-gray-100 rounded-lg shadow-md border border-gray-300">
        <Label className="font-semibold">Shadow Settings</Label>
        <div className="flex flex-col items-center space-y-2">
          <Label>Shadow Color</Label>
          <Input
            type="color"
            value={style.shadowColor}
            onChange={(e) => handleStyleChange("shadowColor", e.target.value)}
            className="border rounded"
          />
        </div>

        <div className="flex items-center w-full gap-2">
  <input
    type="range"
    min="0"
    max="50"
    step="0.1"
    value={style.shadowBlur}
    onChange={(e) => handleStyleChange("shadowBlur", parseFloat(e.target.value))}
    className="w-full"
  />
  <span className="text-sm w-10 text-right">{style.shadowBlur.toFixed(1)}</span>
</div>
<div className="flex items-center w-full gap-2">
  <input
    type="range"
    min="-50"
    max="50"
    step="0.1"
    value={style.shadowOffsetX}
    onChange={(e) => handleStyleChange("shadowOffsetX", parseFloat(e.target.value))}
    className="w-full"
  />
  <span className="text-sm w-10 text-right">{style.shadowOffsetX.toFixed(1)}</span>
</div>
<div className="flex items-center w-full gap-2">
  <input
    type="range"
    min="-50"
    max="50"
    step="0.1"
    value={style.shadowOffsetY}
    onChange={(e) => handleStyleChange("shadowOffsetY", parseFloat(e.target.value))}
    className="w-full"
  />
  <span className="text-sm w-10 text-right">{style.shadowOffsetY.toFixed(1)}</span>
</div>

      </div>

      {/* Gradient Settings Card */}
      <div className="p-4 bg-gray-100 rounded-lg shadow-md border border-gray-300">
        <Label className="font-semibold">Gradient Settings</Label>
        <div className="flex items-center space-x-2">
          <Button onClick={() => handleStyleChange("gradient", !style.gradient)} variant={style.gradient ? "default" : "outline"}>
            <Droplet className="w-4 h-4" /> Enable Gradient
          </Button>
        </div>

        {style.gradient && (
          <>
            <Label>Gradient Colors</Label>
            <div className="grid grid-cols-3 gap-2">
              {style.gradientColors.map((color, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    type="color"
                    value={color}
                    onChange={(e) => {
                      const newColors = [...style.gradientColors];
                      newColors[index] = e.target.value;
                      handleStyleChange("gradientColors", newColors);
                    }}
                    className="border rounded"
                  />
                  <Button
                    className="text-red-500"
                    onClick={() => {
                      const newColors = style.gradientColors.filter((_, i) => i !== index);
                      if (newColors.length === 0) {
                        handleStyleChange("gradient", false);
                      }
                      handleStyleChange("gradientColors", newColors);
                    }}
                  >
                    ❌
                  </Button>
                </div>
              ))}
              <Button onClick={() => handleStyleChange("gradientColors", [...style.gradientColors, "#ffffff"])}>
                + Add
              </Button>
            </div>

            <Label>Gradient Type</Label>
            <select value={style.gradientType} onChange={(e) => handleStyleChange("gradientType", e.target.value)} className="border rounded px-4 py-2 w-full">
              <option value="linear">Linear</option>
              <option value="radial">Radial</option>
              <option value="conic">Conic</option>
            </select>

            <Label>Gradient Angle</Label>
            <Input type="number" value={style.gradientAngle} onChange={(e) => handleStyleChange("gradientAngle", Number(e.target.value))} className="border rounded px-2 py-1" placeholder="Angle (0-360)" />
          </>
        )}

        <div className="flex space-x-2 mt-4">
          <Button onClick={saveGradientStyle} className="flex items-center">
            <Save className="w-4 h-4 mr-1" /> Save Gradient
          </Button>
        </div>

        <Label>Saved Gradients</Label>
        <div className="grid grid-cols-4 gap-2">
          {savedGradients.map((gradient, index) => (
            <div key={index} className="relative">
              <button
                className="w-10 h-10 rounded border"
                style={{
                  background: gradient.gradientType === "linear"
                    ? `linear-gradient(${gradient.gradientAngle}deg, ${gradient.gradientColors.join(", ")})`
                    : gradient.gradientType === "radial"
                    ? `radial-gradient(circle at center, ${gradient.gradientColors.join(", ")})`
                    : `conic-gradient(from ${gradient.gradientAngle}deg at center, ${gradient.gradientColors.join(", ")})`,
                }}
                onClick={() => applySavedGradient(gradient)}
              />
              <Button
                className="absolute top-0 right-0 text-red-500"
                onClick={() => removeSavedGradient(index)}
              >
                ❌
              </Button>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar {
          scrollbar-width: thin; /* For Firefox */
          scrollbar-color: #4a90e2 #f0f0f0; /* For Firefox */
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 16px; /* Width of the scrollbar */
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f0f0f0; /* Background of the scrollbar track */
          border-radius: 8px; /* Rounded corners for the track */
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #4a90e2; /* Color of the scrollbar thumb */
          border-radius: 8px; /* Rounded corners for the thumb */
          border: 4px solid #f0f0f0; /* Space between the thumb and track */
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #357ab8; /* Darker color on hover */
        }
      `}</style>
    </div>
  );
}