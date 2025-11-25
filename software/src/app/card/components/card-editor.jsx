"use client";
import { useState, useRef, useEffect } from "react";
import { 
  Type, ImageIcon, Trash2, ChevronLeft, ChevronRight, 
  RotateCw, QrCode, Barcode, Save, FolderOpen, 
  Plus, X, Edit2, HardDriveDownload, HardDriveUpload, 
  Grid, RotateCcw, FileText, Layers 
} from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { read, utils } from "xlsx";
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

// Components
import { BackgroundUpload } from "./background-upload";
import { ResizableElement } from "./resizable-element";
import { ElementSettings } from "./element-settings";
import PhotoMask from "./photo-mask";
import CardGenerator from "./card-generator";
import AutoContainerGenerator from './AutoContainerGenerator';
import { useUndoRedo } from "./undo-redo-manager";
import useKeyboardShortcuts from "./keyboard-shortcuts";
import { ExcelEditor } from "./ExcelEditor";
import { PhotoEditor } from "./photo-editor";

// Utils
import { getCroppedImg, ManualCropHandler, mmToPixels, pixelsToMm } from './utils/cropUtils';



const saveProjectsToStorage = (projectsList) => {
  try {
    // Ensure all photos are properly included
    const projectsToSave = projectsList.map(project => {
      const photosToSave = { ...project.photos };
      
      // Collect all image references from the template
      ['front', 'back'].forEach(side => {
        project.template[side]?.elements?.forEach(element => {
          if (element.type === "image" && element.content && !photosToSave[element.content]) {
            photosToSave[element.content] = "/placeholder.svg";
          }
        });
      });
      
      return { ...project, photos: photosToSave };
    });
    
    localStorage.setItem('idCardProjects', JSON.stringify(projectsToSave));
  } catch (error) {
    console.error("Failed to save projects:", error);
    toast.error("Failed to save projects");
  }
};
// Project data structure
const DEFAULT_PROJECT = {
  id: "1",
  front: { 
    elements: [], 
    background: "",
    backgroundMode: "dynamic",
    backgroundColumn: "",
    backgroundGroups: []
  },
  back: { 
    elements: [], 
    background: "",
    backgroundMode: "dynamic",
    backgroundColumn: "",
    backgroundGroups: []
  },
  size: { width: 3.375, height: 2.125 },
  orientation: "horizontal",
  maskSrc: null,
  applyMask: false,
  photos: {} // Add empty photos object by default
}

export default function CardEditor({ onTemplateChange, onExcelDataChange, onPhotosChange }) {
  const [showExcelEditor, setShowExcelEditor] = useState(false);
  const [template, setTemplate] = useState(structuredClone(DEFAULT_PROJECT));
  const [cardWidth, setCardWidth] = useState(3.375);
  const [cardHeight, setCardHeight] = useState(2.125);
  const [currentSide, setCurrentSide] = useState("front");
  const [selectedHeader, setSelectedHeader] = useState("");
  const [excelData, setExcelData] = useState({ headers: [], rows: [] });
  const [photos, setPhotos] = useState({});
  const [selectedElements, setSelectedElements] = useState([]);
  const [currentRecordIndex, setCurrentRecordIndex] = useState(0);
  const [applyMask, setApplyMask] = useState(false);
  const containerRef = useRef(null);
  const dpi = 300;
  const [maskSrc, setMaskSrc] = useState(null);
  const [selectionBox, setSelectionBox] = useState(null);
  const [isDraggingSelection, setIsDraggingSelection] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [scrollStart, setScrollStart] = useState({ x: 0, y: 0 });
  const panWrapperRef = useRef(null);
  const fileInputRef = useRef(null);
  const skipHistoryRef = useRef(false);
const [showCropControls, setShowCropControls] = useState(false);
const [crop, setCrop] = useState({ x: 0, y: 0 });
const [zoom, setZoom] = useState(1);
const [rotation, setRotation] = useState(0);
const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
const [cropMode, setCropMode] = useState('manual');
const [showHandles, setShowHandles] = useState(true);
const [cropDimensions, setCropDimensions] = useState({ width: 50, height: 30 });
const [manualCropper, setManualCropper] = useState(null);
const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
const [photosArray, setPhotosArray] = useState([]);
const [showGalleryModal, setShowGalleryModal] = useState(false);
const [selectedPhoto, setSelectedPhoto] = useState(null);
const cropCanvasRef = useRef(null);
const [showPhotoEditor, setShowPhotoEditor] = useState(false);

useEffect(() => {
  onExcelDataChange?.(excelData);
}, [excelData]);
// Initialize manual cropper when photo is selected
useEffect(() => {
  let isMounted = true;

  const initCropper = async () => {
    try {
      if (showCropControls && selectedPhoto?.url && cropCanvasRef.current && isMounted) {
        console.log('Starting cropper initialization...');
        
        // Clean up previous instance if it exists
        if (manualCropper) {
          console.log('Cleaning up previous cropper instance');
          setManualCropper(null);
        }

        // Create and load image
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        await new Promise((resolve, reject) => {
          img.onload = () => {
            console.log('Image loaded:', {
              width: img.width,
              height: img.height,
              naturalWidth: img.naturalWidth,
              naturalHeight: img.naturalHeight
            });
            resolve();
          };
          img.onerror = (error) => {
            console.error('Image load error:', error);
            reject(error);
          };
          img.src = selectedPhoto.url;
        });

        // Get canvas and container dimensions
        const canvas = cropCanvasRef.current;
        const container = canvas.parentElement;
        const containerRect = container.getBoundingClientRect();
        
        console.log('Container dimensions:', {
          width: containerRect.width,
          height: containerRect.height
        });

        // Set canvas size to match container
        canvas.width = containerRect.width;
        canvas.height = containerRect.height;
        canvas.style.width = '100%';
        canvas.style.height = '100%';

        // Initialize cropper with loaded image
        const cropper = new ManualCropHandler(canvas, img, {
          onCropComplete: handleSaveCrop,
          handleSize: 12,
          borderColor: '#ffffff',
          guideColor: 'rgba(255, 255, 255, 0.8)',
          backgroundColor: 'rgba(0, 0, 0, 0.6)'
        });

        // Set initial crop area
        cropper.setCropArea(cropDimensions.width, cropDimensions.height);
        setManualCropper(cropper);
        
        console.log('Cropper initialized successfully');
      }
    } catch (error) {
      console.error('Failed to initialize cropper:', error);
      toast.error('Failed to initialize image cropper: ' + error.message);
    }
  };

  initCropper();

  return () => {
    isMounted = false;
    if (manualCropper) {
      console.log('Cleaning up cropper on unmount');
      setManualCropper(null);
    }
  };
}, [showCropControls, selectedPhoto?.url, cropDimensions]);
  const { recordChange, undo, redo } = useUndoRedo(template, (newTemplate) => {
    skipHistoryRef.current = true;
    setTemplate(structuredClone(newTemplate));
  });
// State
const [rotations, setRotations] = useState({
  elements: {},    // For element-specific rotations
  gallery: {}      // For gallery-specific rotations
});


// Rotation handler
const handleGalleryRotation = (photoName, rotationChange) => {
  setRotations(prev => ({
    ...prev,
    gallery: {
      ...prev.gallery,
      [photoName]: ((prev.gallery[photoName] || 0) + rotationChange) % 360
    }
  }));
};




  const [galleryRotations, setGalleryRotations] = useState({}); // Add this line
// Rotation handler for gallery
const handlePhotoRotation = (elementId, photoName, rotationChange) => {
  setPhotoInstanceRotations(prev => ({
    ...prev,
    [elementId]: {
      ...prev[elementId],
      [photoName]: ((prev[elementId]?.[photoName] || 0) + rotationChange) % 360
    }
  }));
}
  useKeyboardShortcuts({
    selectedElements,
    setSelectedElements,
    template,
    setTemplate,
    currentSide,
    onTemplateChange,
    zoomLevel,
    recordChange, // ✅ very important
  });
  
const handleSaveCrop = async () => {
  try {
    if (!manualCropper || !selectedPhoto) return;
    
    const cropArea = manualCropper.getCropArea();
    console.log('Original crop area:', cropArea);
    
    // Calculate the actual crop coordinates relative to the original image
    const scale = Math.min(
      cropCanvasRef.current.width / manualCropper.image.width,
      cropCanvasRef.current.height / manualCropper.image.height
    );
    
    const scaledWidth = manualCropper.image.width * scale;
    const scaledHeight = manualCropper.image.height * scale;
    const offsetX = (cropCanvasRef.current.width - scaledWidth) / 2;
    const offsetY = (cropCanvasRef.current.height - scaledHeight) / 2;
    
    // Calculate the actual coordinates on the original image
    const actualX = (cropArea.x - offsetX) / scale;
    const actualY = (cropArea.y - offsetY) / scale;
    const actualWidth = cropArea.width / scale;
    const actualHeight = cropArea.height / scale;
    
    const finalCropArea = {
      x: Math.max(0, actualX),
      y: Math.max(0, actualY),
      width: Math.min(actualWidth, manualCropper.image.width - actualX),
      height: Math.min(actualHeight, manualCropper.image.height - actualY),
    };
    
    console.log('Final crop area:', finalCropArea);
    
    const croppedUrl = await getCroppedImg(selectedPhoto.url, finalCropArea, {
      rotation,
      quality: 0.95,
      format: 'png',
      preserveTransparency: true,
      dpi: 300
    });
    
    // Update photos state
    setPhotos(prev => ({
      ...prev,
      [selectedPhoto.name]: croppedUrl
    }));
    
    // Auto-advance to next photo
    const nextIndex = currentPhotoIndex + 1;
    if (nextIndex < photosArray.length) {
      setCurrentPhotoIndex(nextIndex);
      setSelectedPhoto(photosArray[nextIndex]);
      
      // Reset for next photo
      setTimeout(() => {
        if (manualCropper) {
          manualCropper.setCropArea(cropDimensions.width, cropDimensions.height);
          manualCropper.options.lockAspectRatio = true;
          manualCropper.draw();
        }
      }, 200);
    } else {
      setShowCropControls(false);
      setSelectedPhoto(null);
      toast.success('All photos cropped!');
    }
  } catch (error) {
    console.error('Error in handleSaveCrop:', error);
    toast.error(`Error cropping image: ${error.message}`);
  }
};

const toggleAspectRatioLock = () => {
  if (manualCropper) {
    manualCropper.options.lockAspectRatio = !manualCropper.options.lockAspectRatio;
    manualCropper.draw();
  }
};

const initializeManualCropper = async (photoUrl) => {
  console.log('Initializing manual cropper with photo:', photoUrl);
  
  if (!cropCanvasRef.current) {
    console.error('Canvas ref is not available');
    return;
  }
  
  try {
    console.log('Creating new image instance');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    await new Promise((resolve, reject) => {
      img.onload = () => {
        console.log('Image loaded successfully:', {
          width: img.width,
          height: img.height,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight
        });
        resolve();
      };
      img.onerror = (error) => {
        console.error('Image load error:', error);
        reject(error);
      };
      
      console.log('Setting image source');
      img.src = photoUrl;
    });
    
    const canvas = cropCanvasRef.current;
    const container = canvas.parentElement;
    const containerRect = container.getBoundingClientRect();
    
    // Set canvas size to match container
    canvas.width = containerRect.width;
    canvas.height = containerRect.height;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    
    const cropper = new ManualCropHandler(canvas, img, {
      onCropComplete: handleSaveCrop,
      handleSize: 12,
      borderColor: '#ffffff',
      guideColor: 'rgba(255, 255, 255, 0.8)',
      backgroundColor: 'rgba(0, 0, 0, 0.6)'
    });
    
    // Set initial crop area
    cropper.setCropArea(cropDimensions.width, cropDimensions.height);
    setManualCropper(cropper);
    
    console.log('Manual cropper initialized successfully');
  } catch (error) {
    console.error('Error initializing cropper:', error);
    toast.error('Failed to initialize cropper: ' + error.message);
  }
};

const handleCropDimensionChange = (dimension, value) => {
  const newDimensions = { ...cropDimensions, [dimension]: parseFloat(value) || 0 };
  setCropDimensions(newDimensions);
  
  if (manualCropper) {
    manualCropper.setCropArea(newDimensions.width, newDimensions.height);
  }
};

const startBatchCropping = () => {
  const photoEntries = Object.entries(photos);
  setPhotosArray(photoEntries.map(([name, url]) => ({ name, url })));
  setCurrentPhotoIndex(0);
  
  if (photoEntries.length > 0) {
    setSelectedPhoto(photoEntries[0]);
    setShowCropControls(true);
  }
};

  // Project management state
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [renameProjectId, setRenameProjectId] = useState("");
  const [renameProjectName, setRenameProjectName] = useState("");
  const [lastSaved, setLastSaved] = useState(null);
  const [photoInstanceRotations, setPhotoInstanceRotations] = useState({});
  
  
  useEffect(() => {
    loadProjectsFromStorage();
  }, []);

  // Project management functions
  const loadProjectsFromStorage = () => {
    try {
      const savedProjects = localStorage.getItem('idCardProjects');
      if (savedProjects) {
        const parsedProjects = JSON.parse(savedProjects);
        setProjects(parsedProjects);
        
        // If there's a last opened project, load it
        const lastOpenedProjectId = localStorage.getItem('lastOpenedProject');
        if (lastOpenedProjectId) {
          const lastProject = parsedProjects.find(p => p.id === lastOpenedProjectId);
          if (lastProject) {
            loadProject(lastProject.id);
          }
        }
      }
    } catch (error) {
      console.error("Failed to load projects:", error);
      toast.error("Failed to load projects");
    }
  };

  const saveProjectsToStorage = (projectsList) => {
    try {
      localStorage.setItem('idCardProjects', JSON.stringify(projectsList));
    } catch (error) {
      console.error("Failed to save projects:", error);
      toast.error("Failed to save projects");
    }
  };

  const createNewProject = () => {
    if (!newProjectName.trim()) {
      toast.error("Project name cannot be empty");
      return;
    }
    
    const newProject = {
      id: uuidv4(),
      name: newProjectName.trim(),
      template: structuredClone(DEFAULT_PROJECT),
      excelData: { headers: [], rows: [] },
      photos: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    saveProjectsToStorage(updatedProjects);
    setCurrentProject(newProject);
    setTemplate(structuredClone(DEFAULT_PROJECT));
    setExcelData({ headers: [], rows: [] });
    setPhotos({});
    setNewProjectName("");
    setIsNewProjectModalOpen(false);
    setLastSaved(new Date().toISOString());
    
    toast.success(`Project "${newProject.name}" created successfully`);
  };

const saveProject = (manualSave = true) => {
  if (!currentProject) {
    toast.error("No project selected to save");
    return;
  }

  // Create a photos object with all current photos
  const photosToSave = { ...photos };

  // Also ensure all referenced images are included
  ['front', 'back'].forEach(side => {
    template[side]?.elements?.forEach(element => {
      if (element.type === "image" && element.content && !photosToSave[element.content]) {
        photosToSave[element.content] = "/placeholder.svg";
      }
    });
  });

  const updatedProject = {
    ...currentProject,
    template: JSON.parse(JSON.stringify(template)),
    excelData: JSON.parse(JSON.stringify(excelData)),
    photos: photosToSave, // Save all photos
    maskSrc,
    masks,
    applyMask,
    rotations: JSON.parse(JSON.stringify(rotations)),
    photoInstanceRotations: JSON.parse(JSON.stringify(photoInstanceRotations)),
    updatedAt: new Date().toISOString()
  };

  const updatedProjects = projects.map(p => 
    p.id === updatedProject.id ? updatedProject : p
  );
  
  setProjects(updatedProjects);
  localStorage.setItem('idCardProjects', JSON.stringify(updatedProjects));
  setCurrentProject(updatedProject);
  setLastSaved(new Date().toISOString());
  
  if (manualSave) {
    toast.success(`Project "${updatedProject.name}" saved successfully`);
  }
};

  const loadProject = (projectId) => {
    const projectToLoad = projects.find(p => p.id === projectId);
    if (!projectToLoad) {
      toast.error("Project not found");
      return;
    }
  
    // Create deep copies of all data
    const loadedTemplate = JSON.parse(JSON.stringify(projectToLoad.template));
    const loadedExcelData = JSON.parse(JSON.stringify(projectToLoad.excelData));
  
    // Initialize photos with all images from the project
    const loadedPhotos = { ...projectToLoad.photos };
  
    // Verify and repair all image references in the template
    ['front', 'back'].forEach(side => {
      if (loadedTemplate[side]?.elements) {
        loadedTemplate[side].elements.forEach(element => {
          if (element.type === "image" && element.content) {
            // Ensure the photo exists or use placeholder
            if (!loadedPhotos[element.content]) {
              loadedPhotos[element.content] = "/placeholder.svg";
              console.warn(`Missing image for ${element.content}, using placeholder`);
            }
  
            // For dynamic images, ensure we have the current record's image
            if (!element.isCustomImage && loadedExcelData.rows.length > 0) {
              const currentImage = loadedExcelData.rows[0]?.[element.heading];
              if (currentImage && !loadedPhotos[currentImage]) {
                loadedPhotos[currentImage] = "/placeholder.svg";
              }
            }
          }
        });
      }
    });
  
    // ✅ Update all state variables in a single batch
    setCurrentProject(projectToLoad);
    setPhotos(loadedPhotos);
    setExcelData(loadedExcelData);
    setTemplate(() => {
      recordChange(loadedTemplate);
      return loadedTemplate;
    });
    setMasks(projectToLoad.masks || []); // Add this line
    setMaskSrc(projectToLoad.maskSrc || null);
    setApplyMask(projectToLoad.applyMask || false);
    setRotations(projectToLoad.rotations || { elements: {}, gallery: {} }); // Restore rotations
    setPhotoInstanceRotations(
      Object.fromEntries(
        Object.entries(projectToLoad.photoInstanceRotations || {}).filter(([elementId]) =>
          loadedTemplate.front.elements.some(el => el.id === elementId) ||
          loadedTemplate.back.elements.some(el => el.id === elementId)
        )
      )
    );
    setLastSaved(projectToLoad.updatedAt);
  
    // Update card dimensions
    setCardWidth(loadedTemplate.size.width);
    setCardHeight(loadedTemplate.size.height);
  
    // Reset selection and force UI update
    setSelectedElements([]);
     setCurrentRecordIndex(0); // Add this line
  
    // ✅ Save this project as the last opened one
    localStorage.setItem('lastOpenedProject', projectToLoad.id);
  
    toast.success(`Project "${projectToLoad.name}" loaded successfully`);
  };
  

  const renameProject = (projectId, newName) => {
    if (!newName.trim()) {
      toast.error("Project name cannot be empty");
      return;
    }
    
    const updatedProjects = projects.map(p => 
      p.id === projectId ? { ...p, name: newName.trim(), updatedAt: new Date().toISOString() } : p
    );
    
    setProjects(updatedProjects);
    saveProjectsToStorage(updatedProjects);
    
    if (currentProject && currentProject.id === projectId) {
      setCurrentProject({ ...currentProject, name: newName.trim(), updatedAt: new Date().toISOString() });
    }
    
    setRenameProjectName("");
    setIsRenameModalOpen(false);
    
    toast.success("Project renamed successfully");
  };

  const deleteProject = (projectId) => {
    if (!window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      return;
    }
    
    const updatedProjects = projects.filter(p => p.id !== projectId);
    setProjects(updatedProjects);
    saveProjectsToStorage(updatedProjects);
    
    if (currentProject && currentProject.id === projectId) {
      setCurrentProject(null);
      setTemplate(() => {
        const newTemp = structuredClone(DEFAULT_PROJECT);
        recordChange(newTemp);
        return newTemp;
      });
      setExcelData({ headers: [], rows: [] });
      setPhotos({});
      setLastSaved(null);
    }
    
    toast.success("Project deleted successfully");
  };

  const exportProject = () => {
    if (!currentProject) {
      toast.error("No project to export");
      return;
    }
    
    // Create a new photos object that only includes necessary images
    const photosToExport = {};
    
    // Add all custom images and any other referenced photos
    ['front', 'back'].forEach(side => {
      template[side].elements.forEach(element => {
        if (element.type === "image" && element.content) {
          if (photos[element.content]) {
            photosToExport[element.content] = photos[element.content];
          }
          // Also export original images if they exist
          if (photos[`original_${element.content}`]) {
            photosToExport[`original_${element.content}`] = photos[`original_${element.content}`];
          }
        }
      });
    });
  
    const projectData = {
      ...currentProject,
      template,
      excelData,
      photos: photosToExport,
      maskSrc,
      applyMask
    };
    
    const dataStr = JSON.stringify(projectData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${currentProject.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.idcard`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success("Project exported successfully");
  };
  
  const importProject = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      const importedData = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(JSON.parse(e.target.result));
        reader.onerror = () => reject(new Error("Error reading file"));
        reader.readAsText(file);
      });
  
      // Validate and normalize the imported project
      const importedProject = {
        ...importedData,
        id: importedData.id || uuidv4(),
        name: importedData.name || "Imported Project",
        template: importedData.template || structuredClone(DEFAULT_PROJECT.template),
        excelData: importedData.excelData || { headers: [], rows: [] },
        photos: importedData.photos || {},
        maskSrc: importedData.maskSrc || null,
        applyMask: importedData.applyMask || false,
        updatedAt: new Date().toISOString()
      };
  
      // Process all image references
      const processedPhotos = { ...importedProject.photos };
      ['front', 'back'].forEach(side => {
        importedProject.template[side]?.elements?.forEach(element => {
          if (element.type === "image") {
            if (element.isCustomImage) {
              if (!processedPhotos[element.content]) {
                processedPhotos[element.content] = "/placeholder.svg";
              }
            } else if (element.heading && importedProject.excelData?.rows) {
              importedProject.excelData.rows.forEach(row => {
                const imageKey = row[element.heading];
                if (imageKey && !processedPhotos[imageKey]) {
                  processedPhotos[imageKey] = "/placeholder.svg"; // Prevents breakage
                }
              });
            }
          }
        });
      });
      importedProject.photos = processedPhotos;
  
      // Handle project ID conflicts
      const existingIndex = projects.findIndex(p => p.id === importedProject.id);
      const updatedProjects = [...projects];
      
      if (existingIndex >= 0) {
        if (!window.confirm(`Project "${importedProject.name}" already exists. Overwrite?`)) {
          return;
        }
        updatedProjects[existingIndex] = importedProject;
      } else {
        updatedProjects.push(importedProject);
      }
  
      // Update state and storage
      setProjects(updatedProjects);
      saveProjectsToStorage(updatedProjects);
      loadProject(importedProject.id);
      
      toast.success(`Project "${importedProject.name}" imported successfully`);
    } catch (error) {
      console.error("Import failed:", error);
      toast.error(`Import failed: ${error.message}`);
    } finally {
      event.target.value = '';
    }
  };
  
  const getBackgroundImage = (side) => {
    const sideData = template[side];
    if (!sideData) return "none";
  
    // Dynamic background logic
    if (sideData.backgroundMode === 'dynamic' && 
        sideData.backgroundColumn && 
        sideData.backgroundGroups?.length > 0) {
      
      const currentValue = excelData.rows[currentRecordIndex]?.[sideData.backgroundColumn]?.toString().trim();
      
      // 1. First check for exact matches (excluding special markers)
      const matchedGroup = sideData.backgroundGroups.find(group => 
        group.values.includes(currentValue) && 
        !['__ALL__', '__BLANK__'].includes(currentValue)
      );
  
      // 2. If matched group has image, use it
      if (matchedGroup?.image) {
        return `url(${matchedGroup.image})`;
      }
  
      // 3. Check for blank/empty values
      if (!currentValue || currentValue === '') {
        const blankGroup = sideData.backgroundGroups.find(group => 
          group.values.includes('__BLANK__')
        );
        if (blankGroup?.image) {
          return `url(${blankGroup.image})`;
        }
      }
  
      // 4. Check for "all values" group
      const allGroup = sideData.backgroundGroups.find(group => 
        group.values.includes('__ALL__')
      );
      if (allGroup?.image) {
        return `url(${allGroup.image})`;
      }
  
      // 5. Fallback to first group with image
      const firstGroupWithImage = sideData.backgroundGroups.find(group => group.image);
      if (firstGroupWithImage) {
        return `url(${firstGroupWithImage.image})`;
      }
    }
  
    // Static fallback
    if (sideData.background) {
      return `url(${sideData.background})`;
    }
  
    return "none";
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
  
    const handleWheelZoom = (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = -e.deltaY * 0.001;
        setZoomLevel((prev) => Math.min(Math.max(prev + delta, 0.25), 2));
      }
    };
  
    container.addEventListener("wheel", handleWheelZoom, { passive: false });
    return () => container.removeEventListener("wheel", handleWheelZoom);
  }, []);
  
  const handlePanStart = (e) => {
    if (e.ctrlKey && e.button === 0) {
      console.log("🖱️ Pan Start");
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      setScrollStart({
        x: e.currentTarget.scrollLeft,
        y: e.currentTarget.scrollTop,
      });
    }
  };
  
  const handlePanMove = (e) => {
    if (isPanning) {
      console.log("➡️ Panning...");
      const deltaX = e.clientX - panStart.x;
      const deltaY = e.clientY - panStart.y;
      e.currentTarget.scrollLeft = scrollStart.x - deltaX;
      e.currentTarget.scrollTop = scrollStart.y - deltaY;
    }
  };
  
  const handlePanEnd = () => {
    console.log("✅ Pan End");
    setIsPanning(false);
  };
  
  
  const handleMouseDown = (e) => {
    if (e.target !== containerRef.current) return; // avoid dragging on an element

    const rect = containerRef.current.getBoundingClientRect();
    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;

    setSelectionBox({ x: startX, y: startY, width: 0, height: 0 });
    setIsDraggingSelection(true);
  };

// In card-editor.jsx, update the handleMouseMove function
const handleMouseMove = (e) => {
  if (!isDraggingSelection || !selectionBox || !containerRef.current) return;

  const rect = containerRef.current.getBoundingClientRect();
  const currentX = (e.clientX - rect.left) / zoomLevel;
  const currentY = (e.clientY - rect.top) / zoomLevel;

  // Calculate the selection box with rotation in mind
  const newBox = {
    x: Math.max(0, Math.min(selectionBox.x, currentX)),
    y: Math.max(0, Math.min(selectionBox.y, currentY)),
    width: Math.min(Math.abs(currentX - selectionBox.x), rect.width / zoomLevel),
    height: Math.min(Math.abs(currentY - selectionBox.y), rect.height / zoomLevel),
  };

  setSelectionBox(newBox);
};

  const handleMouseUp = () => {
    if (!isDraggingSelection || !selectionBox) return;
  
    // Check overlapping elements with zoom consideration
    const selected = template[currentSide].elements.filter((el) => {
      const elX = el.position.x;
      const elY = el.position.y;
      const elW = el.size.width;
      const elH = el.size.height;
  
      return (
        elX < selectionBox.x + selectionBox.width &&
        elX + elW > selectionBox.x &&
        elY < selectionBox.y + selectionBox.height &&
        elY + elH > selectionBox.y
      );
    });
  
    setSelectedElements(selected);
    setSelectionBox(null);
    setIsDraggingSelection(false);
  };

  const handleMaskApply = (maskedImage, photoKey) => {
    console.log(`Applying mask for: ${photoKey}`);

    setPhotos((prevPhotos) => {
      const updatedPhotos = { ...prevPhotos };

      // Apply the masked image only to the selected image
      updatedPhotos[photoKey] = maskedImage;

      // Remove the original image if it's not a custom image
      if (!photoKey.startsWith('custom_image_')) {
        delete updatedPhotos[`original_${photoKey}`];
      }

      console.log("✅ Stored Masked Image for Selected Record:", updatedPhotos);
      onPhotosChange(updatedPhotos);
      return updatedPhotos;
    });
  };

  const mmToPx = (mm) => {
    return Math.round((mm / 25.4) * dpi)
  }

  const handleFrontUpload = (backgroundData) => {
    const newTemplate = {
      ...template,
      front: {
        ...template.front,
        backgroundMode: backgroundData.type,
        background: backgroundData.type === 'static' ? backgroundData.image : template.front.background,
        backgroundColumn: backgroundData.type === 'dynamic' ? backgroundData.column : '',
        backgroundGroups: backgroundData.type === 'dynamic' ? backgroundData.groups : []
      }
    };
    setTemplate(newTemplate);
    onTemplateChange(newTemplate);
  };
  
  const handleBackUpload = (backgroundData) => {
    const newTemplate = {
      ...template,
      back: {
        ...template.back,
        backgroundMode: backgroundData.type,
        background: backgroundData.type === 'static' ? backgroundData.image : template.back.background,
        backgroundColumn: backgroundData.type === 'dynamic' ? backgroundData.column : '',
        backgroundGroups: backgroundData.type === 'dynamic' ? backgroundData.groups : []
      }
    };
    setTemplate(newTemplate);
    onTemplateChange(newTemplate);
  };

  const handleCardSizeChange = (widthMm, heightMm) => {
    const widthInPixels = mmToPx(widthMm)
    const heightInPixels = mmToPx(heightMm)
    const scaleFactorX = widthInPixels / (cardWidth * dpi)
    const scaleFactorY = heightInPixels / (cardHeight * dpi)

    setCardWidth(widthInPixels / dpi)
    setCardHeight(heightInPixels / dpi)

    setTemplate((prevTemplate) => {
      const updatedTemplate = {
        ...prevTemplate,
        size: { width: widthInPixels / dpi, height: heightInPixels / dpi },
        front: {
          ...prevTemplate.front,
          elements: prevTemplate.front.elements.map((el) => ({
            ...el,
            position: {
              x: el.position.x * scaleFactorX,
              y: el.position.y * scaleFactorY,
            },
            size: {
              width: el.size.width * scaleFactorX,
              height: el.size.height * scaleFactorY,
            },
          })),
        },
        back: {
          ...prevTemplate.back,
          elements: prevTemplate.back.elements.map((el) => ({
            ...el,
            position: {
              x: el.position.x * scaleFactorX,
              y: el.position.y * scaleFactorY,
            },
            size: {
              width: el.size.width * scaleFactorX,
              height: el.size.height * scaleFactorY,
            },
          })),
        },
      };
    
      recordChange(updatedTemplate); // ✅ Track this for undo-redo
      return updatedTemplate;
    });
    
    onTemplateChange({
      ...template,
      size: { width: widthInPixels / dpi, height: heightInPixels / dpi },
    });
  }    

  const handleExcelUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const data = new Uint8Array(event.target?.result)
      const workbook = read(data, { type: "array" })
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = utils.sheet_to_json(firstSheet, { header: 1 })

      const headers = jsonData[0]
      const rows = jsonData.slice(1).map((row) => {
        const rowData = {}
        headers.forEach((header, index) => {
          rowData[header] = row[index]
        })
        return rowData
      })

      const newExcelData = {
        headers,
        rows,
      }
      setExcelData(newExcelData)
      onExcelDataChange(newExcelData)
    }
    reader.readAsArrayBuffer(file)
  }

  const handlePhotoUpload = (e) => {
    const files = e.target.files;
    if (!files) return;
  
    const newPhotos = { ...photos };
    let loadedCount = 0;
  
    const loadImage = (file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === "string") {
          const name = file.name.split(".")[0]; // Key used for storing the photo
          newPhotos[name] = event.target.result; // Saving the photo
          loadedCount++;
  
          if (loadedCount === files.length) {
            setPhotos(newPhotos);
            onPhotosChange(newPhotos, galleryRotations); // ✅ Pass galleryRotations as 2nd argument
            console.log("✅ Updated Photos:", newPhotos, "🌀 Rotations:", galleryRotations);
          }
        }
      };
      reader.readAsDataURL(file);
    };
  
    for (let i = 0; i < files.length; i++) {
      loadImage(files[i]);
    }
  };

  const addElement = (type) => {
    let content = selectedHeader;
    const heading = selectedHeader;
    let isCustomImage = false;
    let isStatic = false;
  
    // Handle different element types
    if (selectedHeader && excelData.headers.includes(selectedHeader)) {
      content = excelData.rows[currentRecordIndex]?.[selectedHeader] || selectedHeader;
    } else if (type === "text") {
      content = "Custom Text";
    } else if (type === "image") {
      // Special case for custom images
      if (selectedHeader === "custom") {
        content = `custom_image_${Date.now()}`;
        isCustomImage = true;
        isStatic = true; // Custom images shouldn't change with Excel data
      } else {
        content = selectedHeader;
      }
    } else if (type === "qrcode") {
      content = selectedHeader || "QR Code Content";
    } else if (type === "barcode") {
      content = selectedHeader || "123456789012";
    }
  
    // Base element configuration
    const newElement = {
      id: Math.random().toString(),
      type,
      content,
      heading,
      position: { x: 50, y: 50 },
      size: {
        width: type === "text" ? 100 : 100,
        height: type === "text" ? 20 : 100,
      },
      style: { 
        fontSize: 16, 
        fontFamily: "Arial", 
        color: "#000000",
        // Add default stroke style for images
        ...(type === "image" ? {
          strokeWidth: 2,
          strokeColor: "#ffffff",
          shadowBlur: 0,
          shadowOffsetX: 0,
          shadowOffsetY: 0,
          shadowColor: "rgba(0,0,0,0.5)"
        } : {})
      },
      rotation: 0,
      isCustomImage,  // Flag to identify custom images
      isStatic,       // Flag to prevent Excel data updates
      // QR/barcode specific configuration
      ...(type === "qrcode" || type === "barcode" ? {
        qrConfig: {
          format: type === "qrcode" ? "qrcode" : "code128",
          selectedFields: selectedHeader ? [selectedHeader] : [],
          customText: "",
          // Default QR code styling
          color: "#000000",
          backgroundColor: "#ffffff",
          margin: 1,
          size: 200
        }
      } : {})
    };
  
    // For custom images, add a placeholder to the photos object
    if (type === "image" && isCustomImage) {
      const updatedPhotos = {
        ...photos,
        [content]: "/placeholder.svg" // Default placeholder for custom images
      };
      setPhotos(updatedPhotos);
      onPhotosChange(updatedPhotos);
    }
  
    // Update the template with the new element
    const newTemplate = {
      ...template,
      [currentSide]: {
        ...template[currentSide],
        elements: [...template[currentSide].elements, newElement],
      },
    };
  
    // Track the added element
    setTemplate(newTemplate);
    onTemplateChange(newTemplate);
  
    // Return the new element for potential chaining
    return newElement;
  };
    
    const updateElement = (updatedElements) => {
      if (!containerRef.current) return;
    
      const rect = containerRef.current.getBoundingClientRect();
    
      // ✅ Correct for zoom by dividing the rendered width/height by zoomLevel
      const scaleFactorX = (dpi * cardWidth) / (rect.width / zoomLevel);
      const scaleFactorY = (dpi * cardHeight) / (rect.height / zoomLevel);
    
      const isArray = Array.isArray(updatedElements) ? updatedElements : [updatedElements];
    
      const newTemplate = {
        ...template,
        [currentSide]: {
          ...template[currentSide],
          elements: template[currentSide].elements.map((el) => {
            const updated = isArray.find((uEl) => uEl.id === el.id);
            if (updated) {
              return {
                ...updated,
                position: {
                  x: updated.position?.x * scaleFactorX ?? el.position.x,
                  y: updated.position?.y * scaleFactorY ?? el.position.y,
                },
                size: {
                  width: updated.size?.width * scaleFactorX ?? el.size.width,
                  height: updated.size?.height * scaleFactorY ?? el.size.height,
                },
                rotation: updated.rotation ?? el.rotation,
                style: {
                  ...el.style,
                  ...updated.style,
                  alignment: updated.style?.alignment ?? el.style?.alignment ?? "left",
                  verticalAlignment: updated.style?.verticalAlignment ?? el.style?.verticalAlignment ?? "top",
                },
              };
            }
            return el;
          }),
        },
      };
    
       // ✅ Track updates
      setTemplate(newTemplate);
      onTemplateChange(newTemplate);
    };
    
    const deleteElements = () => {
      const newTemplate = {
        ...template,
        [currentSide]: {
          ...template[currentSide],
          elements: template[currentSide].elements.filter(
            (el) => !selectedElements.some((selectedEl) => selectedEl.id === el.id)
          ),
        },
      };
    
       // ✅ Track delete
      setTemplate(newTemplate);
      onTemplateChange(newTemplate);
      setSelectedElements([]); // Clear selection after deletion
    };
    
    const navigateRecord = (direction) => {
      if (direction === "prev" && currentRecordIndex > 0) {
        setCurrentRecordIndex((prevIndex) => prevIndex - 1);
      } else if (direction === "next" && currentRecordIndex < excelData.rows.length - 1) {
        setCurrentRecordIndex((prevIndex) => prevIndex + 1);
      }
    
      // Check if last record is reached
      if (currentRecordIndex === excelData.rows.length - 1) {
        setApplyMask(true);
      }
    };
    
const updateElementContent = (element) => {
  // Skip updating static elements (like headings)
  if (element.isStatic || element.isCustomImage) {
    return element;
  }

  // Only update dynamic elements (those linked to excelData headers)
  if (excelData.headers.includes(element.heading)) {

    let newContent = excelData.rows[currentRecordIndex]?.[element.heading] ?? element.heading;

    // 🔥 FIX: Safely convert to string
    if (newContent == null) newContent = ""; 
    if (typeof newContent !== "string") newContent = String(newContent);

    console.log("Updating element content:", element.heading, "->", newContent);

    if (
      element.type === "text" ||
      element.type === "qrcode" ||
      element.type === "barcode" ||
      (element.type === "image" && newContent !== element.content)
    ) {
      // Handle empty or invalid content for images
      if (element.type === "image" && newContent.trim() === "") {
        console.warn("New content for image is invalid, using placeholder.");
        return {
          ...element,
          content: "/placeholder.svg",
        };
      }

      return {
        ...element,
        content: newContent,
      };
    }
  }

  return element;
};

    
    // useEffect to update the elements
    useEffect(() => {
      // Only update the template if currentRecordIndex or excelData changes
      if (excelData?.rows && excelData.rows.length > 0) {
        setTemplate((prevTemplate) => {
          const updatedTemplate = {
            ...prevTemplate,
            front: {
              ...prevTemplate.front,
              elements: prevTemplate.front.elements.map(updateElementContent),
            },
            back: {
              ...prevTemplate.back,
              elements: prevTemplate.back.elements.map(updateElementContent),
            },
          };
    
          recordChange(updatedTemplate); // ✅ Track Excel data change
          return updatedTemplate;
        });
      }
    }, [currentRecordIndex, excelData?.headers, excelData?.rows]); // Dependency array updated for specific changes
    
    const lastRecordedTemplate = useRef(template);

    useEffect(() => {
      if (skipHistoryRef.current) {
        skipHistoryRef.current = false;
        return;
      }
    
      if (JSON.stringify(template) === JSON.stringify(lastRecordedTemplate.current)) return;
    
      const debounceTimeout = setTimeout(() => {
        if (JSON.stringify(template) !== JSON.stringify(lastRecordedTemplate.current)) {
          recordChange(template);
          lastRecordedTemplate.current = template;
        }
      }, 400);
    
      return () => clearTimeout(debounceTimeout);
    }, [template]);
    
    
    const handlePhotoDelete = (photoName) => {
      setPhotos(prev => {
        const updated = { ...prev };
        delete updated[photoName];
        return updated;
      });
      
      setRotations(prev => ({
        ...prev,
        gallery: {
          ...prev.gallery,
          [photoName]: undefined
        }
      }));
      
      if (selectedPhoto?.name === photoName) {
        setSelectedPhoto(null);
      }
    };

    // Add to card-editor.jsx state
const [showMaskGallery, setShowMaskGallery] = useState(false);
const [selectedMask, setSelectedMask] = useState(null);
const [masks, setMasks] = useState([]); // Store all uploaded masks

// Add this function to handle mask upload
const handleMaskUpload = (e) => {
  const files = e.target.files;
  if (!files) return;

  const newMasks = [...masks];
  let loadedCount = 0;

  const loadMask = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target && typeof event.target.result === "string") {
        const name = file.name.split(".")[0]; // Key used for storing the mask
        newMasks.push({
          name,
          url: event.target.result
        });
        loadedCount++;

        if (loadedCount === files.length) {
          setMasks(newMasks);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  for (let i = 0; i < files.length; i++) {
    loadMask(files[i]);
  }
};

// Add this function to apply a selected mask
const applySelectedMask = (maskUrl) => {
  setMaskSrc(maskUrl);
  setShowMaskGallery(false);
};

return (

      <div className="space-y-3 px-3 py-2 bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-sm">
        {/* Project Management Toolbar */}
        <div className="bg-white rounded-xl shadow-md px-5 py-4 flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center border border-gray-200">
          <div className="flex flex-wrap gap-3 items-center">
            <Button onClick={() => setIsNewProjectModalOpen(true)} size="sm" className="gap-1">
              <Plus className="w-4 h-4" />
              New Project
            </Button>
    
            <div className="relative">
              <select
                value={currentProject?.id || ""}
                onChange={(e) => loadProject(e.target.value)}
                className="pl-3 pr-8 py-2 text-sm border border-black-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name} ({new Date(project.updatedAt).toLocaleDateString()})
                  </option>
                ))}
              </select>
              {currentProject && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <FolderOpen className="w-4 h-4 text-gray-400" />
                </div>
              )}
            </div>
    
            {currentProject && (
              <>
                <Button
                  onClick={() => {
                    setRenameProjectId(currentProject.id);
                    setRenameProjectName(currentProject.name);
                    setIsRenameModalOpen(true);
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  Rename
                </Button>
    
                <Button
                  onClick={() => deleteProject(currentProject.id)}
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </>
            )}
          </div>
    
          <div className="flex flex-wrap gap-2 items-center">
            {lastSaved && (
              <span className="text-xs text-gray-500">
                Last saved: {new Date(lastSaved).toLocaleString()}
              </span>
            )}
    
            <Button onClick={saveProject} disabled={!currentProject} size="sm" className="gap-1">
              <Save className="w-4 h-4" />
              Save
            </Button>
    
            <Button onClick={exportProject} disabled={!currentProject} variant="outline" size="sm" className="gap-1">
              <HardDriveDownload className="w-4 h-4" />
              Export
            </Button>
    
            <Button variant="outline" size="sm" className="gap-1" onClick={() => fileInputRef.current?.click()}>
              <HardDriveUpload className="w-4 h-4" />
              Import
            </Button>
    
            <input
              ref={fileInputRef}
              type="file"
              accept=".idcard,application/json"
              onChange={importProject}
              className="hidden"
            />
          </div>
        </div>

 {/* New Project Modal */}
 
      {isNewProjectModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Create New Project</h3>
              <button 
                onClick={() => {
                  setIsNewProjectModalOpen(false);
                  setNewProjectName("");
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="project-name" className="block mb-1">
                  Project Name
                </Label>
                <Input
                  id="project-name"
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Enter project name"
                  className="w-full"
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsNewProjectModalOpen(false);
                    setNewProjectName("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={createNewProject}
                  disabled={!newProjectName.trim()}
                >
                  Create Project
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Rename Project Modal */}
      {isRenameModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Rename Project</h3>
              <button 
                onClick={() => {
                  setIsRenameModalOpen(false);
                  setRenameProjectName("");
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="rename-project" className="block mb-1">
                  New Project Name
                </Label>
                <Input
                  id="rename-project"
                  type="text"
                  value={renameProjectName}
                  onChange={(e) => setRenameProjectName(e.target.value)}
                  placeholder="Enter new project name"
                  className="w-full"
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsRenameModalOpen(false);
                    setRenameProjectName("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => renameProject(renameProjectId, renameProjectName)}
                  disabled={!renameProjectName.trim()}
                >
                  Rename Project
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Current Project Info */}
      {currentProject && (
        <div className="bg-white p-3 rounded-lg shadow-sm mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold">{currentProject.name}</h3>
              <p className="text-sm text-gray-500">
                Created: {new Date(currentProject.createdAt).toLocaleString()} | 
                Last Modified: {new Date(currentProject.updatedAt).toLocaleString()}
              </p>
            </div>
            <div className="text-sm">
              <span className="font-medium">Elements:</span> {template[currentSide].elements.length} | 
              <span className="font-medium ml-2">Records:</span> {excelData.rows.length}
            </div>
          </div>
        </div>
      )}

{/* Upload Section - Compact Grid with Enhanced UX */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  {/* Excel Data Upload */}
  <div className="space-y-1">
    <div className="flex items-center justify-between">
      <Label className="text-sm font-medium flex items-center gap-1">
        <FileText className="w-4 h-4 text-blue-600" /> Excel Data
      </Label>
      {excelData?.rows?.length > 0 && (
        <span className="text-xs text-muted-foreground">
          {excelData.rows.length} records
        </span>
      )}
    </div>
    <div className="flex items-center gap-2">
      <Input
        type="file"
        accept=".xlsx,.xls"
        onChange={handleExcelUpload}
        className="h-9 flex-1 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        id="excel-upload"
      />
      <Button
        variant="outline"
        onClick={() => setShowExcelEditor(true)}
        disabled={!excelData?.rows?.length}
        className="h-9 px-2.5"
        title="Edit Excel data"
      >
        <Edit2 className="w-4 h-4" />
      </Button>
    </div>
  </div>

  {/* Photo Upload */}
  <div className="space-y-1">
    <div className="flex items-center justify-between">
      <Label className="text-sm font-medium flex items-center gap-1">
        <ImageIcon className="w-4 h-4 text-purple-600" /> Card Photos
      </Label>
      {Object.keys(photos).length > 0 && (
        <span className="text-xs text-muted-foreground">
          {Object.keys(photos).length} photos
        </span>
      )}
    </div>
    <div className="flex items-center gap-2">
      <Input
        type="file"
        accept="image/*"
        multiple
        onChange={handlePhotoUpload}
        className="h-9 flex-1 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
        id="photo-upload"
      />
      <Button
        variant="outline"
        onClick={() => setShowGalleryModal(true)}
        disabled={Object.keys(photos).length === 0}
        className="h-9 px-2.5"
        title="View photo gallery"
      >
        <Grid className="w-4 h-4" />
      </Button>
    </div>
  </div>

  {/* Mask Upload */}
  <div className="space-y-1">
    <div className="flex items-center justify-between">
      <Label className="text-sm font-medium flex items-center gap-1">
        <Layers className="w-4 h-4 text-green-600" /> Card Masks
      </Label>
      {masks.length > 0 && (
        <span className="text-xs text-muted-foreground">
          {masks.length} masks
        </span>
      )}
    </div>
    <div className="flex items-center gap-2">
      <Input
        type="file"
        accept="image/png"
        multiple
        onChange={handleMaskUpload}
        className="h-9 flex-1 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
        id="mask-upload"
      />
      <Button
        variant="outline"
        onClick={() => setShowMaskGallery(true)}
        disabled={masks.length === 0}
        className="h-9 px-2.5"
        title="View mask gallery"
      >
        <Grid className="w-4 h-4" />
      </Button>
    </div>
  </div>
</div>

{/* Excel Editor Modal */}
{showExcelEditor && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
    <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Excel Data Editor</h2>
        <Button
          variant="ghost"
          onClick={() => setShowExcelEditor(false)}
          className="text-gray-500 hover:text-gray-900"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>
      <div className="flex-1 overflow-auto">
<ExcelEditor
  excelData={excelData}
  onSave={(newData) => {
    setExcelData(newData);

    // ✅ Update all data elements based on the current record
    const updatedElements = template[currentSide].elements.map(el => {
      if (el.heading && !el.isStatic) {
        const updatedValue = newData.rows[currentRecordIndex]?.[el.heading];
        if (updatedValue !== undefined) {
          return { ...el, content: updatedValue };
        }
      }
      return el;
    });

    // ✅ Apply update
    setTemplate(prev => ({
      ...prev,
      [currentSide]: {
        ...prev[currentSide],
        elements: updatedElements
      }
    }));
  }}
/>

      </div>
      <div className="p-4 border-t flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => setShowExcelEditor(false)}
        >
          Cancel
        </Button>
        <Button
          onClick={() => {
            // Handle save through ExcelEditor's internal logic
            const editor = document.querySelector('#excel-editor');
            if (editor) editor.dispatchEvent(new Event('save'));
          }}
        >
          Save Changes
        </Button>
      </div>
    </div>
  </div>
)}

{/* Mask Gallery Modal */}
{showMaskGallery && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
    <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-green-600" />
          <h2 className="text-lg font-semibold">Mask Gallery</h2>
          <span className="text-xs text-muted-foreground ml-1">
            ({masks.length} masks)
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowMaskGallery(false)}
          className="text-gray-500 hover:text-gray-900"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {selectedMask ? (
          <div className="flex flex-col h-full">
            {/* Preview Pane */}
            <div className="flex-1 p-4 bg-gray-50 flex items-center justify-center">
              <div className="relative w-full max-w-md aspect-square bg-white shadow-sm rounded-lg overflow-hidden border">
                {photos[Object.keys(photos)[0]] ? (
                  <>
                    <PhotoMask
                      src={photos[Object.keys(photos)[0]]}
                      maskSrc={selectedMask.url}
                      className="absolute inset-0 w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 border-2 border-green-400/50 pointer-events-none" />
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-400">
                    <ImageIcon className="w-8 h-8" />
                    <p className="text-sm">No photo available for preview</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Action Bar */}
            <div className="p-3 border-t bg-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium px-2 py-1 bg-gray-100 rounded">
                  {selectedMask.name}
                </span>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedMask(null)}
                >
                  Back
                </Button>
                <Button
                  size="sm"
                  onClick={() => applySelectedMask(selectedMask.url)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Apply Mask
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-3 overflow-auto">
            {masks.map((mask) => (
              <div
                key={mask.name}
                className="group relative cursor-pointer"
                onClick={() => setSelectedMask(mask)}
              >
                <div className="aspect-square bg-gray-50 rounded-md overflow-hidden border relative">
                  {photos[Object.keys(photos)[0]] ? (
                    <PhotoMask
                      src={photos[Object.keys(photos)[0]]}
                      maskSrc={mask.url}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}
                  <div className="absolute inset-0 group-hover:bg-black/10 transition-colors" />
                </div>
                <div className="mt-1 px-1">
                  <p className="text-xs font-medium truncate">{mask.name}</p>
                </div>
                <Button
                  variant="ghost"
                  size="iconSm"
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMasks(masks.filter(m => m.name !== mask.name));
                  }}
                >
                  <Trash2 className="w-3 h-3 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
)}

      {/* Background Upload Component */}
      <BackgroundUpload
        onUpload={(backgroundData) => {
          const updatedTemplate = {
            ...template,
            [currentSide]: {
              ...template[currentSide],
              backgroundMode: 'dynamic',
              backgroundColumn: backgroundData.column,
              backgroundGroups: backgroundData.groups
            }
          };

          if (currentSide === 'front') {
            updatedTemplate.back = {
              ...updatedTemplate.back,
              backgroundMode: 'dynamic',
              backgroundColumn: backgroundData.column,
              backgroundGroups: backgroundData.groups.map(group => ({
                ...group,
                name: group.name.replace('Front:', 'Back:'),
                image: null
              }))
            };
          }

          setTemplate(updatedTemplate);
          onTemplateChange(updatedTemplate);
        }}
        onSizeChange={handleCardSizeChange}
        excelData={excelData}
        backgroundConfig={template[currentSide]}
        sideLabel={currentSide === 'front' ? 'Front' : 'Back'}
        currentSide={currentSide}
        template={template}
      />

      {/* Control Bar - Top Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-3 rounded-lg shadow-sm">
        {/* Side Toggle */}
        <div className="flex gap-2">
          <Button 
            variant={currentSide === "front" ? "default" : "outline"} 
            size="sm"
            onClick={() => setCurrentSide("front")}
          >
            Front Side
          </Button>
          <Button 
            variant={currentSide === "back" ? "default" : "outline"} 
            size="sm"
            onClick={() => setCurrentSide("back")}
            disabled={!template.front.backgroundGroups?.length} // Disable if no front groups
          >
            Back Side
          </Button>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => navigateRecord("prev")} 
            disabled={currentRecordIndex === 0}
            size="sm"
            variant="outline"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="1"
              max={excelData.rows.length}
              value={currentRecordIndex + 1}
              onChange={(e) => {
                let newIndex = parseInt(e.target.value, 10) - 1;
                if (!isNaN(newIndex) && newIndex >= 0 && newIndex < excelData.rows.length) {
                  setCurrentRecordIndex(newIndex);
                }
              }}
              className="w-16 h-8 border rounded text-center text-sm"
            />
            <span className="text-sm text-muted-foreground">/ {excelData.rows.length}</span>
          </div>
          
          <Button 
            onClick={() => navigateRecord("next")} 
            disabled={currentRecordIndex === excelData.rows.length - 1}
            size="sm"
            variant="outline"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label htmlFor="zoom" className="text-sm text-muted-foreground">Zoom</label>
            <input
              id="zoom"
              type="range"
              min="0.25"
              max="2"
              step="0.05"
              value={zoomLevel}
              onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
              className="w-24"
            />
            <span className="text-sm w-10">{Math.round(zoomLevel * 100)}%</span></div>
          <div className="flex gap-1">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setZoomLevel((z) => Math.max(z - 0.1, 0.25))}
            >
              -
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setZoomLevel(1)}
            >
              Reset
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setZoomLevel((z) => Math.min(z + 0.1, 2))}
            >
              +
            </Button>
          </div>
        </div>
        {useKeyboardShortcuts.ShortcutHelpPanel && (
  <div className="mt-2">
    <useKeyboardShortcuts.ShortcutHelpPanel />
  </div>
)}
{/* Replace the current mask toggle with this */}
<div className="flex items-center space-x-2">
  <input 
    type="checkbox" 
    id="apply-mask" 
    checked={applyMask} 
    onChange={(e) => setApplyMask(e.target.checked)} 
    className="h-4 w-4"
  />
  <label htmlFor="apply-mask" className="text-sm">
    Apply Mask {maskSrc && `(${masks.find(m => m.url === maskSrc)?.name || 'Custom'})`}
  </label>
</div>
      </div>

      {/* Add Elements Horizontal Card */}
      <div className="bg-white p-4 rounded-lg shadow-sm flex flex-wrap items-center gap-2 mb-4">
        <Label className="text-sm font-medium whitespace-nowrap mr-2">Add Element:</Label>
        <select
          value={selectedHeader}
          onChange={(e) => setSelectedHeader(e.target.value)}
          className="p-2 border rounded text-sm h-9"
        >
          <option value="custom">Custom</option>
          {excelData?.headers?.length > 0 ? (
            excelData.headers.map((header) => (
              <option key={header} value={header}>{header}</option>
            ))
          ) : (
            <option disabled>No headers available</option>
          )}
        </select>

        <Button onClick={() => addElement("text")} size="sm" className="gap-1">
          <Type className="w-3.5 h-3.5" />
          Text
        </Button>
        <Button onClick={() => addElement("image")} size="sm" className="gap-1">
          <ImageIcon className="w-3.5 h-3.5" />
          Image
        </Button>
        <Button onClick={() => addElement("qrcode")} size="sm" className="gap-1">
          <QrCode className="w-3.5 h-3.5" />
          QR Code
        </Button>
        <Button onClick={() => addElement("barcode")} size="sm" className="gap-1">
          <Barcode className="w-3.5 h-3.5" />
          Barcode
        </Button>
      </div>

      {/* Main Workspace */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left Sidebar - Only Delete + Settings now */}
        <div className="w-full lg:w-64 space-y-4">
          {selectedElements.length > 0 && (
            <div className="space-y-3 bg-white p-4 rounded-lg shadow-sm">
              <Button 
                onClick={deleteElements} 
                size="sm" 
                variant="destructive"
                className="gap-1 w-full"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Selected
              </Button>


              <ElementSettings
                elements={selectedElements}
                onUpdate={updateElement}
                excelHeaders={excelData.headers}
                excelData={excelData}
                currentRecordIndex={currentRecordIndex}
              />
            </div>
          )}
        </div>

        {/* Canvas Area */}
        <div className="flex-1">
        <div
      ref={panWrapperRef}
      className="overflow-auto p-4 bg-teal rounded-lg border shadow-sm"
      onMouseDown={handlePanStart}
      onMouseMove={handlePanMove}
      onMouseUp={handlePanEnd}
      onMouseLeave={handlePanEnd}
      style={{ 
        cursor: isPanning ? "grabbing" : "grab",
        backgroundImage: `
          linear-gradient(45deg, rgba(0,0,0,0.1) 25%, transparent 25%),
          linear-gradient(-45deg, rgba(0,0,0,0.1) 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, rgba(0,0,0,0.1) 75%),
          linear-gradient(-45deg, transparent 75%, rgba(0,0,0,0.1) 75%)
        `,
        backgroundSize: "20px 20px",
        backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px"
      }}
    >
            <div 
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'center center',
                width: `${mmToPx(cardWidth * 25.4)}px`,
                height: `${mmToPx(cardHeight * 25.4)}px`,
                margin: '0 auto'
              }}
            >
              <Card
                ref={containerRef}
                className="relative overflow-hidden shadow-lg"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundImage: getBackgroundImage(currentSide),
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  backgroundColor: template[currentSide].backgroundMode === 'static' && template[currentSide].background 
                    ? "transparent" 
                    : "#fff",
                }}
              >
                {selectionBox && (
                  <div
                    className="absolute border-2 border-blue-500 bg-blue-100 bg-opacity-30 z-50 pointer-events-none"
                    style={{
                      left: `${selectionBox.x}px`,
                      top: `${selectionBox.y}px`,
                      width: `${selectionBox.width}px`,
                      height: `${selectionBox.height}px`,
                    }}
                  />
                )}

                {template[currentSide].elements.map((element) => (
                  <ResizableElement
                    rotations={rotations}
                    key={element.id}
                    element={element}
                    
                    onUpdate={updateElement}
                    containerRef={containerRef}
                    zoomLevel={zoomLevel}
                    onSelect={(event) => {
                      if (!event?.stopPropagation) return;
                      event.stopPropagation();

                      if (event.ctrlKey || event.metaKey) {
                        setSelectedElements((prev) =>
                          prev.some((el) => el.id === element.id)
                            ? prev.filter((el) => el.id !== element.id)
                            : [...prev, element]
                        );
                      } else {
                        setSelectedElements([element]);
                      }
                    }}
                    isSelected={selectedElements.some((el) => el.id === element.id)}
                    photos={photos}
                    applyMask={applyMask}
                    maskSrc={maskSrc}
                    onPhotosChange={setPhotos}
                    excelHeaders={excelData.headers}
                   currentRecord={excelData.rows[currentRecordIndex]} // ✅ Important
                    selectedElements={selectedElements}
                    setSelectedElements={setSelectedElements}
                    galleryRotation={element.type === "image" ? galleryRotations[element.content] || 0 : 0}
                    photoInstanceRotations={photoInstanceRotations}
        
                  >
                    {element.type === "image" ? (
                      <PhotoMask
                        src={photos[element.content] || "/placeholder.svg"}
                        maskSrc={maskSrc}
                        onMaskApply={handleMaskApply}
                        rotation={rotations[element.content] || 0} // Update this line
                        galleryRotation={element.type === "image" ? galleryRotations[element.content] || 0 : 0}
                        photoInstanceRotations={photoInstanceRotations}
                        
              
                      />
                    ) : null}
                  </ResizableElement>
                ))}
              </Card>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Template Controls */}
        <div className="w-full lg:w-64">
          <AutoContainerGenerator
            onTemplateChange={onTemplateChange}
            excelData={excelData}
            currentSide={currentSide}
            setTemplate={setTemplate}
          />
        </div>
      </div>

      {/* Batch Generator */}
      <div className="mt-4">

      <CardGenerator
  template={template}
  excelData={excelData}
  photos={photos}
  applyMask={applyMask}
  maskSrc={maskSrc}
  projects={projects}
  currentProject={currentProject}
  rotations={rotations} // Pass rotations
  photoInstanceRotations={photoInstanceRotations} // Pass instance rotations
/>
      </div>
{/* Photo Gallery Modal */}
{showGalleryModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col shadow-xl">
      <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg">
        <h2 className="text-lg font-semibold text-gray-800">Photo Gallery</h2>
        <div className="flex gap-2">
          <Button
            variant={showCropControls ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              if (showCropControls) {
                setShowCropControls(false);
                setManualCropper(null);
              } else {
                startBatchCropping();
              }
            }}
          >

            {showCropControls ? 'Exit Crop' : 'Start Batch Crop'}
          </Button>
              {/* Add this new edit button */}
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        if (selectedPhoto) {
          // Open photo editor for the selected photo
          setShowPhotoEditor(true);
        }
      }}
      disabled={!selectedPhoto}
    >
      Edit Photo
    </Button>
    <Button
      variant="ghost"
      size="icon"
      onClick={() => {
        setShowGalleryModal(false);
        setShowCropControls(false);
      }}
      className="text-gray-600 hover:text-gray-900"
    >
      <X className="h-5 w-5" />
    </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setShowGalleryModal(false);
              setShowCropControls(false);
            }}
            className="text-gray-600 hover:text-gray-900"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
  {/* Photo Editor */}
{showPhotoEditor && selectedPhoto && (
  <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
    <PhotoEditor 
      photos={{ [selectedPhoto.name]: selectedPhoto.url }}
      onPhotosChange={(editedPhotos) => {
        setPhotos(prev => ({
          ...prev,
          [selectedPhoto.name]: editedPhotos[selectedPhoto.name]
        }));
        setShowPhotoEditor(false);
      }}
    />
  </div>
)}
<div className="flex-1 overflow-auto p-6 bg-white">
  {selectedPhoto ? (
    <div className="flex flex-col items-center">
      <div className="relative w-full h-[60vh] bg-gray-100 rounded-lg mb-4">
        {showCropControls ? (
          <div className="relative w-full h-full bg-gray-900 rounded-lg overflow-hidden">
            <canvas
              ref={cropCanvasRef}
              className="w-full h-full object-contain cursor-crosshair"
              onLoad={() => {
                if (selectedPhoto) {
                  initializeManualCropper(selectedPhoto.url);
                }
              }}
            />
            {selectedPhoto && (
              <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg">
                <div className="text-sm font-medium">
                  Photo {currentPhotoIndex + 1} of {photosArray.length}: {selectedPhoto.name}
                </div>
                <div className="text-xs text-gray-300 mt-1">
                  Double-click to crop and advance to next photo
                </div>
              </div>
            )}
            
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.name}
              className="max-w-full max-h-full object-contain"
              style={{
                transform: `rotate(${rotations.gallery[selectedPhoto.name] || 0}deg)`,
                transition: 'transform 0.3s ease',
                backgroundColor: 'white',
                padding: '1rem'
              }}
            />
          </div>
        )}
      </div>

      {showCropControls ? (
        <div className="w-full space-y-4 bg-gray-50 p-4 rounded-lg">
          {/* Manual Crop Dimensions */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="block mb-2 text-sm font-medium">Width (mm)</Label>
              <Input
                type="number"
                value={cropDimensions.width}
                onChange={(e) => handleCropDimensionChange('width', e.target.value)}
                min="1"
                step="0.1"
                className="text-sm"
              />
            </div>
            <div>
              <Label className="block mb-2 text-sm font-medium">Height (mm)</Label>
              <Input
                type="number"
                value={cropDimensions.height}
                onChange={(e) => handleCropDimensionChange('height', e.target.value)}
                min="1"
                step="0.1"
                className="text-sm"
              />
            </div>
          </div>

          {/* Aspect Ratio Lock Toggle */}
          <div className="flex items-center justify-center">
            <Button
              onClick={() => {
                toggleAspectRatioLock();
              }}
              variant={manualCropper?.options.lockAspectRatio ? 'default' : 'outline'}
              size="sm"
              aria-pressed={manualCropper?.options.lockAspectRatio ? 'true' : 'false'}
              className={`flex items-center gap-2 transition-colors duration-200 ${
                manualCropper?.options.lockAspectRatio ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-400 text-gray-700'
              }`}
              title={manualCropper?.options.lockAspectRatio ? 'Aspect Ratio Locked' : 'Lock Aspect Ratio'}
            >
              <div className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                manualCropper?.options.lockAspectRatio 
                  ? 'bg-white border-white' 
                  : 'border-gray-400'
              }`}>
                {manualCropper?.options.lockAspectRatio && (
                  <div className="w-2 h-2 bg-blue-600 rounded-sm"></div>
                )}
              </div>
              {manualCropper?.options.lockAspectRatio ? 'Aspect Ratio Locked' : 'Lock Aspect Ratio'}
            </Button>
          </div>

          {/* Rotation Control */}
          <div>
            <Label className="block mb-2 text-sm font-medium">Rotation: {rotation}°</Label>
            <input
              type="range"
              min="0"
              max="360"
              value={rotation}
              onChange={(e) => setRotation(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Progress and Controls */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="text-sm text-gray-600">
              Progress: {currentPhotoIndex + 1} / {photosArray.length}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  if (manualCropper) {
                    manualCropper.setCropArea(cropDimensions.width, cropDimensions.height);
                  }
                  setRotation(0);
                }}
              >
                Reset
              </Button>
              <Button
                size="sm"
                onClick={handleSaveCrop}
                disabled={!manualCropper}
              >
                Crop & Next
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded border-l-4 border-blue-400">
            <strong>Instructions:</strong>
            <ul className="mt-1 space-y-1">
              <li>• Drag the crop area to reposition</li>
              <li>• Drag corners to resize</li>
              <li>• Double-click to crop and advance</li>
              <li>• Use dimension inputs for precise sizing</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-lg">
          <Button
            onClick={() => handleGalleryRotation(selectedPhoto.name, -90)}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Rotate Left
          </Button>
          
          <Button
            onClick={() => handleGalleryRotation(selectedPhoto.name, 90)}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            <RotateCw className="mr-2 h-4 w-4" />
            Rotate Right
          </Button>

          <span className="text-sm font-medium text-gray-700 px-3 py-1.5 bg-white rounded border border-gray-200">
            {selectedPhoto.name} ({rotations.gallery[selectedPhoto.name] || 0}°)
          </span>

          <Button
            variant="destructive"
            onClick={() => {
              handlePhotoDelete(selectedPhoto.name);
              setSelectedPhoto(null);
            }}
            className="ml-auto"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      )}
    </div>
  ) : (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 bg-white p-2">
      {Object.entries(photos).map(([name, url]) => (
        <div
          key={name}
          className="cursor-pointer bg-white rounded-lg border border-gray-200 p-2 hover:shadow-md transition-shadow relative group"
          onClick={() => setSelectedPhoto({ name, url })}
        >
          <div className="aspect-square overflow-hidden rounded-md bg-gray-100 relative">
            <img
              src={url}
              alt={name}
              className="w-full h-full object-cover"
              style={{
                transform: `rotate(${rotations.gallery[name] || 0}deg)`,
                transition: 'transform 0.3s ease',
                backgroundColor: 'white'
              }}
            />
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="icon"
                variant="destructive"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePhotoDelete(name);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <p className="text-xs mt-2 text-center text-gray-700 font-medium truncate px-1">
            {name} ({rotations.gallery[name] || 0}°)
          </p>
        </div>
      ))}
    </div>
  )}
</div>
      
      <div className="p-4 border-t bg-gray-50 rounded-b-lg flex justify-between">
        <Button
          variant="outline"
          onClick={() => setSelectedPhoto(null)}
          disabled={!selectedPhoto}
          className="border-gray-300 text-gray-700 hover:bg-gray-100"
        >
          Back to Grid
        </Button>
        <Button 
          onClick={() => setShowGalleryModal(false)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Close Gallery
        </Button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}