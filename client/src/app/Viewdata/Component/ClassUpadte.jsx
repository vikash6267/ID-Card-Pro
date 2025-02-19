"use client";
import { useState, useEffect } from "react";
import axios from "../../../../axiosconfig";
import Swal from "sweetalert2";

const ClassUpdater = ({ schoolId, isOpen, onClose }) => {
  const [classes, setClasses] = useState([]);
  const [classUpdates, setClassUpdates] = useState({});
  const [schoolName, setSchoolName] = useState("Loading...");
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const fetch = () => {
    axios
      .get(`/user/get-classes/${schoolId}`)
      .then((res) => {
        setClasses(res.data.classes);
        setSchoolName(res.data.schoolName || "Unknown School");
      })
      .catch((err) => {
        setError("Failed to load classes");
        console.error("Error fetching classes", err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetch(); // Call the fetch function
  }, [schoolId]); // Dependency array to re-fetch when schoolId changes

  // Handle Class Name Change
  const handleChange = (oldClass, newClass) => {
    setClassUpdates((prev) => ({ ...prev, [oldClass]: newClass }));
  };

  // Send API request to update classes with confirmation popup
  const handleUpdate = async () => {
    if (Object.keys(classUpdates).length === 0) {
      Swal.fire("No Changes!", "You have not made any changes.", "info");
      return;
    }

    Swal.fire({
      title: "Are you sure?",
      text: "You are about to update class names!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, update it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.put("/user/update-classes", { schoolId, classUpdates });
          Swal.fire("Updated!", "Class names have been updated.", "success");
          setClassUpdates({});
          fetch()
        } catch (err) {
          Swal.fire("Error!", "Failed to update classes. Try again.", "error");
          console.error("Error updating classes", err);
        }
      }
    });
  };

  const [isLoading, setIsLoading] = useState(false);

  const handleRemoveAllPhotos = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will remove all photos and reset them to the default!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, remove photos!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      setIsLoading(true); // Set loading to true when the request starts
      try {
        await axios.put("/user/remove-all-photos", { schoolId });
        Swal.fire(
          "Success",
          "All photos removed and reset to default",
          "success"
        );
      } catch (err) {
        Swal.fire("Error", "Failed to remove photos", "error");
      } finally {
        setIsLoading(false); // Set loading to false after the request finishes
      }
    }
  };

  const handleDeleteClass = async (className) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `This will delete the class: ${className}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete the class!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      setIsLoading(true); // Set loading to true when the request starts
      try {
        await axios.put("/user/delete-class", { schoolId, className });
        Swal.fire("Success", "Class deleted successfully", "success");
        fetch(); // Re-fetch classes after deleting
      } catch (err) {
        Swal.fire("Error", "Failed to delete class", "error");
      } finally {
        setIsLoading(false); // Set loading to false after the request finishes
      }
    }
  };

  if (!isOpen) return null; // If not open, don't render the component

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-[888] overflow-auto h-screen">
      <div className="modal-content p-6 max-w-4xl mx-auto bg-white shadow-xl rounded-2xl border border-gray-300 w-full sm:w-11/12 lg:w-2/3 xl:w-1/2 overflow-hidden my-auto">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="spinner-border animate-spin border-t-4 border-blue-600 w-12 h-12 rounded-full"></div>
            <h1 className="ml-4 text-lg sm:text-xl font-semibold text-gray-600">
              Loading...
            </h1>
          </div>
        ) : (
          <>
            <h1 className="school-name text-xl sm:text-2xl font-extrabold text-gray-800 text-center mb-4">
              {schoolName}
            </h1>
            <h2 className="update-title text-lg sm:text-xl font-semibold text-gray-700 mb-4 text-center">
              Update Class Names
            </h2>

            <div className="actions mb-4 text-center">
              <button
                onClick={handleRemoveAllPhotos}
                className="remove-photos-btn bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition duration-300"
              >
                Remove All Photos
              </button>
            </div>

            {error && (
              <p className="error-message text-red-500 text-center mb-4 text-sm sm:text-base">
                {error}
              </p>
            )}

            <div className="table-container overflow-x-auto max-h-[60vh] overflow-y-auto">
              <table className="w-full border border-gray-300 rounded-lg shadow-md">
                <thead>
                  <tr className="table-header bg-blue-600 text-white text-left">
                    <th className="p-3 text-sm sm:text-base">Current Class</th>
                    <th className="p-3 text-sm sm:text-base">New Class Name</th>
                    <th className="p-3 text-sm sm:text-base">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {classes.length > 0 ? (
                    classes.map((cls) => (
                      <tr
                        key={cls}
                        className="table-row border-b hover:bg-gray-100 transition duration-200"
                      >
                        <td className="p-3 text-gray-700 text-sm sm:text-base">
                          {cls}
                        </td>

                        <td className="p-3">
                          <select
                            className="border p-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                            value={classUpdates[cls] || cls}
                            onChange={(e) => {
                              const selectedValue = e.target.value;
                              if (selectedValue === "add-new") {
                                setClassUpdates((prev) => ({
                                  ...prev,
                                  [cls]: "",
                                }));
                              } else {
                                handleChange(cls, selectedValue);
                              }
                            }}
                          >
                            {classes.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                            <option value="add-new">Add New Class</option>
                          </select>

                          {classUpdates[cls] !== undefined && (
                            <input
                              type="text"
                              className="border p-2 rounded-md w-full mt-2 focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                              placeholder="Enter new class name"
                              value={classUpdates[cls]}
                              onChange={(e) => {
                                setClassUpdates((prev) => ({
                                  ...prev,
                                  [cls]: e.target.value,
                                }));
                              }}
                              onBlur={() => {
                                if (!classUpdates[cls].trim()) {
                                  const updatedState = { ...classUpdates };
                                  delete updatedState[cls];
                                  setClassUpdates(updatedState);
                                }
                              }}
                            />
                          )}
                        </td>

                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleDeleteClass(cls)}
                            className="text-red-600 hover:text-red-700 transition duration-200"
                          >
                            Delete Class
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="3"
                        className="no-classes p-4 text-center text-gray-500 text-sm sm:text-base"
                      >
                        No classes found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <button
              className="update-button mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg transition duration-300 shadow-md disabled:opacity-50"
              onClick={handleUpdate}
              disabled={Object.keys(classUpdates).length === 0}
            >
              Update Classes
            </button>

            <button
              className="close-button absolute top-4 right-4 text-gray-500 text-4xl"
              onClick={() => onClose(false)}
            >
              &times;
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ClassUpdater;
