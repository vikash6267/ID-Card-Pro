import { useState, useEffect, useRef, useCallback } from "react";
import { ImageIcon, Trash2, Plus, X, Check } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RotateCw } from "lucide-react";
import { toast } from "sonner";

const DEFAULT_WIDTH = 86;
const DEFAULT_HEIGHT = 54;

export function BackgroundUpload({ 
  onUpload, 
  onSizeChange,
  excelData,
  backgroundConfig,
  sideLabel,
  currentSide,
  template // Add template to props
}) {
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [height, setHeight] = useState(DEFAULT_HEIGHT);
  const [error, setError] = useState("");
  const [isReversed, setIsReversed] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState("");
  const [groups, setGroups] = useState([]);
  const [selectedValues, setSelectedValues] = useState([]);
  const [groupBackgrounds, setGroupBackgrounds] = useState({});
  const [showGroupCreator, setShowGroupCreator] = useState(false);
  const mmToPx = (mm) => Math.round((mm / 25.4) * 300);
  const prevWidthRef = useRef(width);
  const prevHeightRef = useRef(height);
  const canCreateGroups = currentSide === 'front' || 
  (currentSide === 'back' && template?.front?.backgroundGroups?.length);
  const [uploadEnabled, setUploadEnabled] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  

  // Update when groups change
  useEffect(() => {
    const newUploadEnabled = {};
    groups.forEach(group => {
      if (currentSide === 'back' && template?.front) {
        const frontGroupName = group.name.replace('Back:', 'Front:');
        const frontGroup = template.front.backgroundGroups?.find(g => g.name === frontGroupName);
        newUploadEnabled[group.name] = !!frontGroup?.image;
      } else {
        newUploadEnabled[group.name] = true; // Always enabled for front
      }
    });
    setUploadEnabled(newUploadEnabled);
  }, [groups, currentSide, template]);

  useEffect(() => {
    setSelectedColumn(backgroundConfig?.backgroundColumn || "");
    setGroups(backgroundConfig?.backgroundGroups || []);
    
    // ✅ Add this to restore thumbnails
    const restoredThumbnails = {};
    backgroundConfig?.backgroundGroups?.forEach(group => {
      if (group.image) {
        restoredThumbnails[group.name] = group.image;
      }
    });
    setGroupBackgrounds(restoredThumbnails); // ✅ Restore saved background previews
  }, [backgroundConfig]);
  

  useEffect(() => {
    if (prevWidthRef.current !== width || prevHeightRef.current !== height) {
      onSizeChange?.(width, height);
      prevWidthRef.current = width;
      prevHeightRef.current = height;
    }
  }, [width, height, onSizeChange]);

  const columnValues = useCallback(() => {
    if (!selectedColumn || !excelData?.rows) return [];
    
    // Get all unique non-empty values from the column
    const values = [...new Set(
      excelData.rows
        .map(row => row[selectedColumn]?.toString().trim())
        .filter(value => value && value !== 'undefined')
    )];
    
    return values;
  }, [selectedColumn, excelData]);

  const handleGroupImageUpload = useCallback((groupName) => (e) => {
    // First check if we can upload to this side
    if (currentSide === 'back' && !template?.front?.backgroundGroups?.length) {
      setError("Please configure front side first");
      return;
    }
  
    // Get the selected file from the input event
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      setError("Please upload a valid image file");
      return;
    }
  
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.src = url;
  
    img.onload = () => {
      // ✅ AUTO-DETECT IMAGE SIZE and convert to mm
      const dpi = 300;
      const imageWidthMm = (img.width / dpi) * 25.4;
      const imageHeightMm = (img.height / dpi) * 25.4;
      
      // ✅ Update card size based on image dimensions
      setWidth(parseFloat(imageWidthMm.toFixed(2)));
      setHeight(parseFloat(imageHeightMm.toFixed(2)));
      
      // ✅ Notify parent component about size change
      if (onSizeChange) {
        onSizeChange(imageWidthMm, imageHeightMm);
      }
      
      // Use detected dimensions for canvas
      const cardWidth = mmToPx(imageWidthMm);
      const cardHeight = mmToPx(imageHeightMm);
      
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = cardWidth;
      canvas.height = cardHeight;
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, cardWidth, cardHeight);
      ctx.drawImage(img, 0, 0, cardWidth, cardHeight);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
  
      setGroupBackgrounds(prev => ({
        ...prev,
        [groupName]: dataUrl
      }));
  
      const updatedGroups = groups.map(g => ({
        ...g,
        image: g.name === groupName ? dataUrl : groupBackgrounds[g.name]
      }));
  
      onUpload({ 
        type: "dynamic", 
        column: selectedColumn,
        groups: updatedGroups,
        isFront: sideLabel === 'Front'
      });
  
      // ✅ Show success message with detected size
      setError("");
      toast.success(`Card size auto-adjusted to ${imageWidthMm.toFixed(1)}mm × ${imageHeightMm.toFixed(1)}mm`, {
        description: "Based on image dimensions at 300 DPI",
        duration: 3000
      });
  
      e.target.value = ""; // Reset input
      URL.revokeObjectURL(url);
    };
  
    img.onerror = () => {
      setError("Error loading image");
      URL.revokeObjectURL(url);
    };
  }, [width, height, groups, selectedColumn, groupBackgrounds, onUpload, sideLabel, currentSide, template, onSizeChange]);

  const handleWidthChange = (e) => {
    const newWidth = parseFloat(e.target.value);
    if (!isNaN(newWidth)) {
      setWidth(Math.max(1, newWidth)); // Ensure minimum width of 1mm
      setError("");
    } else {
      setError("Width must be a number.");
    }
  };

  const handleHeightChange = (e) => {
    const newHeight = parseFloat(e.target.value);
    if (!isNaN(newHeight)) {
      setHeight(Math.max(1, newHeight)); // Ensure minimum height of 1mm
      setError("");
    } else {
      setError("Height must be a number.");
    }
  };

  const toggleOrientation = () => {
    setIsReversed((prev) => !prev);
    setWidth(height);
    setHeight(width);
  };

  const createNewGroup = () => {
    let newGroupName;
    let newGroupValues;
    
    if (selectedValues.includes("select-all")) {
      // Check if a default group already exists
      if (groups.some(g => g.name.includes("Default"))) {
        setError("A default group already exists");
        return;
      }
      
      newGroupName = `${sideLabel}:Default`;
      newGroupValues = ['__ALL__']; // Special marker for all values
    } else {
      // Filter out values already covered by the default group
      const defaultGroup = groups.find(g => g.name.includes("Default"));
      if (defaultGroup) {
        setError("Cannot create individual groups when a default group exists");
        return;
      }
      
      newGroupName = `${sideLabel}:${selectedValues.join(",").slice(0, 12)}`;
      newGroupValues = selectedValues.filter(v => v !== "select-all");
      
      // Check if any values are already in other groups
      const alreadyGrouped = groups.flatMap(g => g.values);
      const duplicates = newGroupValues.filter(v => alreadyGrouped.includes(v));
      if (duplicates.length > 0) {
        setError(`Values already in groups: ${duplicates.join(", ")}`);
        return;
      }
    }
  
    const newGroup = {
      name: newGroupName,
      values: newGroupValues,
      image: null
    };
  
    const updatedGroups = [...groups, newGroup];
    setGroups(updatedGroups);
    setGroupBackgrounds(prev => ({ ...prev, [newGroupName]: null }));
  
    onUpload({ 
      type: "dynamic", 
      column: selectedColumn,
      groups: updatedGroups,
      forSide: sideLabel
    });
  
    setSelectedValues([]);
    setShowGroupCreator(false);
    setError("");
  };
  // Update the group display to show coverage
const getGroupCoverage = (group) => {
  if (group.values.includes('__ALL__')) return "All values";
  if (group.values.includes('__BLANK__')) return "Blank values";
  return `${group.values.length} value${group.values.length !== 1 ? 's' : ''}`;
};

// Update the value selection UI to show which values are already grouped
const isValueGrouped = (value) => {
  return groups.some(group => 
    group.values.includes(value) || 
    group.values.includes('__ALL__') ||
    group.values.includes('__BLANK__')
  );
};

  const removeGroup = (groupName) => {
    const updatedGroups = groups.filter(g => g.name !== groupName);
    setGroups(updatedGroups);
    setGroupBackgrounds(prev => {
      const updated = { ...prev };
      delete updated[groupName];
      return updated;
    });

    onUpload({ 
      type: "dynamic", 
      column: selectedColumn,
      groups: updatedGroups.map(g => ({
        ...g,
        image: groupBackgrounds[g.name] || null
      }))
    });
  };

  const toggleValueSelection = (value) => {
    if (value === "select-all") {
      setSelectedValues(prev => 
        prev.includes("select-all") 
          ? [] 
          : [...columnValues(), "select-all"]
      );
    } else {
      setSelectedValues(prev => 
        prev.includes(value) 
          ? prev.filter(v => v !== value && v !== "select-all") 
          : [...prev.filter(v => v !== "select-all"), value]
      );
    }
  };

  const isAllSelected = selectedValues.length === columnValues().length && columnValues().length > 0;

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg shadow-md">
<Button 
  onClick={() => setIsModalOpen(true)}
  className={`w-full ${!excelData ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
  disabled={!excelData || !excelData.headers || excelData.headers.length === 0}
>
  <ImageIcon className="w-4 h-4 mr-2" />
  {!excelData ? "Upload Excel First" : "Upload Backgrounds"}
</Button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center border-b pb-4">
                <h3 className="text-lg font-semibold">Upload Backgrounds - {sideLabel}</h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Select Column</Label>
                  <div className="flex items-center space-x-2">
                    <select
                      value={selectedColumn}
                      onChange={(e) => {
                        setSelectedColumn(e.target.value);
                        setGroups([]);
                        setGroupBackgrounds({});
                      }}
                      className="w-full p-2 border rounded text-sm"
                    >
                      <option value="">Select a column</option>
                      {excelData?.headers?.map(header => (
                        <option key={header} value={header}>{header}</option>
                      ))}
                    </select>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowGroupCreator(true)}
                      disabled={!columnValues().length || !canCreateGroups}
                    >
                      <Plus className="w-4 h-4 mr-1" /> Add Group
                    </Button>
                  </div>
                </div>

                {selectedColumn && (
                  <>
                    {showGroupCreator && (
                      <div className="p-4 border rounded-lg bg-white space-y-3">
                        <div className="flex justify-between items-center">
                          <Label>Create New Group</Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setShowGroupCreator(false);
                              setSelectedValues([]);
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="max-h-40 overflow-y-auto border rounded p-2">
                          <div className="flex items-center p-1">
                            <input
                              type="checkbox"
                              id="select-all"
                              checked={isAllSelected || selectedValues.includes("select-all")}
                              onChange={() => toggleValueSelection("select-all")}
                              className="mr-2"
                            />
                            <label htmlFor="select-all" className="text-sm font-medium">
                              Select All Values
                            </label>
                          </div>
                          {columnValues().map(value => (
                            <div key={value} className="flex items-center p-1">
                              <input
                                type="checkbox"
                                id={`value-${value}`}
                                checked={selectedValues.includes(value) || selectedValues.includes("select-all")}
                                onChange={() => toggleValueSelection(value)}
                                className="mr-2"
                                disabled={isValueGrouped(value) && !selectedValues.includes(value)}
                              />
                              <label 
                                htmlFor={`value-${value}`} 
                                className={`text-sm ${isValueGrouped(value) ? 'text-gray-400' : ''}`}
                              >
                                {value}
                                {isValueGrouped(value) && (
                                  <span className="text-xs text-gray-500 ml-1">(grouped)</span>
                                )}
                              </label>
                            </div>
                          ))}
                        </div>
                        
                        <Button
                          onClick={createNewGroup}
                          disabled={selectedValues.length === 0}
                          className="w-full"
                        >
                          <Check className="w-4 h-4 mr-1" /> Create Group
                        </Button>
                      </div>
                    )}

                    <div className="space-y-2">
                      {groups.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {groups.map(group => (
                            <div 
                              key={group.name} 
                              className="relative flex flex-col items-center gap-1 p-2 border rounded-lg bg-white"
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeGroup(group.name)}
                                className="absolute -top-2 -right-2 h-5 w-5 p-0 rounded-full bg-red-500 hover:bg-red-600 text-white"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>

                              <div className="relative w-full aspect-square border rounded overflow-hidden">
                                {!uploadEnabled[group.name] && (
                                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                                    <span className="text-white text-xs text-center p-1">
                                      Upload front first
                                    </span>
                                  </div>
                                )}
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleGroupImageUpload(group.name)}
                                  className={`absolute inset-0 w-full h-full opacity-0 cursor-pointer ${
                                    uploadEnabled[group.name] ? '' : 'pointer-events-none'
                                  }`}
                                  disabled={!uploadEnabled[group.name]}
                                />
                                {groupBackgrounds[group.name] ? (
                                  <img 
                                    src={groupBackgrounds[group.name]} 
                                    alt={group.name} 
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                    <ImageIcon className="w-5 h-5 text-gray-400" />
                                  </div>
                                )}
                              </div>

                              <div className="text-center w-full px-1">
                                <div 
                                  className="text-xs font-medium w-full truncate" 
                                  title={group.name.replace(/^[FB]:/, `${sideLabel}: `)}
                                >
                                  {group.name}
                                </div>
                                <div className="text-[10px] text-gray-500">
                                  {getGroupCoverage(group)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 p-4 border rounded bg-white text-center">
                          {showGroupCreator 
                            ? "Select values to create a group" 
                            : "No groups created yet"}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col space-y-2 pt-2">
                      {/* Auto-size info banner */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                        <div className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div className="flex-1">
                            <p className="font-medium text-blue-900">Auto-Size Detection</p>
                            <p className="text-blue-700 text-xs mt-1">
                              Card size will automatically adjust to match your uploaded image dimensions (at 300 DPI).
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <Label className="text-sm font-medium flex items-center gap-1">
                            Width (mm)
                            <span className="text-xs text-gray-500">(auto)</span>
                          </Label>
                          <Input
                            type="number"
                            value={width}
                            onChange={handleWidthChange}
                            placeholder="Width"
                            min="1"
                            step="0.1"
                            className="bg-blue-50"
                          />
                        </div>
                        <div className="flex-1">
                          <Label className="text-sm font-medium flex items-center gap-1">
                            Height (mm)
                            <span className="text-xs text-gray-500">(auto)</span>
                          </Label>
                          <Input
                            type="number"
                            value={height}
                            onChange={handleHeightChange}
                            placeholder="Height"
                            min="1"
                            step="0.1"
                            className="bg-blue-50"
                          />
                        </div>
                        <Button 
                          onClick={toggleOrientation}
                          variant="outline"
                          size="sm"
                          className="self-end mb-1"
                          title="Rotate dimensions"
                        >
                          <RotateCw className="w-4 h-4" />
                        </Button>
                      </div>
                      {error && <div className="text-red-500 text-sm">{error}</div>}
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    onSizeChange(width, height);
                    setIsModalOpen(false);
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}