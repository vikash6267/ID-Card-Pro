'use client'
import { useEffect, useState } from "react";
import axios from "../../../axiosconfig";
import { useRouter } from "next/navigation";

const StudentLogin = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [schoolData, setSchoolData] = useState(null);
  const [schoolId, setSchoolId] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state
  const router = useRouter();

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const vendor = query.get("schoolid");

    setSchoolId(vendor);
    if (vendor) {
      axios
        .get(`user/getschool/${vendor}`)
        .then((response) => {
          setSchoolData(response.data.data);
        })
        .catch(() => {
          console.log("Error fetching Vendor data");
        })
        .finally(() => {
          setLoading(false); // Stop loading when data is fetched
        });
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = async () => {
    setMessage("");

    try {
      const response = await axios.post("/user/student-login", {
        schoolId,
        userName,
        password,
      });

      if (response.data.success) {
        setMessage("Login successful!");
        console.log("Student ID:", response.data.studentId);
        router.push(
          `https://cardpro.co.in/shareview/edit/${response.data.studentId}?schoolid=${schoolId}`
        )
      }
    } catch (error) {
      console.log(error)
      setMessage(error.response?.data?.error || "Login failed!");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      {loading ? (
        // Loading Spinner
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 text-sm">Loading, please wait...</p>
        </div>
      ) : (
        // Login Form
        <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-6 sm:p-8">
          {schoolData?.name && (
            <h5 className="text-center text-gray-700 text-lg font-semibold mb-2">
              Vendor: <span className="text-blue-600">{schoolData.name}</span>
            </h5>
          )}

          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
            Student Login
          </h2>

          {message && (
            <p className="text-center text-sm font-medium mb-4 text-red-500">
              {message}
            </p>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
              placeholder="Enter Username"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
              placeholder="Enter Password"
            />
          </div>

          <button
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2 rounded-lg transition duration-200 shadow-md"
          >
            Login
          </button>

        
        </div>
      )}
    </div>
  );
};

export default StudentLogin;
