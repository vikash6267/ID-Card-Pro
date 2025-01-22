"use client";
import React, { useEffect, useState } from "react";
import Layout from "@/app/components/Admin/Layout";
import axios from "../../../../axiosconfig";

function Schools() {
  const [schools, setschools] = useState();

  const config = () => {
    return {
      headers: {
        authorization: localStorage.getItem("token") || "", // Ensure token is always a string
      },
      withCredentials: true,
    };
  };
  const searchUsers = async () => {
    const response = await axios.post(`/admin/schools`, null, config());
    setschools(response.data.schools);
    // console.log(response.data.schools);
  };

  const ChageImages = async (id) =>{
    const response = await axios.post(`/user/school/imagesData/${id}`, null, config()
    );
    searchUsers();
  }
  const ChageExcelfile = async (id) =>{
    const response = await axios.post(`/user/school/excleData/${id}`, null, config()
    );
    searchUsers();
  }

  useEffect(() => {
  
    searchUsers();
  }, []);
  return (
    <Layout>
      <>
        <style
          dangerouslySetInnerHTML={{
            __html:
              "\n        .admin-content .cart {\n            background: linear-gradient(to right, #007BFF 50%, #fff 50%);\n            background-size: 200% 100%;\n            background-position: right bottom;\n            transition: all 0.5s ease-out;\n        }\n\n        .admin-content .cart:hover {\n            background-position: left bottom;\n        }\n\n        .admin-content .cart h2 {\n            margin-top: 5px;\n        }\n\n        @media screen and (max-width: 854px) {\n            .admin-content .cart h2 {\n                font-size: 14px;\n            }\n        }\n\n        table {\n            width: 100%;\n            border-collapse: collapse;\n            margin-top: 20px;\n        }\n\n        table,\n        th,\n        td {\n            border: 1px solid #ddd;\n        }\n\n        th,\n        td {\n            text-align: left;\n            padding: 8px;\n        }\n\n        th {\n            background-color: #303956;\n            color: white;\n        }\n\n        tr:nth-child(even) {\n            background-color: #f2f2f2;\n        }\n    ",
          }}
        />
        <div className="main">
          <div className="dashboard">
            <div id="right-dashboard">
              <div className="nav flex items-center justify-between w-full py-4 px-6 border-b-2 border-gray-200 	">
                <div className="left flex items-center gap-3">
                  <h1 className="font-semibold"> Vendors</h1>
                </div>
              </div>
            </div>
            <div className=" w-[70vw] h-[70vh] mt-8 overflow-x-auto overflow-y-auto ">
              <table className=" border rounded-lg overflow-hidden">
                <thead className=" bg-indigo-600 text-white">
                  <tr>
                    <th className="py-2 px-4 font-semibold">Name</th>
                    <th className="py-2 px-4 font-semibold">Email</th>
                    <th className="py-2 px-4 font-semibold">Contact</th>
                    <th className="py-2 px-4 font-semibold">Address</th>
                    <th className="py-2 px-4 font-semibold">exportExcel</th>
                    <th className="py-2 px-4 font-semibold">exportImages</th>
                  </tr>
                </thead>
                <tbody className="">
                  {schools &&
                    schools?.map((e, index) => (
                      <tr
                        key={index}
                        className={
                          index % 2 === 0 ? "bg-indigo-100" : "bg-white"
                        }
                      >
                        <td className="py-2 px-4 text-center text-nowrap">{`${e?.name}`}</td>
                        <td className="py-2 px-4 text-center text-nowrap">
                          {e?.email}
                        </td>
                        <td className="py-2 px-4 text-center">{e?.contact}</td>
                        <td className="py-2 px-4 text-center text-nowrap">
                          {e?.address}
                        </td>
                        <td className="py-2 px-4 text-center">
                          {e?.exportExcel ?( <button className=" bg-indigo-600 px-2 py-1 text-white rounded-md" onClick={() => ChageExcelfile(e._id)}>ON</button> ):(<button className=" bg-indigo-600 px-2 py-1 text-white rounded-md" onClick={() => ChageExcelfile(e._id)}  >OFF</button>)}
                        </td>
                        <td className="py-2 px-4 text-center">
                          {e?.exportImages ?( <button className=" bg-indigo-600 px-2 py-1 text-white rounded-md" onClick={() => ChageImages(e._id)}>ON</button> ):(<button className=" bg-indigo-600 px-2 py-1 text-white rounded-md" onClick={() => ChageImages(e._id)}  >OFF</button>)}
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

export default Schools;
