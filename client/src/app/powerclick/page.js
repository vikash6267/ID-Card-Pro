"use client"

import { useState, useEffect, useRef } from "react"
import { Camera } from "react-camera-pro"
import Cropper from "react-cropper"
import "cropperjs/dist/cropper.css"

const StudentPhotoCapture = ({ setCroppedPhoto, aspectRatio }) => {
  const [photo, setPhoto] = useState(null)
  const [isCropModalOpen, setIsCropModalOpen] = useState(false)
  const cropperRef = useRef(null)
  const [cameraFacingMode, setCameraFacingMode] = useState("environment")
  const [isCameraAccessible, setIsCameraAccessible] = useState(true)
  const [cameraError, setCameraError] = useState(null)
  const cameraRef = useRef(null)

  useEffect(() => {
    const checkCameraAccess = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        stream.getTracks().forEach((track) => track.stop())
        setIsCameraAccessible(true)
        setCameraError(null)
      } catch (error) {
        setIsCameraAccessible(false)
        setCameraError(error.message)
        console.error("Camera access error:", error)
      }
    }

    checkCameraAccess()
  }, [])

  const handleCaptureClick = () => {
    if (cameraRef.current) {
      const imageSrc = cameraRef.current.takePhoto()
      setPhoto(imageSrc)
      setIsCropModalOpen(true)
    }
  }

  const handleCrop = () => {
    if (cropperRef.current && cropperRef.current.cropper) {
      const croppedDataUrl = cropperRef.current.cropper.getCroppedCanvas().toDataURL()
      setCroppedPhoto(croppedDataUrl)
      setIsCropModalOpen(false)
    }
  }

  const handleCameraSwitch = () => {
    setCameraFacingMode((prevMode) => (prevMode === "user" ? "environment" : "user"))
  }

  const handleCameraError = (error) => {
    console.error("Camera error:", error)
    setIsCameraAccessible(false)
    setCameraError(error.message)
  }

  if (!isCameraAccessible) {
    return (
      <div className="text-center mt-6 text-red-600">
        <p>Camera access is blocked or not available. Error: {cameraError}</p>
        <p>Please ensure your browser has camera permissions and try again.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
        >
          Retry Camera Access
        </button>
      </div>
    )
  }

  return (
    <div className="text-center mt-6">
      <Camera
        ref={cameraRef}
        aspectRatio={5 / 4}
        facingMode={cameraFacingMode}
        errorMessages={{
          noCameraAccessible: "No camera device accessible. Please connect your camera or try a different browser.",
          permissionDenied: "Permission denied. Please refresh and give camera permission.",
          switchCamera:
            "It is not possible to switch camera to different one because there is only one video device accessible.",
          canvas: "Canvas is not supported.",
        }}
        onError={handleCameraError}
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
  )
}

export default StudentPhotoCapture

