"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation"; // Correct hook for query parameters
import axios from "../../../../../axiosconfig"; // Make sure this is your axios configuration
import { useDispatch } from "react-redux";
import ImageUploaderWithCrop from "@/component/ImageUpload";
import Image from "next/image";
import Swal from "sweetalert2";
import { editStudent } from "@/redux/actions/userAction";
function Page({ params }) {
  const searchParams = useSearchParams(); // Get query parameters
  const [extraFields, setExtraFields] = useState({});

  const [error, setError] = useState(null); // State to track errors
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
  const [houseName, setHouseName] = useState("");
  const [validUpTo, setValidUpTo] = useState("");
  const [course, setCourse] = useState("");
  const [batch, setBatch] = useState("");
  const [idNo, setIdNo] = useState("");
  const [regNo, setRegNo] = useState("");
  const [extraField1, setExtraField1] = useState("");
  const [extraField2, setExtraField2] = useState("");
  const [selectedImage, setSelectedImage] = useState(null); // Base64 image data

  const [isPending, setIsPending] = useState(false);
  const [imageData, setImageData] = useState({ publicId: "", url: "" }); // State to store only public_id and url
  const dispatch = useDispatch();

  const studentId = params.id; // Access dynamic route param
  const schoolId = searchParams.get("schoolid"); // Access query param

  const [loading, setLoding] = useState(true);
    const [photoType, setPhotoType] = useState("Square");

  useEffect(() => {

 
    if (schoolId) {
      // Fetch school data by schoolId from backend
      axios
        .get(`user//getschool/${schoolId}`)
        .then((response) => {
          setcurrschool(response.data.data); // Update the state with fetched data
          setPhotoType(response.data.data.photoType || "Square");

        })
        .catch((err) => {
          setError("Error fetching school data"); // Handle error if request fails
        });
    }
  }, [schoolId]); // Re-run effect when schoolId changes

  useEffect(() => {
    console.log(studentId)
    console.log(schoolId)
    const factchstudent = async () => {
      setLoding(true);
      const response = await axios.post(`/user/student/${studentId}`);
      console.log(response);
      const temuser = response.data.student;
      console.log(temuser);
      if (temuser) {
        setID(temuser?._id);
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
        if (temuser?.status === "Panding") {
          setIsPending(true);
        }
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
        setLoding(false);
      }
    };
    factchstudent();
  }, []);

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

    console.log(formData);
    console.log(ID);

    // Show loading alert

    // Dispatch action to add student with formData
    const response = await dispatch(editStudent(formData, ID));
    console.log(response);

    if (response === "Student updated successfully") {
      setSelectedImage(null);

      // Show success alert with two buttons
      Swal.fire({
        icon: "success",
        title: "Student Updated Successfully",
      });
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

  const handleExtraFieldChange = (e, fieldName) => {
    setExtraFields((prevState) => ({
      ...prevState,
      [fieldName]: e.target.value,
    }));
  };




  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [courses, setCourses] = useState([]);
  const [staffTypes, setStaffTypes] = useState([]);
  const [institutes, setInstitutes] = useState([]);

   // toggle
  const [newStaffType, setNewStaffType] = useState(false);
  const [newInstitute, setNewInstitute] = useState(false);
  const [newClass, setNewClass] = useState(false);
  const [newSection, setNewSection] = useState(false);
  const [newCourse, setNewCourse] = useState(false);

useEffect(()=>{


  const handleSchoolSelectHello = async () => {
    if(!schoolId) return






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
      
    }
};

handleSchoolSelectHello()

},[schoolId])


  if (loading) {
    return (
      <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
        <div className="spinner"></div>
      </div>
    );
  }

  // if (!loading && !isPending) {
  //   return (
  //     <div className="flex items-center justify-center h-screen bg-red-200 text-red-800 p-4 rounded-lg shadow-md">
  //       <div className="text-lg font-semibold">Link Expire</div>
  //     </div>
  //   );
  // }

  return (
    <section className="bg-white dark:bg-gray-900 py-10 w-full flex justify-center items-center pt-16 ">
    <div className="w-[320px]">
      <form action="mt-3 w-[320px]" onSubmit={handleFormSubmit}>
        <h3 className="text-center text-xl py-3 border-b-2 mb-4 border-indigo-500">
          Edit Student
        </h3>

        <div className="w-full flex justify-center items-center flex-col">
          <Image
            src={imageData.url}
            className="w-[100px]"
            height={550}
            width={550}
            alt="logo"
          />
          <ImageUploaderWithCrop
            setImageData={setImageData}
            setSelectedImage={setSelectedImage}
            selectedImage={selectedImage}
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
  );
}

export default Page;
