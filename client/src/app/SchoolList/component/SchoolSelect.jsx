"use client";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "../../../../axiosconfig";
import { FaUser, FaLock, FaTimes, FaCheck } from "react-icons/fa";
import { currentSchool } from "@/redux/actions/userAction";

const SchoolLoginFields = ({ schoolId, setLoginDetails }) => {
  const [requiredFields, setRequiredFields] = useState([]);
  const [extraFields, setExtraFields] = useState([]);
  const [selectedUsername, setSelectedUsername] = useState("");
  const [selectedPassword, setSelectedPassword] = useState("");
  const [customPassword, setCustomPassword] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchFields = async () => {
      try {
        const response = await axios.get(`/user/${schoolId}/fields`);
        setRequiredFields(response.data.requiredFields || []);
        setExtraFields(response.data.extraFields || []);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error fetching fields",
          text: error.response?.data?.message || "Something went wrong",
        });
      }
    };
    fetchFields();
  }, [schoolId]);

  const handleSave = async (event) => {
    event.preventDefault();

    try {
      const data = {
        userName: selectedUsername,
        password: selectedPassword === "custom" ? customPassword : selectedPassword,
        customPassword: selectedPassword === "custom",
      };

      await axios.post(`/user/${schoolId}/save-login`, data);

      Swal.fire({
        icon: "success",
        title: "Saved!",
        text: "Login fields saved successfully!",
      });
      setLoginDetails(data)
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
      {/* Open Modal Button */}

      
      <button
    
    onClick={(event) => { event.preventDefault();setIsModalOpen(true)}}
        className="bg-blue-600 text-white px-5 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700 transition"
      >
        <FaUser className="text-white" />
        Open Student  Login Fields
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative animate-fadeIn">
            {/* Modal Title */}
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FaLock className="text-gray-700" />
              Configure Login Fields
            </h2>

            {/* Username Dropdown */}
            <label className="block text-gray-700 font-medium mb-1">Username:</label>
            <select
              className="w-full p-2 border rounded mb-4 focus:ring-2 focus:ring-blue-400 outline-none"
              onChange={(e) => setSelectedUsername(e.target.value)}
            >
              <option value="">Select Username</option>
              {requiredFields.map((field, index) => (
                <option key={index} value={field}>
                  {field}
                </option>
              ))}
              {extraFields.map((fieldObj, index) => (
                <option key={index} value={fieldObj.name}>
                  {fieldObj.name}
                </option>
              ))}
            </select>

            {/* Password Dropdown */}
            <label className="block text-gray-700 font-medium mb-1">Password:</label>
            <select
              className="w-full p-2 border rounded mb-4 focus:ring-2 focus:ring-blue-400 outline-none"
              onChange={(e) => setSelectedPassword(e.target.value)}
            >
              <option value="">Select Password</option>
              <option value="custom">Custom</option>
              {requiredFields.map((field, index) => (
                <option key={index} value={field}>
                  {field}
                </option>
              ))}
              {extraFields.map((fieldObj, index) => (
                <option key={index} value={fieldObj.name}>
                  {fieldObj.name}
                </option>
              ))}
            </select>

            {/* Custom Password Input */}
            {selectedPassword === "custom" && (
              <input
                type="text"
                placeholder="Enter custom password"
                className="w-full p-2 border rounded mb-4 focus:ring-2 focus:ring-yellow-400 outline-none"
                onChange={(e) => setCustomPassword(e.target.value)}
              />
            )}

            {/* Action Buttons */}
            <div className="flex justify-between">
              <button
                onClick={handleSave}
                className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-green-700 transition"
              >
                <FaCheck />
                Save
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
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
