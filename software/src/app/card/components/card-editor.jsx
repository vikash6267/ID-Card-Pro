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
const [isProjectManagerOpen, setIsProjectManagerOpen] = useState(false);

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
  // Search + Sort for Project Manager
const [projectSearch, setProjectSearch] = useState("");
const [projectSortBy, setProjectSortBy] = useState("updatedAt"); // 'name' or 'updatedAt'
const [projectSortOrder, setProjectSortOrder] = useState("desc"); // 'asc' or 'desc'

  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [renameProjectId, setRenameProjectId] = useState("");
  const [renameProjectName, setRenameProjectName] = useState("");
  const [lastSaved, setLastSaved] = useState(null);
  const [photoInstanceRotations, setPhotoInstanceRotations] = useState({});
 // Filter and sort projects for display in Project Manager
const filteredAndSortedProjects = (() => {
  if (!projects || projects.length === 0) return [];

  // filter by search (name match)
  const q = projectSearch.trim().toLowerCase();
  const filtered = q ? projects.filter(p => (p.name || "").toLowerCase().includes(q)) : [...projects];

  // sort
  const compare = (a, b) => {
    if (projectSortBy === "name") {
      const an = (a.name || "").toLowerCase();
      const bn = (b.name || "").toLowerCase();
      if (an < bn) return -1;
      if (an > bn) return 1;
      return 0;
    }
    // default: updatedAt (fallback to createdAt)
    const at = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const bt = new Date(b.updatedAt || b.createdAt || 0).getTime();
    return at - bt;
  };

  filtered.sort((a, b) => {
    const r = compare(a, b);
    return projectSortOrder === "asc" ? r : -r;
  });

  return filtered;
})();
 
  
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

  // Only save custom images (not Excel data images) to reduce storage
  const photosToSave = {};
  
  ['front', 'back'].forEach(side => {
    template[side]?.elements?.forEach(element => {
      if (element.type === "image" && element.isCustomImage && element.content) {
        if (photos[element.content]) {
          photosToSave[element.content] = photos[element.content];
        }
      }
    });
  });

  const updatedProject = {
    ...currentProject,
    template: JSON.parse(JSON.stringify(template)),
    excelData: JSON.parse(JSON.stringify(excelData)),
    photos: photosToSave, // Only save custom images
    maskSrc,
    masks: masks || [],
    applyMask,
    rotations: JSON.parse(JSON.stringify(rotations || { elements: {}, gallery: {} })),
    photoInstanceRotations: JSON.parse(JSON.stringify(photoInstanceRotations || {})),
    updatedAt: new Date().toISOString()
  };

  const updatedProjects = projects.map(p => 
    p.id === updatedProject.id ? updatedProject : p
  );
  
  setProjects(updatedProjects);
  
  try {
    localStorage.setItem('idCardProjects', JSON.stringify(updatedProjects));
    setCurrentProject(updatedProject);
    setLastSaved(new Date().toISOString());
    
    if (manualSave) {
      toast.success(`Project "${updatedProject.name}" saved successfully`);
    }
  } catch (error) {
    console.error("Failed to save project:", error);
    if (error.name === 'QuotaExceededError') {
      toast.error("Storage quota exceeded. Try removing some images or use Export instead.");
      
      // Offer to export instead
      if (window.confirm("Storage is full. Would you like to export this project as a file instead?")) {
        exportProject();
      }
    } else {
      toast.error("Failed to save project: " + error.message);
    }
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

    {/* =========================
       Project Management Banner (gradient) — all primary controls live here
       Project name placed below Manage Projects button
       ========================= */}
    <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-xl shadow-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3">

      {/* Left group: Manage Projects button + project name (stacked) */}
      <div className="flex items-start gap-3 min-w-0">
        <div className="flex flex-col items-start gap-2">
          <Button
            onClick={() => setIsProjectManagerOpen(true)}
            size="sm"
            className="flex items-center gap-2 bg-white text-indigo-600 hover:scale-[1.02] transform transition px-3 py-1 rounded-full"
          >
            <FolderOpen className="w-4 h-4" />
            <span className="text-sm font-semibold">Manage Projects</span>
          </Button>

          {/* Project name shown below the button */}
          {currentProject ? (
            <div className="text-left">
              <div className="text-sm font-semibold drop-shadow-sm truncate text-white">
                {currentProject.name}
              </div>
            </div>
          ) : (
            <div className="text-left">
              <div className="text-sm font-semibold drop-shadow-sm text-white/80">No project</div>
            </div>
          )}
        </div>
      </div>

      {/* Middle group: Front/Back, Background Upload (compact), Navigation */}
      <div className="flex items-center gap-2 flex-wrap justify-center">
        {/* Side switch */}
        <div className="flex items-center gap-1 bg-white/10 rounded-full p-1">
          <Button
            size="sm"
            className={`${currentSide === 'front' ? 'bg-white text-indigo-700' : 'text-white/90'} rounded-full px-3 py-1 text-sm`}
            onClick={() => setCurrentSide('front')}
          >
            Front
          </Button>
          <Button
            size="sm"
            className={`${currentSide === 'back' ? 'bg-white text-indigo-700' : 'text-white/90'} rounded-full px-3 py-1 text-sm`}
            onClick={() => setCurrentSide('back')}
          >
            Back
          </Button>
        </div>

        {/* Compact BackgroundUpload trigger (icon wrapper) */}
        <div className="text-gray-900 dark:text-gray-900">
          <BackgroundUpload
            onUpload={(backgroundData) => {
              const updatedTemplate = {
                ...template,
                [currentSide]: {
                  ...template[currentSide],
                  backgroundMode: 'dynamic',
                  backgroundColumn: backgroundData.column,
                  backgroundGroups: backgroundData.groups,
                },
              };
              if (currentSide === "front") {
                updatedTemplate.back = {
                  ...updatedTemplate.back,
                  backgroundMode: 'dynamic',
                  backgroundColumn: backgroundData.column,
                  backgroundGroups: backgroundData.groups.map(group => ({
                    ...group,
                    name: group.name.replace('Front:', 'Back:'),
                    image: null,
                  })),
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
        </div>

        {/* Navigation (prev / index / next) */}
        <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-md shadow-inner">
          <Button
            onClick={() => navigateRecord("prev")}
            disabled={currentRecordIndex === 0}
            size="sm"
            variant="ghost"
            className="text-white/90 p-1 rounded-md"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-1 px-2">
            <input
              type="number"
              min="1"
              max={Math.max(1, excelData.rows.length)}
              value={Math.min(Math.max(1, currentRecordIndex + 1), Math.max(1, excelData.rows.length))}
              onChange={(e) => {
                const newIndex = parseInt(e.target.value, 10) - 1;
                if (!isNaN(newIndex) && newIndex >= 0 && newIndex < excelData.rows.length) {
                  setCurrentRecordIndex(newIndex);
                }
              }}
              className="w-14 h-7 bg-transparent border-none text-sm text-center text-white focus:outline-none"
            />
            <span className="text-xs text-white/70">/ {excelData.rows.length || 0}</span>
          </div>

          <Button
            onClick={() => navigateRecord("next")}
            disabled={currentRecordIndex === excelData.rows.length - 1}
            size="sm"
            variant="ghost"
            className="text-white/90 p-1 rounded-md"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Right group: zoom, +/- and mask toggle */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Zoom */}
        <div className="flex items-center gap-2 bg-white/10 px-2 py-1 rounded-full">
          <label htmlFor="zoom" className="text-xs text-white/80 hidden sm:inline">Zoom</label>
          <input
            id="zoom"
            type="range"
            min="0.25"
            max="2"
            step="0.05"
            value={zoomLevel}
            onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
            className="w-28"
          />
          <span className="text-xs font-medium text-white/90 w-10 text-right">{Math.round(zoomLevel * 100)}%</span>
        </div>

        {/* quick +/- */}
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={() => setZoomLevel((z) => Math.max(z - 0.1, 0.25))} className="text-white/90 border-white/20 p-1 rounded-md">-</Button>
          <Button variant="outline" size="sm" onClick={() => setZoomLevel(1)} className="text-white/90 border-white/20 p-1 rounded-md">Reset</Button>
          <Button variant="outline" size="sm" onClick={() => setZoomLevel((z) => Math.min(z + 0.1, 2))} className="text-white/90 border-white/20 p-1 rounded-md">+</Button>
        </div>

        {/* Apply Mask */}
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            id="apply-mask"
            checked={applyMask}
            onChange={(e) => setApplyMask(e.target.checked)}
            className="h-4 w-4 rounded border-white/40"
          />
          <span className="text-xs text-white/90">Apply Mask {maskSrc && `(${masks.find(m => m.url === maskSrc)?.name || 'Custom'})`}</span>
        </label>
      </div>



{/* =========================
   Project Manager modal (now 3 columns: Projects | Create | Uploads)
   ========================= */}
{isProjectManagerOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    {/* backdrop */}
    <div
      className="absolute inset-0 bg-gradient-to-br from-black/40 via-indigo-700/20 to-pink-700/10 backdrop-blur-sm"
      onClick={() => setIsProjectManagerOpen(false)}
      aria-hidden="true"
    />

    {/* Modal */}
    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[92vh] overflow-hidden flex flex-col ring-1 ring-indigo-100">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-600 to-pink-500 text-white">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/20">
            <FolderOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold leading-tight">Projects</h3>
            <div className="text-sm text-white/80">Manage your saved projects · {projects.length} total</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
            onClick={() => setIsProjectManagerOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Body: 3 columns — switched to light background + black text for readability */}
      <div className="flex-1 overflow-auto p-5 grid grid-cols-1 lg:grid-cols-3 gap-6 bg-gradient-to-b from-black to-indigo-50 text-black">

        {/* ---------- Left: Project list (click-to-open) ---------- */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-white">All Projects</Label>

            <div className="flex items-center gap-3">
              <div className="text-xs text-white">{projects.length} total</div>

              {/* Sort control */}
              <div className="flex items-center gap-2">
                <select
                  value={projectSortBy}
                  onChange={(e) => setProjectSortBy(e.target.value)}
                  className="h-8 text-xs rounded-md border px-2 bg-white text-black"
                  aria-label="Sort projects by"
                >
                  <option value="updatedAt">Updated</option>
                  <option value="name">Name</option>
                </select>

                <button
                  title="Toggle sort order"
                  onClick={() => setProjectSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                  className="h-8 w-8 flex items-center justify-center rounded-md border hover:shadow-sm bg-white text-gray-600"
                  aria-label="Toggle sort order"
                >
                  {projectSortOrder === "asc" ? "▲" : "▼"}
                </button>
              </div>
            </div>
          </div>

          {/* Search input */}
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search projects (name)…"
              value={projectSearch}
              onChange={(e) => setProjectSearch(e.target.value)}
              className="w-full text-black"
              aria-label="Search projects by name"
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setProjectSearch("")}
              title="Clear search"
              className="h-8 w-8"
            >
              ✕
            </Button>
          </div>

          {/* Projects list */}
          <div className="p-4 bg-white rounded-2xl shadow-md border border-gray-100 space-y-4">
            {filteredAndSortedProjects.length === 0 ? (
              <div className="text-sm text-gray-500">No projects match your search. Create one on the right.</div>
            ) : (
              filteredAndSortedProjects.map((p) => (
                <div
                  key={p.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    loadProject(p.id);
                    setCurrentProject(p);
                    setIsProjectManagerOpen(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      loadProject(p.id);
                      setCurrentProject(p);
                      setIsProjectManagerOpen(false);
                    }
                  }}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-shadow duration-150 transform cursor-pointer ${
                    currentProject?.id === p.id
                      ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200 shadow-md scale-[1.01]'
                      : 'bg-white border-gray-100 hover:shadow-sm hover:scale-[1.01]'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="font-medium truncate text-gray-800">{p.name}</div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => { e.stopPropagation(); loadProject(p.id); setIsProjectManagerOpen(false); }}
                      className="text-indigo-600"
                    >
                      Open
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        const newName = window.prompt('Rename project', p.name);
                        if (newName && newName.trim() && newName.trim() !== p.name) {
                          renameProject(p.id, newName.trim());
                        }
                      }}
                      className="text-purple-600"
                    >
                      Rename
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Delete "${p.name}"? This cannot be undone.`)) {
                          deleteProject(p.id);
                        }
                      }}
                    >
                      Delete
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentProject(p);
                        exportProject();
                      }}
                      className="text-indigo-600"
                    >
                      Export
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ---------- Middle: Create / Import (kept light with black text) ---------- */}
        <div className="p-4 bg-teal rounded-2xl shadow-md border border-gray-900 space-y-6">
          <div className="p-4 rounded-xl border border-gray-900 bg-gradient-to-br from-white to-indigo-50">
            <Label className="text-sm font-medium text-black">Create New Project</Label>

            <div className="flex gap-2 mt-3">
              <Input
                type="text"
                placeholder="Project name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="flex-1 text-black"
              />
              <Button
                onClick={() => {
                  createNewProject();
                }}
              >
                Create
              </Button>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-gray-900 bg-gradient-to-br from-white to-pink-50">
            <Label className="text-sm font-medium text-black">Import Project</Label>
            <div className="flex gap-2 mt-3 items-center">
              <Input type="file" accept=".idcard,application/json" onChange={importProject} />
              <div className="text-xs text-gray-500">Import .idcard (JSON)</div>
            </div>
          </div>
        </div>

        {/* ---------- Right: Upload Section (Excel / Photos / Masks) (light bg) ---------- */}
        <div className="p-4 bg-orange rounded-2xl shadow-md border border-red-100 space-y-4">
          <div className="p-3 rounded-2xl border border-gray-900 bg-gradient-to-br from-blue to-indigo-50">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium flex items-center gap-2 text-white">
                <FileText className="w-4 h-4 text-white" /> Uploads
              </Label>
              <div className="text-xs text-gray-500">{excelData?.rows?.length || 0} / {Object.keys(photos).length} / {masks.length}</div>
            </div>

            {/* Compact upload grid */}
            <div className="grid grid-cols-1 gap-3">
              {/* Excel tile */}
              <div className="p-3 rounded-lg border border-dashed border-gray-200 bg-white/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="text-sm font-medium text-black">Excel Data</div>
                    <div className="text-xs text-gray-500">{excelData?.rows?.length || 0} records</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <>
                    <Input
                      id="excel-upload-modal"
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleExcelUpload}
                      className="hidden"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => document.getElementById('excel-upload-modal').click()}
                    >
                      Upload
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowExcelEditor(true)}
                      disabled={!excelData?.rows?.length}
                    >
                      Edit
                    </Button>
                  </>
                </div>
              </div>

              {/* Photos tile */}
              <div className="p-3 rounded-lg border border-dashed border-gray-200 bg-white/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ImageIcon className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="text-sm font-medium text-black">Card Photos</div>
                    <div className="text-xs text-gray-500">{Object.keys(photos).length} photos</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <>
                    <Input
                      id="photo-upload-modal"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => document.getElementById('photo-upload-modal').click()}
                    >
                      Upload
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowGalleryModal(true)}
                      disabled={Object.keys(photos).length === 0}
                    >
                      Gallery
                    </Button>
                  </>
                </div>
              </div>

              {/* Masks tile */}
              <div className="p-3 rounded-lg border border-dashed border-gray-200 bg-white/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Layers className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="text-sm font-medium text-black">Card Masks</div>
                    <div className="text-xs text-gray-500">{masks.length} masks</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <>
                    <Input
                      id="mask-upload-modal"
                      type="file"
                      accept="image/png"
                      multiple
                      onChange={handleMaskUpload}
                      className="hidden"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => document.getElementById('mask-upload-modal').click()}
                    >
                      Upload
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowMaskGallery(true)}
                      disabled={masks.length === 0}
                    >
                      Gallery
                    </Button>
                  </>
                </div>
              </div>
            </div>

            <div className="mt-3 text-xs text-gray-600">
              Tip: Upload Excel to bind data to text fields. Upload photos & masks to preview and apply to cards.
            </div>
          </div>
        </div>
      </div>

{/* Footer */}
<div className="p-4 border-t bg-white flex items-center justify-end gap-3">
  <Button
    variant="outline"
    onClick={() => setIsProjectManagerOpen(false)}
    className="border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
    aria-label="Close project manager"
  >
    <span className="text-gray-700">Close</span>
  </Button>

  <Button
    onClick={saveProject}
    disabled={!currentProject}
    size="sm"
    className="gap-1 bg-white text-indigo-600 hover:bg-indigo-50"
    aria-label="Save project"
  >
    <Save className="w-4 h-4" />
    <span className="text-indigo-600">Save</span>
  </Button>
</div>
    </div>
  </div>
)}


  {/* =========================
     Excel Editor Modal (keeps your prior logic, wired to setShowExcelEditor)
     ========================= */}
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

              // Update data elements based on the current record index (keeps existing logic)
              const updatedElements = template[currentSide].elements.map(el => {
                if (el.heading && !el.isStatic) {
                  const updatedValue = newData.rows[currentRecordIndex]?.[el.heading];
                  if (updatedValue !== undefined) {
                    return { ...el, content: updatedValue };
                  }
                }
                return el;
              });

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
          <Button variant="outline" onClick={() => setShowExcelEditor(false)}>Cancel</Button>
          <Button
            onClick={() => {
              // Let the ExcelEditor component handle save via a custom event
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

  {/* =========================
     Photo Gallery Modal (compact gallery & selection)
     ========================= */}
  {showGalleryModal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col shadow-xl">
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center gap-2">
            <Grid className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-semibold">Photo Gallery</h2>
            <span className="text-xs text-muted-foreground ml-1">({Object.keys(photos).length} photos)</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowGalleryModal(false)} className="text-gray-500 hover:text-gray-900">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Object.entries(photos).length === 0 ? (
              <div className="text-gray-500">No photos uploaded.</div>
            ) : (
              Object.entries(photos).map(([key, src]) => (
                <div key={key} className="group relative rounded-md overflow-hidden border bg-gray-50">
                  <img src={src} alt={key} className="w-full h-40 object-cover" />
                  <div className="absolute inset-0 group-hover:bg-black/10 transition-colors" />
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="iconSm" variant="ghost" onClick={(e) => { e.stopPropagation(); const cp = { ...photos }; delete cp[key]; setPhotos(cp); }}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                    <Button size="iconSm" variant="ghost" onClick={(e) => { e.stopPropagation(); /* set as main preview or similar */ }}>
                      <ImageIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-3 border-t flex justify-end gap-2">
          <Button variant="outline" onClick={() => setShowGalleryModal(false)}>Close</Button>
          <Button onClick={() => setShowGalleryModal(false)}>Done</Button>
        </div>
      </div>
    </div>
  )}

  {/* =========================
     Mask Gallery Modal (keeps your prior logic, with preview + apply)
     ========================= */}
  {showMaskGallery && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold">Mask Gallery</h2>
            <span className="text-xs text-muted-foreground ml-1">({masks.length} masks)</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowMaskGallery(false)} className="text-gray-500 hover:text-gray-900">
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
                  <Button variant="outline" size="sm" onClick={() => setSelectedMask(null)}>Back</Button>
                  <Button size="sm" onClick={() => { applySelectedMask(selectedMask.url); setShowMaskGallery(false); }} className="bg-green-600 hover:bg-green-700">
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

{/* Shortcut help (if present) */}
{useKeyboardShortcuts.ShortcutHelpPanel && (
  <div className="ml-2 hidden sm:block text-black">
    <useKeyboardShortcuts.ShortcutHelpPanel />
  </div>
)}

      </div>

{/* Unified Add & Delete Elements UI - Stylish & Dashing */}
<div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 p-4 rounded-xl shadow-lg flex flex-wrap items-center gap-2 mb-4">

  {/* Label */}
  <Label className="text-sm font-semibold whitespace-nowrap mr-2 text-gray-700">Add Element:</Label>
  
  {/* Select Dropdown */}
  <select
    value={selectedHeader}
    onChange={(e) => setSelectedHeader(e.target.value)}
    className="p-2 border border-gray-300 rounded-lg text-sm h-9 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all"
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

  {/* Add Buttons with gradient & hover */}
  <Button 
    onClick={() => addElement("text")} 
    size="sm" 
    className="gap-1 bg-gradient-to-r from-green-400 to-green-600 text-white font-semibold shadow-md hover:scale-105 transform transition-all rounded-lg"
  >
    <Type className="w-3.5 h-3.5" />
    Text
  </Button>

  <Button 
    onClick={() => addElement("image")} 
    size="sm" 
    className="gap-1 bg-gradient-to-r from-blue-400 to-blue-600 text-white font-semibold shadow-md hover:scale-105 transform transition-all rounded-lg"
  >
    <ImageIcon className="w-3.5 h-3.5" />
    Image
  </Button>

  <Button 
    onClick={() => addElement("qrcode")} 
    size="sm" 
    className="gap-1 bg-gradient-to-r from-purple-400 to-purple-600 text-white font-semibold shadow-md hover:scale-105 transform transition-all rounded-lg"
  >
    <QrCode className="w-3.5 h-3.5" />
    QR Code
  </Button>

  <Button 
    onClick={() => addElement("barcode")} 
    size="sm" 
    className="gap-1 bg-gradient-to-r from-pink-400 to-pink-600 text-white font-semibold shadow-md hover:scale-105 transform transition-all rounded-lg"
  >
    <Barcode className="w-3.5 h-3.5" />
    Barcode
  </Button>

  {/* AutoContainerGenerator Button inline with gradient */}
  <div className="flex items-center">
    <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg p-1 shadow-md">
      <AutoContainerGenerator
        onTemplateChange={onTemplateChange}
        excelData={excelData}
        currentSide={currentSide}
        setTemplate={setTemplate}
      />
    </div>
  </div>

  {/* Delete Button with danger style */}
  <Button 
    onClick={deleteElements} 
    size="sm" 
    className="gap-1 bg-gradient-to-r from-red-400 to-red-600 text-white font-semibold shadow-md hover:scale-105 transform transition-all rounded-lg"
  >
    <Trash2 className="w-3.5 h-3.5" />
    Delete Selected
  </Button>
  
    <div className="flex flex-wrap gap-2 items-center">

      {/* Save stays outside the modal as requested */}
                  {lastSaved && (
        <span className="text-xs text-black-50/80 mr-2">
          Last saved: {new Date(lastSaved).toLocaleString()}
        </span>
      )}
      <Button
        onClick={saveProject}
        disabled={!currentProject}
        size="sm"
        className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg p-1 shadow-md"
      >
        <Save className="w-4 h-4" />
        Save
      </Button>


      {/* Batch Generator */}
      <div className="mt-2">

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
    </div>

</div>


      {/* Main Workspace */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left Sidebar - Only Delete + Settings now */}
        <div className="w-full lg:w-64 space-y-4">
          {selectedElements.length > 0 && (
            <div className="space-y-3 bg-white p-4 rounded-lg shadow-sm">

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
      className="overflow-auto p-4 bg-black/10 rounded-lg border border-gray-200 shadow-sm"
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
      {(() => {
        // Get all image elements and their selected headers
        const imageHeaders = new Set();
        ['front', 'back'].forEach(side => {
          template[side]?.elements?.forEach(element => {
            if (element.type === "image" && element.heading && !element.isCustomImage) {
              imageHeaders.add(element.heading);
            }
          });
        });

        // Get all photo names from Excel data based on selected headers
        const relevantPhotoNames = new Set();
        if (imageHeaders.size > 0 && excelData.rows) {
          excelData.rows.forEach(row => {
            imageHeaders.forEach(header => {
              const photoName = row[header];
              if (photoName) {
                relevantPhotoNames.add(photoName.toString().trim());
              }
            });
          });
        }

        // Filter photos: show custom images + photos matching Excel data
        const filteredPhotos = Object.entries(photos).filter(([name]) => {
          // Always show custom images
          if (name.startsWith('custom_image_')) return true;
          // Show if it matches a photo name from Excel data
          if (relevantPhotoNames.has(name)) return true;
          // Show if no image elements exist (show all)
          if (imageHeaders.size === 0) return true;
          return false;
        });

        if (filteredPhotos.length === 0) {
          return (
            <div className="col-span-full text-center py-8 text-gray-500">
              <p className="text-sm">No photos uploaded yet.</p>
              {imageHeaders.size > 0 && (
                <p className="text-xs mt-2">
                  Upload photos matching: {Array.from(imageHeaders).join(', ')}
                </p>
              )}
            </div>
          );
        }

        return filteredPhotos.map(([name, url]) => (
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
        ));
      })()}
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