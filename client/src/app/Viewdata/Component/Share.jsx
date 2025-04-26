"use client"

import { useEffect, useState } from "react"
import { QRCodeCanvas } from "qrcode.react"

const SharePopup = ({ link, onClose, currSchool }) => {
  // Replace spaces with %20 for proper URL encoding
  const formattedLink = link.replace(/ /g, "%20")

  // State for permission checkboxes
  const [permissions, setPermissions] = useState({
    canEdit: true,
    canDelete: true,
    canMoveToReady: true,
    canShare: true,
  })

  // State for permission popup
  const [showPermissionPopup, setShowPermissionPopup] = useState(false)

  useEffect(() => {
    console.log("Formatted Link:", formattedLink)
  }, [formattedLink])

  // Function to add permissions to the link
  const getPermissionLink = () => {
    // Create a URL object to easily manipulate the parameters
    const url = new URL(formattedLink)
    const params = url.searchParams

    // Add permission parameters
    params.set("canEdit", permissions.canEdit ? "1" : "0")
    params.set("canDelete", permissions.canDelete ? "1" : "0")
    params.set("canMoveToReady", permissions.canMoveToReady ? "1" : "0")
    params.set("canShare", permissions.canShare ? "1" : "0")

    // Return the updated URL as a string
    return url.toString()
  }

  const handleShare = () => {
    // Show permission popup when share is clicked
    setShowPermissionPopup(true)
  }

  const handleShareWithPermissions = () => {
    // Close the permission popup
    setShowPermissionPopup(false)

    // Get the link with permissions
    const linkWithPermissions = getPermissionLink()
    console.log("Link with permissions:", linkWithPermissions)

    // Share the link with permissions
    if (navigator.share) {
      navigator
        .share({
          title: "Check this out!",
          text: "Here's the link:",
          url: linkWithPermissions,
        })
        .then(() => console.log("Shared successfully"))
        .catch((error) => console.error("Error sharing:", error))
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard
        .writeText(linkWithPermissions)
        .then(() => alert("Link copied to clipboard!"))
        .catch((err) => console.error("Could not copy text: ", err))
    }
  }

  const handleShare2 = (type) => {
    if (navigator.share) {
      navigator
        .share({
          title: "Check this out!",
          text: "Here's the link:",
          url: `https://cardpro.co.in/studentlogin?schoolid=${currSchool}&type=${type}`,
        })
        .then(() => console.log("Shared successfully"))
        .catch((error) => console.error("Error sharing:", error))
    } else {
      alert("Web Share API is not supported in this browser.")
    }
  }

  // Handle checkbox changes
  const handleCheckboxChange = (permission) => {
    setPermissions({
      ...permissions,
      [permission]: !permissions[permission],
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80 flex flex-col justify-center items-center z-50">
        <h3 className="text-lg font-bold mb-4">Share or QR Code</h3>
        <div className="mb-4 flex flex-col w-full">
          <p className="text-sm mb-2">Share this link:</p>
          <button onClick={handleShare} className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">
            Share
          </button>
          <button onClick={() => handleShare2("student")} className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">
            Student Login Share
          </button>
          <button onClick={() => handleShare2("staff")} className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">
            Staff Login Share
          </button>
        </div>
        <div className="relative">
          {/* QR Code with increased size */}
          <QRCodeCanvas
            value={getPermissionLink()} // Use the link with permissions for QR code
            size={180} // Increased size
            includeMargin={true} // Adds quiet zone
          />
          {/* Logo */}
          <div className="absolute inset-0 flex justify-center items-center">
            <img
              src="/login.jpg" // Replace with your logo path
              alt="Logo"
              className="w-10 h-10 bg-white p-1 rounded-full" // Reduced size and added padding
            />
          </div>
        </div>
        <button onClick={() => onClose(false)} className="mt-4 bg-gray-500 text-white px-4 py-2 rounded w-full">
          Close
        </button>
      </div>

      {/* Permission Popup */}
      {showPermissionPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[60]">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80 flex flex-col z-[60]">
            <h3 className="text-lg font-bold mb-4">Set Permissions</h3>
            <p className="text-sm mb-4">Select which permissions to grant:</p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="canEdit"
                  checked={permissions.canEdit}
                  onChange={() => handleCheckboxChange("canEdit")}
                  className="mr-2 h-4 w-4"
                />
                <label htmlFor="canEdit" className="text-sm">
                  Allow Edit
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="canDelete"
                  checked={permissions.canDelete}
                  onChange={() => handleCheckboxChange("canDelete")}
                  className="mr-2 h-4 w-4"
                />
                <label htmlFor="canDelete" className="text-sm">
                  Allow Delete
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="canMoveToReady"
                  checked={permissions.canMoveToReady}
                  onChange={() => handleCheckboxChange("canMoveToReady")}
                  className="mr-2 h-4 w-4"
                />
                <label htmlFor="canMoveToReady" className="text-sm">
                  Allow Move to Ready
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="canShare"
                  checked={permissions.canShare}
                  onChange={() => handleCheckboxChange("canShare")}
                  className="mr-2 h-4 w-4"
                />
                <label htmlFor="canShare" className="text-sm">
                  Allow Share
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowPermissionPopup(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded"
              >
                Cancel
              </button>
              <button onClick={handleShareWithPermissions} className="px-4 py-2 bg-blue-500 text-white rounded">
                Share
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SharePopup
