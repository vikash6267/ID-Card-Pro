'use client'
import React, { useState } from "react";

import axios from "../../../axiosconfig";
const App = () => {
  const [schoolId, setSchoolId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDownload = async () => {
    if (!schoolId) {
      setError("Please enter a valid School ID.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const response = await axios.get(`/pdf/generate-pdf/${schoolId}`, {
        responseType: "blob", // To handle binary file download
      });

      // Create a link to download the file
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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-4 text-center">ID Card Generator</h1>
        <div className="mb-4">
          <label htmlFor="schoolId" className="block text-sm font-medium text-gray-700">
            Enter School ID:
          </label>
          <input
            type="text"
            id="schoolId"
            value={schoolId}
            onChange={(e) => setSchoolId(e.target.value)}
            placeholder="Enter School ID"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <button
          onClick={handleDownload}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
          disabled={loading}
        >
          {loading ? "Generating PDF..." : "Download PDF"}
        </button>
      </div>
    </div>
  );
};

export default App;
