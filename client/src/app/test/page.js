'use client'
import React, { useState } from 'react';

import axios from '../../../axiosconfig';
const UserSchoolPdf = ({ userId }) => {
  const [loading, setLoading] = useState(false);

  const generatePdf = async () => {
    setLoading(true);

    try {
      // Make the GET request with Axios to fetch the PDF
      const response = await axios.get(`/user/userdata`, {
        responseType: 'blob', // Set the response type to 'blob' to handle the PDF as binary data
        headers: {
          "Content-Type": "application/json", // Specify the content type as JSON
          "Authorization": `${localStorage.getItem("token")}`, // Add token to Authorization header
        },
      });

      // Handle successful PDF generation
      if (response.status === 200) {
        const blob = response.data; // The PDF data is returned in the blob
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'user_school_report.xlsx'; // The name of the downloaded file
        link.click(); // Trigger the download
      } else {
        alert("Error generating PDF");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>User School Report</h2>
      <p>Generate a PDF report for this user's schools.</p>
      <button 
        onClick={generatePdf} 
        disabled={loading} 
        style={{ padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px' }}
      >
        {loading ? 'Generating...' : 'Generate PDF'}
      </button>
    </div>
  );
};

export default UserSchoolPdf;
