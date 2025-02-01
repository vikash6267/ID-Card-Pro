import React, { useState } from "react";
import axios from "../../../../axiosconfig";
import Swal from "sweetalert2";

import { FaQrcode, FaFilePdf, FaFileExport, FaImages, FaSignature, FaTimes } from "react-icons/fa";

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

  const downloadReport = async () => {
    setLoading(true);

    Swal.fire({
      title: "Generating Report...",
      text: "Please wait while the report is being generated.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
  
      const response = await axios.get(`/user/generate-report?schoolId=${schoolId}&role=${currRole}`, {
        responseType: "blob", // Ensures the response is a file (PDF)
      });

      // Create blob URL for downloading
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "student_report.pdf"; // File name
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);

      Swal.fire({
        title: "Success!",
        text: "The report has been downloaded successfully.",
        icon: "success",
        confirmButtonColor: "#4CAF50",
      });

    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to generate report",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-gray-900 p-6 rounded-lg shadow-2xl w-96">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-700 pb-3">
        <h3 className="text-lg font-bold text-white text-center w-full">Download Options</h3>
        <button onClick={() => onClose(false)} className="text-gray-400 hover:text-red-400">
          <FaTimes size={20} />
        </button>
      </div>

      {/* Error Message */}
      {error && <p className="text-red-400 text-sm mt-4">{error}</p>}

      {/* Buttons Section */}
      <div className="flex flex-col space-y-4 mt-4">

        {/* Download QR */}
        <button
          onClick={() => handleDownload(true)}
          className={`flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg shadow-lg transition duration-200 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          <FaQrcode /> {loading ? "Processing..." : "Download Proof QR"}
        </button>

        {/* Download Report */}
        <button
          onClick={() => downloadReport()}
          className={`flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg shadow-lg transition duration-200 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          <FaFilePdf /> {loading ? "Generating..." : "Download Report"}
        </button>

        {/* Download Proof Data */}
        <button
          onClick={() => handleDownload(false)}
          className={`flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg shadow-lg transition duration-200 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          <FaFilePdf /> {loading ? "Processing..." : "Download Proof Data"}
        </button>

        {/* Conditional Exports */}
        {(status === "Panding" || status === "Ready to print" || status === "Printed") && (
          <>
            {(user?.exportExcel || user?.school?.exportExcel) && (
              <button
                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg shadow-lg transition duration-200"
                onClick={downloadExcel}
              >
                <FaFileExport /> Export Excel
              </button>
            )}
            {(user?.exportImage || user?.school?.exportImages) && (
              <button
                className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg shadow-lg transition duration-200"
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
                className="flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded-lg shadow-lg transition duration-200"
                onClick={downloadSignature}
              >
                <FaSignature /> Signature Download
              </button>
            )}
          </>
        )}

        {/* Close Button */}
        <button
          onClick={() => onClose(false)}
          className="mt-4 bg-gray-700 hover:bg-gray-800 text-white py-2 px-4 rounded-lg w-full shadow-lg transition duration-200"
        >
          Close
        </button>

      </div>
    </div>
  </div>
  );
};

export default DownloadPopup;
