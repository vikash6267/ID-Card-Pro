import React, { useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";

const SharePopup = ({ link, onClose,currSchool }) => {
  // Replace spaces with %20 for proper URL encoding
  const formattedLink = link.replace(/ /g, "%20");

  useEffect(() => {
    console.log("Formatted Link:", formattedLink);
  }, [formattedLink]);

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: "Check this out!",
          text: "Here's the link:",
          url: formattedLink,
        })
        .then(() => console.log("Shared successfully"))
        .catch((error) => console.error("Error sharing:", error));
    } else {
      alert("Web Share API is not supported in this browser.");
    }
  };


  const handleShare2 = (type) => {
    if (navigator.share) {
      navigator
        .share({
          title: "Check this out!",
          text: "Here's the link:",
          url: `https://cardpro.co.in/studentlogin?schoolid=${currSchool}&type=${type}`,
        })
        .then(() => console.log("Shared successfully"))
        .catch((error) => console.error("Error sharing:", error));
    } else {
      alert("Web Share API is not supported in this browser.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80 flex flex-col justify-center items-center z-50">
        <h3 className="text-lg font-bold mb-4">Share or QR Code</h3>
        <div className="mb-4 flex flex-col">
          <p className="text-sm mb-2">Share this link:</p>
          <button
            onClick={handleShare}
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Share
          </button>
          <button
            onClick={()=>handleShare2("student")}
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
          >
           Student Login Share
          </button>
          <button
               onClick={()=>handleShare2("student")}
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
          >
           Staff Login Share
          </button>
        </div>
        <div className="relative">
            {/* QR Code with increased size */}
            <QRCodeCanvas
              value={formattedLink}
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
        <button
          onClick={() => onClose(false)}
          className="mt-4 bg-gray-500 text-white px-4 py-2 rounded w-full"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default SharePopup;
