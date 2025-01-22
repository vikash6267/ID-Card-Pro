import React, { useState } from "react";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import Swal from "sweetalert2";
import axios from "axios";

const ImageUploaderWithCrop = ({ setImageData, selectedImage, setSelectedImage,title="Upload Image" ,height=false}) => {
  const [cropper, setCropper] = useState(null);

  const handlePhotoFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      Swal.fire({
        icon: "error",
        title: "Invalid File",
        text: "Please select a valid image file.",
      });
    }
  };

  const handleUpload = async () => {
    if (!cropper) {
      Swal.fire({
        icon: "error",
        title: "Crop Required",
        text: "Please crop the image before uploading.",
      });
      return;
    }

    const croppedCanvas = cropper.getCroppedCanvas();
    if (!croppedCanvas) return;

    const croppedBlob = await new Promise((resolve) => {
      croppedCanvas.toBlob((blob) => {
        resolve(blob);
      }, "image/jpeg");
    });

    const formData = new FormData();
    formData.append("file", croppedBlob);

    Swal.fire({
      title: "Uploading...",
      text: "Please wait while the image is being uploaded.",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const response = await axios.post(
        "https://api.cardpro.co.in/image/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      Swal.close();

      if (response.data.success) {
        const { public_id, url } = response.data.thumbnailImage;
        setImageData({ publicId: public_id, url });
        Swal.fire({
          icon: "success",
          title: "Uploaded",
          text: "Image uploaded successfully!",
        });
      }
    } catch (error) {
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: "Failed to upload the image. Please try again later.",
      });
    }
  };

  return (
    <div>
      <label
        htmlFor={`dropzone-file-${title}`}
        className="flex items-center px-3 py-3 mx-auto mt-6 text-center border-2 border-dashed rounded-lg cursor-pointer"
      >
        <input
        id={`dropzone-file-${title}`}
          type="file"
          className="hidden"
          onChange={handlePhotoFileSelect}
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6 text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
          />
        </svg>
        <h2 className="mx-3 text-gray-400">{title}</h2>
      </label>

      {selectedImage && (
        <div className="mt-4">
          {
            height ?
            <Cropper
            src={selectedImage}
            style={{  width: "100%" }}
            aspectRatio={0}        // Disable fixed aspect ratio
            guides={false}         // Disable guides
            viewMode={3}           // Allow free resizing and movement of the crop box
            dragMode="move"       // Allow moving the crop box
            responsive={true}
            autoCropArea={1}       // Maximize crop area
            checkOrientation={false}
            wheelZoom={true}       // Enable zoom with mouse wheel
            zoomable={true}        // Enable zoom with buttons
            minCropBoxWidth={50}   // Minimum crop box width
            minCropBoxHeight={50}  // Minimum crop box height
            toggleDragModeOnDblclick={false}  // Disable double-click mode toggle
            onInitialized={(instance) => setCropper(instance)}  // Initialize the cropper instance
          /> :
          <Cropper
            src={selectedImage}
            style={{ height: 400, width: "100%" }}
            aspectRatio={0}        // Disable fixed aspect ratio
            guides={false}         // Disable guides
            viewMode={3}           // Allow free resizing and movement of the crop box
            dragMode="move"       // Allow moving the crop box
            responsive={true}
            autoCropArea={1}       // Maximize crop area
            checkOrientation={false}
            wheelZoom={true}       // Enable zoom with mouse wheel
            zoomable={true}        // Enable zoom with buttons
            minCropBoxWidth={50}   // Minimum crop box width
            minCropBoxHeight={50}  // Minimum crop box height
            toggleDragModeOnDblclick={false}  // Disable double-click mode toggle
            onInitialized={(instance) => setCropper(instance)}  // Initialize the cropper instance
          />
          }
          <p
            onClick={handleUpload}
            className="mt-4 cursor-pointer px-4 py-2 bg-blue-500 text-white rounded"
          >
            {title}
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageUploaderWithCrop;
