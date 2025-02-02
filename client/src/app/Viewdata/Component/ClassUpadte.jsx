'use client';
import { useState, useEffect } from "react";
import axios from "../../../../axiosconfig";
import Swal from "sweetalert2";

const ClassUpdater = ({ schoolId = "6766a3c749f33676866a00a6", isOpen, onClose }) => {
    const [classes, setClasses] = useState([]);
    const [classUpdates, setClassUpdates] = useState({});
    const [schoolName, setSchoolName] = useState("Loading...");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch school name & classes
    useEffect(() => {
        axios.get(`/user/get-classes/${schoolId}`)
            .then(res => {
                setClasses(res.data.classes);
                setSchoolName(res.data.schoolName || "Unknown School");
            })
            .catch(err => {
                setError("Failed to load classes");
                console.error("Error fetching classes", err);
            })
            .finally(() => setLoading(false));
    }, [schoolId]);

    // Handle Class Name Change
    const handleChange = (oldClass, newClass) => {
        setClassUpdates(prev => ({ ...prev, [oldClass]: newClass }));
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
            confirmButtonText: "Yes, update it!"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.put("/user/update-classes", { schoolId, classUpdates });
                    Swal.fire("Updated!", "Class names have been updated.", "success");
                    setClassUpdates({});
                } catch (err) {
                    Swal.fire("Error!", "Failed to update classes. Try again.", "error");
                    console.error("Error updating classes", err);
                }
            }
        });
    };

    if (!isOpen) return null; // If not open, don't render the component

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-[9999] overflow-auto h-screen">
        <div className="modal-content p-4 max-w-4xl mx-auto bg-white shadow-xl rounded-2xl border border-gray-300 w-full sm:w-11/12 lg:w-2/3 xl:w-1/2 overflow-hidden  my-auto">
            {loading ? (
                <h1 className="text-lg sm:text-xl font-semibold text-center text-gray-600">Loading...</h1>
            ) : (
                <>
                    <h1 className="school-name text-xl sm:text-2xl font-extrabold text-gray-800 text-center mb-4">{schoolName}</h1>
                    <h2 className="update-title text-lg sm:text-xl font-semibold text-gray-700 mb-4 text-center">Update Class Names</h2>
    
                    {error && <p className="error-message text-red-500 text-center mb-4 text-sm sm:text-base">{error}</p>}
    
                    <div className="table-container overflow-x-auto max-h-[60vh] overflow-y-auto">
                        <table className="w-full border border-gray-300 rounded-lg shadow-md">
                            <thead>
                                <tr className="table-header bg-blue-600 text-white text-left">
                                    <th className="p-3 text-sm sm:text-base">Current Class</th>
                                    <th className="p-3 text-sm sm:text-base">New Class Name</th>
                                </tr>
                            </thead>
                            <tbody>
                                {classes.length > 0 ? (
                                    classes.map(cls => (
                                        <tr key={cls} className="table-row border-b hover:bg-gray-100 transition duration-200">
                                            <td className="p-3 text-gray-700 text-sm sm:text-base">{cls}</td>
                                            <td className="p-3">
                                                <input
                                                    type="text"
                                                    className="class-input border p-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                                                    defaultValue={cls}
                                                    onChange={(e) => handleChange(cls, e.target.value)}
                                                />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="2" className="no-classes p-4 text-center text-gray-500 text-sm sm:text-base">No classes found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
    
                    <button
                        className="update-button mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg transition duration-300 shadow-md disabled:opacity-50"
                        onClick={handleUpdate}
                        disabled={Object.keys(classUpdates).length === 0}
                    >
                        Update Classes
                    </button>
                    <button
                        className="close-button absolute top-2 right-2 text-gray-500 text-4xl"
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
