"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Nav from "../components/Nav";
import { Disclosure } from "@headlessui/react";
import { addStaff, addStudent } from "@/redux/actions/userAction";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { redirect, useRouter } from "next/navigation";

import ImageUpload from "@/component/ImageUpload";
import axios from "../../../axiosconfig";
const Adddata = () => {
  const { user, schools, error } = useSelector((state) => state.user);
  const [currSchool, setCurrSchool] = useState("");
  const [currRole, setCurrRole] = useState("");

  const [name, setName] = useState("");

  const [studentClass, setStudentClass] = useState("");
  const [section, setSection] = useState("");

  const [photoName, setPhotoName] = useState("");

  const [staffType, setStaffType] = useState("");

  const dispatch = useDispatch();
  const [loginSchool, setloginSchool] = useState(false);

  const [extraField2, setExtraField2] = useState("");
  const [imageData, setImageData] = useState({ publicId: "", url: "" }); // State to store only public_id and url
  const [selectedImage, setSelectedImage] = useState(null); // Base64 image data
  // Signature
  const [SignatureData, setSignatureData] = useState({ publicId: "", url: "" }); // State to store only public_id and url
  const [selectedImageSig, setSelectedImageSig] = useState(null); // Base64 image data

  const [course, setCourse] = useState("");

  const [extraFields, setExtraFields] = useState({});
  const [extraFieldsStaff, setExtraFieldsStaff] = useState({});
  
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [courses, setCourses] = useState([]);
  const [staffTypes, setStaffTypes] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [loading, setLoading] = useState(false);
   // toggle
  const [newStaffType, setNewStaffType] = useState(false);
  const [newInstitute, setNewInstitute] = useState(false);
  const [newClass, setNewClass] = useState(false);
  const [newSection, setNewSection] = useState(false);
  const [newCourse, setNewCourse] = useState(false);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);

    // Extracting all query parameters
    const vendor = query.get("vendor");
    const role = query.get("role");
    const className = query.get("class");
    const section = query.get("section");
    const course = query.get("course");
    const staffType = query.get("staffType");
    const institute = query.get("institute");

    // Setting states based on query parameters
    if (vendor) {
        const school = schools?.find((school) => school._id == vendor);
        setCurrSchool(school);
    }

    if (role) setCurrRole(role);
    if (className) setStudentClass(className);
    if (section) setSection(section);
    if (course) setCourse(course);
    if (staffType) setStaffType(staffType);
    if (institute) setExtraField2(institute);
}, []);



  useEffect(() => {
    if (!user) {
      redirect("/");
    }
    if (user?.role == "school") {
      console.log(user.school);
      setCurrSchool(user.school);
      setloginSchool(true);
    }
  }, [user]);

  const handleSchoolSelect = async(e) => {
    // console.log("school change ni")
    if (e.target.value === "") return;
    const school = schools?.find((school) => school._id == e.target.value);
    setCurrSchool(school);
  };

  
  
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    console.log("enter");
    // Create an empty object to store form data
    const formData = {
      name,
    };

    if (studentClass) formData.class = studentClass;
    if (section) formData.section = section;
    if (photoName) formData.photoName = photoName;
    if (course) formData.course = course;
    if (extraFields) formData.extraFields = extraFields;

    if (imageData.publicId) formData.publicId = imageData.publicId;
    if (imageData.url) formData.url = imageData.url;
    // Add other student schema fields here

    // Log formData
    console.log(formData);

    // Dispatch action to add student with formData
    console.log(currSchool?._id);
    const response = await dispatch(addStudent(formData, currSchool._id));
    console.log(response);

    if (response == "successfully Register") {
      toast.success(response, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      setSelectedImage(null);

      setName("");

      setStudentClass("");
      setSection("");
      setPhotoName("");
      setCourse("");

      setStaffType("");
      setExtraField2("");
      setImageData({ publicId: "", url: "" }); // Resetting the image data to an empty state

    
    } else {
      toast.error(response, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  const handleStaffFormSubmit = async (e) => {
    e.preventDefault();

    // Create an empty object to store form data
    const formData = {};

    // Add values to formData only if they are not empty
    if (name) formData.name = name;
    if (staffType) formData.staffType = staffType;
    if (extraField2) formData.institute = extraField2;
    if (extraFieldsStaff) formData.extraFieldsStaff = extraFieldsStaff;
    if (SignatureData) formData.SignatureData = SignatureData;
    // Add other staff fields here
    if (imageData.publicId) formData.publicId = imageData.publicId;
    if (imageData.url) formData.url = imageData.url;

    // Dispatch action to add staff with formData
    const response = await dispatch(addStaff(formData, currSchool._id));
    console.log(response);
    if (response == "Successfully Registered") {
      toast.success(response, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      setSelectedImage(null);

      setName("");

      setStudentClass("");
      setSection("");
      setPhotoName("");
      setCourse("");

      setStaffType("");
      setExtraField2("");
      setImageData({ publicId: "", url: "" }); // Resetting the image data to an empty state

      
    } else {
      toast.error(response, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }

    // Clear all form values after dispatching the form
  };

  const handleExtraFieldChange = (e, fieldName) => {
    setExtraFields({
      ...extraFields,
      [fieldName]: e.target.value,
    });
  };
  const handleExtraFieldChangeStaff = (e, fieldName) => {
    setExtraFieldsStaff({
      ...extraFieldsStaff,
      [fieldName]: e.target.value,
    });
  };

useEffect(()=>{


  const handleSchoolSelectHello = async () => {
    const schoolId = currSchool._id;
    
    // Validate schoolId
    if (!schoolId) {
        console.error("❌ No school selected.");
        return 
    }

    setLoading(true);

    try {


      if (user?.role == "school") {
        console.log(user.school);
        setCurrSchool(user.school);
        setloginSchool(true);
      }
      else{
        const school = schools?.find((school) => school._id === schoolId);
        if (!school) {
            setLoading(false);
            console.error("❌ School not found in local state.");
            return alert("Selected school does not exist.");
        }

        setCurrSchool(school);
      }
      

        const response = await axios.post("/user/filter-data", { schoolId });

        if (response.data) {
          console.log(response.data)
            setClasses(response.data.uniqueStudents || []);
            setSections(response.data.uniqueSections || []);
            setCourses(response.data.uniqueCourses || []);
            setStaffTypes(response.data.staffTypes || []);
            setInstitutes(response.data.instituteUni || []);
        } else {
            console.error("❌ Unexpected response structure:", response);
            alert("Unexpected response from the server.");
        }
    } catch (err) {
        console.error("❌ Error fetching filtered data:", err);
        alert(err.response?.data?.message || "Failed to fetch data. Please try again.");
    } finally {
        setLoading(false);
    }
};

handleSchoolSelectHello()

},[currSchool])

  return (
    <>
      <Nav />
      <section className="bg-white dark:bg-gray-900 py-10">
        <div className="container flex flex-col items-center justify-center  px-6 mx-auto">
          <div className="flex items-center justify-center mt-6"></div>
          {!loginSchool && schools?.length !== 0 && (
            <form className="mt-6 w-full max-w-md">
              <div className="mb-4">
                <label
                  htmlFor="school"
                  className="block text-md text-center font-medium text-gray-700"
                >
                  Select Vendor
                </label>
                <select
                  id="school"
                  onChange={handleSchoolSelect}
                  value={currSchool._id}
                  className="mt-1 h-10 px-3 border block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select Vendor</option>
                  {schools?.map((school) => (
                    <option key={school?._id} value={school?._id}>
                      {school.name}
                    </option>
                  ))}
                </select>
              </div>
            </form>
          )}
          {!loginSchool && schools?.length === 0 && (
            <h4 className="text-center text-2xl py-2 px-5 text-red-500">
              Please add a School
            </h4>
          )}
          <form className="mt-3 w-full max-w-md">
            <div className="mb-4 w-full flex justify-center items-center gap-4">
              <label
                htmlFor="Role"
                className="block text-md text-center font-medium text-gray-700"
              >
                Select Role
              </label>
              <div className="mt-1 flex space-x-4">
                <button
                  type="button"
                  onClick={() => setCurrRole("student")}
                  className={`${
                    currRole === "student"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700"
                  } px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setCurrRole("staff")}
                  className={`${
                    currRole === "staff"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700"
                  } px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  Staff
                </button>
              </div>
            </div>
          </form>

          {currRole === "student" && (
            <div className="w-[320px]">
              <form action="mt-3 w-[320px] ">
                <h3 className="text-center text-xl py-3 border-b-2 mb-4 border-indigo-500">
                  Add Student
                </h3>

                <div className="mb-4 w-[320px]">
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
          <select
            id="class"
            value={studentClass}
            onChange={(e) => {
              if (e.target.value === "addNew") {
                setNewClass(true);
                setStudentClass("");
              } else {
                setNewClass(false);
                setStudentClass(e.target.value);
              }
            }}
            className="mt-1 block h-10 px-3 border w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Select Class</option>
            {classes.map((cls, index) => (
              <option key={index} value={cls}>
                {cls}
              </option>
            ))}
            <option value="addNew">Add New</option>
          </select>
          {newClass && (
            <input
              type="text"
              placeholder="Enter new Class"
              value={studentClass}
              onChange={(e) => setStudentClass(e.target.value)}
              className="mt-2 block h-10 px-3 border w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          )}
        </div>
      )}

      {/* Section Dropdown */}
      {currSchool?.requiredFields?.includes("Section") && (
        <div className="mb-4">
          <select
            id="section"
            value={section}
            onChange={(e) => {
              if (e.target.value === "addNew") {
                setNewSection(true);
                setSection("");
              } else {
                setNewSection(false);
                setSection(e.target.value);
              }
            }}
            className="mt-1 block h-10 px-3 border w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Select Section</option>
            {sections.map((sec, index) => (
              <option key={index} value={sec}>
                {sec}
              </option>
            ))}
            <option value="addNew">Add New</option>
          </select>
          {newSection && (
            <input
              type="text"
              placeholder="Enter new Section"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="mt-2 block h-10 px-3 border w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          )}
        </div>
      )}

      {/* Course Dropdown */}
      {currSchool?.requiredFields?.includes("Course") && (
        <div className="mb-4">
          <select
            id="course"
            value={course}
            onChange={(e) => {
              if (e.target.value === "addNew") {
                setNewCourse(true);
                setCourse("");
              } else {
                setNewCourse(false);
                setCourse(e.target.value);
              }
            }}
            className="mt-1 block h-10 px-3 border w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Select Course</option>
            {courses.map((crs, index) => (
              <option key={index} value={crs}>
                {crs}
              </option>
            ))}
            <option value="addNew">Add New</option>
          </select>
          {newCourse && (
            <input
              type="text"
              placeholder="Enter new Course"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="mt-2 block h-10 px-3 border w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          )}
        </div>
      )}

                {currSchool?.extraFields?.map((field, index) => (
                  <div key={index} className="mb-4">
                    <input
                      type="text"
                      id={field.name}
                      value={extraFields?.[field.name] || ""}
                      placeholder={field.name}
                      onChange={(e) => handleExtraFieldChange(e, field.name)}
                      className="mt-1 block h-10 px-3 border w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                ))}

                <ImageUpload
                  setImageData={setImageData}
                  setSelectedImage={setSelectedImage}
                  selectedImage={selectedImage}
                />

                <button
                  type="submit"
                  onClick={handleFormSubmit}
                  className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Add Student
                </button>
              </form>
            </div>
          )}
        </div>
        {currRole === "staff" && (
          <div className="w-[320px] m-auto ">
            <form action="mt-3 w-[320px]">
              <h3 className="text-center text-xl py-3 border-b-2 mb-4 border-indigo-500">
                Add Staff
              </h3>
              <div className="mb-4">
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Staff Name"
                  className="mt-1 block h-10 px-3 border w-80 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>

              {currSchool?.requiredFieldsStaff?.includes("Staff Type") && (
        <div className="mb-4">
          <select
            id="staffType"
            value={staffType}
            onChange={(e) => {
              if (e.target.value === "addNew") {
                setNewStaffType(true);
                setStaffType("");
              } else {
                setNewStaffType(false);
                setStaffType(e.target.value);
              }
            }}
            className="mt-1 block h-10 px-3 border w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Select Staff Type</option>
            {staffTypes.map((type, index) => (
              <option key={index} value={type}>
                {type}
              </option>
            ))}
            <option value="addNew">Add New</option>
          </select>
          {newStaffType && (
            <input
              type="text"
              placeholder="Enter new Staff Type"
              value={staffType}
              onChange={(e) => setStaffType(e.target.value)}
              className="mt-2 block h-10 px-3 border w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          )}
        </div>
      )}

      {currSchool?.requiredFieldsStaff?.includes("Institute") && (
        <div className="mb-4">
          <select
            id="Institute"
            value={extraField2}
            onChange={(e) => {
              if (e.target.value === "addNew") {
                setNewInstitute(true);
                setExtraField2("");
              } else {
                setNewInstitute(false);
                setExtraField2(e.target.value);
              }
            }}
            className="mt-1 block h-10 px-3 border w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Select Institute</option>
            {institutes.map((inst, index) => (
              <option key={index} value={inst}>
                {inst}
              </option>
            ))}
            <option value="addNew">Add New</option>
          </select>
          {newInstitute && (
            <input
              type="text"
              placeholder="Enter new Institute"
              value={extraField2}
              onChange={(e) => setExtraField2(e.target.value)}
              className="mt-2 block h-10 px-3 border w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          )}
        </div>
      )}

              {currSchool?.extraFieldsStaff?.map((field, index) => (
                <div key={index} className="mb-4">
                  <input
                    type="text"
                    id={field.name}
                    value={extraFieldsStaff?.[field.name] || ""}
                    placeholder={field.name}
                    onChange={(e) => handleExtraFieldChangeStaff(e, field.name)}
                    className="mt-1 block h-10 px-3 border w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              ))}
              <ImageUpload
                setImageData={setImageData}
                setSelectedImage={setSelectedImage}
                selectedImage={selectedImage}
                title="Upload Passport Size"
              />

              {currSchool.requiredFieldsStaff.includes("Signature Name") && (
                <ImageUpload
                  setImageData={setSignatureData}
                  setSelectedImage={setSelectedImageSig}
                  selectedImage={selectedImageSig}
                  title="Upload Signature"
                  height={true}
                />
              )}
              <button
                type="submit"
                onClick={handleStaffFormSubmit}
                className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Add Staff
              </button>
            </form>
          </div>
        )}
      </section>
    </>
  );
};

export default Adddata;
