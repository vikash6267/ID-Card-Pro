import React, { useState } from "react";
import axios from "../../../../axiosconfig";

const DownloadPopup = ({
  onClose,
  schoolId,
  status,
  studentClass,
  section,
  course,
  currRole,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");

  const handleDownload = async (withQR) => {
    if (!schoolId) {
      setError("Please enter a valid School ID.");
      return;
    }
    if (!email) {
      setError("Please enter a valid Email ID.");
      return;
    }
    setError("");
    setLoading(true);
console.log( `/pdf/generate-pdf/${schoolId}/${email}?status=${status}&class=${studentClass}&section=${section}&course=${course}&withQR=${withQR}`,)
    try {
      const response = await axios.get(
        `/pdf/generate-pdf/${schoolId}/${email}?status=${status}&class=${studentClass}&section=${section}&course=${course}&withQR=${withQR}`,
        { responseType: "blob" } // Handle binary file download
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `ID_Cards_${schoolId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      setError("Failed to generate the PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h3 className="text-lg font-bold mb-4 text-center">Download Options</h3>

        <p className="text-sm mb-4">
          Enter your email address to receive the data. The data will be sent
          to your email within 4 hours.
        </p>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full border p-2 rounded mb-4"
        />

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <div className="flex flex-col space-y-2">
          <button
            onClick={() => handleDownload(true)} // Download with QR
            className={`bg-blue-500 text-white px-4 py-2 rounded ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Processing..." : "Download with QR"}
          </button>
          <button
            onClick={() => handleDownload(false)} // Download without QR
            className={`bg-green-500 text-white px-4 py-2 rounded ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Processing..." : "Download without QR"}
          </button>
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

export default DownloadPopup;