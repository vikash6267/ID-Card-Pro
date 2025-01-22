"use client";
import React, { useState, useEffect } from "react";
import Nav from "../../components/Nav";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { updateSchool } from "@/redux/actions/userAction";
import { RiContactsBook2Line } from "react-icons/ri";
import { FaRegAddressCard } from "react-icons/fa";

import { FiUser } from "react-icons/fi"; // For Vendor Name icon
import { AiOutlineMail } from "react-icons/ai"; // For Email icon
import { MdCode } from "react-icons/md"; // For Code icon

import "react-toastify/dist/ReactToastify.css";

const EditSchool = ({ params }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const [code, setCode] = useState("");
  const [requiredFields, setRequiredFields] = useState(["Student Name"]);
  const [requiredFieldsStaff, setrequiredFieldsStaff] = useState(["Name"]);

  // Student For adddition
  const [extraFields, setExtraFields] = useState([]);
  const [newFieldName, setNewFieldName] = useState("");
  // Staff For adddition
  const [extraFieldsStaff, setExtraFieldsStaff] = useState([]);
  const [newFieldNameStaff, setNewFieldNameStaff] = useState("");

  const router = useRouter();
  const dispatch = useDispatch();
  const schoolId = params ? params.id : null; // Assuming you have a route
  console.log(schoolId);

  // Assuming you have stored the school data in your Redux store
  const { schools, error } = useSelector((state) => state.user);
  console.log(schools);

  useEffect(() => {
    const schoolId = params ? params.id : null;
    if (schoolId) {
      let school = schools?.find((school) => school?._id == schoolId);
      if (school) {
        setName(school?.name);
        setEmail(school?.email);
        setContact(school?.contact);
        setAddress(school?.address);
        setCode(school?.showPassword);
        setRequiredFields(school?.requiredFields);
        setrequiredFieldsStaff(school?.requiredFieldsStaff);
        setExtraFields(school?.extraFields);
        setExtraFieldsStaff(school?.extraFieldsStaff);
      }
    }
  }, [schools]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Here you can use the state variables (name, email, etc.) to update the school data
    const updatedSchoolData = {
      name,
      email,
      contact,
      address,
      extraFields,
      extraFieldsStaff,
      requiredFields,
      requiredFieldsStaff,
    };
    // Dispatch action to update school data
    const response = await dispatch(updateSchool(updatedSchoolData, schoolId));
    if (response == "School updated successfully") {
     
      router.push("/SchoolList");
    } 
  };

  const handleChange = (e) => {
    const { name, checked } = e.target;
    if (checked) {
      setRequiredFields((prevFields) => [...prevFields, name]);
    } else {
      setRequiredFields((prevFields) =>
        prevFields.filter((field) => field !== name)
      );
    }
  };

  const handleStaffChange = (e) => {
    const { name, checked } = e.target;
    if (checked) {
      setrequiredFieldsStaff((prevFields) => [...prevFields, name]);
    } else {
      setrequiredFieldsStaff((prevFields) =>
        prevFields.filter((field) => field !== name)
      );
    }
  };

  const handleAddField = (e) => {
    e.preventDefault();
    if (newFieldName) {
      // Add new field at the beginning of the array (above existing fields)
      setExtraFields([{ name: newFieldName }, ...extraFields]);
      setNewFieldName(""); // Clear input field after adding
    }
  };

  // Handle removing a field
  const handleRemoveField = (index) => {
    const updatedFields = extraFields.filter((_, i) => i !== index);
    setExtraFields(updatedFields);
  };

  // /staff

  const handleAddFieldStaff = (e) => {
    e.preventDefault();
    if (newFieldNameStaff) {
      // Add new field at the beginning of the array (above existing fields)
      setExtraFieldsStaff([{ name: newFieldNameStaff }, ...extraFieldsStaff]);
      setNewFieldNameStaff(""); // Clear input field after adding
    }
  };

  // Handle removing a field
  const handleRemoveFieldStaff = (index) => {
    const updatedFields = extraFields.filter((_, i) => i !== index);
    setExtraFieldsStaff(updatedFields);
  };
  return (
    <>
      <Nav />
      <section className="bg-white dark:bg-gray-900 py-10">
        <div className="container flex items-center justify-center min-h-screen px-6 mx-auto">
          <form className="w-full max-w-md">
            <div className="flex items-center justify-center mt-6">
              <a
                href="#"
                className="w-1/3 pb-4 font-medium text-center text-2xl text-gray-800 capitalize border-b-2 border-blue-500 dark:border-blue-400 dark:text-white"
              >
                Edit Vendor Details
              </a>
            </div>
            <div className="relative flex items-center mt-8">
              <label
                htmlFor="vendorName"
                className="absolute left-0 -top-6 text-gray-700 dark:text-gray-300"
              >
                Vendor Name
              </label>
              <span className="absolute">
                <FiUser className="w-6 h-6 mx-3 text-gray-300 dark:text-gray-500" />
              </span>
              <input
                type="text"
                id="vendorName"
                className="block w-full py-3 text-gray-700 bg-white border rounded-lg px-11 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-600 focus:border-blue-400 dark:focus:border-blue-300 focus:ring-blue-300 focus:outline-none focus:ring focus:ring-opacity-40"
                placeholder="Vendor Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="relative flex items-center mt-6">
              <label
                htmlFor="email"
                className="absolute left-0 -top-6 text-gray-700 dark:text-gray-300"
              >
                Email Address
              </label>
              <span className="absolute">
                <AiOutlineMail className="w-6 h-6 mx-3 text-gray-300 dark:text-gray-500" />
              </span>
              <input
                type="email"
                id="email"
                className="block w-full py-3 text-gray-700 bg-white border rounded-lg px-11 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 dark:focus:border-blue-300 focus:ring-blue-300 focus:outline-none focus:ring focus:ring-opacity-40"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

           

            <div className="relative flex items-center mt-8">
              <label
                htmlFor="contact"
                className="absolute left-0 -top-6 text-gray-700 dark:text-gray-300"
              >
                Contact
              </label>
              <span className="absolute">
                <RiContactsBook2Line className="text-gray-300 ms-3 text-xl" />
              </span>
              <input
                type="text"
                id="contact"
                className="block w-full py-3 text-gray-700 bg-white border rounded-lg px-11 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 dark:focus:border-blue-300 focus:ring-blue-300 focus:outline-none focus:ring focus:ring-opacity-40"
                placeholder="Contact"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
              />
            </div>

            <div className="relative flex items-center mt-8">
              <label
                htmlFor="address"
                className="absolute left-0 -top-6 text-gray-700 dark:text-gray-300"
              >
                Address
              </label>
              <span className="absolute">
                <FaRegAddressCard className="text-gray-300 ms-3 text-xl" />
              </span>
              <input
                type="text"
                id="address"
                className="block w-full py-3 text-gray-700 bg-white border rounded-lg px-11 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 dark:focus:border-blue-300 focus:ring-blue-300 focus:outline-none focus:ring focus:ring-opacity-40"
                placeholder="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="relative flex items-center mt-8">
              <label
                htmlFor="code"
                className="absolute left-0 -top-6 text-gray-700 dark:text-gray-300"
              >
                Password
              </label>
              <span className="absolute">
                <MdCode className="w-6 h-6 mx-3 text-gray-300 dark:text-gray-500" />
              </span>
              <input
                type="text"
                id="code"
                disabled
                className="block w-full py-3 text-gray-700 bg-white border rounded-lg px-11 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 dark:focus:border-blue-300 focus:ring-blue-300 focus:outline-none focus:ring focus:ring-opacity-40"
                placeholder="Code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>

            <h2 className="mt-5 font-semibold text-xl ">Student Required</h2>
            <div className="mt-1 flex flex-col space-x-4">
              <label
                htmlFor="studentName"
                className="flex items-center space-x-2"
              >
                <input
                  type="checkbox"
                  id="studentName"
                  name="Student Name"
                  checked={requiredFields.includes("Student Name")}
                />
                <span className="text-gray-600">Student Name</span>
              </label>

              <label htmlFor="class" className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="class"
                  name="Class"
                  checked={requiredFields.includes("Class")}
                  onChange={handleChange}
                />
                <span className="text-gray-600">Class</span>
              </label>
              <label htmlFor="section" className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="section"
                  name="Section"
                  checked={requiredFields.includes("Section")}
                  onChange={handleChange}
                />
                <span className="text-gray-600">Section</span>
              </label>

              <label htmlFor="course" className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="course"
                  name="Course"
                  checked={requiredFields.includes("Course")}
                  onChange={handleChange}
                />
                <span className="text-gray-600">Course</span>
              </label>

              <div className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
                <div className="flex items-center mb-4">
                  <input
                    type="text"
                    placeholder="Field Name"
                    value={newFieldName}
                    onChange={(e) => {
                      e.preventDefault();
                      setNewFieldName(e.target.value);
                    }}
                    className="p-3 border border-gray-300 rounded-l-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleAddField}
                    className="p-3 bg-blue-500 text-white rounded-r-lg ml-2 hover:bg-blue-600 focus:outline-none"
                  >
                    Add New Field
                  </button>
                </div>

                <h3 className="text-xl font-semibold mb-4 text-gray-800">
                  Newly Added Fields
                </h3>
                <div className="space-y-3">
                  {extraFields.length > 0 ? (
                    extraFields.map((field, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center bg-gray-50 p-3 rounded-lg shadow-sm hover:shadow-md"
                      >
                        <p className="text-gray-700">{field.name}</p>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleRemoveField(index);
                          }}
                          className="text-red-500 hover:text-red-700 focus:outline-none"
                        >
                          Remove
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No fields added yet.</p>
                  )}
                </div>
              </div>
            </div>

            <h2 className="mt-5 font-semibold text-xl">Staff Required</h2>
            <div className="mt-1 flex flex-col space-x-4">
              <label htmlFor="name" className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="name"
                  name="Name"
                  checked={requiredFieldsStaff.includes("Name")}
                />
                <span className="text-gray-600">Name</span>
              </label>

              <label
                htmlFor="staffType"
                className="flex items-center space-x-2"
              >
                <input
                  type="checkbox"
                  id="staffType"
                  name="Staff Type"
                  checked={requiredFieldsStaff.includes("Staff Type")}
                  onChange={handleStaffChange}
                />
                <span className="text-gray-600">Staff Type</span>
              </label>

              <label
                htmlFor="institute"
                className="flex items-center space-x-2"
              >
                <input
                  type="checkbox"
                  id="institute"
                  name="Institute"
                  checked={requiredFieldsStaff.includes("Institute")}
                  onChange={handleStaffChange}
                />
                <span className="text-gray-600">Institute</span>
              </label>

              <label
                htmlFor="signatureName"
                className="flex items-center space-x-2"
              >
                <input
                  type="checkbox"
                  id="signatureName"
                  name="Signature Name"
                  checked={requiredFieldsStaff.includes("Signature Name")}
                  onChange={handleStaffChange}
                />
                <span className="text-gray-600">Staff Signature</span>
              </label>

              <div className="p-4 bg-gray-100 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <input
                    type="text"
                    placeholder="Field Name"
                    value={newFieldNameStaff}
                    onChange={(e) => {
                      e.preventDefault();
                      setNewFieldNameStaff(e.target.value);
                    }}
                    className="p-2 border rounded-l-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleAddFieldStaff}
                    className="p-2 bg-blue-500 text-white rounded-r-lg ml-2 hover:bg-blue-600 focus:outline-none"
                  >
                    Add New Field
                  </button>
                </div>

                <h3 className="text-xl font-semibold mb-4">
                  Newly Added Fields For Staff
                </h3>
                <div className="space-y-2">
                  {extraFieldsStaff.length > 0 ? (
                    extraFieldsStaff.map((field, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm hover:shadow-md"
                      >
                        <p className="text-gray-800">{field.name}</p>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleRemoveFieldStaff(index);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No fields added yet.</p>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={handleSubmit}
              className="w-full px-6 py-3 mt-6 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-blue-500 rounded-lg hover:bg-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-50"
            >
              Update School
            </button>
          </form>
        </div>
      </section>
    </>
  );
};

export default EditSchool;
