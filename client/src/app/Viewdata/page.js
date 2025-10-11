"use client";
import React, { useEffect, useState } from "react";
import Nav from "../components/Nav";
import { useSelector } from "react-redux";
import axios from "../../../axiosconfig";
import JSZip from "jszip";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { redirect, useRouter } from "next/navigation";
import Image from "next/image";
import Swal from "sweetalert2";
import { FaEdit, FaTrashAlt, FaUndo } from "react-icons/fa";
import { FaSearch } from "react-icons/fa";
import {
  FaFileExport,
  FaImages,
  FaCheck,
  FaArrowLeft,
  FaUserCheck,
  FaUserTimes,
  FaShareAlt,
} from "react-icons/fa";
import { HiDuplicate } from "react-icons/hi";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

import Pagination from "@/component/Pagination";
import Link from "next/link";
import SharePopup from "./Component/Share";
import DownloadPopup from "./Component/DownloadPopup";
import { MdChangeHistory } from "react-icons/md";

const Viewdata = () => {
  const { user, schools, error } = useSelector((state) => state.user);
  const [currRole, setCurrRole] = useState("");
  const [status, setstatus] = useState("");
  const [submitted, setsubmited] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [students, setstudents] = useState(null);
  const [staffs, setstaffs] = useState(null);
  const [showChatBox, setShowChatBox] = useState(false);
  const [studentIds, setStudentIds] = useState([]);
  const [staffIds, setStaffIds] = useState([]);
  const [showFilterBox, setShowFilterBox] = useState(false);
  const [currSchool, setCurrSchool] = useState("");
  const [loginSchool, setloginSchool] = useState(false);
  const [schoolData, setSchoolData] = useState(null);
  const [classValue, setClassValue] = useState("");
  const [sectionValue, setSectionValue] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setError] = useState("");
  const [pagination, setPagination] = useState({
    totalStudents: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 500,
  });
  const [showPopup, setShowPopup] = useState(false);
  const [showDownload, setShowDownload] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [className, setClassname] = useState([]);
  const [sections, setSections] = useState([]);
  const [sectionValueSearch, setSectionValueSearch] = useState([]);
  const [classNameValue, setclassNameValue] = useState("");

  // Course for
  const [unqiueCourse, setUnqiueCourse] = useState([]);
  const [courseValueSearch, setCourseValueSearch] = useState([]);

  // Staff Type for
  const [unqiueStaff, setUnqiueStaff] = useState([]);
  const [staffValueSearch, setValueStaff] = useState("");
  // Staff In for
  const [unqiueStaffInsi, setUnqiueStaffInsi] = useState([]);
  const [staffValueSearchInsi, setValueStaffInsi] = useState("");

  const [studentData, setStudentData] = useState([]);
  const [staffData, setStaffData] = useState([]);

  const [statusCount, setSatusCount] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);

  const resetState = () => {
    setstudents([]);
    setStudentData([]);
    setstaffs([]);
    setStaffData([]);
  };

  useEffect(() => {
    console.log(user);
    if (!user) {
      redirect("/");
    }
    if (user?.role == "school") {
      const schoolId = user?.school?._id;

      if (schoolId) {
        // Fetch school data by schoolId from backend
        axios
          .get(`user/getschool/${schoolId}`)
          .then((response) => {
            setSchoolData(response.data.data);
            const studentCountByStatus = response.data.studentCountByStatus;
            const staffCountByStatus = response.data.staffCountByStatus;

            if (true) {
              // Check if student data exists, else use staff data
              if (studentCountByStatus && studentCountByStatus.length > 0) {
                setSatusCount(studentCountByStatus);
                setCurrRole("student");
                setShowDeleted(false)
                // Map to extract statuses for students
                const studentStatuses = studentCountByStatus.map(
                  (item) => item._id
                );

                // Set status based on available statuses for students
                if (studentStatuses.includes("Panding")) {
                  setstatus("Panding");
                } else if (studentStatuses.includes("Ready to print")) {
                  setstatus("Ready to print");
                } else if (studentStatuses.includes("Printed")) {
                  setstatus("Printed");
                } else {
                  setstatus("Panding"); // Default to "Pending"
                }
              } else if (staffCountByStatus && staffCountByStatus.length > 0) {
                setSatusCount(staffCountByStatus);
                setCurrRole("staff");
                setShowDeleted(false)
                // Map to extract statuses for staff
                const staffStatuses = staffCountByStatus.map(
                  (item) => item._id
                );

                // Set status based on available statuses for staff
                if (staffStatuses.includes("Panding")) {
                  setstatus("Panding");
                } else if (staffStatuses.includes("Ready to print")) {
                  setstatus("Ready to print");
                } else if (staffStatuses.includes("Printed")) {
                  setstatus("Printed");
                } else {
                  setstatus("Panding"); // Default to "Pending"
                }
              } else {
                // If no student or staff data, default to student and Pending
                setSatusCount(studentCountByStatus); // Set status count to student data, if available
                setCurrRole("student");
                setstatus("Panding"); // Default to "Pending" if no data is found
              }
            }
          })
          .catch((err) => {
            console.log("Error fetching Vendor data"); // Handle error if request fails
          });
      }

      setCurrSchool(user?.school?._id);
      setloginSchool(true);
    }
  }, [user]);

  // Function to handle selection of a student
  const handleStudentSelect = (studentId) => {
    // Check if the studentId is already in the array
    if (studentIds.includes(studentId)) {
      // If yes, remove it from the array
      setStudentIds(studentIds.filter((id) => id !== studentId));
    } else {
      // If not, add it to the array
      console.log(studentIds);
      setStudentIds([...studentIds, studentId]);
    }
  };

  const handleStaffSelect = (staffId) => {
    // Check if the studentId is already in the array
    if (staffIds.includes(staffId)) {
      // If yes, remove it from the array
      setStaffIds(staffIds.filter((id) => id !== staffId));
    } else {
      // If not, add it to the array
      setStaffIds([...staffIds, staffId]);
    }
  };

  const config = () => {
    return {
      headers: {
        authorization: localStorage.getItem("token") || "", // Ensure token is always a string
      },
      withCredentials: true,
    };
  };

  const modeToPending = async (e) => {
    e.preventDefault();
    if (currRole == "student") {
      const response = await axios.post(
        `/user/student/change-status/pending/${currSchool}?`,
        { studentIds },
        config()
      );
      handleFormSubmit(e);
      setStudentIds([]);
      setStaffIds([]);
    }
    if (currRole == "staff") {
      const response = await axios.post(
        `/user/staff/change-status/pending/${currSchool}?`,
        { staffIds },
        config()
      );
      handleFormSubmit(e);
      setStudentIds([]);
      setStaffIds([]);
    }
  };

  const modeToReadytoprint = async (e) => {
    e.preventDefault();
    try {
      let response;
      let successMessage = "";
      let skippedMessage = "";

      Swal.fire({
        title: "Processing...",
        text: "Please wait while the status is being updated.",
        icon: "info",
        showCancelButton: false,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      if (currRole === "student") {
        response = await axios.post(
          `/user/student/change-status/readyto/${currSchool}?`,
          { studentIds },
          config()
        );
        setStudentIds([]);
        setStaffIds([]);
        successMessage = "Student status has been updated.";
      } else if (currRole === "staff") {
        response = await axios.post(
          `/user/staff/change-status/readyto/${currSchool}?`,
          { staffIds },
          config()
        );
        setStudentIds([]);
        setStaffIds([]);
        successMessage = "Staff status has been updated.";
      }

      Swal.close(); // Close loading alert

      if (response?.data?.success) {
        Swal.fire({
          title: "Success!",
          text: response.data.message || successMessage,
          icon: "success",
          confirmButtonText: "OK",
        });
      }

      if (response?.data?.skippedStudents?.length > 0) {
        skippedMessage = response.data.skippedStudents
          .map(
            (student) => `<b>${student.name}:</b> ${student.reason.join(", ")}`
          )
          .join("<br>");

        Swal.fire({
          title: "Some Entries Were Skipped!",
          html: skippedMessage,
          icon: "warning",
          confirmButtonText: "OK",
        });
      }

      handleFormSubmit(e);
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Something went wrong!",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const modeToPrinted = async (e) => {
    e.preventDefault();
    if (currRole == "student") {
      const response = await axios.post(
        `/user/student/change-status/printed/${currSchool}?`,
        { studentIds },
        config()
      );
      handleFormSubmit(e);
      setStudentIds([]);
      setStaffIds([]);
    }
    if (currRole == "staff") {
      const response = await axios.post(
        `/user/staff/change-status/printed/${currSchool}?`,
        { staffIds },
        config()
      );
      handleFormSubmit(e);
      setStudentIds([]);
      setStaffIds([]);
    }
  };

  const setPage = (page) => {
    // Ensure that the page is within the valid range
    if (page >= 1 && page <= pagination.totalPages) {
      setPagination({ ...pagination, currentPage: page });
    }
  };

  useEffect(() => {
    if (currRole && currSchool && status) {
      handleFormSubmit(false);
    }
  }, [pagination.currentPage, pagination.pageSize]);

  useEffect(() => {
    if (currRole && currSchool && status) {
      setPagination({
        totalStudents: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 50,
      });
      handleFormSubmit(false);
    }
  }, [
    currRole,
    currSchool,
    status,
    classNameValue,
    sectionValueSearch,
    courseValueSearch,
    staffValueSearch,
    staffValueSearchInsi,
    showDeleted
  ]);

  const handleSchoolSelect = (e) => {
    if (e.target.value === "") {
      return;
    }
    console.log(e.target.value);
    setCurrSchool(e.target.value);
    const schoolId = e.target.value;
    if (schoolId) {
      // Fetch school data by schoolId from backend
      axios
        .get(`user/getschool/${schoolId}`)
        .then((response) => {
          setSchoolData(response.data.data);
          const studentCountByStatus = response.data.studentCountByStatus;
          const staffCountByStatus = response.data.staffCountByStatus;

          if (true) {
            // Check if student data exists, else use staff data
            if (studentCountByStatus && studentCountByStatus.length > 0) {
              setSatusCount(studentCountByStatus);
              setCurrRole("student");

              // Map to extract statuses for students
              const studentStatuses = studentCountByStatus.map(
                (item) => item._id
              );

              // Set status based on available statuses for students
              if (studentStatuses.includes("Panding")) {
                setstatus("Panding");
              } else if (studentStatuses.includes("Ready to print")) {
                setstatus("Ready to print");
              } else if (studentStatuses.includes("Printed")) {
                setstatus("Printed");
              } else {
                setstatus("Panding"); // Default to "Pending"
              }
            } else if (staffCountByStatus && staffCountByStatus.length > 0) {
              setSatusCount(staffCountByStatus);
              setCurrRole("staff");
              setShowDeleted(false)
              // Map to extract statuses for staff
              const staffStatuses = staffCountByStatus.map((item) => item._id);

              // Set status based on available statuses for staff
              if (staffStatuses.includes("Panding")) {
                setstatus("Panding");
              } else if (staffStatuses.includes("Ready to print")) {
                setstatus("Ready to print");
              } else if (staffStatuses.includes("Printed")) {
                setstatus("Printed");
              } else {
                setstatus("Panding"); // Default to "Pending"
              }
            } else {
              // If no student or staff data, default to student and Pending
              setSatusCount(studentCountByStatus); // Set status count to student data, if available
              setCurrRole("student");
              setstatus("Panding"); // Default to "Pending" if no data is found
            }
          }
        })
        .catch((err) => {
          console.log("Error fetching Vendor data"); // Handle error if request fails
        });
    }
    setclassNameValue("");
    setCourseValueSearch("");
    setSectionValueSearch("");
    setValueStaff("");
    setValueStaffInsi("");
    setSearchQuery("");
    setPagination({
      totalStudents: 0,
      totalPages: 0,
      currentPage: 1,
      pageSize: 50,
    });
    console.log("Selected Vendor:", e.target.value);
  };

  // Function to toggle chat box visibility
  const toggleChatBox = () => {
    setShowChatBox(!showChatBox);
  };

  const handleFormSubmit = async (e) => {
    if (e) e.preventDefault();
    setSatusCount([]);
    setLoading(true); // Start the loading spinner
    resetState(); // Reset state for students and staff

    try {
      // Determine endpoint and error messages dynamically based on role
      const isStudent = currRole === "student";
      const endpoint = isStudent
        ? `/user/students/${currSchool}?status=${status}&page=${pagination.currentPage}&limit=${pagination.pageSize}&search=${searchQuery}&studentClass=${classNameValue}&section=${sectionValueSearch}&course=${courseValueSearch}&showDelete=${showDeleted}`
        : `/user/staffs/${currSchool}?status=${encodeURIComponent(status)}&staffType=${encodeURIComponent(staffValueSearch)}&institute=${encodeURIComponent(staffValueSearchInsi)}&search=${encodeURIComponent(searchQuery)}&page=${pagination.currentPage}&limit=${pagination.pageSize}`;

      const noDataMessage = isStudent
        ? "No students found for the provided school ID"
        : "No staff found for the provided school ID";
      const toastMessage = isStudent
        ? "No Students Added In This Vendor"
        : "No Staff Member Added In This Vendor";

      // Make the API request
      const response = await axios.post(endpoint, null, config());
      console.log(response.data);
      // Handle "No data found" scenario
      if (response?.data?.message === noDataMessage) {
        // toast.error(toastMessage, {
        //   position: "top-right",
        //   autoClose: 5000,
        //   hideProgressBar: false,
        //   closeOnClick: true,
        //   pauseOnHover: true,
        //   draggable: true,
        //   progress: undefined,
        // });
        setError("No Record Found");
        setsubmited(true); // Mark form as submitted

        setSatusCount(response.data.staffCountByStatus || []);

        resetState(); // Reset state again for safety
        return;
      }

      // Update state based on role
      if (isStudent) {
        setstudents(response?.data?.students || []);
        setPagination({
          ...pagination,
          totalStudents: response?.data?.pagination?.totalStudents || 0,
          totalPages: response?.data?.pagination?.totalPages || 0,
        });
        setStudentData(response?.data?.students || []);
        console.log(response?.data);
        setClassname(response?.data?.uniqueStudents || []);
        setSections(response?.data?.uniqueSection || []);
        setUnqiueCourse(response?.data?.uniqueCourse || []);
        setSatusCount(response.data.staffCountByStatus || []);
      } else {
        setstaffs(response?.data?.staff || []);
        console.log(response?.data?.staff);
        setPagination({
          ...pagination,
          totalStudents: response?.data?.pagination?.totalStudents || 0,
          totalPages: response?.data?.pagination?.totalPages || 0,
        });
        setSatusCount(response?.data?.staffCountByStatus || []);
        console.log(statusCount);
        console.log(response.data.staffCountByStatus);
        setStaffData(response?.data?.staff || []);
        console.log(response?.data?.staffTypes);
        setUnqiueStaff(response?.data?.staffTypes || []);
        setUnqiueStaffInsi(response?.data?.instituteUni || []);
      }
      setsubmited(true); // Mark form as submitted
    } catch (error) {
      console.error("Error during API request:", error);
      toast.error("An error occurred while processing your request.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      resetState(); // Reset state on error
    } finally {
      setLoading(false); // End the loading spinner
    }
  };

  // Helper function to reset state

  // const downloadExcel = async () => {
  //   try {
  //     if (currRole == "student") {
  //       try {
  //         const response = await axios.get(
  //           `/user/excel/data/${currSchool}?status=${status}`,
  //           {
  //             headers: {
  //               authorization: `${localStorage.getItem("token")}`,
  //             },
  //             responseType: "blob", // Set response type to blob for file download
  //           }
  //         );
  //         const contentDisposition = response.headers["content-disposition"];

  //         let filename = "Student_Data.xlsx";
  //         if (contentDisposition) {
  //           // Regular expression se filename extract karna
  //           const filenameMatch =
  //             contentDisposition.match(/filename="?([^"]+)"?/);
  //           filename = filenameMatch
  //             ? filenameMatch[1]
  //             : "default_filename.xlsx";

  //           console.log(filename); // Output: Test_staff.xlsx
  //         } else {
  //           console.log("Filename not found in headers");
  //         }

  //         const url =
  //           window.URL.createObjectURL(new Blob([response.data])) || null;
  //         const link = document.createElement("a");
  //         link.href = url;
  //         link.setAttribute("download", filename);
  //         document.body.appendChild(link);
  //         link.click();
  //       } catch (error) {
  //         toast.error("Error downloading Excel file:", {
  //           position: "top-right",
  //           autoClose: 5000,
  //           hideProgressBar: false,
  //           closeOnClick: true,
  //           pauseOnHover: true,
  //           draggable: true,
  //           progress: undefined,
  //         });
  //       }
  //     }
  //     if (currRole == "staff") {
  //       try {
  //         console.log("Hello");
  //         const response = await axios.get(
  //           `/user/staff/excel/data/${currSchool}?status=${status}`,
  //           {
  //             headers: {
  //               authorization: `${localStorage.getItem("token")}`,
  //             },
  //             responseType: "blob", // Set response type to blob for file download
  //           }
  //         );
  //         const contentDisposition = response.headers["content-disposition"];

  //         let filename = "Staff.xlsx";
  //         if (contentDisposition) {
  //           // Regular expression se filename extract karna
  //           const filenameMatch =
  //             contentDisposition.match(/filename="?([^"]+)"?/);
  //           filename = filenameMatch
  //             ? filenameMatch[1]
  //             : "default_filename.xlsx";

  //           console.log(filename); // Output: Test_staff.xlsx
  //         } else {
  //           console.log("Filename not found in headers");
  //         }

  //         const url =
  //           window.URL.createObjectURL(new Blob([response.data])) || null;
  //         const link = document.createElement("a");
  //         link.href = url;
  //         link.setAttribute("download", filename);
  //         document.body.appendChild(link);
  //         link.click();
  //       } catch (error) {
  //         toast.error("Error downloading Excel file:", {
  //           position: "top-right",
  //           autoClose: 5000,
  //           hideProgressBar: false,
  //           closeOnClick: true,
  //           pauseOnHover: true,
  //           draggable: true,
  //           progress: undefined,
  //         });
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error downloading Excel file:", error);
  //   }
  // };


  const downloadExcel = async () => {
    try {
      if (currRole === "student") {
        const { value: idOption } = await Swal.fire({
          title: "Download Excel",
          text: "Do you want to download with ID?",
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "With ID",
          cancelButtonText: "Without ID",
        });

        // Agar user "With ID" choose kare toh idPresent = "yes" warna null
        const idPresent = idOption ? "yes" : undefined;

        try {
          const response = await axios.get(
            `/user/excel/data/${currSchool}?status=${status}&idPresent=${idPresent}`,
            {
              headers: {
                authorization: `${localStorage.getItem("token")}`,
              },
              responseType: "blob", // File download ke liye responseType blob hona chahiye
            }
          );

          const contentDisposition = response.headers["content-disposition"];
          let filename = "Student_Data.xlsx";

          if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
            filename = filenameMatch ? filenameMatch[1] : "default_filename.xlsx";
          }

          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", filename);
          document.body.appendChild(link);
          link.click();
        } catch (error) {
          Swal.fire("Error!", "Error downloading Excel file.", "error");
        }
      }

      if (currRole === "staff") {
        try {
          const response = await axios.get(
            `/user/staff/excel/data/${currSchool}?status=${status}`,
            {
              headers: {
                authorization: `${localStorage.getItem("token")}`,
              },
              responseType: "blob",
            }
          );

          const contentDisposition = response.headers["content-disposition"];
          let filename = "Staff.xlsx";

          if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
            filename = filenameMatch ? filenameMatch[1] : "default_filename.xlsx";
          }

          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", filename);
          document.body.appendChild(link);
          link.click();
        } catch (error) {
          Swal.fire("Error!", "Error downloading Excel file.", "error");
        }
      }
    } catch (error) {
      console.error("Error downloading Excel file:", error);
    }
  };


  const downloadImages = async () => {
    try {
      // Show SweetAlert2 loading popup
      const swalInstance = Swal.fire({
        title: "Downloading...",
        text: "Please wait while the avatars are being downloaded.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading(); // Show loading spinner
        },
      });

      let response;

      if (currRole == "student") {
        response = await axios.post(
          `/user/student/images/${currSchool}`,
          { status },
          {
            ...config(),
            responseType: "blob", // Ensure response is a blob
          }
        );
      }
      if (currRole == "staff") {
        response = await axios.post(
          `/user/staff/images/${currSchool}`,
          { status },
          {
            ...config(),
            responseType: "blob", // Ensure response is a blob
          }
        );
      }

      // Extract filename from response headers
      const contentDisposition = response.headers["content-disposition"];
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : "avatars.zip";

      // Create and trigger download of the ZIP file
      const blob = new Blob([response.data], { type: "application/zip" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Close the SweetAlert2 loading popup after successful download
      Swal.fire({
        icon: "success",
        title: "Download Complete",
        text: `The avatars have been successfully downloaded as ${filename}`,
      });
    } catch (error) {
      // Handle error and show SweetAlert2 error popup
      console.error("Error downloading avatars:", error);
      Swal.fire({
        icon: "error",
        title: "Download Failed",
        text: "An error occurred while downloading the avatars.",
      });
    }
  };

  const downloadSignature = async () => {
    try {
      // Show SweetAlert2 loading popup
      const swalInstance = Swal.fire({
        title: "Downloading...",
        text: "Please wait while the avatars are being downloaded.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading(); // Show loading spinner
        },
      });

      let response;

      if (currRole == "staff") {
        response = await axios.post(
          `/user/staff/signatureNew/${currSchool}`,
          { status },
          {
            ...config(),
            responseType: "blob", // Ensure response is a blob
          }
        );
      }

      // Extract filename from response headers
      const contentDisposition = response.headers["content-disposition"];
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : "avatars.zip";

      // Create and trigger download of the ZIP file
      const blob = new Blob([response.data], { type: "application/zip" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Close the SweetAlert2 loading popup after successful download
      Swal.fire({
        icon: "success",
        title: "Download Complete",
        text: `The avatars have been successfully downloaded as ${filename}`,
      });
    } catch (error) {
      // Handle error and show SweetAlert2 error popup
      console.error("Error downloading avatars:", error);
      Swal.fire({
        icon: "error",
        title: "Download Failed",
        text: "An error occurred while downloading the avatars.",
      });
    }
  };
  const redirectToStudentEdit = (id) => {
    router.push(`/Viewdata/edit/${id}`);
  };

  const deleteStudent = async (id) => {
    // Show loading Swal
    Swal.fire({
      title: "Deleting...",
      text: "Please wait while the student is being deleted.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      // Perform the delete request
      const response = await axios.post(
        `/user/delete/student/${id}?`,
        {},
        config()
      );

      // Handle success
      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "The student was successfully deleted.",
          confirmButtonText: "OK",
        });
      }

      handleFormSubmit();
    } catch (error) {
      // Handle error
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to delete the student. Please try again later.",
        confirmButtonText: "OK",
      });
    }
  };
  const deleteStaff = async (id) => {
    // Show loading Swal
    Swal.fire({
      title: "Deleting...",
      text: "Please wait while the student is being deleted.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      // Perform the delete request
      const response = await axios.post(
        `/user/delete/staff/${id}?`,
        {},
        config()
      );

      // Handle success
      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "The Staff was successfully deleted.",
          confirmButtonText: "OK",
        });
      }

      handleFormSubmit();
      setStudentIds([]);
      setStaffIds([]);
    } catch (error) {
      // Handle error
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to delete the student. Please try again later.",
        confirmButtonText: "OK",
      });
    }
  };

  const redirectToStaffEdit = (id) => {
    router.push(`/Viewdata/staffedit/${id}`);
  };

  const [filterActive, setFilterActive] = useState(false);
  const filterStudent = (e) => {
    e.preventDefault();

    if (filterActive) {
      setstudents(studentData);
      setFilterActive(false);
      return;
    }
    const filtered = studentData.filter(
      (student) =>
        student?.class.replace(/\./g, "").toLowerCase() ===
        classValue.toLowerCase() &&
        student?.section.replace(/\./g, "").toLowerCase() ===
        sectionValue.toLowerCase()
    );
    setFilterActive(true);
    setstudents(filtered);
  };

  const handleSearch = (query, currentRole) => {
    setSearchQuery(query);

    setPagination({
      totalStudents: 0,
      totalPages: 0,
      currentPage: 1,
      pageSize: 50,
    });
    handleFormSubmit(false);
    return;
  };

  const [isAllSelected, setIsAllSelected] = useState(false); // State to track selection

  const deletHandler = async (e) => {
    e.preventDefault();
    if (currRole == "student") {
      // Check if the studentIds array is empty
      if (studentIds.length === 0) {
        Swal.fire("No students selected!", "", "warning");
        return;
      }

      // Show loading alert
      Swal.fire({
        title: "Deleting...",
        text: "Please wait while we process your request.",
        icon: "info",
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        const response = await axios.post(
          `/user/students/delete/${currSchool}?`,
          { studentIds },
          config()
        );
        handleFormSubmit();
        setStudentIds([]);
        setStaffIds([]);
        setIsAllSelected(false);
        selectAllStudents();
        // Show success alert after successful deletion
        Swal.fire("Success!", "Students deleted successfully.", "success");
      } catch (error) {
        Swal.fire("Error!", "Something went wrong.", "error");
      }
    }

    if (currRole == "staff") {
      // Check if the staffIds array is empty
      if (staffIds.length === 0) {
        Swal.fire("No staff selected!", "", "warning");
        return;
      }

      // Show loading alert
      Swal.fire({
        title: "Deleting...",
        text: "Please wait while we process your request.",
        icon: "info",
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        const response = await axios.post(
          `/user/staffs/delete/${currSchool}?`,
          { staffIds },
          config()
        );
        handleFormSubmit();
        setStudentIds([]);
        setStaffIds([]);
        // Show success alert after successful deletion
        Swal.fire("Success!", "Staff deleted successfully.", "success");
      } catch (error) {
        Swal.fire("Error!", "Something went wrong.", "error");
      }
    }
  };

  const restoreHandler = async (e) => {
    e.preventDefault();

    if (currRole === "student") {
      if (studentIds.length === 0) {
        Swal.fire("No students selected!", "", "warning");
        return;
      }

      Swal.fire({
        title: "Restoring...",
        text: "Please wait while we process your request.",
        icon: "info",
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        const response = await axios.post(
          `/user/students/restore/${currSchool}?`,
          { studentIds },
          config()
        );

        handleFormSubmit();
        setStudentIds([]);
        setStaffIds([]);
        setIsAllSelected(false);
        selectAllStudents();

        Swal.fire("Success!", "Students restored successfully.", "success");
      } catch (error) {
        Swal.fire("Error!", "Something went wrong during restore.", "error");
      }
    }
  };

  const selectAllStudents = () => {
    if (isAllSelected) {
      // Clear all selections
      setStudentIds([]);
      setStaffIds([]);
    } else {
      // Select all based on current role
      if (currRole === "student") {
        const allStudentIds = students.map((student) => student._id);
        setStudentIds(allStudentIds);
      }

      if (currRole === "staff") {
        const allStaffIds = staffs.map((staff) => staff._id);
        setStaffIds(allStaffIds);
      }
    }
    setIsAllSelected(!isAllSelected); // Toggle the state
  };

  useEffect(() => {
    const savedSchool = localStorage.getItem("currSchool");
    const savedRole = localStorage.getItem("currRole");
    const savedStatus = localStorage.getItem("status");
    const classValuelocal = localStorage.getItem("classValuelocal");
    const sectionValueSearchLocal = localStorage.getItem("sectionValuelocal");
    const searchLocal = localStorage.getItem("searchLocal");
    const CourseLocal = localStorage.getItem("courseLocal");

    const schoolId = savedSchool;
    if (schoolId) {
      // Fetch school data by schoolId from backend
      axios
        .get(`user/getschool/${schoolId}`)
        .then((response) => {
          setSchoolData(response.data.data); // Update the state with fetched data
          console.log(response.data.data);
        })
        .catch((err) => {
          console.log("Error fetching Vendor data"); // Handle error if request fails
        });
    }
    console.log(savedStatus);
    if (savedSchool) setCurrSchool(savedSchool);
    if (savedRole) setCurrRole(savedRole);
    if (savedStatus) setstatus(savedStatus);
    if (classValuelocal) setclassNameValue(classValuelocal);
    if (sectionValueSearchLocal) setSectionValueSearch(sectionValueSearchLocal);
    if (searchLocal) setSearchQuery(searchLocal);
    if (CourseLocal) setCourseValueSearch(CourseLocal);
  }, []);

  // Update localStorage whenever values change
  useEffect(() => {
    if (currSchool) localStorage.setItem("currSchool", currSchool);
    if (currRole) localStorage.setItem("currRole", currRole);
    if (status) localStorage.setItem("status", status);
    if (searchQuery) localStorage.setItem("searchLocal", searchQuery);
    if (classNameValue) localStorage.setItem("classValuelocal", classNameValue);
    if (sectionValueSearch)
      localStorage.setItem("sectionValuelocal", sectionValueSearch);
  }, [
    currSchool,
    currRole,
    status,
    classNameValue,
    searchQuery,
    sectionValueSearch,
  ]);

  const handleShare = (studentID, name) => {
    if (!studentID || !currSchool) {
      console.error("Student ID or school ID is missing.");
      return;
    }

    const shareUrl = `https://api.whatsapp.com/send?text=Hello! Here is the profile link for ${name}: ${window.location.origin}/parent/${studentID}?schoolid=${currSchool}. Check it out now!`;
    window.open(shareUrl, "_blank");
  };
  const handleShare2 = (studentID, name) => {
    if (!studentID || !currSchool) {
      console.error("Student ID or Vendor ID is missing.");
      return;
    }

    const shareUrl = `https://api.whatsapp.com/send?text=Hello! Here is the profile link for ${name}: ${window.location.origin}/staff/${studentID}?schoolid=${currSchool}. Check it out now!`;
    window.open(shareUrl, "_blank");
  };

  const moveReadySingle = async (studentId) => {
    try {
      // Show loading spinner
      Swal.fire({
        title: "Updating...",
        text: "Please wait while the status is being updated.",
        icon: "info",
        showCancelButton: false,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading(); // Display loading spinner
        },
      });

      let response;

      if (currRole === "student") {
        response = await axios.post(
          `/user/student/change-status/readyto/${currSchool}?`,
          { studentIds: [studentId] }, // Wrap studentId in an array
          config()
        );
      } else if (currRole === "staff") {
        response = await axios.post(
          `/user/staff/change-status/readyto/${currSchool}?`,
          { staffIds: [studentId] },
          config()
        );
      }

      handleFormSubmit();
      setStudentIds([]);
      setStaffIds([]);
      if (response.data.success) {
        Swal.fire({
          title: "Success!",
          text: response.data.message,
          icon: "success",
          confirmButtonText: "OK",
        });
      }

      // If any student was skipped, show details
      if (response.data.skippedStudents?.length > 0) {
        let skippedMessage = response.data.skippedStudents
          .map(
            (student) => `<b>${student.name}:</b> ${student.reason.join(", ")}`
          )
          .join("<br>");

        Swal.fire({
          title: "Some Students Were Skipped!",
          html: skippedMessage,
          icon: "warning",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      let err = error.response?.data?.message;
      if (
        error.response?.data?.message ===
        "No students were updated due to missing required fields or empty extraFields values." ||
        error.response?.data?.message ===
        "No staff members were updated due to missing required fields or empty extraFields values."
      ) {
        err = "Please Put Values And Try Again";
      }

      Swal.fire({
        title: "Error!",
        text: err || "Failed to update student status. Please try again later.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const moveBackPendingSingle = async (studentId) => {
    try {
      // Show loading spinner
      Swal.fire({
        title: "Updating...",
        text: "Please wait while the status is being updated.",
        icon: "info",
        showCancelButton: false,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading(); // Display loading spinner
        },
      });

      if (currRole == "student") {
        // Make the API call
        const response = await axios.post(
          `/user/student/change-status/pending/${currSchool}?`,
          { studentIds: [studentId] }, // Wrap studentId in an array
          config()
        );

        // Fetch updated student list
        handleFormSubmit();
        setStudentIds([]);
        setStaffIds([]);
        // Close the loading spinner and show success message
        Swal.fire({
          title: "Success!",
          text: "Student status has been updated.",
          icon: "success",
        });
      }

      if (currRole == "staff") {
        const response = await axios.post(
          `/user/staff/change-status/pending/${currSchool}?`,
          { staffIds: [studentId] },
          config()
        );
        handleFormSubmit();
        setStudentIds([]);
        setStaffIds([]);
        Swal.fire({
          title: "Success!",
          text: "Student status has been updated.",
          icon: "success",
        });
      }
    } catch (error) {
      console.error("Error updating status:", error);

      // Close the loading spinner and show error message
      Swal.fire({
        title: "Error!",
        text: "Failed to update student status. Please try again later.",
        icon: "error",
      });
    }
  };

  const moveBackreadytoSingle = async (studentId) => {
    try {
      // Show loading spinner
      Swal.fire({
        title: "Updating...",
        text: "Please wait while the status is being updated.",
        icon: "info",
        showCancelButton: false,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading(); // Display loading spinner
        },
      });

      if (currRole == "student") {
        // Make the API call
        const response = await axios.post(
          `/user/student/change-status/readyto/${currSchool}?`,
          { studentIds: [studentId] }, // Wrap studentId in an array
          config()
        );

        // Fetch updated student list
        handleFormSubmit();
        setStudentIds([]);
        setStaffIds([]);
        // Close the loading spinner and show success message
        Swal.fire({
          title: "Success!",
          text: "Student status has been updated.",
          icon: "success",
        });
      }

      if (currRole == "staff") {
        const response = await axios.post(
          `/user/staff/change-status/readyto/${currSchool}?`,
          { staffIds: [studentId] },
          config()
        );
        handleFormSubmit();
        setStudentIds([]);
        setStaffIds([]);
        Swal.fire({
          title: "Success!",
          text: "Student status has been updated.",
          icon: "success",
        });
      }
    } catch (error) {
      console.error("Error updating status:", error);

      // Close the loading spinner and show error message
      Swal.fire({
        title: "Error!",
        text: "Failed to update student status. Please try again later.",
        icon: "error",
      });
    }
  };

  const copyData = async (studentId) => {
    try {
      // Show loading spinner
      Swal.fire({
        title: "Updating...",
        text: "Please wait while the status is being updated.",
        icon: "info",
        showCancelButton: false,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading(); // Display loading spinner
        },
      });

      if (currRole == "student") {
        // Make the API call
        const response = await axios.post(
          `/user/student/change-status/copy/${currSchool}?`,
          { studentIds: [studentId] }, // Wrap studentId in an array
          config()
        );

        // Fetch updated student list
        handleFormSubmit();
        setStudentIds([]);
        setStaffIds([]);
        // Close the loading spinner and show success message
        Swal.fire({
          title: "Success!",
          text: "Student status has been updated.",
          icon: "success",
        });
      }

      if (currRole == "staff") {
        const response = await axios.post(
          `/user/staff/change-status/copy/${currSchool}?`,
          { staffIds: [studentId] },
          config()
        );
        handleFormSubmit();
        setStudentIds([]);
        setStaffIds([]);
        Swal.fire({
          title: "Success!",
          text: "Student status has been updated.",
          icon: "success",
        });
      }
    } catch (error) {
      console.error("Error updating status:", error);

      // Close the loading spinner and show error message
      Swal.fire({
        title: "Error!",
        text: "Failed to update student status. Please try again later.",
        icon: "error",
      });
    }
  };

  const Statuschecker = (value) => {
    console.log(value);

    const statusObj = statusCount?.find((count) => count._id === value);
    console.log(statusObj);
    return statusObj ? statusObj.count : 0; // Return count or 0 if not found
  };


  const formatDate = (dateString) => {
    const options = {
      weekday: "long",          // e.g., Monday
      year: "numeric",          // e.g., 2025
      month: "long",            // e.g., May
      day: "numeric",           // e.g., 31
      hour: "2-digit",          // e.g., 11 AM
      minute: "2-digit",
      second: "2-digit",
      hour12: true,             // 12-hour format
    };
    return new Date(dateString).toLocaleString("en-US", options);
  };



  const handleDeleteAvatar = async (studentId) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this avatar?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (confirm.isConfirmed) {
      try {
        const res = await axios.put(`/user/remove-student-image/${studentId}`);

        if (res.data.success) {
          Swal.fire({
            title: "Deleted!",
            text: res.data.message,
            icon: "success",
          });
          handleFormSubmit()
          // Optionally, update the student state to reflect default avatar immediately
          // Example: setStudent(prev => ({ ...prev, avatar: res.data.student.avatar }));
        } else {
          Swal.fire({
            title: "Error!",
            text: res.data.message,
            icon: "error",
          });
        }
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text: "Failed to delete avatar. Try again later.",
          icon: "error",
        });
      }
    }
  };

  const handleToggle = () => {
    const newValue = !showDeleted;
    setShowDeleted(newValue);

  };
  return (
    <div>
      <Nav />

      <section className="bg-white min-h-screen dark:bg-gray-900 py-10  ">
        {!submitted && (
          <div className="container flex flex-col items-center justify-center px-6 mx-auto">
            <div className="flex items-center justify-center mt-6">
              <a
                href="#"
                className="pb-4 font-medium text-center text-2xl text-gray-800 capitalize border-b-2 border-blue-500 dark:border-blue-400 dark:text-white"
              >
                View Data
              </a>
            </div>
          </div>
        )}

        <div className="container flex flex-col items-center mt-6 justify-center px-6 mx-auto">
          {user && (
            <form
              className="mt-6 w-full flex justify-between flex-wrap"
              onSubmit={handleFormSubmit}
            >
              {/* School Dropdown */}
              {!loginSchool && (
                <div className="flex items-center justify-center   gap-4">
                  {!loginSchool && (
                    <div className="mb-4 flex gap-3 items-center">
                      <select
                        id="school"
                        onChange={handleSchoolSelect}
                        value={currSchool}
                        className="mt-1 h-10 px-3 z-0 border block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="">Select Vendor</option>
                        {schools?.map((school) => (
                          <option key={school._id} value={school._id}>
                            {school.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {submitted && !user?.school && currRole !== "staff" && (
                    <Link
                      href={`/powerclick?vendor=${currSchool}&role=${currRole}&class=${classNameValue}&section=${sectionValueSearch}&course=${courseValueSearch}&staffType=${staffValueSearch}&institute=${staffValueSearchInsi}`}
                      className={`px-4 py-2 mb-3 rounded-md font-medium  bg-blue-900 text-gray-100`}
                    >
                      Power Click
                    </Link>
                  )}
                </div>
              )}

              {/* Role Selection Buttons */}
              <div className="mb-4 flex space-x-4">
                <button
                  type="button"
                  onClick={() => setCurrRole("student")}
                  className={`px-4 py-1 rounded-md font-medium ${currRole === "student"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700"
                    }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => { setCurrRole("staff"); setShowDeleted(false) }}
                  className={`px-4 py-1 rounded-md font-medium ${currRole === "staff"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700"
                    }`}
                >
                  Staff
                </button>
                {submitted && (
                  <Link
                    href={`/Adddata?vendor=${currSchool}&role=${currRole}&class=${classNameValue}&section=${sectionValueSearch}&course=${courseValueSearch}&staffType=${staffValueSearch}&institute=${staffValueSearchInsi}`}
                    className={`px-4 py-2 rounded-md font-medium  bg-gray-200 text-gray-700`}
                  >
                    Add {currRole}
                  </Link>
                )}
              </div>

              {/* Status Selection Buttons */}
              <div className="mb-4 flex space-x-4 relative">
                {/* Pending Button */}
                <button
                  type="button"
                  onClick={() => setstatus("Panding")}
                  className={`px-4 py-2 rounded-md font-medium relative ${status === "Panding"
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-700"
                    }`}
                >
                  Pending
                  {submitted && (
                    <span className="absolute -top-2 right-0 mt- mr-1 text-sm font-semibold text-white bg-red-600 rounded-full px-2">
                      {Statuschecker("Panding")}
                    </span>
                  )}
                </button>

                {/* Ready to Print Button */}
                <button
                  type="button"
                  onClick={() => setstatus("Ready to print")}
                  className={`px-4 py-2 rounded-md font-medium relative ${status === "Ready to print"
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-700"
                    }`}
                >
                  Ready
                  {submitted && (
                    <span className="absolute -top-3 right-0 mt-1 mr-1 text-sm font-semibold text-white bg-red-600 rounded-full px-2">
                      {Statuschecker("Ready to print")}
                    </span>
                  )}
                </button>

                {/* Printed Button */}
                <button
                  type="button"
                  onClick={() => setstatus("Printed")}
                  className={`px-4 py-2 rounded-md font-medium relative ${status === "Printed"
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-700"
                    }`}
                >
                  Printed
                  {submitted && (
                    <span className="absolute -top-3 right-0 mt-1 mr-1 text-sm font-semibold text-white bg-red-600 rounded-full px-2">
                      {Statuschecker("Printed")}
                    </span>
                  )}
                </button>
              </div>
            </form>
          )}

          {!loginSchool && schools?.length === 0 && (
            <h4 className="text-center text-2xl py-2 px-5 text-red-500">
              Please add a Vendor
            </h4>
          )}
        </div>

        {loading && (
          <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
            <div className="spinner"></div>
          </div>
        )}

        {!submitted && (
          <div className="flex justify-center items-center  bg-gray-50">
            <div className="bg-yellow-100 text-yellow-700 p-8 rounded-lg border-l-8 border-yellow-600 shadow-xl mx-auto max-w-md">
              <p className="font-semibold text-lg text-center leading-relaxed">
                Please select a Vendor Role and Status.
              </p>
            </div>
          </div>
        )}
        {submitted && currRole == "student" && students?.length === 0 && (
          <div className="text-red-600 font-semibold text-center mt-4 p-4 bg-red-100 border-l-4 border-red-500 shadow-md rounded-lg">
            {errorMsg}
          </div>
        )}
        {submitted && currRole == "staff" && staffs?.length === 0 && (
          <div className="text-red-600 font-semibold text-center mt-4 p-4 bg-red-100 border-l-4 border-red-500 shadow-md rounded-lg">
            {errorMsg}
          </div>
        )}

        {submitted && (
          <div className="container mx-auto px-4 sm:px-8 lg:px-16 z-0">
            {/* Heading */}

            {/* Search Section */}
            <div className="bg-gray-100 rounded-lg shadow-md p-4 w-full">
              {/* Responsive Layout */}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Search Input */}
                <div className="flex items-center justify-around w-full">
                  <div className="flex items-center  bg-white rounded-md shadow-sm w-full sm:w-auto flex-grow">
                    <span className="flex items-center justify-center px-4 text-gray-500">
                      <FaSearch />
                    </span>
                    <input
                      type="text"
                      placeholder={
                        currRole === "student"
                          ? "Search students..."
                          : "Search staff..."
                      }
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full p-2 sm:p-3 border-none focus:outline-none rounded-r-md text-sm sm:text-base"
                    />
                  </div>

                  {/* Search Button */}
                  <button
                    onClick={() => handleSearch(searchQuery)}
                    className="w- sm:w-auto px-4 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  >
                    Search
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Class Dropdown (For Students) */}
                  {currRole === "student" &&
                    className &&
                    className.length > 0 && (
                      <div className="flex items-center gap-4">
                        {/* Dropdown */}
                        <select
                          value={classNameValue || ""} // Ensure value is always a string
                          onChange={(e) => {
                            setclassNameValue(e.target.value);
                            setPagination({
                              totalStudents: 0,
                              totalPages: 0,
                              currentPage: 1,
                              pageSize: 50,
                            });
                          }}
                          className="w-full sm:w-auto p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base "
                          style={{ maxHeight: "200px", overflowY: "auto" }}
                        >
                          <option value=""> All Class</option>
                          {className.map((name, index) =>
                            name && name.trim() ? (
                              <option key={index} value={name}>
                                {name}
                              </option>
                            ) : (
                              <option key={index} value="no-class">
                                Without Class Name
                              </option>
                            )
                          )}
                        </select>
                      </div>
                    )}

                  {/* Course Dropdown (For Students) */}
                  {currRole === "student" &&
                    className &&
                    unqiueCourse.length > 0 && (
                      <div className="flex items-center gap-4">
                        {/* Dropdown */}
                        <select
                          value={courseValueSearch || ""} // Ensure value is always a string
                          onChange={(e) => {
                            setCourseValueSearch(e.target.value);
                            setPagination({
                              totalStudents: 0,
                              totalPages: 0,
                              currentPage: 1,
                              pageSize: 50,
                            });
                          }}
                          className="w-full sm:w-auto p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                          style={{ maxHeight: "200px", overflowY: "auto" }}
                        >
                          <option value=""> All Courses</option>
                          {unqiueCourse.map((name, index) =>
                            name && name.trim() ? (
                              <option key={index} value={name}>
                                {name}
                              </option>
                            ) : (
                              <option key={index} value="no-class">
                                Without Course Name
                              </option>
                            )
                          )}
                        </select>
                      </div>
                    )}

                  {/* Section Dropdown (For Students) */}
                  {currRole === "student" &&
                    sections &&
                    sections.length > 0 && (
                      <div className="flex items-center gap-4">
                        {/* Dropdown */}
                        <select
                          value={sectionValueSearch || ""} // Ensure value is always a string
                          onChange={(e) => {
                            setSectionValueSearch(e.target.value);
                            setPagination({
                              totalStudents: 0,
                              totalPages: 0,
                              currentPage: 1,
                              pageSize: 50,
                            });
                          }} // Update state on change
                          className="w-full sm:w-auto p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                          style={{ maxHeight: "200px", overflowY: "auto" }}
                        >
                          <option value=""> All Section</option>
                          {sections.map(
                            (name, index) =>
                              name && (
                                <option key={index} value={name}>
                                  {name}
                                </option>
                              )
                          )}
                        </select>
                      </div>
                    )}

                  {currRole === "staff" &&
                    unqiueStaff &&
                    unqiueStaff.length > 0 && (
                      <div className="flex items-center gap-4">
                        {/* Dropdown */}
                        <select
                          value={staffValueSearch || ""} // Ensure value is always a string
                          onChange={(e) => {
                            setValueStaff(e.target.value);
                            setPagination({
                              totalStudents: 0,
                              totalPages: 0,
                              currentPage: 1,
                              pageSize: 50,
                            });
                          }} // Update state on change
                          className="w-full sm:w-auto p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                          style={{ maxHeight: "200px", overflowY: "auto" }}
                        >
                          {/* all staff type */}
                          <option value=""> Staff Type</option>
                          {unqiueStaff.map(
                            (name, index) =>
                              name && (
                                <option key={index} value={name}>
                                  {name}
                                </option>
                              )
                          )}
                        </select>
                      </div>
                    )}
                  {currRole === "staff" &&
                    unqiueStaffInsi &&
                    unqiueStaffInsi.length > 0 && (
                      <div className="flex items-center gap-4">
                        {/* Dropdown */}
                        <select
                          value={staffValueSearchInsi || ""} // Ensure value is always a string
                          onChange={(e) => {
                            setValueStaffInsi(e.target.value);
                            setPagination({
                              totalStudents: 0,
                              totalPages: 0,
                              currentPage: 1,
                              pageSize: 50,
                            });
                          }} // Update state on change
                          className="w-full sm:w-auto p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                          style={{ maxHeight: "200px", overflowY: "auto" }}
                        >
                          {/* all staff type */}
                          <option value=""> Institute</option>
                          {unqiueStaffInsi.map(
                            (name, index) =>
                              name && (
                                <option key={index} value={name}>
                                  {name}
                                </option>
                              )
                          )}
                        </select>
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>
        )}

        {submitted && (
          <div className="container mx-auto px-16 ">

            {showDeleted && (
              <div className="text-sm text-red-600">
                After 30 days, student will be automatically deleted
              </div>
            )}


            {pagination.totalPages > 0 && (
              <Pagination
                totalPages={pagination.totalPages}
                currentPage={pagination.currentPage}
                setPage={setPage}
              />
            )}

            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {students?.length > 0 &&
                  students?.map((student) => (
                    <div
                      key={student?._id}
                      className={`relative shadow-lg p-6 rounded-xl border-2 w-full bg-gradient-to-b from-blue-400 via-blue-300 to-blue-100 transform  transition-all duration-300 ${studentIds.includes(student._id)
                        ? "border-blue-500"
                        : "border-gray-200"
                        }`}
                      onClick={() => handleStudentSelect(student._id)}
                    >
                      {status === "Panding" && (
                        <div className="absolute top-2 right-2 flex justify-between w-[95%] left-2 items-right ">
                          {student?.parentChanges ? (
                            <p className="text-green-900 flex items-center gap-2 text-sm ">
                              <FaCheckCircle />
                              Verify
                            </p>
                          ) : (
                            <p className=" opacity-0">{"."}</p>
                          )}
                          {<div>
                            <div className="flex gap-3">
                              {!showDeleted && <button
                                onClick={() =>
                                  handleShare(student._id, student.name)
                                }
                                className=" p-1 z-10 bg-green-600 text-white rounded-full shadow-md hover:bg-blue-500"
                              >
                                <FaShareAlt size={13} />
                              </button>}

                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  deleteStudent(student._id);
                                }}
                                className="flex items-center gap-1 p-1 z-10 bg-red-600 text-white rounded-full shadow-md hover:bg-red-500"
                              >
                                {showDeleted && <span>Permanently Delete</span>}
                                <FaTrashAlt size={13} />
                              </button>

                            </div>
                          </div>}
                        </div>
                      )}

                      <div className=" mt-3">
                        <h5 className="font-bold text-gray-800 mt-4 text-center text-wrap break-words">
                          {student?.name}
                        </h5>

                        {student?.isDuplicate === "true" && (
                          <div className="flex items-center justify-center mt-2 bg-red-100 text-red-700 px-3 py-1 rounded-md shadow-md">
                            <HiDuplicate className="mr-1 text-red-600 text-lg" />
                            <span className="font-semibold">Duplicate</span>
                          </div>
                        )}

                        <div className="flex flex-col items-center mt-1">
                          <div className="grid grid-cols-2 gap-2 relative">
                            <div className="relative">
                              <Image
                                height={80}
                                width={80}
                                className="min-w-[95%] max-w-[95%] min-h-[100px] max-h-[100px] rounded-full border-4 border-blue-500 shadow-lg"
                                src={student?.avatar?.url }
                                alt={student?.name}
                              />

                              {/* Delete Button Overlay */}
                {              student?.avatar?.url !== "https://cardpro.co.in/login.jpg" &&
                              <button
                                onClick={() => handleDeleteAvatar(student._id)}
                                className="absolute top-0 right-0 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 shadow-md text-xs"
                                title="Delete Avatar"
                              >
                                X
                              </button>}
                            </div>

                            <div>
                              <div className="mt-4 text-gray-700">
                                {student?.photoNameUnuiq && (
                                  <p className="text-[10px] font-medium">
                                    Photo No.: {student?.photoNameUnuiq}
                                  </p>
                                )}

                                {schoolData?.requiredFields?.includes("Class") && (
                                  <p>
                                    <span className="font-semibold">Class:</span>{" "}
                                    <span className="text-[13px]">{student?.class || ""}</span>
                                  </p>
                                )}
                                {schoolData?.requiredFields?.includes("Section") && (
                                  <p>
                                    <span className="font-semibold">Section:</span>{" "}
                                    <span className="text-[13px]">{student?.section || ""}</span>
                                  </p>
                                )}
                                {schoolData?.requiredFields?.includes("Course") && (
                                  <p>
                                    <span className="font-semibold">Course:</span>{" "}
                                    <span className="text-[13px]">{student?.course || ""}</span>
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                        </div>
                        {/* Divider Line */}
                        <div className="h-[2px] w-[100%] bg-blue-500 mx-auto my-4 rounded-full"></div>

                        <ul className="mt-2 text-gray-700   flex gap-1  flex-col">
                          {schoolData?.extraFields.map((field, index) => (
                            <li
                              key={index}
                              className="flex text-[13px] gap-1  "
                            >
                              <span className="font-semibold text-w  ">
                                {field?.name}:
                              </span>
                              <span>
                                {" "}
                                {student?.extraFields?.[field?.name] || ""}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {!showDeleted && status === "Panding" && (
                        <div className="flex justify-center mt-4 gap-3">
                          <button
                            onClick={() => redirectToStudentEdit(student._id)}
                            className="flex items-center text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transform transition-all duration-200"
                          >
                            <FaEdit className="mr-2" />
                            Edit
                          </button>

                          <button
                            onClick={(e) => moveReadySingle(student._id)}
                            className="text-sm px-1 py-2 text-[12px] bg-yellow-500 text-white rounded-lg hover:bg-yellow-400 transform transition-all duration-200"
                          >
                            <span className=" text-[8px]"> Move to</span> Ready
                          </button>
                        </div>
                      )}
                      {!showDeleted && status === "Printed" && !user?.school && (
                        <div className="flex justify-center mt-4 gap-3">
                          <button
                            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg shadow-lg"
                            onClick={() => moveBackPendingSingle(student._id)}
                          >
                            <FaArrowLeft /> Pending
                          </button>
                          <button
                            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg shadow-lg"
                            onClick={() => moveBackreadytoSingle(student._id)}
                          >
                            <FaArrowLeft /> Ready
                          </button>
                        </div>
                      )}

                      {!showDeleted && status === "Printed" && user?.school && (
                        <div className="flex justify-center mt-4 gap-3">
                          <button
                            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg shadow-lg"
                            onClick={() => copyData(student._id)}
                          >
                            <FaArrowLeft /> Copy To Pending
                          </button>
                        </div>
                      )}


                      {!showDeleted && <div className="mt-2 flex justify-center" >
                        <button
                          type="button"
                          onClick={() => setShowStatus(!showStatus)}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          {showStatus ? "Hide Status" : "Show Status"}
                        </button>
                      </div>}
                      {showStatus && <div>
                        {student?.statusHistory?.filter(item => item.status === status).length > 0 && (
                          <div>
                            <h3>{status} Status History:</h3>
                            <ul>
                              {student.statusHistory
                                .filter(item => item.status === status)
                                .map((item, index) => (
                                  <li key={index}>
                                    Date: {formatDate(item.changedAt)}
                                  </li>
                                ))}
                            </ul>
                          </div>
                        )}
                      </div>}

                      {showDeleted && student.deletedAt && (
                        <>
                          Delete date time: {formatDate(student.deletedAt)}
                        </>
                      )}


                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
        {submitted && staffs?.length > 0 && (
          <div className=" mx-auto px-16 ">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {staffs?.map((staff) => (
                <div
                  key={staff?._id}
                  className={`relative shadow-lg p-6 rounded-xl border-2 w-full bg-gradient-to-b from-blue-400 via-blue-300 to-blue-100 transform  transition-all duration-300 ${staffIds.includes(staff._id)
                    ? "border-blue-500"
                    : "border-indigo-50"
                    }`}
                  onClick={() => handleStaffSelect(staff._id)}
                >
                  {/* Share and Delete Buttons */}
                  {status === "Panding" && (
                    <div className="absolute top-2 right-2 flex justify-between w-[95%] left-2 items-right ">
                      {staff?.shareUpdate ? (
                        <h4 className="text-center text-sm text-green-800 font-semibold">
                          <FaCheckCircle className="inline mr-1" />
                          Verified
                        </h4>
                      ) : (
                        <p className=" opacity-0">{"."}</p>
                      )}

                      <div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleShare2(staff._id, staff.name)}
                            className="p-1 bg-indigo-700 text-white rounded-full hover:bg-indigo-800 shadow-md transition-all"
                          >
                            <FaShareAlt size={13} />
                          </button>
                          <button
                            onClick={() => deleteStaff(staff._id)}
                            className="p-1 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-md transition-all"
                          >
                            <FaTrashAlt size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Photo */}
                  <div className=" mt-3">
                    {/* Name */}
                    <h3 className="text-xl font-semibold text-center text-gray-800">
                      {staff?.name}
                    </h3>
                    {staff?.isDuplicate === "true" && (
                      <div className="flex items-center justify-center mt-2 bg-red-100 text-red-700 px-3 py-1 rounded-md shadow-md">
                        <HiDuplicate className="mr-1 text-red-600 text-lg" />
                        <span className="font-semibold">Duplicate</span>
                      </div>
                    )}
                    <div className="flex flex-col items-center mt-1">
                      <div className="grid grid-cols-2 gap-2">
                        <Image
                          height={100}
                          width={100}
                          className="  rounded-full border-4 border-blue-500 shadow-lg"
                          src={staff?.avatar?.url}
                          alt={staff?.name}
                        />

                        <div>
                          <div className="mt-4 text-gray-700 ">
                            {staff?.photoNameUnuiq && (
                              <p className="text-[10px] font-medium">
                                <span className="font-semibold">
                                  Photo No.:
                                </span>{" "}
                                {staff?.photoNameUnuiq}
                              </p>
                            )}
                            {schoolData?.requiredFieldsStaff?.includes(
                              "Staff Type"
                            ) && (
                                <p className="">
                                  <span className="font-semibold">
                                    Staff Type:
                                  </span>{" "}
                                  <span className=" text-[13px]">
                                    {" "}
                                    {staff?.staffType
                                      ?.split(" ")
                                      .slice(0, 3)
                                      .join(" ") || ""}
                                    {staff?.staffType?.split(" ").length > 3
                                      ? " ..."
                                      : ""}
                                  </span>
                                </p>
                              )}
                            {schoolData?.requiredFieldsStaff?.includes(
                              "Institute"
                            ) && (
                                <p className="">
                                  <span className="font-semibold">
                                    Institute:
                                  </span>{" "}
                                  <span className=" text-[13px]">
                                    {staff?.institute || ""}
                                  </span>
                                </p>
                              )}
                          </div>
                        </div>
                      </div>

                      {/* Verified Badge */}

                      {/* Divider Line */}
                      <div className="h-[2px] w-[100%] bg-blue-500 mx-auto my-4 rounded-full"></div>

                      {/* Details */}
                      <div className="text-sm text-gray-700 font-medium">
                        <ul className="mt-2 text-gray-700   flex gap-1  flex-col">
                          {schoolData?.extraFieldsStaff.map((field, index) => (
                            <li key={index} className="flex text-[13px] gap-1">
                              <span className="font-semibold">
                                {field?.name}:
                              </span>
                              <span>
                                {staff?.extraFieldsStaff &&
                                  staff.extraFieldsStaff[field?.name]
                                  ? staff?.extraFieldsStaff[field?.name]
                                  : ""}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Signature */}
                    {schoolData &&
                      schoolData?.requiredFieldsStaff.includes(
                        "Signature Name"
                      ) && (
                        <div className="flex justify-center my-4">
                          <img
                            src={staff?.signatureImage?.url}
                            alt={staff?.name}
                            className="w-[80%] h-auto max-h-[85px] rounded-md border shadow-md"
                          />
                        </div>
                      )}

                    {/* Action Buttons */}
                    {!showDeleted && status === "Panding" && (
                      <div className="flex justify-center gap-4 mt-4">
                        {/* Edit Button */}
                        <button
                          onClick={() => redirectToStaffEdit(staff._id)}
                          className="px-4 py-2 bg-indigo-700 flex items-center text-white rounded-lg shadow-md hover:bg-indigo-800 transition-all"
                        >
                          <FaEdit className="mr-2" />
                          Edit
                        </button>

                        {/* Move to Ready Button */}

                        <button
                          onClick={(e) => {
                            moveReadySingle(staff._id);
                          }}
                          className="px-2 py-1 bg-yellow-600 text-[12px] text-white rounded-lg shadow-md hover:bg-yellow-700 transition-all"
                        >
                          <span className="text-[8px]"> Move to </span>Ready
                        </button>
                      </div>
                    )}
                    {status === "Printed" && !user?.school && (
                      <div className="flex justify-center mt-4 gap-3">
                        <button
                          className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg shadow-lg"
                          onClick={() => moveBackPendingSingle(staff._id)}
                        >
                          <FaArrowLeft /> Pending
                        </button>
                        <button
                          className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg shadow-lg"
                          onClick={() => moveBackreadytoSingle(staff._id)}
                        >
                          <FaArrowLeft /> Ready
                        </button>
                      </div>
                    )}

                    {status === "Printed" && user?.school && (
                      <div className="flex justify-center mt-4 gap-3">
                        <button
                          className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg shadow-lg"
                          onClick={() => copyData(staff._id)}
                        >
                          <FaArrowLeft /> Copy To Pending
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
      <div>
        {/* Chat Box Button */}
        {submitted && (
          <button
            className={`fixed bottom-4 left-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-full shadow-lg ${!showChatBox ? "button-bounce" : ""
              }`}
            onClick={toggleChatBox}
          >
            More
          </button>
        )}

        {/* List of Buttons in Chat Box */}

        {showChatBox && (
          <div className="fixed bottom-16 left-4 flex flex-col gap-3">
            {showPopup && (
              <SharePopup
                link={`https://cardpro.co.in/shareview?vendor=${currSchool}&role=${currRole}&status=${status}&class=${classNameValue}&section=${sectionValueSearch}&course=${courseValueSearch}&staffType=${staffValueSearch}&institute=${staffValueSearchInsi}&page=${pagination.currentPage}&limit=${pagination.pageSize}`}
                currSchool={currSchool}
                onClose={setShowPopup}
              />
            )}
            {showDownload && (
              <DownloadPopup
                schoolId={currSchool}
                currRole={currRole}
                status={status}
                course={courseValueSearch}
                onClose={setShowDownload}
                section={sectionValueSearch}
                studentClass={classNameValue}
                institute={staffValueSearchInsi}
                staffType={staffValueSearch}
                user={user}
                schoolData={schoolData}
                downloadExcel={downloadExcel}
                downloadImages={downloadImages}
                downloadSignature={downloadSignature}
              />
            )}
            <div>
              {currRole === "student" && !user?.school && <>
                <button
                  onClick={handleToggle}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-md transition duration-300 ${showDeleted ? "bg-red-500 text-white" : "bg-green-500 text-white"
                    }`}
                >
                  {showDeleted ? (
                    <>
                      <FaEyeSlash className="text-lg" />
                      Hide Deleted
                    </>
                  ) : (
                    <>
                      <FaEye className="text-lg" />
                      Show Deleted
                    </>
                  )}
                </button>
              </>}

            </div>
            {!showDeleted &&
              <>
                <button
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg shadow-lg"
                  onClick={() => setShowPopup(true)}
                >
                  Share
                </button>
                <button
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg shadow-lg"
                  onClick={() => setShowDownload(true)}
                >
                  Download Tab
                </button>
              </>}
            {!user?.school && (
              <>
                <button
                  className={`flex items-center gap-2 ${isAllSelected
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-blue-600 hover:bg-blue-700"
                    } text-white py-2 px-4 rounded-lg shadow-lg`}
                  onClick={selectAllStudents}
                >
                  {isAllSelected ? <FaUserTimes /> : <FaUserCheck />}
                  {isAllSelected ? "Unselect All" : "Select All"}
                </button>
                {showDeleted &&
                  <button
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg shadow-lg"
                    onClick={restoreHandler} // jo pehle diya tha
                  >
                    <FaUndo /> Restore Selected
                  </button>
                }

                {!showDeleted && <button
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg shadow-lg"
                  onClick={deletHandler}
                >
                  <FaTrashAlt /> Delete Selected
                </button>}
              </>
            )}

            {/* Pending status */}
            {!showDeleted && status === "Panding" && (
              <>
                {/* {(user?.exportExcel || user?.school?.exportExcel) && (
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
                )} */}

                <>
                  <button
                    className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg shadow-lg"
                    onClick={modeToReadytoprint}
                  >
                    <FaCheck /> Move to Ready
                  </button>
                </>
              </>
            )}

            {/* Ready to Print status */}
            {!showDeleted && status === "Ready to print" && (
              <>
                {!user?.school && (
                  <button
                    className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg shadow-lg"
                    onClick={modeToPrinted}
                  >
                    <FaCheck /> Move to Printed
                  </button>
                )}

                <button
                  className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg shadow-lg"
                  onClick={modeToPending}
                >
                  <FaArrowLeft /> Move Back to Pending
                </button>

                {/* {(user?.exportExcel || user?.school?.exportExcel) && (
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
                )} */}
              </>
            )}

            {/* Printed status */}
            {!showDeleted && status === "Printed" && (
              <>
                {/* {(user?.exportExcel || user?.school?.exportExcel) && (
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
                )} */}
              </>
            )}
          </div>
        )}

        {submitted && currRole == "DUMMYYAHA(student)THA" && (
          <button
            className="px-5 py-2 bg-gray-500 text-white rounded-full fixed right-20 bottom-5  "
            onClick={() => setShowFilterBox(!showFilterBox)}
          >
            Filter
          </button>
        )}



        {showFilterBox && (
          <div className="flex flex-col fixed right-[55px] bottom-20 z-10 px-5 py-5 rounded-md ">
            <form onSubmit={filterStudent}>
              <input
                type="text"
                placeholder="Class"
                className=" w-20 block border py-1 px-3 my-1 border-gray-400 rounded-md"
                value={classValue}
                onChange={(e) => setClassValue(e.target.value)}
              />
              <input
                type="text"
                placeholder="Section"
                value={sectionValue}
                className=" w-20 block border py-1 px-3 my-1 border-gray-400 rounded-md"
                onChange={(e) => setSectionValue(e.target.value)}
              />
              <button
                type="submit"
                className="bg-indigo-600 text-white px-5 py-1 rounded-full m-auto mt-2 "
              >
                {filterActive ? <p>Reset Filter</p> : <>Filter</>}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Viewdata;
