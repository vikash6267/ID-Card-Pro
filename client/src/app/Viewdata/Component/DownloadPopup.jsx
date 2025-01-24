import React, { useState } from "react";
import axios from "../../../../axiosconfig";
import Swal from "sweetalert2";
import { FaFileExport, FaImages } from "react-icons/fa";

const DownloadPopup = ({
  onClose,
  schoolId,
  status,
  studentClass,
  section,
  course,
  currRole,
  institute,
  staffType,

  user,
  schoolData,
  downloadExcel,
  downloadImages,
  downloadSignature,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDownload = async (withQR) => {
    if (!schoolId) {
      Swal.fire({
        icon: "error",
        title: "Invalid School ID",
        text: "Please enter a valid School ID.",
      });
      return;
    }

    Swal.fire({
      title: "Generating PDF...",
      text: "Please wait while we prepare your download.",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading(); // Show the loading spinner
      },
    });

    try {
      let response;

      if (currRole === "student") {
        response = await axios.get(
          `/pdf/generate-pdf/${schoolId}?status=${status}&class=${studentClass}&section=${section}&course=${course}&withQR=${withQR}`,
          { responseType: "blob" } // Handle binary file download
        );
      } else if (currRole === "staff") {
        response = await axios.get(
          `/pdf/generate-pdf/staffs/${schoolId}?status=${status}&staffType=${staffType}&institute=${institute}&withQR=${withQR}`,
          { responseType: "blob" } // Handle binary file download
        );
      }

      // Download the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `ID_Cards_${schoolId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Show success message
      Swal.fire({
        icon: "success",
        title: "Download Successful",
        text: `The PDF for School ID ${schoolId} has been downloaded.`,
      });
    } catch (err) {
      console.error(err);

      // Show error message
      Swal.fire({
        icon: "error",
        title: "Download Failed",
        text: "Failed to generate the PDF. Please try again.",
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h3 className="text-lg font-bold mb-4 text-center">Download Options</h3>

        {/* <p className="text-sm mb-4">
          Enter your email address to receive the data. The data will be sent
          to your email within 4 hours.
        </p> */}

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <div className="flex flex-col space-y-4">
          <button
            onClick={() => handleDownload(true)} // Download with QR
            className={`flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg shadow-lg ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Processing..." : "Download Proof QR"}
          </button>
          <button
            onClick={() => handleDownload(false)} // Download without QR
            className={`flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg shadow-lg ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Processing..." : "Download Proof Data"}
          </button>
          {/* Pending status */}
          {status === "Panding" && (
            <>
              {(user?.exportExcel || user?.school?.exportExcel) && (
                <button
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg shadow-lg"
                  onClick={downloadExcel}
                >
                  <FaFileExport /> Export Excel
                </button>
              )}
              {(user?.exportImage || user?.school?.exportImages) && (
                <button
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg shadow-lg"
                  onClick={downloadImages}
                >
                  <FaImages /> Export Images
                </button>
              )}
              {((currRole === "staff" &&
                schoolData?.requiredFieldsStaff.includes("Signature Name") &&
                user?.exportImage) ||
                user?.school?.exportImages) && (
                <button
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg shadow-lg"
                  onClick={downloadSignature}
                >
                  <FaImages /> Signature Download
                </button>
              )}
            </>
          )}

          {/* Ready to Print status */}
          {status === "Ready to print" && (
            <>
              {(user?.exportExcel || user?.school?.exportExcel) && (
                <button
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg shadow-lg"
                  onClick={downloadExcel}
                >
                  <FaFileExport /> Export Excel
                </button>
              )}
              {(user?.exportImage || user?.school?.exportImages) && (
                <button
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg shadow-lg"
                  onClick={downloadImages}
                >
                  <FaImages /> Export Images
                </button>
              )}
            </>
          )}

          {/* Printed status */}
          {status === "Printed" && (
            <>
              {(user?.exportExcel || user?.school?.exportExcel) && (
                <button
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg shadow-lg"
                  onClick={downloadExcel}
                >
                  <FaFileExport /> Export Excel
                </button>
              )}
              {(user?.exportImage || user?.school?.exportImages) && (
                <button
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg shadow-lg"
                  onClick={downloadImages}
                >
                  <FaImages /> Export Images
                </button>
              )}
            </>
          )}
          <button
            onClick={() => onClose(false)}
            className="mt-4 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg w-full shadow-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DownloadPopup;
