"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import BwipJS from "bwip-js";  // Import bwip-js for generating barcodes including DataMatrix
import { FiSettings } from "react-icons/fi";  // Importing a settings icon for better UX

const QRCodeElement = ({ 
  size, 
  rotation = 0, 
  excelHeaders = [], 
  currentRecord = {},
  // Add these props
  qrConfig = {},
  onConfigChange 
}) => {
  // Initialize state from props
  const [selectedFields, setSelectedFields] = useState(qrConfig.selectedFields || []);
  const [qrFormat, setQrFormat] = useState(qrConfig.format || "qrcode");
  const [customText, setCustomText] = useState(qrConfig.customText || "");  
  const canvasRef = useRef(null);
  const [showSettings, setShowSettings] = useState(false); // Toggle settings panel
  const [loading, setLoading] = useState(false);

    // When any config changes, notify parent
    useEffect(() => {
      if (onConfigChange) {
        onConfigChange({
          format: qrFormat,
          selectedFields,
          customText
        });
      }
    }, [qrFormat, selectedFields, customText]);

  // Handle field selection
  const handleFieldChange = (field) => {
    setSelectedFields((prevFields) =>
      prevFields.includes(field) ? prevFields.filter((f) => f !== field) : [...prevFields, field]
    );
  };

  // Handle custom text input change
  const handleCustomTextChange = (e) => {
    setCustomText(e.target.value);
  };

  // Generate QR/Barcode when selections change
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Set the canvas size to match the bounding rectangle exactly
    canvas.width = size.width;
    canvas.height = size.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous content

    // Construct the QR content string
    let qrContent = customText;
    
    // If no custom text, build from selected fields
    if (!qrContent && selectedFields.length > 0) {
      qrContent = selectedFields
        .map((field) => `${field}: ${currentRecord?.[field] ?? "N/A"}`)
        .join(" | ");
    }
    
    // If still no content, use a default placeholder
    if (!qrContent) {
      qrContent = "Sample QR Code";
    }

    const generateQR = async () => {
      setLoading(true);
      try {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        // Ensure canvas matches the actual element size
        canvas.width = size.width;
        canvas.height = size.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (qrFormat === "qrcode") {
          await QRCode.toCanvas(canvas, qrContent, {
            errorCorrectionLevel: "H",
            margin: 1,
            width: size.width,
            height: size.height
          });
        } else {
          // For barcodes (like DataMatrix, Code128)
          BwipJS.toCanvas(canvas, {
            bcid: qrFormat,  // Barcode format (e.g., "datamatrix", "code128")
            text: qrContent, // Content to encode in the barcode
            scale: 3,        // Scale for the barcode
            height: 10,      // Barcode height
            includetext: true, // Whether to include the text value below the barcode
          });
        }
      } catch (error) {
        console.error("❌ Error generating QR/Barcode:", error);
        // Show error message on canvas
        ctx.fillStyle = "#ff0000";
        ctx.font = "12px Arial";
        ctx.fillText("Error generating code", 10, 20);
      } finally {
        setLoading(false);
      }
    };

    generateQR();
  }, [selectedFields, size.width, size.height, qrFormat, currentRecord, customText]); // Update when any setting changes

  return (
    <div className="flex h-full w-full">
      {/* Sidebar for Settings */}
      {showSettings && (
        <div className="w-72 bg-white p-4 shadow-lg border-r transition-all ease-in-out duration-300">
          <h2 className="text-lg font-semibold mb-3">QR & Barcode Settings</h2>

          {/* QR Format Selection */}
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Format:</label>
          <select
            value={qrFormat}
            onChange={(e) => setQrFormat(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md mb-3"
          >
            <option value="qrcode">QR Code</option>
            <option value="datamatrix">Data Matrix</option>
            <option value="code128">Code 128</option>
            <option value="pdf417">PDF417</option>
            
          </select>

          {/* Field Selection */}
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Fields:</label>
          <div className="max-h-40 overflow-auto border p-2 rounded bg-gray-50">
            {excelHeaders.length > 0 ? (
              excelHeaders.map((field) => (
                <div key={field} className="flex items-center mb-1">
                  <input
                    type="checkbox"
                    checked={selectedFields.includes(field)}
                    onChange={() => handleFieldChange(field)}
                    className="mr-2"
                  />
                  <label className="text-sm">{field}</label>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-600">No fields available. Upload an Excel file with headers.</p>
            )}
          </div>

          {/* Custom Text Option */}
          <label className="block text-sm font-medium text-gray-700 mb-1">Custom QR Content:</label>
          <input
            type="text"
            value={customText}
            onChange={handleCustomTextChange}
            placeholder="Enter custom text or URL"
            className="w-full p-2 border border-gray-300 rounded-md mb-3"
          />
        </div>
      )}

      {/* QR Code Display */}
      <div className="flex flex-col items-center justify-center flex-grow p-0 m-0">
        {loading ? (
          <div className="loader">Loading...</div>
        ) : (
          <canvas ref={canvasRef} className="w-full h-full border-none shadow-none" />
        )}

        {/* Settings Icon */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="absolute top-4 right-4 p-1.5 bg-green-700 text-white rounded-full hover:bg-gray-800 transition duration-200"
        >
          <FiSettings className="text-xl" />
        </button>
      </div>
    </div>
  );
};

export default QRCodeElement;
