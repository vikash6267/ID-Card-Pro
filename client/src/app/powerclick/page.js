'use client'
import React, { useState, useRef, useEffect } from "react";

const StudentPhotoCapture = ({ setCroppedPhoto, aspectRatio }) => {
  const [photo, setPhoto] = useState(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Start the camera stream on component mount
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
        });
        videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Error accessing webcam:", err);
      }
    };

    startCamera();

    // Cleanup on component unmount
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

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
    // Here you can implement any crop logic if required
    // For now, we’ll directly set the cropped image as the final image
    setCroppedPhoto(photo);
    setIsCropModalOpen(false);
  };

  return (
    <div className="text-center mt-6">
      {/* Video element to show the webcam feed */}
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
      </div>

      {/* Canvas for capturing the photo */}
      <canvas ref={canvasRef} style={{ display: "none" }}></canvas>

      {/* Modal for cropping */}
      {isCropModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg w-11/12 max-w-md">
            <h3 className="text-2xl font-semibold mb-6 text-center">Crop Your Photo</h3>
            <img src={photo} alt="Captured" className="w-full h-auto rounded border" />
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

export default StudentPhotoCapture;
