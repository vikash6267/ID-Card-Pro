"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Slider } from "./ui/slider";
import { Button } from "./ui/button";
import { Wand2, CircleDot, RotateCw, Check, X, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

const DEFAULT_FILTERS = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  warmth: 0,
  exposure: 0,
  vibrance: 0,
  sharpen: 0,
  blur: 0,
  // Advanced portrait filters
  skinSmoothing: 0,
  blemishRemoval: 0,
  teethWhitening: 0,
  eyeEnhancement: 0,
  faceContour: 0,
  skinTone: 0,
  lipEnhancement: 0
};

// Advanced image processing functions
const applyFiltersToCanvas = (canvas, filters) => {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;

  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  // Apply brightness
  if (filters.brightness !== 100) {
    const brightness = filters.brightness / 100;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] * brightness);     // R
      data[i + 1] = Math.min(255, data[i + 1] * brightness); // G
      data[i + 2] = Math.min(255, data[i + 2] * brightness); // B
    }
  }

  // Apply contrast
  if (filters.contrast !== 100) {
    const contrast = (filters.contrast / 100) ** 2;
    const intercept = 128 * (1 - contrast);
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, Math.max(0, data[i] * contrast + intercept));     // R
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] * contrast + intercept)); // G
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] * contrast + intercept)); // B
    }
  }

  // Apply saturation
  if (filters.saturation !== 100) {
    const saturation = filters.saturation / 100;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b; // Grayscale conversion
      data[i] = Math.min(255, gray + saturation * (r - gray));     // R
      data[i + 1] = Math.min(255, gray + saturation * (g - gray)); // G
      data[i + 2] = Math.min(255, gray + saturation * (b - gray)); // B
    }
  }

  // Apply warmth (temperature)
  if (filters.warmth !== 0) {
    const warmth = filters.warmth / 100;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] * (1 + warmth));     // R (increase)
      data[i + 2] = Math.max(0, data[i + 2] * (1 - warmth)); // B (decrease)
    }
  }

  // Apply exposure
  if (filters.exposure !== 0) {
    const exposure = 1 + (filters.exposure / 100);
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] * exposure);     // R
      data[i + 1] = Math.min(255, data[i + 1] * exposure); // G
      data[i + 2] = Math.min(255, data[i + 2] * exposure); // B
    }
  }

  // Apply vibrance (selective saturation)
  if (filters.vibrance !== 0) {
    const vibrance = filters.vibrance / 100;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const max = Math.max(r, g, b);
      const avg = (r + g + b) / 3;
      const amt = (Math.abs(max - avg) * 2 / 255) * vibrance;
      
      if (r !== max) data[i] += (max - r) * amt;
      if (g !== max) data[i + 1] += (max - g) * amt;
      if (b !== max) data[i + 2] += (max - b) * amt;
    }
  }

  // Apply sharpen (simplified unsharp mask)
  if (filters.sharpen > 0) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.putImageData(imageData, 0, 0);
    
    // Apply blur
    ctx.filter = `blur(${1 - (filters.sharpen / 100)}px)`;
    ctx.drawImage(tempCanvas, 0, 0);
    ctx.filter = 'none';
    
    // Subtract blurred version from original
    const blurredData = ctx.getImageData(0, 0, width, height);
    const blurred = blurredData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] + (data[i] - blurred[i]) * 0.5);     // R
      data[i + 1] = Math.min(255, data[i + 1] + (data[i + 1] - blurred[i + 1]) * 0.5); // G
      data[i + 2] = Math.min(255, data[i + 2] + (data[i + 2] - blurred[i + 2]) * 0.5); // B
    }
  }

  // Apply blur
  if (filters.blur > 0) {
    ctx.filter = `blur(${filters.blur / 10}px)`;
    ctx.putImageData(imageData, 0, 0);
    ctx.filter = 'none';
    return; // Skip other filters after blur
  }

  if (filters.skinSmoothing > 0) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.putImageData(imageData, 0, 0);
    
    // Apply blur to smooth skin
    ctx.filter = `blur(${filters.skinSmoothing / 20}px)`;
    ctx.drawImage(tempCanvas, 0, 0);
    ctx.filter = 'none';
    
    const blurredData = ctx.getImageData(0, 0, width, height);
    const blurred = blurredData.data;
    
    // Blend original and blurred based on skin tone detection
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Simple skin tone detection
      const isSkin = r > 95 && g > 40 && b > 20 && 
                    r > g && r > b && 
                    Math.abs(r - g) > 15;
      
      if (isSkin) {
        // Blend with blurred version
        const blendAmount = filters.skinSmoothing / 100;
        data[i] = data[i] * (1 - blendAmount) + blurred[i] * blendAmount;
        data[i + 1] = data[i + 1] * (1 - blendAmount) + blurred[i + 1] * blendAmount;
        data[i + 2] = data[i + 2] * (1 - blendAmount) + blurred[i + 2] * blendAmount;
      }
    }
  }

  // Apply teeth whitening
  if (filters.teethWhitening > 0) {
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Simple teeth detection (light colors)
      const isTooth = r > 200 && g > 180 && b > 160;
      
      if (isTooth) {
        const amount = filters.teethWhitening / 100;
        // Make teeth whiter by reducing yellow/blue
        data[i] = Math.min(255, r + (255 - r) * amount);
        data[i + 1] = Math.min(255, g + (255 - g) * amount * 0.8);
        data[i + 2] = Math.min(255, b + (255 - b) * amount * 0.6);
      }
    }
  }

  // Apply eye enhancement
  if (filters.eyeEnhancement > 0) {
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Simple eye detection (dark areas)
      const isEye = r < 100 && g < 80 && b < 80 && 
                   (r > 20 || g > 20 || b > 20);
      
      if (isEye) {
        const amount = filters.eyeEnhancement / 100;
        // Enhance contrast and saturation
        const avg = (r + g + b) / 3;
        data[i] = Math.max(0, Math.min(255, avg + (r - avg) * (1 + amount)));
        data[i + 1] = Math.max(0, Math.min(255, avg + (g - avg) * (1 + amount)));
        data[i + 2] = Math.max(0, Math.min(255, avg + (b - avg) * (1 + amount)));
      }
    }
  }

  // Apply face contour
  if (filters.faceContour > 0) {
    // This would require face detection for proper implementation
    // Simplified version just affects midtones
    const amount = filters.faceContour / 100;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const avg = (r + g + b) / 3;
      
      if (avg > 80 && avg < 180) { // Midtones
        data[i] = Math.max(0, Math.min(255, r * (1 - amount * 0.3)));
        data[i + 1] = Math.max(0, Math.min(255, g * (1 - amount * 0.3)));
        data[i + 2] = Math.max(0, Math.min(255, b * (1 - amount * 0.3)));
      }
    }
  }

  // Apply skin tone adjustment
  if (filters.skinTone !== 0) {
    const amount = filters.skinTone / 100;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Simple skin tone detection
      const isSkin = r > 95 && g > 40 && b > 20 && 
                    r > g && r > b && 
                    Math.abs(r - g) > 15;
      
      if (isSkin) {
        // Adjust skin tone warmth
        data[i] = Math.min(255, r * (1 + amount * 0.2));
        data[i + 2] = Math.max(0, b * (1 - amount * 0.2));
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
};
export function PhotoEditor({ photos, onPhotosChange }) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [presets, setPresets] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [processedPhotos, setProcessedPhotos] = useState({});
  const [activeTab, setActiveTab] = useState("adjust");
  const [batchProgress, setBatchProgress] = useState({
    processed: 0,
    total: 0,
    current: ""
  });
  const canvasRef = useRef(null);
  const originalImageRef = useRef(null);

  // Load saved presets from localStorage
  useEffect(() => {
    const savedPresets = localStorage.getItem("photoFilterPresets");
    if (savedPresets) {
      try {
        setPresets(JSON.parse(savedPresets));
      } catch (e) {
        console.error("Failed to parse presets:", e);
      }
    }
  }, []);

  // Process single image with filters
  const processSingleImage = useCallback(async (imageUrl, filters) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        // Apply filters
        applyFiltersToCanvas(canvas, filters);
        
        // Return as data URL
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      };
      img.onerror = () => {
        console.error("Failed to load image:", imageUrl);
        resolve(imageUrl); // Return original if fails
      };
      img.src = imageUrl;
    });
  }, []);

  // Update canvas with new image
  const updateCanvasWithImage = useCallback((imageUrl) => {
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // Set canvas dimensions
      const maxWidth = 800;
      const ratio = Math.min(maxWidth / img.width, 1);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Draw image
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Apply filters
      applyFiltersToCanvas(canvas, filters);
    };
    img.onerror = () => {
      console.error("Failed to load preview image");
    };
    img.src = imageUrl;
  }, [filters]);

  // Apply filters to all photos
  const applyToAllPhotos = useCallback(async () => {
    setIsProcessing(true);
    setBatchProgress({
      processed: 0,
      total: Object.keys(photos).length,
      current: ""
    });
    
    try {
      const processed = {};
      const photoEntries = Object.entries(photos);
      
      for (const [name, url] of photoEntries) {
        try {
          setBatchProgress(prev => ({
            ...prev,
            current: name,
            processed: prev.processed + 1
          }));
          
          const result = await processSingleImage(url, filters);
          processed[name] = result;
          
          if (selectedPhoto?.name === name) {
            updateCanvasWithImage(result);
          }
        } catch (error) {
          console.error(`Error processing ${name}:`, error);
          processed[name] = url;
        }
      }
      
      setProcessedPhotos(processed);
      onPhotosChange(processed);
      toast.success(`Filters applied to ${photoEntries.length} photos`);
    } catch (error) {
      console.error("Error processing photos:", error);
      toast.error("Failed to apply filters to all photos");
    } finally {
      setIsProcessing(false);
      setBatchProgress({
        processed: 0,
        total: 0,
        current: ""
      });
    }
  }, [photos, filters, selectedPhoto, processSingleImage, updateCanvasWithImage, onPhotosChange]);

  // Apply filters to selected photo
  const applyToSelected = useCallback(async () => {
    if (!selectedPhoto) return;
    
    setIsProcessing(true);
    try {
      const result = await processSingleImage(selectedPhoto.url, filters);
      
      setProcessedPhotos(prev => ({
        ...prev,
        [selectedPhoto.name]: result
      }));
      
      onPhotosChange({
        ...photos,
        [selectedPhoto.name]: result
      });
      
      toast.success("Filters applied to selected photo");
      setShowEditor(false);
    } catch (error) {
      console.error("Error applying filters:", error);
      toast.error("Failed to apply filters");
    } finally {
      setIsProcessing(false);
    }
  }, [selectedPhoto, filters, photos, onPhotosChange, processSingleImage]);

  // Save current filters as preset
  const savePreset = useCallback(() => {
    const presetName = prompt("Enter preset name:");
    if (!presetName) return;
    
    const newPreset = {
      name: presetName,
      filters: { ...filters }
    };
    
    const updatedPresets = [...presets, newPreset];
    setPresets(updatedPresets);
    localStorage.setItem("photoFilterPresets", JSON.stringify(updatedPresets));
    toast.success(`Preset "${presetName}" saved`);
  }, [filters, presets]);

  // Load preset
  const loadPreset = useCallback((preset) => {
    setFilters(preset.filters);
    toast.success(`Preset "${preset.name}" loaded`);
  }, []);

  // Delete preset
  const deletePreset = useCallback((presetName) => {
    if (!window.confirm(`Delete preset "${presetName}"?`)) return;
    
    const updatedPresets = presets.filter(p => p.name !== presetName);
    setPresets(updatedPresets);
    localStorage.setItem("photoFilterPresets", JSON.stringify(updatedPresets));
    toast.success(`Preset "${presetName}" deleted`);
  }, [presets]);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    toast.success("Filters reset to default");
  }, []);

  // Open editor for a specific photo
  const openEditor = useCallback((name, url) => {
    setSelectedPhoto({ name, url });
    originalImageRef.current = url;
    setShowEditor(true);
  }, []);

  // Preview filters on canvas
  useEffect(() => {
    if (!selectedPhoto || !canvasRef.current) return;
    
    const timer = setTimeout(() => {
      updateCanvasWithImage(selectedPhoto.url);
    }, 150);
    
    return () => clearTimeout(timer);
  }, [filters, selectedPhoto, updateCanvasWithImage]);

  // Render UI
  return (
    <div className="space-y-4">
{isProcessing && batchProgress.total > 0 && (
  <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
    <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center gap-4 w-80 relative">
      <button 
        onClick={() => {
          setIsProcessing(false);
          setBatchProgress({ processed: 0, total: 0, current: "" });
        }}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
      >
        <X className="w-5 h-5" />
      </button>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="bg-blue-600 h-2.5 rounded-full" 
          style={{ 
            width: `${(batchProgress.processed / batchProgress.total) * 100}%` 
          }}
        ></div>
      </div>
      <RotateCw className="w-6 h-6 animate-spin text-blue-600" />
      <p className="text-sm font-medium text-gray-800">
        Processing {batchProgress.processed} of {batchProgress.total} photos...
      </p>
      <p className="text-xs text-gray-500 text-center">
        {batchProgress.current}
      </p>
    </div>
  </div>
)}

      {/* Batch Processing Controls */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium">Batch Photo Enhancement</h3>
          <div className="flex gap-2">
            <Button
              onClick={applyToAllPhotos}
              disabled={isProcessing || Object.keys(photos).length === 0}
              size="sm"
              className="gap-1"
            >
              <Wand2 className="w-4 h-4" />
              {isProcessing ? "Processing..." : "Apply to All Photos"}
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {Object.entries(photos).map(([name, url]) => (
            <div key={name} className="relative group">
              <img
                src={processedPhotos[name] || url}
                alt={name}
                className="w-full h-32 object-cover rounded-md border"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEditor(name, url)}
                  className="text-white hover:bg-white/20"
                >
                  Edit
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Photo Editor Modal */}
      {showEditor && selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-medium">Editing: {selectedPhoto.name}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEditor(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-3 gap-6 p-4">
              {/* Preview Canvas */}
              <div className="lg:col-span-2 bg-gray-100 rounded-lg flex items-center justify-center p-2 relative">
                <canvas
                  ref={canvasRef}
                  className="max-w-full max-h-[70vh] object-contain border rounded-md shadow-sm"
                  style={{
                    backgroundColor: '#f0f0f0',
                    width: '100%',
                    height: 'auto'
                  }}
                />
              </div>
              
              {/* Controls */}
              <div className="space-y-6 overflow-y-auto">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button
                      variant={activeTab === "adjust" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveTab("adjust")}
                    >
                      Adjust
                    </Button>
                    <Button
                      variant={activeTab === "retouch" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveTab("retouch")}
                    >
                      Retouch
                    </Button>
                    <Button
                      variant={activeTab === "presets" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveTab("presets")}
                    >
                      Presets
                    </Button>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    className="text-red-500"
                  >
                    Reset
                  </Button>
                </div>
                
                {activeTab === "adjust" && (
                  <div className="space-y-4">
                    <div>
                      <label className="flex justify-between mb-2">
                        <span>Brightness</span>
                        <span>{filters.brightness}%</span>
                      </label>
                      <Slider
                        value={[filters.brightness]}
                        min={0}
                        max={200}
                        step={1}
                        onValueChange={([val]) => setFilters(prev => ({ ...prev, brightness: val }))}
                      />
                    </div>
                    
                    <div>
                      <label className="flex justify-between mb-2">
                        <span>Contrast</span>
                        <span>{filters.contrast}%</span>
                      </label>
                      <Slider
                        value={[filters.contrast]}
                        min={0}
                        max={200}
                        step={1}
                        onValueChange={([val]) => setFilters(prev => ({ ...prev, contrast: val }))}
                      />
                    </div>
                    
                    <div>
                      <label className="flex justify-between mb-2">
                        <span>Saturation</span>
                        <span>{filters.saturation}%</span>
                      </label>
                      <Slider
                        value={[filters.saturation]}
                        min={0}
                        max={200}
                        step={1}
                        onValueChange={([val]) => setFilters(prev => ({ ...prev, saturation: val }))}
                      />
                    </div>
                    
                    <div>
                      <label className="flex justify-between mb-2">
                        <span>Warmth</span>
                        <span>{filters.warmth}</span>
                      </label>
                      <Slider
                        value={[filters.warmth]}
                        min={-100}
                        max={100}
                        step={1}
                        onValueChange={([val]) => setFilters(prev => ({ ...prev, warmth: val }))}
                      />
                    </div>
                    
                    <div>
                      <label className="flex justify-between mb-2">
                        <span>Exposure</span>
                        <span>{filters.exposure}</span>
                      </label>
                      <Slider
                        value={[filters.exposure]}
                        min={-100}
                        max={100}
                        step={1}
                        onValueChange={([val]) => setFilters(prev => ({ ...prev, exposure: val }))}
                      />
                    </div>
                    
                    <div>
                      <label className="flex justify-between mb-2">
                        <span>Vibrance</span>
                        <span>{filters.vibrance}</span>
                      </label>
                      <Slider
                        value={[filters.vibrance]}
                        min={-100}
                        max={100}
                        step={1}
                        onValueChange={([val]) => setFilters(prev => ({ ...prev, vibrance: val }))}
                      />
                    </div>
                    
                    <div>
                      <label className="flex justify-between mb-2">
                        <span>Sharpen</span>
                        <span>{filters.sharpen}</span>
                      </label>
                      <Slider
                        value={[filters.sharpen]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={([val]) => setFilters(prev => ({ ...prev, sharpen: val }))}
                      />
                    </div>
                    
                    <div>
                      <label className="flex justify-between mb-2">
                        <span>Blur</span>
                        <span>{filters.blur}</span>
                      </label>
                      <Slider
                        value={[filters.blur]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={([val]) => setFilters(prev => ({ ...prev, blur: val }))}
                      />
                    </div>
                  </div>
                )}
                
{activeTab === "retouch" && (
  <div className="space-y-4">
    <div>
      <label className="flex justify-between mb-2">
        <span>Skin Smoothing</span>
        <span>{filters.skinSmoothing}</span>
      </label>
      <Slider
        value={[filters.skinSmoothing]}
        min={0}
        max={100}
        step={1}
        onValueChange={([val]) => setFilters(prev => ({ ...prev, skinSmoothing: val }))}
      />
    </div>
    
    <div>
      <label className="flex justify-between mb-2">
        <span>Blemish Removal</span>
        <span>{filters.blemishRemoval}</span>
      </label>
      <Slider
        value={[filters.blemishRemoval]}
        min={0}
        max={100}
        step={1}
        onValueChange={([val]) => setFilters(prev => ({ ...prev, blemishRemoval: val }))}
      />
    </div>
    
    <div>
      <label className="flex justify-between mb-2">
        <span>Teeth Whitening</span>
        <span>{filters.teethWhitening}</span>
      </label>
      <Slider
        value={[filters.teethWhitening]}
        min={0}
        max={100}
        step={1}
        onValueChange={([val]) => setFilters(prev => ({ ...prev, teethWhitening: val }))}
      />
    </div>
    
    <div>
      <label className="flex justify-between mb-2">
        <span>Eye Enhancement</span>
        <span>{filters.eyeEnhancement}</span>
      </label>
      <Slider
        value={[filters.eyeEnhancement]}
        min={0}
        max={100}
        step={1}
        onValueChange={([val]) => setFilters(prev => ({ ...prev, eyeEnhancement: val }))}
      />
    </div>

    <div>
      <label className="flex justify-between mb-2">
        <span>Face Contour</span>
        <span>{filters.faceContour}</span>
      </label>
      <Slider
        value={[filters.faceContour]}
        min={-100}
        max={100}
        step={1}
        onValueChange={([val]) => setFilters(prev => ({ ...prev, faceContour: val }))}
      />
    </div>

    <div>
      <label className="flex justify-between mb-2">
        <span>Skin Tone</span>
        <span>{filters.skinTone}</span>
      </label>
      <Slider
        value={[filters.skinTone]}
        min={-100}
        max={100}
        step={1}
        onValueChange={([val]) => setFilters(prev => ({ ...prev, skinTone: val }))}
      />
    </div>

    <div>
      <label className="flex justify-between mb-2">
        <span>Lip Enhancement</span>
        <span>{filters.lipEnhancement}</span>
      </label>
      <Slider
        value={[filters.lipEnhancement]}
        min={0}
        max={100}
        step={1}
        onValueChange={([val]) => setFilters(prev => ({ ...prev, lipEnhancement: val }))}
      />
    </div>
  </div>
)}
                
                {activeTab === "presets" && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                            <Button
        variant="outline"
        className="gap-1"
        onClick={() => setFilters({
          ...DEFAULT_FILTERS,
          brightness: 110,
          contrast: 110,
          saturation: 110,
          sharpen: 20
        })}
      >
        <Wand2 className="w-4 h-4" />
        Enhance
      </Button>
      
      <Button
        variant="outline"
        className="gap-1"
        onClick={() => setFilters({
          ...DEFAULT_FILTERS,
          brightness: 90,
          contrast: 110,
          saturation: 85,
          warmth: 15
        })}
      >
        <Wand2 className="w-4 h-4" />
        Warm
      </Button>
      
      <Button
        variant="outline"
        className="gap-1"
        onClick={() => setFilters({
          ...DEFAULT_FILTERS,
          brightness: 105,
          contrast: 105,
          saturation: 80,
          warmth: -10
        })}
      >
        <Wand2 className="w-4 h-4" />
        Cool
      </Button>
      
      <Button
        variant="outline"
        className="gap-1"
        onClick={() => setFilters({
          ...DEFAULT_FILTERS,
          brightness: 85,
          contrast: 120,
          saturation: 80
        })}
      >
        <Wand2 className="w-4 h-4" />
        Dramatic
      </Button>

      {/* Portrait Presets */}
      <Button
        variant="outline"
        className="gap-1"
        onClick={() => setFilters({
          ...DEFAULT_FILTERS,
          skinSmoothing: 50,
          teethWhitening: 30,
          eyeEnhancement: 40
        })}
      >
        <Wand2 className="w-4 h-4" />
        Portrait
      </Button>

      <Button
        variant="outline"
        className="gap-1"
        onClick={() => setFilters({
          ...DEFAULT_FILTERS,
          skinSmoothing: 70,
          blemishRemoval: 50,
          skinTone: 20
        })}
      >
        <Wand2 className="w-4 h-4" />
        Beauty
      </Button>

      <Button
        variant="outline"
        className="gap-1"
        onClick={() => setFilters({
          ...DEFAULT_FILTERS,
          brightness: 120,
          contrast: 90,
          saturation: 120,
          vibrance: 30
        })}
      >
        <Wand2 className="w-4 h-4" />
        Vibrant
      </Button>

      <Button
        variant="outline"
        className="gap-1"
        onClick={() => setFilters({
          ...DEFAULT_FILTERS,
          brightness: 80,
          contrast: 130,
          saturation: 70
        })}
      >
        <Wand2 className="w-4 h-4" />
        Moody
      </Button>
    
                      <Button
                        variant="outline"
                        className="gap-1"
                        onClick={() => setFilters({
                          ...DEFAULT_FILTERS,
                          brightness: 110,
                          contrast: 110,
                          saturation: 110,
                          sharpen: 20
                        })}
                      >
                        <Wand2 className="w-4 h-4" />
                        Enhance
                      </Button>
                      
                      <Button
                        variant="outline"
                        className="gap-1"
                        onClick={() => setFilters({
                          ...DEFAULT_FILTERS,
                          brightness: 90,
                          contrast: 110,
                          saturation: 85,
                          warmth: 15
                        })}
                      >
                        <Wand2 className="w-4 h-4" />
                        Warm
                      </Button>
                      
                      <Button
                        variant="outline"
                        className="gap-1"
                        onClick={() => setFilters({
                          ...DEFAULT_FILTERS,
                          brightness: 105,
                          contrast: 105,
                          saturation: 80,
                          warmth: -10
                        })}
                      >
                        <Wand2 className="w-4 h-4" />
                        Cool
                      </Button>
                      
                      <Button
                        variant="outline"
                        className="gap-1"
                        onClick={() => setFilters({
                          ...DEFAULT_FILTERS,
                          brightness: 85,
                          contrast: 120,
                          saturation: 80
                        })}
                      >
                        <Wand2 className="w-4 h-4" />
                        Dramatic
                      </Button>
                    </div>
                    
                    {presets.length > 0 && (
                      <div className="pt-2 border-t">
                        <h4 className="text-sm font-medium mb-2">Saved Presets</h4>
                        <div className="space-y-2">
                          {presets.map((preset) => (
                            <div key={preset.name} className="flex items-center justify-between gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => loadPreset(preset)}
                                className="w-full justify-start"
                              >
                                {preset.name}
                              </Button>
                              <Button
                                variant="ghost"
                                size="iconSm"
                                onClick={() => deletePreset(preset.name)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="pt-4 flex gap-2">
                      <Button
                        variant="outline"
                        className="gap-1 flex-1"
                        onClick={savePreset}
                      >
                        <Save className="w-4 h-4" />
                        Save Current as Preset
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="pt-4 border-t flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowEditor(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={applyToSelected}
                    disabled={isProcessing}
                    className="flex-1 gap-1"
                  >
                    {isProcessing ? (
                      <RotateCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    Apply
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}