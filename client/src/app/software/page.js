'use client'
import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import * as fabric from 'fabric';



// ID Card Upload and Mapping Component
const IDCardDesigner = () => {
  const [excelData, setExcelData] = useState([]);
  const [photos, setPhotos] = useState({});
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [mappedFields, setMappedFields] = useState([]);
  const [selectedField, setSelectedField] = useState('');
  const [customText, setCustomText] = useState('');
  const [selectedText, setSelectedText] = useState(null);
  const [imagePopup, setImagePopup] = useState(false);
  const [newImage, setNewImage] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = new fabric.Canvas('editorCanvas', {
      width: 800,
      height: 500,
      backgroundColor: '#f0f0f0',
    });
    canvasRef.current = canvas;
    return () => {
      canvas.dispose();
    };
  }, []);

  // Handle uploading the Excel data
  const handleExcelUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      setExcelData(jsonData);
    };

    reader.readAsArrayBuffer(file);
  };

  // Handle uploading the ID card background image
  const handleBackgroundUpload = (event) => {
    event.preventdefault()
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      setBackgroundImage(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle uploading photos
  const handlePhotoUpload = (event) => {
    const files = event.target.files;
    const photoURLs = Array.from(files).map(file => URL.createObjectURL(file));
    const photoMap = photoURLs.reduce((acc, url, index) => {
      acc[index + 1] = url; // Photo number starts from 1
      return acc;
    }, {});
    setPhotos(photoMap);
  };



  // Handle text customization
  const handleTextCustomization = (property, value) => {
    if (selectedText) {
      selectedText.set({ [property]: value });
      canvasRef.current.renderAll();
    }
  };

  // Handle deleting selected text/image
  const handleDeleteSelected = () => {
    if (selectedText) {
      canvasRef.current.remove(selectedText);
      setSelectedText(null);
    }
  };

  // Update the selected field for text/image mapping
  const handleFieldSelection = (event) => {
    setSelectedField(event.target.value);
  };

  // Toggle Image Popup
  const toggleImagePopup = () => {
    setImagePopup(!imagePopup);
  };

  // Handle image selection from Excel data or upload
  const handleImageSelect = (image) => {
    setNewImage(image);
    toggleImagePopup();
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-semibold text-center mb-8">ID Card Designer</h1>

      {/* Upload ID Card Design */}
      <div className="mb-6">
        <label className="block text-lg font-semibold">Upload ID Card Background Design:</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleBackgroundUpload}
          className="mt-2 px-4 py-2 border border-gray-300 rounded"
        />
      </div>

      {/* Upload Excel File */}
      <div className="mb-6">
        <label className="block text-lg font-semibold">Upload Excel Data:</label>
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleExcelUpload}
          className="mt-2 px-4 py-2 border border-gray-300 rounded"
        />
      </div>

      {/* Upload Photos */}
      <div className="mb-6">
        <label className="block text-lg font-semibold">Upload Photos:</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handlePhotoUpload}
          className="mt-2 px-4 py-2 border border-gray-300 rounded"
        />
      </div>

      {/* Add Text or Image */}
      <div className="mb-6">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded mr-4"
          onClick={() => handleAddField('text')}
        >
          Add Text
        </button>
        <button
          className="px-4 py-2 bg-green-500 text-white rounded"
          onClick={() => handleAddField('image')}
        >
          Add Image
        </button>
      </div>

      {/* Field Selection Dropdown */}
      <div className="mb-6">
        <label className="block text-lg font-semibold">Select Field to Add:</label>
        <select
          value={selectedField}
          onChange={handleFieldSelection}
          className="w-full px-4 py-2 border border-gray-300 rounded"
        >
          <option value="">Select Field</option>
          {excelData.length > 0 &&
            Object.keys(excelData[0]).map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
        </select>
      </div>

      {/* Custom Text Input */}
      <div className="mb-6">
        <label className="block text-lg font-semibold">Custom Text:</label>
        <input
          type="text"
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          className="mt-2 px-4 py-2 border border-gray-300 rounded w-full"
        />
      </div>

      {/* Text Customization */}
      <div className="mb-6">
        <button
          className="px-4 py-2 bg-yellow-500 text-white rounded mr-4"
          onClick={() => handleTextCustomization('fontSize', 30)}
        >
          Increase Font Size
        </button>
        <button
          className="px-4 py-2 bg-yellow-500 text-white rounded"
          onClick={() => handleTextCustomization('fontFamily', 'Courier')}
        >
          Change Font Family
        </button>
      </div>

      {/* Delete Button */}
      <div className="mb-6">
        <button
          className="px-4 py-2 bg-red-500 text-white rounded"
          onClick={handleDeleteSelected}
        >
          Delete Selected
        </button>
      </div>

      {/* Generate the ID Card Preview */}
      <div className="mt-6 relative">
        {backgroundImage && <img src={backgroundImage} alt="ID Card" className="absolute w-full h-full" />}
        <canvas id="editorCanvas" className="border border-gray-400 absolute top-0 left-0"></canvas>
      </div>

      {/* Image Popup */}
      {imagePopup && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-1/2">
            <h2 className="text-2xl mb-4">Select or Upload Image</h2>
            <div className="mb-4">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded"
                onClick={toggleImagePopup}
              >
                Close
              </button>
            </div>
            <div>
              <label className="block text-lg font-semibold">Choose an Image</label>
              <select
                onChange={(e) => handleImageSelect(photos[e.target.value])}
                className="w-full px-4 py-2 border border-gray-300 rounded"
              >
                <option value="">Select Photo</option>
                {Object.entries(photos).map(([key, url]) => (
                  <option key={key} value={key}>
                    Photo {key}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IDCardDesigner;
