"use client";
import React, { useEffect, useState } from "react";
import axios from "../../../../axiosconfig";
import Layout from "@/app/components/Admin/Layout";

function Distributors() {
  const [users, setUsers] = useState([]);

  const config = () => ({
    headers: {
      authorization: localStorage.getItem("token") || "",
    },
    withCredentials: true,
  });

  const fetchUsers = async () => {
    try {
      const response = await axios.post(`/admin/users`, null, config());
      setUsers(response.data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleUserStatus = async (id, currentStatus) => {
    try {
      await axios.put(`/user/toggle-user-status/${id}`, null, config());
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === id ? { ...user, isActive: !currentStatus } : user
        )
      );
    } catch (error) {
      console.error("Error toggling user status:", error);
    }
  };

  const searchUsers = async () => {
    const response = await axios.post(`/admin/users`, null, config()
    );
    setUsers(response.data.users);
    console.log(response.data.users)
  };
  
  const ChageExcelfile = async (id) =>{
    const response = await axios.post(`/admin/set/user/exceldata/${id}`, null, config()
    );
    searchUsers();
  }
  const ChageImages = async (id) =>{
    const response = await axios.post(`/admin/set/user/imagesData/${id}`, null, config()
    );
    searchUsers();
  }

  return (
    <Layout>
      <div className="main">
        <div className="dashboard flex flex-col px-10 w-full">
          <div id="right-dashboard">
            <div className="nav flex items-center justify-between w-full py-4 px-6 border-b-2 border-gray-200">
              <h1 className="font-semibold">Distributors</h1>
            </div>
          </div>
          <div className="w-[70vw] h-[70vh] mt-8 overflow-x-auto overflow-y-auto">
            <table className="border rounded-lg overflow-hidden">
              <thead className="bg-indigo-600 text-white">
                <tr>
                  <th className="py-2 px-4 font-semibold">Active</th>
                  <th className="py-2 px-4 font-semibold">Name</th>
                  <th className="py-2 px-4 font-semibold">Email</th>
                  <th className="py-2 px-4 font-semibold">Contact</th>
                  <th className="py-2 px-4 font-semibold">City</th>
                  <th className="py-2 px-4 font-semibold">District</th>
                  <th className="py-2 px-4 font-semibold">State</th>
                  <th className="py-2 px-4 font-semibold">Company Name</th>
                  <th className="py-2 px-4 font-semibold">Vendor Limit</th>
                  <th className="py-2 px-4 font-semibold">Student Limit</th>
                  <th className="py-2 px-4 font-semibold">Staff Limit</th>
                  <th className="py-2 px-4 font-semibold">Export Excel</th>
                  <th className="py-2 px-4 font-semibold">Export Image</th>
                </tr>
              </thead>
              <tbody className="bg-orange-100">
                {users &&
                  users.map((e, index) => (
                    <tr
                      key={e._id}
                      className={index % 2 === 0 ? "bg-indigo-100" : "bg-white"}
                    >
                      {/* 🔹 Toggle Button */}
                      <td className="py-2 px-4 text-center">
                        <button
                          onClick={() => toggleUserStatus(e._id, e.isActive)}
                          className={`px-4 py-1 rounded-md ${
                            e.isActive ? "bg-green-500" : "bg-red-500"
                          } text-white`}
                        >
                          {e.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="py-2 px-4 text-center">{e.name}</td>
                      <td className="py-2 px-4 text-center">{e.email}</td>
                      <td className="py-2 px-4 text-center">{e.contact}</td>
                      <td className="py-2 px-4 text-center">{e.city}</td>
                      <td className="py-2 px-4 text-center">{e.district}</td>
                      <td className="py-2 px-4 text-center">{e.state}</td>
                      <td className="py-2 px-4 text-center">{e.companyName}</td>
                      <td className="py-2 px-4 text-center">{e.vendorLimit}</td>
                      <td className="py-2 px-4 text-center">{e.studentLimit}</td>
                      <td className="py-2 px-4 text-center">{e.staffLimit}</td>
                      <td className="py-2 px-4 text-center">
                        <button
                          className="bg-indigo-600 px-2 py-1 text-white rounded-md"
                          onClick={() => ChageExcelfile(e._id)}
                        >
                          {e.exportExcel ? "ON" : "OFF"}
                        </button>
                      </td>
                      <td className="py-2 px-4 text-center">
                        <button
                          className="bg-indigo-600 px-2 py-1 text-white rounded-md"
                          onClick={() => ChageImages(e._id)}
                        >
                          {e.exportImage ? "ON" : "OFF"}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Distributors;
