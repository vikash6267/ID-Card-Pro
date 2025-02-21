import React, { useState } from "react";
import Swal from "sweetalert2";
import axios from "../../../axiosconfig";

function SignatureUpload({ currRole,currSchool }) {
  const [selectedPhotos, setSelectedPhotos] = useState([]);

  const handlePhotoFileSelect = (e) => {
    e.preventDefault();
    const files = Array.from(e.target.files); // Convert FileList to an array
    setSelectedPhotos((prevPhotos) => [...prevPhotos, ...files]); // Update state
    console.log([...selectedPhotos, ...files]);
  };

  const fetchStudentAndStaffCount = async (schoolId) => {
    try {
      const [studentCountResponse, staffCountResponse] = await Promise.all([
        axios.get(`/user/students/count/${schoolId}`),
        axios.get(`/user/staff/count/${schoolId}`),
      ]);

      if (
        studentCountResponse.data.success &&
        staffCountResponse.data.success
      ) {
        return {
          studentCount: studentCountResponse.data.studentCount,
          staffCount: staffCountResponse.data.staffCount,
        };
      } else {
        throw new Error("Failed to fetch counts");
      }
    } catch (error) {
      console.error("Error fetching counts:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while fetching the counts. Please try again.",
        timer: 5000,
        timerProgressBar: true,
      });
      return null;
    }
  };

  const handleSubmitnowfuntiion = async (event) => {
    event.preventDefault();

    const processingTimePerPhoto = 2000; // 2 seconds per photo
    const totalPhotos = selectedPhotos.length;
    const totalProcessingTime = (totalPhotos * processingTimePerPhoto) / 1000; // in seconds

    const counsAll = await fetchStudentAndStaffCount(currSchool);
    console.log(selectedPhotos.length);

    // Check for staff role
    if (currRole === "staff" && counsAll.staffCount < totalPhotos) {
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: `Please Add Staff First. Current Staff Count is ${counsAll.staffCount}`,
        allowOutsideClick: false,
      });
      setSelectedPhotos([]);
      return;
    }

    // Inform the user about the estimated time
    Swal.fire({
      title: "Uploading Signature...",
      text: `Estimated time to complete: ${totalProcessingTime} seconds. Please wait.`,
      allowOutsideClick: false,
      showConfirmButton: false, // Remove the "OK" button here as well
    });

    const formData = new FormData();
    selectedPhotos.forEach((file) => {
      formData.append("file", file);
    });

    try {
      for (let index = 0; index < selectedPhotos.length; index++) {
        const file = selectedPhotos[index];
        const singleFormData = new FormData();
        singleFormData.append("file", file);

        if (currRole === "staff") {
          await axios.post(
            `/user/staff/signature/${currSchool}`,
            singleFormData,
            {
              withCredentials: true,
              headers: {
                "Content-Type": "multipart/form-data",
                authorization: `${localStorage.getItem("token")}`,
              },
            }
          );
        }

        // Simulate server processing delay
        await new Promise((resolve) =>
          setTimeout(resolve, processingTimePerPhoto)
        );

        // Update Swal with remaining time
        const remainingTime =
          ((totalPhotos - index - 1) * processingTimePerPhoto) / 1000; // in seconds
        Swal.update({
          text: `Processing Signature ${
            index + 1
          } of ${totalPhotos}. Estimated time left: ${remainingTime} seconds.`,
          allowOutsideClick: false,
          showConfirmButton: false, // Remove the "OK" button here as well
        });
      }

      // All photos uploaded successfully
      Swal.fire({
        icon: "success",
        title: "Upload Signature Successful",
        text: "All Signature uploaded successfully.",
        allowOutsideClick: false,
      });
      setSelectedPhotos([]);
    } catch (error) {
      console.error("Error uploading Signature:", error);
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: "Failed to upload Signature. Please try again.",
        allowOutsideClick: false,
      });
    }
  };

  return (
    <div>
      {" "}
      <form className="mt-6 w-full max-w-md" onSubmit={handleSubmitnowfuntiion}>
        <label
          htmlFor="dropzone-file-staff"
          className="flex items-center px-3 py-3 mx-auto mt-6 text-center border-2 border-dashed rounded-lg cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
          <h2 className="mx-3 text-gray-400">Staff Signature</h2>
          <input
            id="dropzone-file-staff"
            type="file"
            className="hidden"
            multiple
            onChange={handlePhotoFileSelect}
          />
        </label>
        {selectedPhotos?.length !== 0 && (
          <div className="mt-6">
            <button className="w-full px-6 py-3 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-50">
            Upload Signature
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

export default SignatureUpload;
