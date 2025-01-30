"use client";

import React, { useState, useEffect, useRef } from "react";

import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import axios from "../../../axiosconfig";
import Swal from "sweetalert2";


const StudentPhotoCapture = ({ setCroppedPhoto, aspectRatio }) => {
  const [photo, setPhoto] = useState(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const cropperRef = useRef(null);
  const [cameraFacingMode, setCameraFacingMode] = useState("environment");
  const [isCameraAccessible, setIsCameraAccessible] = useState(true);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);


   // Start the camera based on facingMode
   const startCamera = async (facingMode) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode },
      });
      videoRef.current.srcObject = stream;
    } catch (error) {
      setIsCameraAccessible(false);
      Swal.fire({
        title: "Camera Permission Denied",
        text: "Please enable camera access in your browser settings to capture photos.",
        icon: "error",
      });
    }
  };


  useEffect(() => {
    startCamera(cameraFacingMode);

    // Cleanup on component unmount
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [cameraFacingMode]);



  const handleCaptureClick = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // Set the canvas size to the video dimensions
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    // Draw the current frame from the video onto the canvas
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    // Get the captured image as a data URL
    const imageSrc = canvas.toDataURL("image/jpeg");
    setPhoto(imageSrc);
    setIsCropModalOpen(true);
  };

  const handleCrop = () => {
    if (cropperRef.current && cropperRef.current.cropper) {
      const croppedDataUrl = cropperRef.current.cropper.getCroppedCanvas().toDataURL();
      setCroppedPhoto(croppedDataUrl);
      setIsCropModalOpen(false);
    }
  };



  
const handleCameraSwitch = () => {
    setCameraFacingMode((prevMode) => (prevMode === "user" ? "environment" : "user"));
  };


  return (
    <div className="text-center mt-6">
      {/* <Camera
    
        ref={webcamRef}
        aspectRatio={5 / 4} 
        audio={false}
        facingMode={cameraFacingMode}
        className="rounded-lg border-2 border-gray-300 shadow-lg"
        screenshotFormat="image/jpeg"
      
      /> */}


      <video
        ref={videoRef}
        autoPlay
        playsInline
        width="100%"
        className="rounded-lg border-2 border-gray-300 shadow-lg"
      />


      <div className="mt-6 flex justify-center gap-6">
        <button
          onClick={handleCaptureClick}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
        >
          Capture Photo
        </button>
        <button
          onClick={handleCameraSwitch}
          className="px-6 py-2 bg-gray-600 text-white rounded-lg shadow-md hover:bg-gray-700 transition duration-300"
        >
          Switch Camera
        </button>
      </div>


      <canvas ref={canvasRef} style={{ display: "none" }}></canvas>


      {isCropModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg w-11/12 max-w-md">
            <h3 className="text-2xl font-semibold mb-6 text-center">Crop Your Photo</h3>
            <Cropper
              src={photo}
              className="w-full h-64 rounded border"
              initialAspectRatio={aspectRatio}
              aspectRatio={aspectRatio}
              guides={false}
              ref={cropperRef}
            />
            <div className="mt-6 flex justify-between">
              <button
                onClick={() => setIsCropModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCrop}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition duration-300"
              >
                Crop & Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StudentDisplay = () => {
  const [students, setStudents] = useState([]);
  const [currentStudentIndex, setCurrentStudentIndex] = useState(0);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [croppedPhoto, setCroppedPhoto] = useState(null);
  const [studentClass, setStudentClass] = useState("");
  const [stuSection, setSection] = useState("");
  const [stuCourse, setCourse] = useState("");
  const [aspectRatio, setAspectRatio] = useState(1 / 1);

  const handleAspectRatioChange = (e) => {
    const selectedRatio = e.target.value === "passport" ? 7 / 9 : 1 / 1;
    setAspectRatio(selectedRatio);
  };

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const vendor = query.get("vendor");
    const className = query.get("class");
    const section = query.get("section");
    const course = query.get("course");

    if (className) setStudentClass(className);
    if (section) setSection(section);
    if (course) setCourse(course);

    if (vendor) {
      axios
        .get(`/user/students/no-photo/${vendor}?studentClass=${studentClass}&section=${stuSection}&course=${stuCourse}`)
        .then((response) => {console.log(response.data) ; setStudents(response.data)})
        .catch((error) => console.error("Error fetching students:", error));
    }
  }, [currentStudentIndex]);

  const handlePhotoCaptured = (photoUrl) => setCapturedPhoto(photoUrl);

  const handleNextStudent = () => {
    setCurrentStudentIndex((prevIndex) => (prevIndex + 1) % students.length);
    setCroppedPhoto(null);
  };

  const handlePreviousStudent = () => {
    setCurrentStudentIndex((prevIndex) => (prevIndex - 1 + students.length) % students.length);
    setCroppedPhoto(null);
  };

  const handleUpdatePhoto = async (studentId) => {
    console.log(croppedPhoto);
    if (croppedPhoto) {
      Swal.fire({
        title: "Uploading...",
        text: "Please wait while the image is being uploaded.",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
  
      try {
        // Create an image object
        const img = new Image();
        img.src = croppedPhoto;
        
        img.onload = async () => {
          // Create a canvas to resize the image
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Resize the image (adjust max width and height as needed)
          const maxWidth = 800;  // Adjust the max width
          const maxHeight = 800; // Adjust the max height
          let width = img.width;
          let height = img.height;
  
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = width * ratio;
            height = height * ratio;
          }
  
          // Set canvas size and draw the image
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
  
          // Convert the canvas to a data URL (image format and quality can be adjusted)
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.7); // Adjust quality (0 to 1)
  
          // Convert Data URL to Blob directly
          const byteString = atob(compressedDataUrl.split(',')[1]);
          const arrayBuffer = new ArrayBuffer(byteString.length);
          const uintArray = new Uint8Array(arrayBuffer);
  
          for (let i = 0; i < byteString.length; i++) {
            uintArray[i] = byteString.charCodeAt(i);
          }
  
          const blob = new Blob([uintArray], { type: "image/jpeg" });
  
          // Prepare the form data to upload the image
          const formData = new FormData();
          formData.append("file", new File([blob], "photo.jpg"));
  
          // Upload the image
          const uploadResponse = await axios.post("/image/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
  
          Swal.close();
  
          if (uploadResponse.data.success) {
            const { public_id, url } = uploadResponse.data.thumbnailImage;
  
            // Update the student's avatar with the uploaded image URL
            const res = await axios.put(`/user/students/${studentId}/avatar`, {
              publicId: public_id,
              url: url,
            });
            console.log(res);
          }
        };
  
        img.onerror = () => {
          Swal.close();
          Swal.fire({
            icon: "error",
            title: "Image Load Failed",
            text: "Failed to load the image. Please try again.",
          });
        };
      } catch (error) {
        Swal.close();
        Swal.fire({
          icon: "error",
          title: "Upload Failed",
          text: "Failed to upload or update the image. Please try again later.",
        });
      }
    } else {
      Swal.fire({
        icon: "warning",
        title: "No Image Selected",
        text: "Please capture a photo before uploading.",
      });
    }
  };
  
  


  const handleShare = () => {
    if (window.navigator.share) {
      window.navigator
        .share({
          title: "Student Photo Update",
          text: `Check out the new student photo update for ${currentStudent?.name}!`,
          url: window.location.href,
        })
        .catch((error) => console.error("Error sharing:", error));
    } else {
      Swal.fire({
        icon: "info",
        title: "Share Feature",
        text: "Sharing is not supported on your device or browser.",
      });
    }
  };


  if (students.length === 0) {
    return (
      <div className="text-center mt-8 text-gray-600">
        <p>No students without photos.</p>
      </div>
    );
  }

  const currentStudent = students[currentStudentIndex];
  const upcomingStudents = students.slice(currentStudentIndex + 1, currentStudentIndex + 4);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 py-8">
      <div className="bg-white shadow-lg rounded-lg p-8 w-11/12 max-w-lg">
        <h2 className="text-3xl font-semibold text-center mb-6">{currentStudent?.name}</h2>
        <div className="flex justify-center mt-4 mb-6">
          <img src={currentStudent?.avatar.url} alt="" className="h-24 w-24 rounded-full border-4 border-gray-300" />
          <div className="ml-4 text-left">
            {currentStudent?.class && (
              <p className="text-lg font-medium">Class: {currentStudent?.class}</p>
            )}
            {currentStudent?.section && (
              <p className="text-lg font-medium">Section: {currentStudent?.section}</p>
            )}
          </div>
        </div>
        <p className="text-gray-600 text-center mb-6">School: {currentStudent?.school?.name}</p>

        <select
          onChange={handleAspectRatioChange}
          className="w-full p-3 mb-6 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          <option value="square">Square</option>
          <option value="passport">Passport</option>
        </select>

        <StudentPhotoCapture setCroppedPhoto={setCroppedPhoto} aspectRatio={aspectRatio} />

        {croppedPhoto && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold">Cropped Photo Preview:</h3>
            <img
              src={croppedPhoto}
              alt="Cropped Preview"
              className="mt-2 rounded-lg border-2 border-gray-300"
            />
            <button
              onClick={() => handleUpdatePhoto(currentStudent._id)}
              className="mt-6 w-full px-6 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition duration-300"
            >
              Update Photo
            </button>
          </div>
        )}

        <div className="mt-6">
          <h4 className="font-semibold">Upcoming Students:</h4>
          <ul>
            {upcomingStudents.map((student, index) => (
              <li key={index} className="text-gray-600">{student.name}</li>
            ))}
          </ul>
        </div>

        <div className="flex justify-between mt-8">
          <button
            onClick={handlePreviousStudent}
            className="w-28 px-6 py-2 bg-gray-600 text-white rounded-lg shadow-md hover:bg-gray-700 transition duration-300"
          >
            Previous
          </button>
          <button
            onClick={handleNextStudent}
            className="w-28 px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
          >
            Next
          </button>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={handleShare}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
          >
            Share
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDisplay;