"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation"; // Correct hook for query parameters
import axios from "../../../../axiosconfig";
import Swal from "sweetalert2";
import Image from "next/image";
import ImageUploaderWithCrop from "@/component/ImageUpload";
import { useDispatch } from "react-redux";
import { editStaff } from "@/redux/actions/userAction";

function Page({ params }) {
  const searchParams = useSearchParams(); // Get query parameters
  const [error, setError] = useState(null); // State to track errors
  const [currSchool, setcurrschool] = useState();

  const [name, setName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [husbandName, setHusbandName] = useState("");
  const [dob, setDob] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [qualification, setQualification] = useState("");
  const [designation, setDesignation] = useState("");
  const [staffType, setStaffType] = useState("");
  const [doj, setDoj] = useState("");
  const [uid, setUid] = useState("");
  const [staffID, setStaffID] = useState("");
  const [udiseCode, setUdiseCode] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [dispatchNo, setDispatchNo] = useState("");
  const [dateOfIssue, setDateOfIssue] = useState("");
  const [ihrmsNo, setIhrmsNo] = useState("");
  const [beltNo, setBeltNo] = useState("");
  const [photoName, setPhotoName] = useState("");

  const [licenceNo, setLicenceNo] = useState("");
  const [idNo, setIdNo] = useState("");
  const [jobStatus, setJobStatus] = useState("");
  const [panCardNo, setPanCardNo] = useState("");
  const [aadharCardNo, setAadharCardNo] = useState("");
  const [extraField1, setExtraField1] = useState("");
  const [extraField2, setExtraField2] = useState("");
  const [id, setID] = useState();
  const [imageData, setImageData] = useState({ publicId: "", url: "" }); // State to store only public_id and url
  const [selectedImage, setSelectedImage] = useState(null); // Base64 image data
  const [extraFieldsStaff, setExtraFieldsStaff] = useState({});
  const [isPending, setIsPending] = useState(false);
 const [SignatureData, setSignatureData] = useState({ publicId: "", url: "" }); // State to store only public_id and url
  const [selectedImageSig, setSelectedImageSig] = useState(null); // Base64 image data

  const dispatch = useDispatch();

  const schoolId = searchParams.get("schoolid"); // Access query param

  useEffect(() => {
    if (schoolId) {
      // Fetch school data by schoolId from backend
      axios
        .get(`user/getschool/${schoolId}`)
        .then((response) => {
          setcurrschool(response.data.data); // Update the state with fetched data
        })
        .catch((err) => {
          setError("Error fetching school data"); // Handle error if request fails
        });
    }
  }, [schoolId]); // Re-run effect when schoolId changes

  useEffect(() => {
    const staffId = params ? params.id : null;
    const factchstudent = async () => {
      const config = () => {
        return {
          headers: {
            authorization: localStorage.getItem("token") || "", // Ensure token is always a string
          },
          withCredentials: true,
        };
      };
      const response = await axios.get(`/user/staff/${staffId}`, config());
      const staffData = response.data.staff;
      if (staffData) {
        setName(staffData?.name);
        setFatherName(staffData?.fatherName);
        setHusbandName(staffData?.husbandName);
        setDob(staffData?.dob);
        setContact(staffData?.contact);
        setEmail(staffData?.email);
        setAddress(staffData?.address);
        setQualification(staffData?.qualification);
        setDesignation(staffData?.designation);
        setStaffType(staffData.staffType);
        setDoj(staffData?.doj);
        setUid(staffData?.uid);
        setStaffID(staffData?.staffID);
        setUdiseCode(staffData?.udiseCode);
        setSchoolName(staffData?.schoolName);
        setBloodGroup(staffData?.bloodGroup);
        setDispatchNo(staffData?.dispatchNo);
        setDateOfIssue(staffData?.dateOfissue);
        setIhrmsNo(staffData?.ihrmsNo);
        setBeltNo(staffData?.beltNo);
        setPhotoName(staffData?.photoName);
        setID(staffData?._id);
        setImageData({
          publicId: staffData?.avatar?.publicId,
          url: staffData?.avatar?.url,
        });
        setSignatureData({
          publicId: staffData?.signatureImage?.publicId,
          url: staffData?.signatureImage?.url,
        });
        setLicenceNo(staffData?.licenceNo); // New field
        setIdNo(staffData?.idNo); // New field
        setJobStatus(staffData?.jobStatus); // New field
        setPanCardNo(staffData?.panCardNo); // New field
        setAadharCardNo(staffData?.adharNo); // New field
        setExtraField1(staffData?.extraField1); // New field
        setExtraField2(staffData?.institute); // New field
        setExtraFieldsStaff(staffData?.extraFieldsStaff);
        if (staffData?.status === "Panding") {
          setIsPending(true);
        }
      }
    };
    factchstudent();
  }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    console.log("call");
    try {
      // Show loading alert
      Swal.fire({
        title: "Please wait...",
        text: "Updating staff data...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const shareUpdate = "true";
      const formData = { shareUpdate };

      // Add non-empty fields to formData
      formData.avatar = imageData;

      if (name) formData.name = name.trim();
      if (fatherName) formData.fatherName = fatherName.trim();
      if (husbandName) formData.husbandName = husbandName.trim();
      if (dob) formData.dob = dob.trim();
      if (contact) formData.contact = contact.trim();
      if (email) formData.email = email.trim();
      if (address) formData.address = address.trim();
      if (qualification) formData.qualification = qualification.trim();
      if (designation) formData.designation = designation.trim();
      if (staffType) formData.staffType = staffType.trim();
      if (doj) formData.doj = doj.trim();
      if (uid) formData.uid = uid.trim();
      if (staffID) formData.staffID = staffID.trim();
      if (udiseCode) formData.udiseCode = udiseCode.trim();
      if (schoolName) formData.schoolName = schoolName.trim();
      if (bloodGroup) formData.bloodGroup = bloodGroup.trim();
      if (dispatchNo) formData.dispatchNo = dispatchNo.trim();
      if (dateOfIssue) formData.dateOfIssue = dateOfIssue.trim();
      if (ihrmsNo) formData.ihrmsNo = ihrmsNo.trim();
      if (beltNo) formData.beltNo = beltNo.trim();
      if (licenceNo) formData.licenceNo = licenceNo.trim();
      if (idNo) formData.idNo = idNo.trim();
      if (jobStatus) formData.jobStatus = jobStatus.trim();
      if (panCardNo) formData.panCardNo = panCardNo.trim();
      if (aadharCardNo) formData.adharNo = aadharCardNo.trim();
      if (extraField1) formData.extraField1 = extraField1.trim();
           if (extraField2) formData.institute = extraField2.trim();

      console.log(formData);
      console.log(id);
      if (extraFieldsStaff) formData.extraFieldsStaff = extraFieldsStaff;
      if (SignatureData) formData.signatureImage = SignatureData;

      const response = await dispatch(editStaff(formData, id));
      if (response === "Staff updated successfully") {
        setSelectedImage(null);

        // Show success alert with two buttons
        Swal.fire({
          icon: "success",
          title: "Staff Updated Successfully",
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
    } catch (error) {
      // Show error alert for unexpected errors
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
        timer: 5000,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      });
    }
  };
  const handleExtraFieldChange = (e, fieldName) => {
    setExtraFieldsStaff((prevState) => ({
      ...prevState,
      [fieldName]: e.target.value,
    }));
  };


  
  if (!isPending) {
    return (
      <div className="flex items-center justify-center h-screen bg-red-200 text-red-800 p-4 rounded-lg shadow-md">
        <div className="text-lg font-semibold">
        Link Expired
        </div>
      </div>
    );
  }
  
  return (
    <div>
     <section className="bg-white dark:bg-gray-900 py-10 w-full flex justify-center items-center pt-16 ">
        <div className="w-[320px]">
          <form action="mt-3 w-[320px]" onSubmit={handleFormSubmit}>
            <h3 className="text-center text-xl py-3 border-b-2 mb-4 border-indigo-500">
              Edit Staff
            </h3>
            <div className="mb-4">
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
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Staff Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Staff Name"
                className="mt-1 block h-10 px-3 border w-80 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>
          
            {currSchool?.requiredFieldsStaff?.includes("Staff Type") && (
              <div className="mb-4">
                <label
                  htmlFor="staffType"
                  className="block text-sm font-medium text-gray-700"
                >
                  Staff Type
                </label>
                <input
                  type="text"
                  id="staffType"
                  value={staffType}
                  placeholder="Staff Type"
                  onChange={(e) => setStaffType(e.target.value)}
                  className="mt-1 block h-10 px-3 border w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            )}
           

            {/* Extra Field 2 */}
            {currSchool?.requiredFieldsStaff?.includes("Institute") && (
              <div className="mb-4">
                <label
                  htmlFor="extraField2"
                  className="block text-sm font-medium text-gray-700"
                >
                 Institute
                </label>
                <input
                  type="text"
                  id="extraField2"
                  value={extraField2}
                  placeholder="Institute"
                  onChange={(e) => setExtraField2(e.target.value)}
                  className="mt-1 block h-10 px-3 border w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            )}

            {currSchool?.extraFieldsStaff?.length > 0 &&
              currSchool?.extraFieldsStaff?.map((field, index) => (
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
                    value={extraFieldsStaff?.[field.name]} // Use existing value or empty string
                    placeholder={field.name}
                    onChange={(e) => handleExtraFieldChange(e, field.name)}
                    className="mt-1 block h-10 px-3 border w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              ))}

            {currSchool &&
              currSchool?.requiredFieldsStaff.includes("Signature Name") && (
              
              <>

                <div className=" flex justify-center my-4">
                  <img
                    height={50}
                    width={50}
                    src={SignatureData?.url}
                     className="w-[80%] h-auto max-h-[85px]"
                  />
                </div>

                <ImageUploaderWithCrop
                  setImageData={setSignatureData}
                  setSelectedImage={setSelectedImageSig}
                  selectedImage={selectedImageSig}
                  title="Upload Signature"
                  height={true}
                  signature={true}
              
                />
              </>
              )}



            {/* Add a submit button */}
            <button
              type="submit"
              className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Add Staff
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default Page;
