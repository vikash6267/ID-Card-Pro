"use client";
import React, { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { useSelector } from "react-redux";
import axios from "../../../axiosconfig";
import Swal from "sweetalert2";
import { FaFilePdf, FaDownload, FaSpinner, FaArrowRight } from "react-icons/fa";
import Nav from "../components/Nav";

function Page() {
  const { user } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]); // Stores raw data

  useEffect(() => {
    if (!user) redirect("/");
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const res = await axios.get("/user/userdata-raw", {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
      if (res.data.success) {
        setData(res.data.data);
      } else {
        Swal.fire("Error", "Failed to fetch data", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Something went wrong while fetching data", "error");
    }
  };

  const generatePdf = async () => {
    setLoading(true);
    Swal.fire({
      title: "Processing...",
      text: "Generating your Report, please wait.",
      didOpen: () => Swal.showLoading(),
      allowOutsideClick: false,
      showConfirmButton: false,
    });

    try {
      const response = await axios.get(`/user/userdata`, {
        responseType: "blob",
        headers: {
          Authorization: `${localStorage.getItem("token")}`,
        },
      });

      if (response.status === 200) {
        const blob = response.data;
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "user_school_report.xlsx";
        link.click();

        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Your Report has been generated successfully!",
          confirmButtonText: "Download Complete",
        });
      } else {
        Swal.fire("Error", "Error generating Report, please try again!", "error");
      }
    } catch (error) {
      console.error("Error generating Report:", error);
      Swal.fire("Oops...", "Something went wrong! Please try again later.", "error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Download Ready-to-print Students ZIP
  const handleDownload = async (schoolId, schoolName) => {
    if (!schoolId || !schoolName) return;

    try {
      Swal.fire({
        title: "Preparing download...",
        text: "Your Ready-to-Print student data is being prepared. Please wait.",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const response = await axios({
        url: `/user/zip/${schoolId}`,
        method: "GET",
        responseType: "blob",
        headers: {
          Authorization: `${localStorage.getItem("token")}`,
        },
        params: { status: "Ready to print" },
      });

      if (response.status === 200) {
        const blob = response.data;
        const link = document.createElement("a");
        const cleanName = schoolName.replace(/[\s,]+/g, "_");
        link.href = URL.createObjectURL(blob);
        link.download = `${cleanName}_ReadyToPrint_Students.zip`;
        link.click();
        URL.revokeObjectURL(link.href);

        Swal.fire({
          icon: "success",
          title: "Download started!",
          text: `${schoolName} Ready-to-Print student data is downloading.`,
          timer: 2500,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "Could not download the file. Try again later.",
        });
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong during download!",
      });
    }
  };

  // ✅ Move all Ready-to-print students → Printed
  const handleMoveToPrinted = async (schoolId, schoolName) => {
    if (!schoolId) return;

    Swal.fire({
      title: "Confirm Action",
      text: `Move all "Ready to print" students of ${schoolName} to "Printed"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Move All",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          Swal.fire({
            title: "Updating...",
            text: "Moving students to Printed status. Please wait.",
            didOpen: () => Swal.showLoading(),
            allowOutsideClick: false,
            showConfirmButton: false,
          });

          const res = await axios.put(
            `/user/student-all/change-status/printed/${schoolId}`,
            {}, // no body needed
            {
              headers: {
                Authorization: `${localStorage.getItem("token")}`,
              },
            }
          );

          if (res.data.success) {
            Swal.fire({
              icon: "success",
              title: "Updated!",
              text: res.data.message,
            });
            fetchData(); // refresh table
          } else {
            Swal.fire("Error", res.data.message || "Update failed", "error");
          }
        } catch (err) {
          console.error(err);
          Swal.fire("Error", "Something went wrong while updating!", "error");
        }
      }
    });
  };

  return (
    <>
      <Nav />
      <div className="mx-auto min-h-screen pt-[80px] py-10 px-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Distributor Panel
        </h2>

        {/* Generate Report Button */}
        <div className="flex justify-center mb-6">
          <button
            onClick={generatePdf}
            disabled={loading}
            className={`px-6 py-3 text-white font-semibold rounded-lg transition duration-300 flex items-center space-x-2 ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaFilePdf />}
            <span>{loading ? "Generating..." : "Generate Report"}</span>
          </button>
        </div>

        {/* Table */}
        <div className="border-t border-gray-300 pt-8 w-11/12 mx-auto">
          <h3 className="text-2xl font-semibold mb-4 text-center">User Data Raw</h3>

          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 rounded-lg">
              <thead className="bg-blue-500 text-white">
                <tr>
                  <th className="px-4 py-2 border">Actions</th>
                  <th className="px-4 py-2 border">School Name</th>
                  <th className="px-4 py-2 border">Ready to Print Students</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-4">
                      No data available
                    </td>
                  </tr>
                ) : (
                  data.map((school, idx) => (
                    <tr key={idx} className="text-center">
                      <td className="px-4 py-2 border flex justify-center gap-2">
                        {/* Download */}
                        <button
                          onClick={() => handleDownload(school._id, school.schoolName)}
                          className="px-3 py-1 text-white bg-blue-500 hover:bg-blue-600 rounded flex items-center space-x-1"
                        >
                          <FaDownload />
                          <span>Download</span>
                        </button>

                        {/* Move to Printed */}
                        <button
                          onClick={() => handleMoveToPrinted(school._id, school.schoolName)}
                          className="px-3 py-1 text-white bg-green-500 hover:bg-green-600 rounded flex items-center space-x-1"
                        >
                          <FaArrowRight />
                          <span>Move to Printed</span>
                        </button>
                      </td>

                      <td className="px-4 py-2 border">{school.schoolName}</td>
                      <td className="px-4 py-2 border">{school.readyToPrintStudents}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default Page;
