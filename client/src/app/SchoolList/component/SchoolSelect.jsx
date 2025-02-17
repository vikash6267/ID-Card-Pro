"use client";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "../../../../axiosconfig";
import { FaUser, FaLock, FaTimes, FaCheck, FaExchangeAlt } from "react-icons/fa";

const SchoolLoginFields = ({ schoolId, setLoginDetails, studentLogin, staffLogin,setStaffLoginDetails }) => {
  const [requiredFields, setRequiredFields] = useState([]);
  const [extraFields, setExtraFields] = useState([]);
  const [selectedUsername, setSelectedUsername] = useState(studentLogin?.userName || "");
  const [selectedPassword, setSelectedPassword] = useState(studentLogin?.password || "");
  const [selectedUsernameStaff, setSelectedUsernameStaff] = useState(staffLogin?.userName || "");
  const [selectedPasswordStaff, setSelectedPasswordStaff] = useState(staffLogin?.password || "");
  const [customPassword, setCustomPassword] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStudentLogin, setIsStudentLogin] = useState(true);

useEffect(() => {
  const fetchFields = async () => {
    try {
      const response = await axios.get(`/user/${schoolId}/fields`);

      if (isStudentLogin) {
        setRequiredFields(response.data.requiredFields || []);
        setExtraFields(response.data.extraFields || []);
        setSelectedUsername(studentLogin?.userName || ""); // Set default username
        setSelectedPassword(studentLogin?.customPassword ? "custom" : studentLogin?.password || ""); // Set password or "custom"
        setCustomPassword(studentLogin?.customPassword ? studentLogin?.password : ""); // Set custom password if applicable
      
      } else {
        setRequiredFields(response.data.requiredFieldsStaff || []);
        setExtraFields(response.data.extraFieldsStaff || []);
        setSelectedUsernameStaff(staffLogin?.userName || "");
        setSelectedPasswordStaff(staffLogin?.customPassword ? "custom" : staffLogin?.password || "");
        setCustomPassword(staffLogin?.customPassword ? staffLogin?.password : "");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error fetching fields",
        text: error.response?.data?.message || "Something went wrong",
      });
    }
  };
  fetchFields();
}, [schoolId, isStudentLogin,isModalOpen]);


  const handleSave = async (event) => {
    event.preventDefault();
    try {
      const data = isStudentLogin ? {
        userName: selectedUsername,
        password: selectedPassword === "custom" ? customPassword : selectedPassword,
        customPassword: selectedPassword === "custom",
        student: true,
      } : {
        userName: selectedUsernameStaff,
        password: selectedPasswordStaff === "custom" ? customPassword : selectedPasswordStaff,
        customPassword: selectedPasswordStaff === "custom",
        staff: true,
      };


   
      await axios.post(`/user/${schoolId}/save-login`, data);

      Swal.fire({
        icon: "success",
        title: "Saved!",
        text: "Login fields saved successfully!",
      });
      if(isStudentLogin){
        setLoginDetails(data);

      }else{
        setStaffLoginDetails(data)
      }
      setIsModalOpen(false);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Save Failed",
        text: error.response?.data?.message || "Could not save login fields.",
      });
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={(e) => {e.preventDefault() ;setIsModalOpen(true)}}
        className="bg-blue-600 text-white px-5 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700 transition"
      >
        <FaUser />
        {isStudentLogin ? "Open  Login Fields" : "Open  Login Fields"}
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative animate-fadeIn">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FaLock />
              Configure {isStudentLogin ? "Student" : "Staff"} Login Fields
            </h2>

            <button
              onClick={(e) => {e.preventDefault() ; setIsStudentLogin(!isStudentLogin)}}
              className="mb-4 bg-gray-500 text-white px-3 py-1 rounded-md flex items-center gap-2 hover:bg-gray-600 transition"
            >
              <FaExchangeAlt />
              Switch to {isStudentLogin ? "Staff" : "Student"} Login
            </button>

            <label className="block text-gray-700 font-medium mb-1">Username:</label>
            <select
              className="w-full p-2 border rounded mb-4 focus:ring-2 focus:ring-blue-400 outline-none"
              value={isStudentLogin ? selectedUsername : selectedUsernameStaff}
              onChange={(e) => {e.preventDefault() ;isStudentLogin ? setSelectedUsername(e.target.value) : setSelectedUsernameStaff(e.target.value)}}
            >
              <option value=''>Select Username</option>
              {requiredFields.map((field, index) => (
                <option key={index} value={field}>{field}</option>
              ))}
              {extraFields.map((fieldObj, index) => (
                <option key={index} value={fieldObj.name}>{fieldObj.name}</option>
              ))}
            </select>

            <label className="block text-gray-700 font-medium mb-1">Password:</label>
            <select
              className="w-full p-2 border rounded mb-4 focus:ring-2 focus:ring-blue-400 outline-none"
              value={isStudentLogin ? selectedPassword : selectedPasswordStaff}
              onChange={(e) => isStudentLogin ? setSelectedPassword(e.target.value) : setSelectedPasswordStaff(e.target.value)}
            >
              <option value="">Select Password</option>
              <option value="custom">Custom</option>
              {requiredFields.map((field, index) => (
                <option key={index} value={field}>{field}</option>
              ))}
              {extraFields.map((fieldObj, index) => (
                <option key={index} value={fieldObj.name}>{fieldObj.name}</option>
              ))}
            </select>

            {((isStudentLogin && selectedPassword === "custom") || (!isStudentLogin && selectedPasswordStaff === "custom")) && (
              <input
                type="text"
                value={customPassword}
                placeholder="Enter custom password"
                className="w-full p-2 border rounded mb-4 focus:ring-2 focus:ring-yellow-400 outline-none"
                onChange={(e) => setCustomPassword(e.target.value)}
              />
            )}

            <div className="flex justify-between">
              <button
                onClick={handleSave}
                className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-green-700 transition"
              >
                <FaCheck />
                Save
              </button>
              <button
                onClick={(e) => {e.preventDefault() ;setIsModalOpen(false)}}
                className="bg-red-500 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-red-600 transition"
              >
                <FaTimes />
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolLoginFields;
