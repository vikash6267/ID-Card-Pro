"use client";

import React, { useEffect, useState } from "react";
import Layout from "@/app/components/Admin/Layout";
import axios from "../../../../axiosconfig";
import { FaChevronDown, FaChevronUp } from "react-icons/fa"; // Importing arrow icons

const UsersSchoolsData = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openUserId, setOpenUserId] = useState(null); // State to track open/close user data

  useEffect(() => {
    axios
      .get("/user/users-data")
      .then((response) => {
        setData(response.data.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-gray-700">Loading...</p>
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-red-500">{error}</p>
      </div>
    );

  const toggleUserData = (userId) => {
    setOpenUserId(openUserId === userId ? null : userId); // Toggle visibility of user data
  };

  return (
    <Layout>
      <div className="max-h-screen bg-gradient-to-r from-blue-100 to-indigo-200 flex flex-col justify-start overflow-auto py-12">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <h2 className="text-4xl font-extrabold text-center text-blue-800 mb-12">
            Users & Schools Data
          </h2>

          <div className="space-y-8">
            {data.map((user) => (
              <div
                key={user.userId}
                className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-500 text-white shadow-xl rounded-lg p-8 mb-8 transition-all  duration-300"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-semibold">{user.userName}</h3>
                    <span className="text-sm text-gray-300">{user.userEmail}</span>
                  </div>
                  <button
                    onClick={() => toggleUserData(user.userId)}
                    className="flex items-center text-blue-200 hover:text-blue-400 focus:outline-none font-semibold"
                  >
                    {openUserId === user.userId ? (
                      <>
                        <FaChevronUp className="mr-2" /> Close Schools
                      </>
                    ) : (
                      <>
                        <FaChevronDown className="mr-2" /> Open Schools
                      </>
                    )}
                  </button>
                </div>

                {openUserId === user.userId && user.schools?.length ? (
                  user.schools.map((school) => (
                    <div key={school.schoolId} className="border-t-2 mt-6 pt-6">
                      <h4 className="text-xl font-semibold text-gray-100 mb-6">
                        {school.schoolName}
                      </h4>
                      <p className="text-sm text-gray-300">{school.schoolStatus}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                        <div className="bg-gray-800 p-6 rounded-lg shadow-xl hover:bg-gray-700 transition-colors">
                          <strong className="text-lg text-gray-200">Students:</strong>
                          <ul className="list-disc pl-6 text-gray-400">
                            {Object.entries(school.studentStatusCount).map(([key, value]) => (
                              <li key={key}>
                                {key}: <span className="font-medium">{value}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-gray-800 p-6 rounded-lg shadow-xl hover:bg-gray-700 transition-colors">
                          <strong className="text-lg text-gray-200">Staff:</strong>
                          <ul className="list-disc pl-6 text-gray-400">
                            {Object.entries(school.staffStatusCount).map(([key, value]) => (
                              <li key={key}>
                                {key}: <span className="font-medium">{value}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))
                ) : openUserId === user.userId ? (
                  <p className="text-gray-400 mt-4">No schools found for this user.</p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UsersSchoolsData;
