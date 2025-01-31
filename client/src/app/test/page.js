'use client'
import React, { useState } from "react";
import axios from "axios";

const DownloadReport = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const downloadReport = async () => {
    setLoading(true);
    setError(null);

    try {
      const schoolId = "677b9d666e3f1249a8d43e29"; // Replace with dynamic school ID if needed

      const response = await axios.get(`http://localhost:4010/user/generate-report?schoolId=${schoolId}`, {
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
    } catch (error) {
      setError(error.response?.data?.message || "Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Download Student Report</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button
        onClick={downloadReport}
        disabled={loading}
        style={{
          padding: "10px 20px",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        {loading ? "Generating..." : "Download Report"}
      </button>
    </div>
  );
};

export default DownloadReport;
