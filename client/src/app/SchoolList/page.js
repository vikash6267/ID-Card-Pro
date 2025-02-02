// Import necessary dependencies
"use client";
import React, { useEffect, useState } from "react";
import Nav from "../components/Nav";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import Swal from "sweetalert2";
import { deletSchool } from "@/redux/actions/userAction";
import ClassUpdater from "../Viewdata/Component/ClassUpadte";
import { FaEdit, FaTrashAlt } from "react-icons/fa"; // Import React Icons

const SchoolList = () => {
  const { schools, error } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [showClassModal, setShowClassModal] = useState(false);
  const [currSchool, setCurrSchool] = useState("");

  // Handle delete with SweetAlert2 confirmation
  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deletSchool(id));
        Swal.fire("Deleted!", "The school has been deleted.", "success");
      }
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Nav />
      <div className="max-w-6xl mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">
          Vendor List
        </h1>
        {error && (
          <p className="text-center text-red-500 font-medium mb-4">{error}</p>
        )}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Loop through schools and display each */}
          {schools?.map((school) => (
            <div
              key={school._id}
              className="bg-white rounded-lg shadow-lg p-6 border border-gray-400 hover:shadow-xl transition duration-200 relative"
            >
              <button
                className="bg-red-500 absolute top-2  right-2 text-sm text-white py-2 px-2 rounded-full hover:bg-red-600 focus:outline-none focus:ring focus:ring-red-300 flex items-center gap-2"
                onClick={() => handleDelete(school._id)}
              >
                <FaTrashAlt />
              </button>
              <h2 className="text-2xl font-semibold text-gray-700 mb-4 truncate">
                {school?.name}
              </h2>
              {school?.contact && (
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Contact:</strong> {school.contact}
                </p>
              )}
              {school?.email && (
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Email:</strong> {school.email}
                </p>
              )}
              {school?.address && (
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Address:</strong> {school.address}
                </p>
              )}
              <div className="flex gap-4 mt-4">
                <Link
                  href={`/SchoolList/${school._id}`}
                  className="bg-blue-500 text-sm text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300 flex items-center gap-2"
                >
                  <FaEdit /> Edit Vendor
                </Link>

                <button
                  className="bg-yellow-500 text-sm text-white py-2 px-4 rounded-lg hover:bg-yellow-600 focus:outline-none focus:ring focus:ring-yellow-300 flex items-center gap-2"
                  onClick={() => {
                    setCurrSchool(school._id);
                    setShowClassModal(true);
                  }}
                >
                  Change Class
                </button>
              </div>
            </div>
          ))}
        </div>

        {showClassModal && (
          <ClassUpdater
            schoolId={currSchool}
            isOpen={showClassModal}
            onClose={setShowClassModal}
          />
        )}
        {schools?.length === 0 && (
          <p className="text-center text-gray-500 mt-10">
            No schools available. Add new schools to display here.
          </p>
        )}
      </div>
    </div>
  );
};

export default SchoolList;
