"use client";
import { useState, useEffect } from "react";


// photo-upload.jsx
export function PhotoUpload({ onPhotosChange }) {
  const [photos, setPhotos] = useState({});
  const [galleryRotations, setGalleryRotations] = useState({}); // Separate state for gallery rotations
  const [loading, setLoading] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const handlePhotoUpload = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setLoading(true);
    const newPhotos = { ...photos };
    const newRotations = { ...galleryRotations };
    let loadedCount = 0;

    const loadImage = (file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const name = file.name.split(".")[0].trim();
        newPhotos[name] = event.target.result;
        newRotations[name] = 0; // Initialize rotation to 0
        loadedCount++;

        if (loadedCount === files.length) {
          setPhotos(newPhotos);
          setGalleryRotations(newRotations);
          onPhotosChange(newPhotos, newRotations); // New
          setLoading(false);
        }
      };
      reader.onerror = () => {
        loadedCount++;
        if (loadedCount === files.length) {
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    };

    Array.from(files).forEach(loadImage);
    e.target.value = "";
  };

  const handleDeletePhoto = (name) => {
    setPhotos(prev => {
      const updated = { ...prev };
      delete updated[name];
      onPhotosChange(updated, galleryRotations); // New
      return updated;
    });
    setGalleryRotations(prev => {
      const updated = { ...prev };
      delete updated[name];
      return updated;
    });
  };

  const handleGalleryRotation = (name, rotation) => {
    setGalleryRotations(prev => ({
      ...prev,
      [name]: ((prev[name] || 0) + rotation) % 360
    }));
    // Notify parent of rotation change
    onPhotosChange(photos, {
      ...galleryRotations,
      [name]: ((galleryRotations[name] || 0) + rotation) % 360
    });
  };

  const openPhotoInGallery = (name, url) => {
    setSelectedPhoto({ name, url });
    setShowGalleryModal(true);
  };


  useEffect(() => {
    if (!showGalleryModal || !selectedPhoto) return;

    const handleKeyDown = (e) => {
      const photoNames = Object.keys(photos);
      const currentIndex = photoNames.indexOf(selectedPhoto.name);
      
      if (e.key === 'ArrowRight' && currentIndex < photoNames.length - 1) {
        setSelectedPhoto({
          name: photoNames[currentIndex + 1],
          url: photos[photoNames[currentIndex + 1]]
        });
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setSelectedPhoto({
          name: photoNames[currentIndex - 1],
          url: photos[photoNames[currentIndex - 1]]
        });
      } else if (e.key === 'Escape') {
        setShowGalleryModal(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showGalleryModal, selectedPhoto, photos]);

}