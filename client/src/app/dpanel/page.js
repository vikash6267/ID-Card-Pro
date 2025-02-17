"use client";
import React, { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { useSelector } from "react-redux";
import axios from "../../../axiosconfig";
import Swal from "sweetalert2";
import { FaFilePdf, FaDownload, FaSpinner } from "react-icons/fa"; // Importing icons
import Nav from "../components/Nav";

function Page() {  // Renamed from "page" to "Page"
  const { user } = useSelector((state) => state.user);

  useEffect(() => {
    if (!user) {
      redirect("/"); // This is commented out, you can uncomment if necessary
    }
  }, [user]);

  const [loading, setLoading] = useState(false);

  const generatePdf = async () => {
    setLoading(true);

    // Display processing message using SweetAlert2
    Swal.fire({
      title: "Processing...",
      text: "Generating your Report report, please wait.",
      didOpen: () => {
        Swal.showLoading(); // Show loading spinner
      },
      allowOutsideClick: false, // Prevent closing during processing
      showConfirmButton: false, // Hide confirm button while processing
    });

    try {
      // Make the GET request with Axios to fetch the PDF
      const response = await axios.get(`/user/userdata`, {
        responseType: "blob", // Set the response type to 'blob' to handle the PDF as binary data
        headers: {
          "Content-Type": "application/json", // Specify the content type as JSON
          Authorization: `${localStorage.getItem("token")}`, // Add token to Authorization header
        },
      });

      // Handle successful PDF generation
      if (response.status === 200) {
        const blob = response.data; // The PDF data is returned in the blob
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "user_school_report.xlsx"; // The name of the downloaded file
        link.click(); // Trigger the download

        // Success alert after downloading
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Your Report  has been generated successfully!",
          confirmButtonText: "Download Complete",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error generating Report, please try again!",
        });
      }
    } catch (error) {
      console.error("Error generating Report:", error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong! Please try again later.",
      });
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <>
      <Nav />

      <div className="mx-auto min-h-screen  rounded-lg shadow-lg text-center py-10  pt-[80px]">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Distributor Panel
        </h2>

        <div className="flex justify-center space-x-4">
          {/* PDF Generation Button with Icon */}
          <button
            onClick={generatePdf}
            disabled={loading}
            className={`px-6 py-3 text-white font-semibold rounded-lg transition duration-300 flex items-center space-x-2 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaFilePdf />}
            <span>{loading ? "Generating..." : "Generate Report"}</span>
          </button>
        </div>
      </div>
    </>
  );
}

export default Page;  // Renamed to "Page"
