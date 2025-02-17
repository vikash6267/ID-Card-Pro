"use client";
import React, { useEffect, useState } from "react";


import axios from "../../../../axiosconfig"

import Layout from "@/app/components/Admin/Layout";



function Distributors() {
  const [users,setUsers] = useState();

  const config = () => {
    return {
        headers: {
            'authorization': localStorage.getItem('token') || '' // Ensure token is always a string
        },
        withCredentials: true
    };
};
const searchUsers = async () => {
  const response = await axios.post(`/admin/users`, null, config()
  );
  setUsers(response.data.users);
  console.log(response.data.users)
};

useEffect(() => {
  const searchUsers = async () => {
    const response = await axios.post(`/admin/users`, null, config()
    );
    setUsers(response.data.users);
    console.log(response.data.users)
  };
   searchUsers();
}, []); 

const DeletUser = async (id) =>{
  const response = await axios.post(`${basePath}/admin/delete/user/${id}`, null, config()
  );
  setUsers(response.data.user);
}

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
      <>
        <div className="main ">
          <div className="dashboard flex flex-col px-10 w-full">
            <div id="right-dashboard">
              <div className="nav flex items-center justify-between w-full py-4 px-6 border-b-2 border-gray-200 	">
                <div className="left flex items-center gap-3">
                 
                  <h1 className="font-semibold"> Distributers</h1>
                </div>
              </div>
            </div>
            <div className=" w-[70vw] h-[70vh] mt-8 overflow-x-auto overflow-y-auto ">
              <table className=" border rounded-lg overflow-hidden">
                <thead className="bg-indigo-600 text-white">
                  <tr>
                    <th className="py-2 px-4 font-semibold">Name</th>
                    <th className="py-2 px-4 font-semibold">Email</th>
                    <th className="py-2 px-4 font-semibold">Contact</th>
                    <th className="py-2 px-4 font-semibold">city</th>
                    <th className="py-2 px-4 font-semibold">district</th>
                    <th className="py-2 px-4 font-semibold">state</th>
                    <th className="py-2 px-4 font-semibold">companyName</th>
                    <th className="py-2 px-4 font-semibold">VendorLimit</th>
                    <th className="py-2 px-4 font-semibold">studentLimit</th>
                    <th className="py-2 px-4 font-semibold">staffLimit</th>
                    <th className="py-2 px-4 font-semibold">exportExcel</th>
                    <th className="py-2 px-4 font-semibold">exportImage</th>
                  </tr>
                </thead>
                <tbody className="bg-orange-100">
                  {users &&
                    users?.map((e, index) => (
                      <tr
                        key={index}
                        className={
                          index % 2 === 0 ? "bg-indigo-100" : "bg-white"
                        }
                      >
                        <td className="py-2 px-4 text-center text-nowrap">{`${e?.name}`}</td>
                        <td className="py-2 px-4 text-center">{e?.email}</td>
                        <td className="py-2 px-4 text-center">{e?.contact}</td>
                        <td className="py-2 px-4 text-center">{e?.city}</td>
                        <td className="py-2 px-4 text-center text-nowrap">{e?.district}</td>
                        <td className="py-2 px-4 text-center text-nowrap">{e?.state}</td>
                        <td className="py-2 px-4 text-center text-nowrap">
                          {e?.companyName}
                        </td>
                        <td className="py-2 px-4 text-center">
                          {e?.schoolLimit}
                        </td>
                        <td className="py-2 px-4 text-center">
                          {e?.studentLimit}
                        </td>
                        <td className="py-2 px-4 text-center">
                          {e?.staffLimit}
                        </td>
                        <td className="py-2 px-4 text-center">
                          {e?.exportExcel ?( <button className=" bg-indigo-600 px-2 py-1 text-white rounded-md" onClick={() => ChageExcelfile(e._id)}>ON</button> ):(<button className=" bg-indigo-600 px-2 py-1 text-white rounded-md" onClick={() => ChageExcelfile(e._id)}  >OFF</button>)}
                        </td>
                        <td className="py-2 px-4 text-center">
                          {e?.exportImage ?( <button className=" bg-indigo-600 px-2 py-1 text-white rounded-md" onClick={() => ChageImages(e._id)}>ON</button> ):(<button className=" bg-indigo-600 px-2 py-1 text-white rounded-md" onClick={() => ChageImages(e._id)}  >OFF</button>)}
                        </td>
                        {/* <td className="py-2 px-4 text-center">
                    {e?.studentId?.resumePdf?.fileId ? (
                      <a href={e?.studentId?.resumePdf?.url} target="_blank">
                        Doanload
                      </a>
                    ) : (
                      <Link href={`/WatchResumeEmploye/${e?.studentId?._id}`}>
                        Watch
                      </Link>
                    )}
                  </td>
                  <td className="py-2 px-4 text-center">
                    <select
                      className="bg-white border rounded-md py-1 px-2"
                      value={statusMap[e?._id] || "pending"}
                      onChange={(event) => handleSelectChange(e?._id, event)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Accepted">Accept</option>
                      <option value="Rejected">Reject</option>
                    </select>
                  </td> */}
                      </tr>
                    ))}
                </tbody>
              </table>
              {/* <Bar data={data} /> */}
            </div>
          </div>
        </div>
      </>
    </Layout>
  );
}

export default Distributors;
