"use client";
import React, { useState, useEffect } from "react";
import Nav from "../../../components/Nav";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  currentUser,
  editStudent,
  updateSchool,
} from "@/redux/actions/userAction";
import { RiContactsBook2Line } from "react-icons/ri";
import { FaRegAddressCard } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "../../../../../axiosconfig";
import Image from "next/image";
import Swal from "sweetalert2";
import ImageUploaderWithCrop from "@/component/ImageUpload";

const EditStudent = ({ params }) => {
  const [currSchool, setcurrschool] = useState();
  const [currRole, setCurrRole] = useState("");
  const [husbandName, setHusbandName] = useState("");
  const [name, setName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [motherName, setMotherName] = useState("");
  const [dob, setDob] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [section, setSection] = useState("");
  const [session, setSession] = useState("");
  const [admissionNo, setAdmissionNo] = useState("");
  const [busNo, setBusNo] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [studentID, setStudentID] = useState("");
  const [aadharNo, setAadharNo] = useState("");
  const [ribbionColour, setRibbionColour] = useState("");
  const [routeNo, setRouteNo] = useState("");
  const [modeOfTransport, setmodeOfTransport] = useState("");
  const [ID, setID] = useState("");
  const [schoolID, setSchoolID] = useState("");
  const [houseName, setHouseName] = useState("");
  const [validUpTo, setValidUpTo] = useState("");
  const [course, setCourse] = useState("");
  const [batch, setBatch] = useState("");
  const [idNo, setIdNo] = useState("");
  const [regNo, setRegNo] = useState("");
  const [extraField1, setExtraField1] = useState("");
  const [extraField2, setExtraField2] = useState("");
  const [selectedImage, setSelectedImage] = useState(null); // Base64 image data

  const [extraFields, setExtraFields] = useState({});

  const [imageData, setImageData] = useState({ publicId: "", url: "" }); // State to store only public_id and url

  const router = useRouter();
  const dispatch = useDispatch();
  const StudentlId = params ? params?.id : null; // Assuming you have a route

  // Assuming you have stored the school data in your Redux store
  const { user, schools, error } = useSelector((state) => state.user);

  useEffect(() => {
    const studentId = params ? params.id : null;
    const factchstudent = async () => {
      const config = () => {
        return {
          headers: {
            authorization: localStorage.getItem("token") || "", // Ensure token is always a string
          },
          withCredentials: true,
        };
      };
      const response = await axios.get(`/user/student/${studentId}`, config());
      const temuser = response.data.student;
      console.log(temuser);
      if (temuser) {
        setID(temuser?._id);
        setSchoolID(temuser?.school);
        setName(temuser?.name);
        setFatherName(temuser?.fatherName);
        setMotherName(temuser?.motherName);
        setDob(temuser?.dob);
        setContact(temuser?.contact);
        setEmail(temuser?.email);
        setAddress(temuser?.address);
        setRollNo(temuser?.rollNo);
        setStudentClass(temuser?.class);
        setSection(temuser?.section);
        setSession(temuser?.session);
        setAdmissionNo(temuser?.admissionNo);
        setBusNo(temuser?.busNo);
        setBloodGroup(temuser?.bloodGroup);
        setStudentID(temuser?.studentID);
        setAadharNo(temuser?.aadharNo);
        setRibbionColour(temuser?.ribbionColour);
        setRouteNo(temuser?.routeNo);
        setHouseName(temuser?.houseName);
        setExtraFields(temuser?.extraFields);

        setImageData({
          publicId: temuser?.avatar?.publicId,
          url: temuser?.avatar?.url,
        });

        if (temuser?.validUpTo) {
          const formatDate = (date) => {
            const d = new Date(date);
            const day = String(d.getDate()).padStart(2, "0");
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const year = d.getFullYear();
            return `${day}/${month}/${year}`;
          };
          setValidUpTo(formatDate(temuser.validUpTo)); // Format and set the date
        } else {
          setValidUpTo("");
        }
        setCourse(temuser?.course);
        setBatch(temuser?.batch);
        setIdNo(temuser?.idNo);
        setRegNo(temuser?.regNo);
        setExtraField1(temuser?.extraField1);
        setExtraField2(temuser?.extraField2);
      }
      if (user?.role == "school") {
        setcurrschool(user?.school);

      } else {
        let school = schools?.find((school) => school?._id == temuser?.school);
        console.log(school)
        setcurrschool(school);
      }



    };


    factchstudent();
    console.log(currSchool)
  }, [params, user]);


  const [photoType, setPhotoType] = useState("Square");

  useEffect(() => {
    console.log("schoolID:", schoolID); // Debugging ke liye
    if (schoolID) {
      axios.get(`/user/getschool/${schoolID}`)
        .then((response) => {
          setPhotoType(response.data.data.photoType || "Square");
          console.log(response.data.data);
        })
        .catch((err) => console.log("Error fetching School data", err));
    }
  }, [schoolID]);





  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [courses, setCourses] = useState([]);
  const [staffTypes, setStaffTypes] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [loading, setLoading] = useState(false);
  // toggle
  const [newStaffType, setNewStaffType] = useState(false);
  const [newInstitute, setNewInstitute] = useState(false);
  const [newClass, setNewClass] = useState(false);
  const [newSection, setNewSection] = useState(false);
  const [newCourse, setNewCourse] = useState(false);

  useEffect(() => {


    const handleSchoolSelectHello = async () => {
      if (!schoolID) return

      const schoolId = schoolID;





      setLoading(true);

      try {





        const response = await axios.post("/user/filter-data", { schoolId });

        if (response.data) {
          console.log(response.data)
          setClasses(response.data.uniqueStudents || []);
          setSections(response.data.uniqueSections || []);
          setCourses(response.data.uniqueCourses || []);
          setStaffTypes(response.data.staffTypes || []);
          setInstitutes(response.data.instituteUni || []);
        } else {
          console.error("❌ Unexpected response structure:", response);
          alert("Unexpected response from the server.");
        }
      } catch (err) {
        console.error("❌ Error fetching filtered data:", err);
        alert(err.response?.data?.message || "Failed to fetch data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    handleSchoolSelectHello()

  }, [schoolID])



  const handleFormSubmit = async (e) => {
    e.preventDefault();
    console.log("submit");
    Swal.fire({
      title: "Please wait...",
      text: "Updating student data...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    const formData = { name };
    formData.avatar = imageData;

    if (fatherName) formData.fatherName = fatherName;
    if (motherName) formData.motherName = motherName;
    if (dob) formData.dob = dob;
    if (contact) formData.contact = contact;
    if (email) formData.email = email;
    if (address) formData.address = address;
    if (rollNo) formData.rollNo = rollNo;
    if (studentClass) formData.class = studentClass;
    if (section) formData.section = section;
    if (session) formData.session = session;
    if (admissionNo) formData.admissionNo = admissionNo;
    if (busNo) formData.busNo = busNo;
    if (bloodGroup) formData.bloodGroup = bloodGroup;
    if (studentID) formData.studentID = studentID;
    if (aadharNo) formData.aadharNo = aadharNo;
    if (ribbionColour) formData.ribbionColour = ribbionColour;
    if (routeNo) formData.routeNo = routeNo;
    if (houseName) formData.houseName = houseName;
    if (validUpTo) formData.validUpTo = validUpTo;
    if (course) formData.course = course;
    if (batch) formData.batch = batch;
    if (idNo) formData.idNo = idNo;
    if (regNo) formData.regNo = regNo;
    if (extraField1) formData.extraField1 = extraField1;
    if (extraField2) formData.extraField2 = extraField2;
    if (extraFields) formData.extraFields = extraFields;

    // Show loading alert

    // Dispatch action to add student with formData
    const response = await dispatch(editStudent(formData, ID));


    if (response === "Student updated successfully") {
      setSelectedImage(null);

      // Show success alert with two buttons
      Swal.fire({
        icon: "success",
        title: "Student Updated Successfully",
      });
      router.push("/Viewdata");
    } else {
      // Show error alert
      Swal.fire({
        icon: "error",
        title: "Error",
        text: response,
        timer: 5000,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      });
    }
  };



  const handleDeleteAvatar = async () => {
  if (!ID) return;

  const confirm = await Swal.fire({
    title: "Are you sure?",
    text: "Do you want to delete this avatar?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "Cancel",
  });

  if (confirm.isConfirmed) {
    try {
      const res = await axios.put(`/user/remove-student-image/${ID}`);

      if (res.data.success) {
        Swal.fire({
          title: "Deleted!",
          text: res.data.message,
          icon: "success",
        });

        // Update the state to default avatar
        setImageData({
          publicId: "",
          url: "https://cardpro.co.in/login.jpg",
        });
      } else {
        Swal.fire({
          title: "Error!",
          text: res.data.message,
          icon: "error",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Failed to delete avatar. Try again later.",
        icon: "error",
      });
    }
  }
};


  // useEffect(() => {
  //   if (currSchool?.extraFields) {
  //     const initialFields = {};
  //     currSchool.extraFields.forEach((field) => {
  //       initialFields[field.name] = field.value || ""; // Set initial value if available
  //     });
  //     setExtraFields(initialFields);
  //   }
  // }, [currSchool]);

  // Handle change in any extra field
  const handleExtraFieldChange = (e, fieldName) => {
    setExtraFields((prevState) => ({
      ...prevState,
      [fieldName]: e.target.value,
    }));
  };

  return (
    <>
      <Nav />
      <section className="bg-white dark:bg-gray-900 py-10 w-full flex justify-center items-center pt-16 ">
        <div className="w-[320px]">
          <form action="mt-3 w-[320px]" onSubmit={handleFormSubmit}>
            <h3 className="text-center text-xl py-3 border-b-2 mb-4 border-indigo-500">
              Edit Student
            </h3>

         <div className="w-full flex justify-center items-center flex-col relative">
  <Image
    src={imageData.url || "https://cardpro.co.in/login.jpg"}
    className="w-[100px] rounded-full border-4 border-blue-500 shadow-lg"
    height={100}
    width={100}
    alt="Student Avatar"
  />

  {/* Delete Button */}
  <button
    onClick={handleDeleteAvatar}
    type="button"
    className="absolute top-0 right-0 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 shadow-md text-xs"
    title="Delete Avatar"
  >
    X
  </button>

  <ImageUploaderWithCrop
    setImageData={setImageData}
    setSelectedImage={setSelectedImage}
    selectedImage={selectedImage}
    photoT={photoType}
  />
</div>

            <div className="mb-4 w-[320px]">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Student Name
              </label>

              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Student Name"
                className="mt-1 block h-10 px-3 border w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>
            {currSchool?.requiredFields?.includes("Class") && (
              <div className="mb-4">

                <label
                  htmlFor="class"
                  className="block text-sm font-medium text-gray-700"
                >
                  Class
                </label>
                <select
                  id="class"
                  value={studentClass}
                  onChange={(e) => {
                    if (e.target.value === "addNew") {
                      setNewClass(true);
                      setStudentClass("");
                    } else {
                      setNewClass(false);
                      setStudentClass(e.target.value);
                    }
                  }}
                  className="mt-1 block h-10 px-3 border w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select Class</option>
                  {classes.map((cls, index) => (
                    <option key={index} value={cls}>
                      {cls}
                    </option>
                  ))}
                  <option value="addNew">Add New</option>
                </select>
                {newClass && (
                  <input
                    type="text"
                    placeholder="Enter new Class"
                    value={studentClass}
                    onChange={(e) => setStudentClass(e.target.value)}
                    className="mt-2 block h-10 px-3 border w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                )}
              </div>
            )}

            {/* Section Dropdown */}
            {currSchool?.requiredFields?.includes("Section") && (
              <div className="mb-4">
                <label
                  htmlFor="section"
                  className="block text-sm font-medium text-gray-700"
                >
                  Section
                </label>
                <select
                  id="section"
                  value={section}
                  onChange={(e) => {
                    if (e.target.value === "addNew") {
                      setNewSection(true);
                      setSection("");
                    } else {
                      setNewSection(false);
                      setSection(e.target.value);
                    }
                  }}
                  className="mt-1 block h-10 px-3 border w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select Section</option>
                  {sections.map((sec, index) => (
                    <option key={index} value={sec}>
                      {sec}
                    </option>
                  ))}
                  <option value="addNew">Add New</option>
                </select>
                {newSection && (
                  <input
                    type="text"
                    placeholder="Enter new Section"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className="mt-2 block h-10 px-3 border w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                )}
              </div>
            )}

            {/* Course Dropdown */}
            {currSchool?.requiredFields?.includes("Course") && (
              <div className="mb-4">
                <label
                  htmlFor="course"
                  className="block text-sm font-medium text-gray-700"
                >
                  Course
                </label>
                <select
                  id="course"
                  value={course}
                  onChange={(e) => {
                    if (e.target.value === "addNew") {
                      setNewCourse(true);
                      setCourse("");
                    } else {
                      setNewCourse(false);
                      setCourse(e.target.value);
                    }
                  }}
                  className="mt-1 block h-10 px-3 border w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select Course</option>
                  {courses.map((crs, index) => (
                    <option key={index} value={crs}>
                      {crs}
                    </option>
                  ))}
                  <option value="addNew">Add New</option>
                </select>
                {newCourse && (
                  <input
                    type="text"
                    placeholder="Enter new Course"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="mt-2 block h-10 px-3 border w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                )}
              </div>
            )}


            {currSchool?.extraFields?.length > 0 && currSchool?.extraFields?.map((field, index) => (
              <div key={index} className="mb-4">
                <label
                  htmlFor="extraField2"
                  className="block text-sm font-medium text-gray-700"
                >
                  {field.name}
                </label>
                <input
                  type="text"
                  id={field.name}
                  value={extraFields?.[field.name]} // Use existing value or empty string
                  placeholder={field.name}
                  onChange={(e) => handleExtraFieldChange(e, field.name)}
                  className="mt-1 block h-10 px-3 border w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            ))}


            <div className="w-full flex justify-center items-center">
              <button
                type="submit"
                className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default EditStudent;
