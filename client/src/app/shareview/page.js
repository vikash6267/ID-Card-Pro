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
import { FaEdit, FaTrashAlt } from "react-icons/fa";
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

import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

import Pagination from "@/component/Pagination";
import Link from "next/link";

const Viewdata = () => {
  const { user, schools, error } = useSelector((state) => state.user);
  const [currRole, setCurrRole] = useState("");
  const [status, setstatus] = useState("");
  const [submitted, setsubmited] = useState(false);
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
    pageSize: 50,
  });

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

  const resetState = () => {
    setstudents([]);
    setStudentData([]);
    setstaffs([]);
    setStaffData([]);
  };

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);

    // Extracting all query parameters
    const vendor = query.get("vendor");
    const status = query.get("status");
    const role = query.get("role");
    const className = query.get("class");
    const section = query.get("section");
    const course = query.get("course");
    const staffType = query.get("staffType");
    const institute = query.get("institute");
console.log(role)
    // Setting states based on query parameters
    if (vendor) {
    
      axios
        .get(`user/getschool/${vendor}`)
        .then((response) => {
          setSchoolData(response.data.data); // Update the state with fetched data
          console.log(response.data.data.name);
        })
        .catch((err) => {
          console.log("Error fetching Vendor data"); // Handle error if request fails
        });

      setCurrSchool(vendor);
      setloginSchool(true);
    }

    if (role) setCurrRole(role);
    if (status) setstatus(status);
    if (className) setclassNameValue(className);
    if (section) setSectionValueSearch(section);
    if (course) setCourseValueSearch(course);
    if (staffType) setValueStaff(staffType);
    if (institute) setUnqiueStaffInsi(institute);
  }, []);

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
    }
    if (currRole == "staff") {
      const response = await axios.post(
        `/user/staff/change-status/pending/${currSchool}?`,
        { staffIds },
        config()
      );
      handleFormSubmit(e);
    }
  };

  const modeToReadytoprint = async (e) => {
    e.preventDefault();
    if (currRole == "student") {
      const response = await axios.post(
        `/user/student/change-status/readyto/${currSchool}?`,
        { studentIds },
        config()
      );
      handleFormSubmit(e);
      setStudentIds([]);
    }
    if (currRole == "staff") {
      const response = await axios.post(
        `/user/staff/change-status/readyto/${currSchool}?`,
        { staffIds },
        config()
      );
      handleFormSubmit(e);
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
    }
    if (currRole == "staff") {
      const response = await axios.post(
        `/user/staff/change-status/printed/${currSchool}?`,
        { staffIds },
        config()
      );
      handleFormSubmit(e);
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
          setSchoolData(response.data.data); // Update the state with fetched data
          console.log(response.data.data);
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
        ? `/user/students/${currSchool}?status=${status}&page=${pagination.currentPage}&limit=${pagination.pageSize}&search=${searchQuery}&studentClass=${classNameValue}&section=${sectionValueSearch}&course=${courseValueSearch}`
        : `/user/staffs/${currSchool}?status=${status}&staffType=${staffValueSearch}&institute=${staffValueSearchInsi}&search=${searchQuery}&page=${pagination.currentPage}&limit=${pagination.pageSize}`;
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

  const downloadExcel = async () => {
    try {
      if (currRole == "student") {
        try {
          const response = await axios.get(
            `/user/excel/data/${currSchool}?status=${status}`,
            {
              headers: {
                authorization: `${localStorage.getItem("token")}`,
              },
              responseType: "blob", // Set response type to blob for file download
            }
          );

          const url =
            window.URL.createObjectURL(new Blob([response.data])) || null;
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", "Student_Data.xlsx");
          document.body.appendChild(link);
          link.click();
        } catch (error) {
          toast.error("Error downloading Excel file:", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        }
      }
      if (currRole == "staff") {
        try {
          const response = await axios.get(
            `/user/staff/excel/data/${currSchool}?status=${status}`,
            {
              headers: {
                authorization: `${localStorage.getItem("token")}`,
              },
              responseType: "blob", // Set response type to blob for file download
            }
          );

          const url =
            window.URL.createObjectURL(new Blob([response.data])) || null;
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", "Student_Data.xlsx");
          document.body.appendChild(link);
          link.click();
        } catch (error) {
          toast.error("Error downloading Excel file:", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
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
    router.push(`/shareview/edit/${id}?schoolid=${currSchool}`);
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
    router.push(`/shareview/staffedit/${id}`);
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
    const statusObj = statusCount?.find((count) => count._id === value);
    return statusObj ? statusObj.count : 0; // Return count or 0 if not found
  };
  return (
    <div>
      <Nav />

      <section className="bg-white dark:bg-gray-900 py-10 ">
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
          { (
            <form
              className="mt-6 w-full flex justify-between flex-wrap"
              onSubmit={handleFormSubmit}
            >
              {/* School Dropdown */}

{schoolData?.name}
              {/* Role Selection Buttons */}
              <div className="mb-4 flex space-x-4">
                {currRole === "student" && (
                  <button
                    type="button"
                    disabled
                    onClick={() => setCurrRole("student")}
                    className={`px-4 py-1 rounded-md font-medium ${
                      currRole === "student"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    Student
                  </button>
                )}
                {currRole === "staff" && (
                  <button
                    type="button"
                    disabled
                    onClick={() => setCurrRole("staff")}
                    className={`px-4 py-1 rounded-md font-medium ${
                      currRole === "staff"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    Staff
                  </button>
                )}
                {/* {submitted && (
                  <Link
                    href={`/Adddata?vendor=${currSchool}&role=${currRole}&class=${classNameValue}&section=${sectionValueSearch}&course=${courseValueSearch}&staffType=${staffValueSearch}&institute=${staffValueSearchInsi}`}
                    className={`px-4 py-2 rounded-md font-medium  bg-gray-200 text-gray-700`}
                  >
                    Add  {currRole}
                  </Link>
                )} */}
              </div>

              {/* Status Selection Buttons */}
              <div className="mb-4 flex space-x-4 relative">
                {/* Pending Button */}
                <button
                  type="button"
                  onClick={() => setstatus("Panding")}
                  className={`px-4 py-2 rounded-md font-medium relative ${
                    status === "Panding"
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
                  className={`px-4 py-2 rounded-md font-medium relative ${
                    status === "Ready to print"
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
                  className={`px-4 py-2 rounded-md font-medium relative ${
                    status === "Printed"
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  Printed
                  {statusCount.length > 0 && (
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
          <div className="container mx-auto px-4 sm:px-8 lg:px-16">
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
                          disabled
                          onChange={(e) => {
                            setclassNameValue(e.target.value);

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
                          disabled
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
                          disabled
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
                          disabled
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
                          disabled
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
                      className={`relative shadow-lg p-6 rounded-xl border-2 w-full bg-gradient-to-b from-blue-400 via-blue-300 to-blue-100 transform  transition-all duration-300 ${
                        studentIds.includes(student._id)
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
                          <div>
                            <div className="flex gap-3">
                              <button
                                onClick={() =>
                                  handleShare(student._id, student.name)
                                }
                                className=" p-1 z-10 bg-green-600 text-white rounded-full shadow-md hover:bg-blue-500"
                              >
                                <FaShareAlt size={13} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  deleteStudent(student._id);
                                }}
                                className=" p-1 z-10 bg-red-600 text-white rounded-full shadow-md hover:bg-red-500"
                              >
                                <FaTrashAlt ize={13} />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className=" mt-3">
                        <h3 className=" font-bold text-gray-800 mt-4 text-center text-wrap break-words">
                          {student?.name}
                        </h3>
                        <div className="flex flex-col items-center mt-1">
                          <div className="grid grid-cols-2 gap-2 ">
                            <Image
                              height={80}
                              width={80}
                              className="min-w-[95%] max-w-[95%] min-h-[100px] max-h-[100px] rounded-full border-4 border-blue-500 shadow-lg"
                              src={student?.avatar?.url}
                              alt={student?.name}
                            />

                            <div>
                              <div className="mt-4 text-gray-700 ">
                                {student?.photoNameUnuiq && (
                                  <p className="text-[10px] font-medium">
                                    Photo No.: {student?.photoNameUnuiq}
                                  </p>
                                )}
                                {schoolData?.requiredFields?.includes(
                                  "Class"
                                ) && (
                                  <p>
                                    <span className="font-semibold">
                                      Class:
                                    </span>{" "}
                                    <span className=" text-[13px]">
                                      {" "}
                                      {student?.class || ""}
                                    </span>
                                  </p>
                                )}
                                {schoolData?.requiredFields?.includes(
                                  "Section"
                                ) && (
                                  <p>
                                    <span className="font-semibold">
                                      Section:
                                    </span>{" "}
                                    <span className=" text-[13px]">
                                      {" "}
                                      {student?.section || ""}
                                    </span>
                                  </p>
                                )}
                                {schoolData?.requiredFields?.includes(
                                  "Course"
                                ) && (
                                  <p>
                                    <span className="font-semibold">
                                      Course:
                                    </span>{" "}
                                    {student?.course || ""}
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

                      {status === "Panding" &&  (
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
                      {/* {status === "Printed" && !user?.school && (
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
                      )} */}
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
                  className={`relative shadow-lg p-6 rounded-xl border-2 w-full bg-gradient-to-b from-blue-400 via-blue-300 to-blue-100 transform  transition-all duration-300 ${
                    staffIds.includes(staff._id)
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
                    {status === "Panding" && (
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
                    {status === "Printed" && (
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
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
      <div>
        {/* Chat Box Button */}
        {/* {submitted} */}
        {submitted && (status === "Panding" ||  status === "Ready to print") && (
          <button
            className={`fixed bottom-4 left-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-full shadow-lg ${
              !showChatBox ? "button-bounce" : ""
            }`}
            onClick={toggleChatBox}
          >
            More
          </button>
        )}

        {/* List of Buttons in Chat Box */}

        {showChatBox && (
          <div className="fixed bottom-16 left-4 flex flex-col gap-3">
            {!user?.school && status ==="Panding" && (
              <>
                <button
                  className={`flex items-center gap-2 ${
                    isAllSelected
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  } text-white py-2 px-4 rounded-lg shadow-lg`}
                  onClick={selectAllStudents}
                >
                  {isAllSelected ? <FaUserTimes /> : <FaUserCheck />}
                  {isAllSelected ? "Unselect All" : "Select All"}
                </button>
                <button
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg shadow-lg"
                  onClick={deletHandler}
                >
                  <FaTrashAlt /> Delete Selected
                </button>
              </>
            )}

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
            {status === "Ready to print" && (
              <>
          
                {!user?.school && (
                  <button
                    className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg shadow-lg"
                    onClick={modeToPending}
                  >
                    <FaArrowLeft /> Move Back to Pending
                  </button>
                )}
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
