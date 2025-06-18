import React, { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";


const AutoContainerGenerator = ({ onTemplateChange, excelData, currentSide, setTemplate }) => {
  const [maxHeadingWidth, setMaxHeadingWidth] = useState(0);
  const [maxDataWidth, setMaxDataWidth] = useState(0);
  const [median, setMedian] = useState(":");
  const [showPopup, setShowPopup] = useState(false);
  const [showArrangement, setShowArrangement] = useState(false);
  const [availableHeaders, setAvailableHeaders] = useState([]);
  const [selectedHeaders, setSelectedHeaders] = useState([]);
  const [includedHeaders, setIncludedHeaders] = useState(new Set());
  const [containerWidth, setContainerWidth] = useState(800);
  const [sectionGap, setSectionGap] = useState(30);

  const baseFontSize = 16;
  const padding = 5;
  const separatorMinWidth = 30;
  const [rowSpacing, setRowSpacing] = useState(2);
  const [columnSpacing, setColumnSpacing] = useState(2);
  const fixedRowHeight = baseFontSize + padding * 2;

  useEffect(() => {
    if (excelData.headers.length > 0 && excelData.rows.length > 0) {
      setAvailableHeaders([...excelData.headers]);
      setSelectedHeaders([...excelData.headers]);
      setIncludedHeaders(new Set(excelData.headers));
      calculateMaxWidths([...excelData.headers]);
    }
  }, [excelData]);

  const calculateMaxWidths = (headersToInclude) => {
    const headingWidths = headersToInclude.map(header => 
      header.length * baseFontSize * 0.6 + padding * 2
    );
    const maxHeading = Math.max(...headingWidths);
    
    let maxData = 0;
    headersToInclude.forEach(header => {
      excelData.rows.forEach(row => {
        const cellContent = row[header] || "";
        const cellWidth = cellContent.length * baseFontSize * 0.6 + padding * 2;
        if (cellWidth > maxData) {
          maxData = cellWidth;
        }
      });
    });
    
    setMaxHeadingWidth(maxHeading);
    setMaxDataWidth(maxData);
    
    const calculatedWidth = maxHeading + maxData + 
      (Math.max(median.length * baseFontSize * 0.5, separatorMinWidth)) + 
      (sectionGap * 2) +
      (padding * 4);
    
    setContainerWidth(Math.max(calculatedWidth, 800));
  };

  const handleHeaderToggle = (header) => {
    setIncludedHeaders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(header)) {
        newSet.delete(header);
      } else {
        newSet.add(header);
      }
      calculateMaxWidths([...newSet]);
      return newSet;
    });
  };

  const generateElements = (headers) => {
    if (!headers.length) return;
    
    const elements = [];
    const firstRow = excelData.rows[0] || {};
  
    headers.forEach((header, index) => {
      const separatorWidth = Math.max(median.length * baseFontSize * 0.5, separatorMinWidth);
      const yPosition = 50 + index * (fixedRowHeight + rowSpacing);
  
      const headingX = 50;
      const separatorX = headingX + maxHeadingWidth + columnSpacing;
      const dataX = separatorX + separatorWidth + columnSpacing;
  
      // Heading element
      elements.push({
        id: `heading-${header}-${Date.now()}-${index}`,
        type: "text",
        content: header,
        heading: header,
        position: { x: headingX, y: yPosition },
        size: { width: maxHeadingWidth, height: fixedRowHeight },
        style: { 
          fontSize: baseFontSize, 
          fontFamily: "Arial, sans-serif", 
          color: "#000000", 
          fontWeight: "bold",
          alignment: "left", 
          verticalAlignment: "top",
          wordWrap: true,
          overflow: "hidden",
        },
        rotation: 0,
        isStatic: true,
      });
  
      // Separator element
      elements.push({
        id: `median-${header}-${Date.now()}-${index}`,
        type: "text",
        content: median,
        heading: header,
        position: { x: separatorX, y: yPosition },
        size: { width: separatorWidth, height: fixedRowHeight },
        style: { 
          fontSize: baseFontSize, 
          fontFamily: "Arial, sans-serif", 
          color: "#666666", 
          alignment: "middle", 
          verticalAlignment: "top",
        },
        rotation: 0,
        isStatic: true,
      });
  
      // Data element
      elements.push({
        id: `data-${header}-${Date.now()}-${index}`,
        type: "text",
        content: firstRow[header] || "",
        heading: header,
        position: { x: dataX, y: yPosition },
        size: { width: maxDataWidth, height: fixedRowHeight },
        style: { 
          fontSize: baseFontSize, 
          fontFamily: "Arial, sans-serif", 
          color: "#000000", 
          alignment: "left", 
          verticalAlignment: "top",
          wordWrap: true,
          overflow: "hidden",
        },
        rotation: 0,
        isStatic: false // ✅ dynamic
      });
    });
  
    const separatorWidth = Math.max(median.length * baseFontSize * 0.5, separatorMinWidth);
    const calculatedWidth = maxHeadingWidth + maxDataWidth + 
      separatorWidth + 
      (columnSpacing * 2) +
      (padding * 4);
  
    setTemplate(prev => ({
      ...prev,
      [currentSide]: {
        ...prev[currentSide],
        containerWidth: Math.max(calculatedWidth, 800),
        elements: [...(prev[currentSide]?.elements || []), ...elements]
      }
    }));
    setShowPopup(false);
  };

  const handleMedianChange = (e) => setMedian(e.target.value);

  const handleDragStart = (e, header) => e.dataTransfer.setData("text/plain", header);

  const handleDrop = (e, targetList) => {
    e.preventDefault();
    const header = e.dataTransfer.getData("text/plain");
    
    if (targetList === 'selected') {
      setAvailableHeaders(prev => prev.filter(h => h !== header));
      setSelectedHeaders(prev => [...prev, header]);
    } else {
      setSelectedHeaders(prev => prev.filter(h => h !== header));
      setAvailableHeaders(prev => [...prev, header]);
    }
  };

  const toggleArrangement = () => {
    setShowArrangement(!showArrangement);
    if (!showArrangement) {
      setAvailableHeaders([...excelData.headers]);
      setSelectedHeaders([]);
    }
  };

  return (
    <div>
      <Button size="sm" variant="outline" onClick={() => setShowPopup(true)} className="mb-2">
        Auto Text
      </Button>

      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg w-96 relative">
            <button 
              onClick={() => setShowPopup(false)} 
              className="absolute top-2 right-2 text-gray-600 hover:text-black"
            >
              ✖
            </button>

            <h3 className="text-lg font-semibold mb-3 text-center">Auto Text Options</h3>

            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm">Arrange Headers</Label>
              <button
                type="button"
                className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none ${showArrangement ? 'bg-blue-500' : 'bg-gray-300'}`}
                onClick={toggleArrangement}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${showArrangement ? 'translate-x-6' : 'translate-x-1'}`}
                />
              </button>
            </div>

            {showArrangement && (
              <div className="flex gap-2 mb-3 h-40">
                <div 
                  className="flex-1 border rounded p-2 overflow-y-auto"
                  onDrop={(e) => handleDrop(e, 'available')}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <h4 className="text-sm font-medium mb-1">Available</h4>
                  {availableHeaders.map(header => (
                    <div
                      key={header}
                      draggable
                      onDragStart={(e) => handleDragStart(e, header)}
                      className="p-1 mb-1 text-sm border rounded cursor-move hover:bg-gray-50"
                    >
                      {header}
                    </div>
                  ))}
                </div>

                <div 
                  className="flex-1 border rounded p-2 overflow-y-auto"
                  onDrop={(e) => handleDrop(e, 'selected')}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <h4 className="text-sm font-medium mb-1">Selected</h4>
                  {selectedHeaders.map(header => (
                    <div
                      key={header}
                      draggable
                      onDragStart={(e) => handleDragStart(e, header)}
                      className="p-1 mb-1 text-sm border rounded cursor-move hover:bg-gray-50"
                    >
                      {header}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-3">
              <Label className="block text-center text-sm mb-1">Separator</Label>
              <Input
                type="text"
                value={median}
                onChange={handleMedianChange}
                className="block mx-auto w-3/4 text-center"
                maxLength={200}
              />
            </div>

            <div className="mb-3 flex justify-between">
              <div className="flex flex-col">
                <Label className="block text-center text-sm mb-1">Vertical Gap (px)</Label>
                <Input
                  type="number"
                  value={rowSpacing}
                  onChange={(e) => setRowSpacing(Number(e.target.value))}
                  className="block mx-auto w-24 text-center"
                />
              </div>
              <div className="flex flex-col">
                <Label className="block text-center text-sm mb-1">Horizontal Gap (px)</Label>
                <Input
                  type="number"
                  value={columnSpacing}
                  onChange={(e) => setColumnSpacing(Number(e.target.value))}
                  className="block mx-auto w-24 text-center"
                />
              </div>
            </div>

            <div className="mb-3">
              <Label className="block text-center text-sm mb-1">Include Columns</Label>
              {excelData.headers.map(header => (
                <div key={header} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={includedHeaders.has(header)}
                    onChange={() => handleHeaderToggle(header)}
                    className="mr-2"
                  />
                  <span>{header}</span>
                </div>
              ))}
            </div>

            <Button 
              onClick={() => generateElements(showArrangement ? selectedHeaders : excelData.headers)} 
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            >
              Generate All
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoContainerGenerator;