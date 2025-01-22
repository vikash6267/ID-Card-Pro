"use client";
import React, { useState, useEffect } from "react";
import Nav from "../../../components/Nav";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  currentUser,
  editStudent,
  updateSchool,
} from "@/redux/actions/userAction";
import { RiContactsBook2Line } from "react-icons/ri";
import { FaRegAddressCard } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "../../../../../axiosconfig";
import Image from "next/image";
import Swal from "sweetalert2";
import ImageUploaderWithCrop from "@/component/ImageUpload";

const EditStudent = ({ params }) => {
  const [currSchool, setcurrschool] = useState();
  const [currRole, setCurrRole] = useState("");
  const [husbandName, setHusbandName] = useState("");
  const [name, setName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [motherName, setMotherName] = useState("");
  const [dob, setDob] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [section, setSection] = useState("");
  const [session, setSession] = useState("");
  const [admissionNo, setAdmissionNo] = useState("");
  const [busNo, setBusNo] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [studentID, setStudentID] = useState("");
  const [aadharNo, setAadharNo] = useState("");
  const [ribbionColour, setRibbionColour] = useState("");
  const [routeNo, setRouteNo] = useState("");
  const [modeOfTransport, setmodeOfTransport] = useState("");
  const [ID, setID] = useState("");
  const [houseName, setHouseName] = useState("");
  const [validUpTo, setValidUpTo] = useState("");
  const [course, setCourse] = useState("");
  const [batch, setBatch] = useState("");
  const [idNo, setIdNo] = useState("");
  const [regNo, setRegNo] = useState("");
  const [extraField1, setExtraField1] = useState("");
  const [extraField2, setExtraField2] = useState("");
  const [selectedImage, setSelectedImage] = useState(null); // Base64 image data

  const [extraFields, setExtraFields] = useState({});

  const [imageData, setImageData] = useState({ publicId: "", url: "" }); // State to store only public_id and url

  const router = useRouter();
  const dispatch = useDispatch();
  const StudentlId = params ? params?.id : null; // Assuming you have a route

  // Assuming you have stored the school data in your Redux store
  const { user, schools, error } = useSelector((state) => state.user);

  useEffect(() => {
    const studentId = params ? params.id : null;
    const factchstudent = async () => {
      const config = () => {
        return {
          headers: {
            authorization: localStorage.getItem("token") || "", // Ensure token is always a string
          },
          withCredentials: true,
        };
      };
      const response = await axios.get(`/user/student/${studentId}`, config());
      const temuser = response.data.student;
      console.log(temuser);
      if (temuser) {
        setID(temuser?._id);
        setName(temuser?.name);
        setFatherName(temuser?.fatherName);
        setMotherName(temuser?.motherName);
        setDob(temuser?.dob);
        setContact(temuser?.contact);
        setEmail(temuser?.email);
        setAddress(temuser?.address);
        setRollNo(temuser?.rollNo);
        setStudentClass(temuser?.class);
        setSection(temuser?.section);
        setSession(temuser?.session);
        setAdmissionNo(temuser?.admissionNo);
        setBusNo(temuser?.busNo);
        setBloodGroup(temuser?.bloodGroup);
        setStudentID(temuser?.studentID);
        setAadharNo(temuser?.aadharNo);
        setRibbionColour(temuser?.ribbionColour);
        setRouteNo(temuser?.routeNo);
        setHouseName(temuser?.houseName);
        setExtraFields(temuser?.extraFields);

        setImageData({
          publicId: temuser?.avatar?.publicId,
          url: temuser?.avatar?.url,
        });

        if (temuser?.validUpTo) {
          const formatDate = (date) => {
            const d = new Date(date);
            const day = String(d.getDate()).padStart(2, "0");
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const year = d.getFullYear();
            return `${day}/${month}/${year}`;
          };
          setValidUpTo(formatDate(temuser.validUpTo)); // Format and set the date
        } else {
          setValidUpTo("");
        }
        setCourse(temuser?.course);
        setBatch(temuser?.batch);
        setIdNo(temuser?.idNo);
        setRegNo(temuser?.regNo);
        setExtraField1(temuser?.extraField1);
        setExtraField2(temuser?.extraField2);
      }
      if (user?.role == "school") {
        setcurrschool(user?.school);
      } else {
        let school = schools?.find((school) => school?._id == temuser?.school);
        console.log(school);
        setcurrschool(school);
      }
    };
    factchstudent();
  }, [user]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    console.log("submit");
    Swal.fire({
      title: "Please wait...",
      text: "Updating student data...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    const formData = { name };
    formData.avatar = imageData;

    if (fatherName) formData.fatherName = fatherName;
    if (motherName) formData.motherName = motherName;
    if (dob) formData.dob = dob;
    if (contact) formData.contact = contact;
    if (email) formData.email = email;
    if (address) formData.address = address;
    if (rollNo) formData.rollNo = rollNo;
    if (studentClass) formData.class = studentClass;
    if (section) formData.section = section;
    if (session) formData.session = session;
    if (admissionNo) formData.admissionNo = admissionNo;
    if (busNo) formData.busNo = busNo;
    if (bloodGroup) formData.bloodGroup = bloodGroup;
    if (studentID) formData.studentID = studentID;
    if (aadharNo) formData.aadharNo = aadharNo;
    if (ribbionColour) formData.ribbionColour = ribbionColour;
    if (routeNo) formData.routeNo = routeNo;
    if (houseName) formData.houseName = houseName;
    if (validUpTo) formData.validUpTo = validUpTo;
    if (course) formData.course = course;
    if (batch) formData.batch = batch;
    if (idNo) formData.idNo = idNo;
    if (regNo) formData.regNo = regNo;
    if (extraField1) formData.extraField1 = extraField1;
    if (extraField2) formData.extraField2 = extraField2;
    if (extraFields) formData.extraFields = extraFields;

    console.log(formData);
    console.log(ID);
    console.log(StudentlId, "param");

    // Show loading alert

    // Dispatch action to add student with formData
    const response = await dispatch(editStudent(formData, ID));
    console.log(response);

    if (response === "Student updated successfully") {
      setSelectedImage(null);

      // Show success alert with two buttons
      Swal.fire({
        icon: "success",
        title: "Student Updated Successfully",
      });
      router.push("/Viewdata");
    } else {
      // Show error alert
      Swal.fire({
        icon: "error",
        title: "Error",
        text: response,
        timer: 5000,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      });
    }
  };

  // useEffect(() => {
  //   if (currSchool?.extraFields) {
  //     const initialFields = {};
  //     currSchool.extraFields.forEach((field) => {
  //       initialFields[field.name] = field.value || ""; // Set initial value if available
  //     });
  //     setExtraFields(initialFields);
  //   }
  // }, [currSchool]);

  // Handle change in any extra field
  const handleExtraFieldChange = (e, fieldName) => {
    setExtraFields((prevState) => ({
      ...prevState,
      [fieldName]: e.target.value,
    }));
  };

  return (
    <>
      <Nav />
      <section className="bg-white dark:bg-gray-900 py-10 w-full flex justify-center items-center pt-16 ">
        <div className="w-[320px]">
          <form action="mt-3 w-[320px]" onSubmit={handleFormSubmit}>
            <h3 className="text-center text-xl py-3 border-b-2 mb-4 border-indigo-500">
              Edit Student
            </h3>

            <div className="w-full flex justify-center items-center flex-col">
              <Image
                src={imageData.url}
                className="w-[100px]"
                height={550}
                width={550}
                alt="logo"
              />
              <ImageUploaderWithCrop
                setImageData={setImageData}
                setSelectedImage={setSelectedImage}
                selectedImage={selectedImage}
              />
            </div>
            <div className="mb-4 w-[320px]">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Student Name
              </label>

              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Student Name"
                className="mt-1 block h-10 px-3 border w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>
          
            {currSchool?.requiredFields?.includes("Class") && (
              <div className="mb-4">
                <label
                  htmlFor="class"
                  className="block text-sm font-medium text-gray-700"
                >
                  Class
                </label>
                <input
                  type="text"
                  id="class"
                  value={studentClass}
                  placeholder="Class"
                  onChange={(e) => setStudentClass(e.target.value)}
                  className="mt-1 block h-10 px-3 border w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            )}
            {currSchool?.requiredFields?.includes("Section") && (
              <div className="mb-4">
                <label
                  htmlFor="section"
                  className="block text-sm font-medium text-gray-700"
                >
                  Section
                </label>
                <input
                  type="text"
                  id="section"
                  value={section}
                  placeholder="Section"
                  onChange={(e) => setSection(e.target.value)}
                  className="mt-1 block h-10 px-3 border w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            )}

          
            {currSchool?.requiredFields?.includes("Course") && (
              <div className="mb-4">
                <label
                  htmlFor="course"
                  className="block text-sm font-medium text-gray-700"
                >
                  Course
                </label>
                <input
                  type="text"
                  id="course"
                  value={course}
                  placeholder="Course"
                  onChange={(e) => setCourse(e.target.value)}
                  className="mt-1 block h-10 px-3 border w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            )}
         

            {currSchool?.extraFields?.length > 0 && currSchool?.extraFields?.map((field, index) => (
              <div key={index} className="mb-4">
              <label
                  htmlFor="extraField2"
                  className="block text-sm font-medium text-gray-700"
                >
             {field.name}
                </label>
                <input
                  type="text"
                  id={field.name}
                  value={extraFields?.[field.name]} // Use existing value or empty string
                  placeholder={field.name}
                  onChange={(e) => handleExtraFieldChange(e, field.name)}
                  className="mt-1 block h-10 px-3 border w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            ))}

            
            <div className="w-full flex justify-center items-center">
              <button
                type="submit"
                className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default EditStudent;
