import axios from "../../../axiosconfig";
import {
  setUser,
  setSchools,
  setStudents,
  setStaff,
  setError,
  setLoading,
} from "../sclices/userSclice";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2"; // Import SweetAlert2

const config = () => {
  return {
    headers: {
      authorization: localStorage.getItem("token") || "", // Ensure token is always a string
    },
    withCredentials: true,
  };
};

export const currentUser = (userData) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    console.log("call current user")
    const token = localStorage.getItem("token");
    if (!token) {
      return;
    }
    const response = await axios.post(`/user/curr`, {}, config());
    dispatch(setUser(response?.data?.user));
    console.log(response?.data?.user)
    dispatch(currentSchool());
  } catch (error) {
    dispatch(
      setError(error?.response?.data?.message || "Failed to get current user")
    );
  } finally {
    dispatch(setLoading(false));
  }
};

export const currentSchool = (userData) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const token = localStorage.getItem("token");
    if (!token) {
      return;
    }
    const response = await axios.post(`/user/schools`, {}, config());
    console.log(response?.data?.schools)
    dispatch(setSchools(response?.data?.schools));
  } catch (error) {
    dispatch(
      setError(error?.response?.data?.message || "Failed to get current user")
    );
  } finally {
    dispatch(setLoading(false));
  }
};

export const loginUser = (userData) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    console.log(userData);

    // Show loading alert
    Swal.fire({
      title: "Please wait...",
      text: "Logging you in...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const response = await axios.post(`/user/login`, {
      ...userData,
    });
    console.log(response);

    localStorage.removeItem("token");
    localStorage.setItem("token", response.data.token);
    dispatch(currentUser());

    // Show success alert
    Swal.fire({
      icon: "success",
      title: "Login Successful",
      text: "You have been logged in successfully.",
      timer: 2000,
   
    });
  } catch (error) {
    let errorMessage = "Login failed"; // Default error message

    if (error?.response?.status === 500) {
      errorMessage = "Wrong password provided. Please try again.";
    } else if (error?.response?.data?.message) {
      errorMessage = error.response.data.message; // Server-provided error message
    }

    // Show error alert
    Swal.fire({
      icon: "error",
      title: "Login Failed",
      text: errorMessage,
      timer: 5000,
      confirmButtonText: "Try Again",

   
    
     
    });

    dispatch(setError(error?.response?.data?.message || "Login failed"));
  } finally {
    dispatch(setLoading(false));
  }
};

export const loginSchool = (userData) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    console.log(userData);

    // Show loading alert
    Swal.fire({
      title: "Please wait...",
      text: "Logging you in...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const response = await axios.post(`/user/school/login`, {
      ...userData,
    });
    console.log(response);

    localStorage.removeItem("token");
    localStorage.setItem("token", response.data.token);
    dispatch(currentUser());

    // Success alert with SweetAlert2
    Swal.fire({
      icon: "success",
      title: "Login Successful",
      text: "Welcome back!",
      confirmButtonText: "Okay",
    });
  } catch (error) {
    let errorMessage = "Login failed"; // Default error message

    if (error?.response?.status === 500) {
      errorMessage = "Wrong password provided. Please try again.";
    } else if (error?.response?.data?.message) {
      errorMessage = error.response.data.message; // Server-provided error message
    }

    // Error alert with SweetAlert2
    Swal.fire({
      icon: "error",
      title: "Login Failed",
      text: errorMessage,
      confirmButtonText: "Try Again",
    });

    dispatch(setError(error?.response?.data?.message || "Login failed"));
  } finally {
    dispatch(setLoading(false));
  }
};

export const registerUser = (userData) => async (dispatch) => {
  try {
    console.log(userData);
    dispatch(setLoading(true));

    const response = await axios.post(`/user/registration`, {
      ...userData,
    });

    dispatch(setLoading(false));
    console.log(response.data);
    localStorage.setItem("token", response.data.Token);

    if (response?.data?.succcess) {
      Swal.fire({
        icon: 'success',
        title: 'Registration Successful',
        text: response.data.message,
        confirmButtonText: 'OK',
      });
      return response.data.message;
    } else {
      throw new Error(response?.data?.message);
    }
  } catch (error) {
    console.log(error);
    dispatch(setLoading(false));

    let errorMessage = "Signin failed"; // Default error message

    if (error?.response?.status === 401) {
      // 401 is the standard code for unauthorized
      errorMessage = "User with this email already exists.";
    } else if (error?.response?.data?.message) {
      errorMessage = error.response.data.message; // Server-provided error message
    }

    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: errorMessage,
      confirmButtonText: 'OK',
    });

    dispatch(
      setError(error?.response?.data?.message || "registerStudent failed")
    );
  }
};

export const submitOtpStudent = (otp) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await axios.post(
      `/user/activate/user`,
      otp, config()
    );
    console.log(response?.data)
    if (response?.data?.succcess) {
      console.log("enter")
      await localStorage.removeItem("token");
      await localStorage.setItem("token", response.data.token);
      const token = localStorage.getItem("token");
      console.log(token)
      dispatch(currentUser());
      return response.data.message;
    }
    else {
      console.log("out")
      toast.error(response?.data?.succcess, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
    dispatch(setLoading(false));
  } catch (error) {
    dispatch(setLoading(false));
    console.error(error);
    dispatch(
      setError(error?.response?.data?.message || "get current user failed")
    );
  }
};



export const logoutUser = (userData) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    dispatch(setLoading(false));
    dispatch(setUser(null));
    localStorage.removeItem("token");
    dispatch(setSchools([]));
  } catch (error) {
    dispatch(setLoading(false));
    dispatch(
      setError(error?.response?.data?.message || "registerStudent failed")
    );
  }
};

export const addSchool = (userData) => async (dispatch) => {
  try {
    console.log(userData);
    
    // Show loading spinner while waiting for API response
    Swal.fire({
      title: 'Please wait...',
      text: 'Processing your request...',
      didOpen: () => {
        Swal.showLoading(); // Show loading spinner
      },
      allowOutsideClick: false, // Disable closing the alert outside
      showConfirmButton: false, // Hide confirm button
    });

    dispatch(setLoading(true));

    const response = await axios.post(`/user/registration/school`, {
      ...userData,
    }, config());

    dispatch(setLoading(false));
    dispatch(currentSchool());
    console.log(response.data);

    if (response?.data?.success) {
      // Close the loading alert and show success
      Swal.close(); // Close the loading alert
      Swal.fire({
        title: 'Success!',
        text: response.data.message,
        icon: 'success',
        confirmButtonText: 'OK',
      });
      return response.data.message;
    }

    // Fallback error message from the API
    Swal.close(); // Close the loading alert
    Swal.fire({
      title: 'Oops!',
      text: response?.data?.message || 'Something went wrong!',
      icon: 'error',
      confirmButtonText: 'Try Again',
    });
    return response.data.message;

  } catch (error) {
    dispatch(setLoading(false));

    // Close the loading alert
    Swal.close();

    // Error alert using SweetAlert2
    Swal.fire({
      title: 'Error!',
      text: error?.response?.data?.message || 'Registration failed',
      icon: 'error',
      confirmButtonText: 'OK',
    });

    dispatch(setError(error?.response?.data?.message || 'registerStudent failed'));
  }
};

export const editStudent = (studntData, id) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await axios.post(`/user/edit/student/${id}`, {
      ...studntData,
    },);
    dispatch(setLoading(false));
    return response.data.message;
  } catch (error) {
    dispatch(setLoading(false));
    dispatch(
      setError(error?.response?.data?.message || "registerStudent failed")
    );
  }
};

export const editStaff = (staffData, id) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await axios.post(`/user/edit/staff/${id}`, {
      ...staffData,
    }, config());
    dispatch(setLoading(false));
    return response.data.message;
  } catch (error) {
    console.log(error)
    dispatch(setLoading(false));
    dispatch(
      setError(error?.response?.data?.message || "registerStudent failed")
    );
  }
};
export const updateStudent = (userData) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const { data } = await axios.post(
      `${basePath}/student/update`,
      userData,
      config()
    );
    dispatch(currentStudent());
    dispatch(setLoading(false));
  } catch (error) {
    dispatch(setLoading(false));
    console.error(error);
    dispatch(
      setError(error?.response?.data?.message || "get current user failed")
    );
  }
};

export const addStudent = (studntData, id) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    
    // Show the loading SweetAlert2 spinner
    Swal.fire({
      title: 'Processing...',
      text: 'Please wait while we register the student.',
      icon: 'info',
      allowOutsideClick: false, // Prevent closing the alert
      didOpen: () => {
        Swal.showLoading(); // Show the loading spinner
      }
    });

    const response = await axios.post(`/user/registration/student/${id}`, {
      ...studntData,
    }, config());

    dispatch(setLoading(false));

    // Close the loading SweetAlert2 spinner and show success message
    Swal.fire({
      icon: 'success',
      title: 'Student Registered Successfully!',
      text: response.data.message,
    });

    return response.data.message;
  } catch (error) {
    console.log(error);
    dispatch(setLoading(false));

    // Close the loading SweetAlert2 spinner and show error message
    Swal.fire({
      icon: 'error',
      title: 'Registration Failed',
      text: error?.response?.data?.message || "registerStudent failed",
    });

    dispatch(
      setError(error?.response?.data?.message || "registerStudent failed")
    );
  }
};

export const addStaff = (staffData, id) => async (dispatch) => {
  try {
    // Dispatch to set loading state in your app
    dispatch(setLoading(true));

    // Show the loading SweetAlert2 spinner
    Swal.fire({
      title: 'Processing...',
      text: 'Please wait while we register the staff.',
      icon: 'info',
      allowOutsideClick: false, // Prevent closing the alert
      didOpen: () => {
        Swal.showLoading(); // Show the loading spinner
      }
    });

    const response = await axios.post(`/user/registration/staff/${id}`, {
      ...staffData,
    }, config());

    // Dispatch to set loading state to false after successful response
    dispatch(setLoading(false));

    // Close the loading SweetAlert2 spinner and show success message
    Swal.fire({
      icon: 'success',
      title: 'Staff Registered Successfully!',
      text: response.data.message,
    });

    return response.data.message;
  } catch (error) {
    // Dispatch to set loading state to false in case of error
    dispatch(setLoading(false));

    // Close the loading SweetAlert2 spinner and show error message
    Swal.fire({
      icon: 'error',
      title: 'Registration Failed',
      text: error?.response?.data?.message || "registerStaff failed",
    });

    // Dispatch the error message
    dispatch(
      setError(error?.response?.data?.message || "registerStaff failed")
    );
  }
};

export const AllJobs =
  (obj = {}) =>
    async (dispatch) => {
      try {
        dispatch(setLoading(true));
        const { data } = await axios.post(
          `${basePath}/student/AllJobs`,
          obj,
          config()
        );
        dispatch(setAllJobs(data.jobs));
        dispatch(
          setPage({
            totalPages: data.totalPages,
            currentPage: data.currentPage,
          })
        );
        dispatch(setLoading(false));
      } catch (error) {
        dispatch(setLoading(false));
        console.error(error);
        dispatch(
          setError(error?.response?.data?.message || "get current user failed")
        );
      }
    };

export const applicationSend = (dets) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const { data } = await axios.post(
      `${basePath}/student/apply`,
      dets,
      config()
    );
    dispatch(AllJobs());
    dispatch(setLoading(false));
  } catch (error) {
    dispatch(setLoading(false));
    console.error(error);
    dispatch(
      setError(error?.response?.data?.message || "send Application failed")
    );
  }
};

export const getApplication = () => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const { data } = await axios.get(
      `${basePath}/student/applications`,
      config()
    );
    dispatch(setApplication(data.applications));
    dispatch(setLoading(false));
  } catch (error) {
    dispatch(setLoading(false));
    console.error(error);
    dispatch(
      setError(error?.response?.data?.message || "get Application failed")
    );
  }
};

export const avatarStudent = (fileData) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const formData = new FormData();
    formData.append("avatar", fileData);
    const res = await axios.post(`${basePath}/student/avatar`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        authorization: `${localStorage.getItem("token")}`,
      },
    });
    dispatch(setLoading(false));
    dispatch(currentStudent());
  } catch (error) {
    console.error(error);
    dispatch(setLoading(false));
    dispatch(
      setError(
        error?.response?.data?.message || "failed to upload a new avatar"
      )
    );
  }
};

export const deletUser = (user) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const { data } = await axios.post(`${basePath}/deletUser`, {
      ...user,
    });
    dispatch(setLoading(false));
    toast.success("Deleted User")

  } catch (error) {
    console.error(error);
    dispatch(setLoading(false));
    toast.error(errorMessage, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
    dispatch(
      setError(
        error?.response?.data?.message || "failed to upload a new avatar"
      )
    );
  }
};

export const aadExcel = (fileData, schooId,dataHeading,extraFieldsMapping) => async (dispatch) => {
  try {
    // Show loading alert
    Swal.fire({
      title: 'Uploading...',
      text: 'Please wait while the file is being uploaded.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    dispatch(setLoading(true));
    console.log("student");

    const formData = new FormData();
    formData.append("file", fileData);
    
    if (dataHeading) {
      formData.append("data", JSON.stringify(dataHeading)); // Convert to JSON string
    }
    if (extraFieldsMapping) {
      formData.append("extra", JSON.stringify(extraFieldsMapping)); // Convert to JSON string
    }

    const response = await axios.post(
      `/upload-excel/${schooId}`,
      formData,
      {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
          authorization: `${localStorage.getItem("token")}`,
        },
      }
    );

    dispatch(currentUser());
    dispatch(setLoading(false));

    // Show success alert with the response message
    Swal.fire({
      icon: 'success',
      title: 'Upload Successful',
      text: response.data.message,
      timer: 5000,
      timerProgressBar: true,
    });

    return response.data.message;
  } catch (error) {
    dispatch(setLoading(false));
    console.error(error);

    // Show error alert
    Swal.fire({
      icon: 'error',
      title: 'Upload Failed',
      text: error?.response?.data?.message || 'Failed to upload the file. Please try again.',
      timer: 5000,
      timerProgressBar: true,
    });

    dispatch(
      setError(error?.response?.data?.message || "Fail to upload Resume")
    );
  }
};

export const aadExcelstaff = (fileData, schooId,dataHeading,extraFieldsMappingStaff) => async (dispatch) => {
  try {
    // Show loading alert
    Swal.fire({
      title: 'Uploading...',
      text: 'Please wait while the file is being uploaded.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    dispatch(setLoading(true));
    console.log("staff");
    console.log(fileData);

    const formData = new FormData();
    formData.append("file", fileData);
    console.log(formData);
    if (dataHeading) {
      formData.append("data", JSON.stringify(dataHeading)); // Convert to JSON string
    }
    if (extraFieldsMappingStaff) {
      formData.append("extra", JSON.stringify(extraFieldsMappingStaff)); // Convert to JSON string
    }
    const response = await axios.post(
      `/upload-excel/staff/${schooId}`,
      formData,
      {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
          authorization: `${localStorage.getItem("token")}`,
        },
      }
    );

    dispatch(currentUser());
    dispatch(setLoading(false));

    // Close loading and show success alert
    Swal.fire({
      icon: 'success',
      title: 'Upload Successful',
      text: response.data.message,
    });

    return response.data.message;
  } catch (error) {
    dispatch(setLoading(false));
    console.error(error);

    // Close loading and show error alert
    Swal.fire({
      icon: 'error',
      title: 'Upload Failed',
      text: error?.response?.data?.message || 'Failed to upload file',
    });

    dispatch(
      setError(error?.response?.data?.message || "Failed to upload Resume")
    );
  }
};


export const submitStudentPhotos = (fileData, schooId) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const formData = new FormData();
    formData.append("file", fileData);
    const response = await axios.post(
      `/upload-excel/${schooId}`,
      formData,
      {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
          authorization: `${localStorage.getItem("token")}`,
        },
      }
    );
    dispatch(currentUser());
    dispatch(setLoading(false));
    return response.data.message;
  } catch (error) {
    dispatch(setLoading(false));
    console.error(error,);
    dispatch(
      setError(error?.response?.data?.message || "fail to upload Resume")
    );
  }
};

export const updateSchool = (userData, id) => async (dispatch) => {
  try {
    // Show loading spinner while waiting for API response
    Swal.fire({
      title: 'Please wait...',
      text: 'Updating school data...',
      didOpen: () => {
        Swal.showLoading(); // Show loading spinner
      },
      allowOutsideClick: false, // Disable closing the alert outside
      showConfirmButton: false, // Hide confirm button
    });

    dispatch(setLoading(true));

    const response = await axios.post(
      `/user/edit/school/${id}`,
      userData,
      config()
    );
console.log(response)
    dispatch(currentSchool());
    dispatch(setLoading(false));

    // Close the loading alert and show success message
    Swal.close(); // Close the loading alert
    Swal.fire({
      title: 'Success!',
      text: response.data.message,
      icon: 'success',
      confirmButtonText: 'OK',
    });

    

    return response.data.message;

  } catch (error) {
    dispatch(setLoading(false));
    console.error(error);

    // Close the loading alert and show error message
    Swal.close(); // Close the loading alert
    Swal.fire({
      title: 'Error!',
      text: error?.response?.data?.message || 'Updating school failed',
      icon: 'error',
      confirmButtonText: 'OK',
    });

    dispatch(setError(error?.response?.data?.message || 'get current user failed'));
  }
};


export const deletSchool = (id) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const { data } = await axios.post(`user/delete/school/${id}`, null, config());
    dispatch(setLoading(false));
    dispatch(currentSchool())
    toast.success("Deleted School")

  } catch (error) {
    console.error(error);
    dispatch(setLoading(false));
    toast.error(errorMessage, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
    dispatch(
      setError(
        error?.response?.data?.message || "failed to upload a new avatar"
      )
    );
  }
};