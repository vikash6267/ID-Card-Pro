const express = require("express");
const Student = require("../models/studentModel");
const Staff = require("../models/staffModel");
const School = require("../models/schoolModel");

const ejs = require("ejs");
const htmlPdf = require("html-pdf");
const path = require("path")
const {
  ExcelUpload,
  userRegistration,
  userActivation,
  userLogin,
  addStudent,
  addSchool,
  deleteStudent,
  editStudent,
  deleteSchool,
  editSchool,
  getAllStudentsInSchool,
  updateStudentStatusToPrint,
  updateStudentStatusToPending,
  updateStudentStatusToPrinted,
  deleteStudents,
  studentListExcel,
  GraphData,
  EditUser,
  updatePassword,
  userAvatar,
  ChangeActive,
  SerchSchool,
  allSchool,
  userForgetPasswordVerify,
  userForgetPasswordsendMail,
  SchoolrequiredFields,
  userProfile,
  StudentsAvatars,
  addStaff,
  editStaff,
  updateStaffStatusToPrint,
  updateStaffStatusToPending,
  updateStaffStatusToPrinted,
  deleteStaff,
  StaffAvatars,
  getAllStaffInSchool,
  ExcelStudentData,
  StaffAvatarsDownload,
  ExcelData,
  SchooluserLogin,
  SerchStudent,
  ExcelDataStaff,
  StaffNewAvatarsDownload,
  currUser,
  deleteStaffcurr,
  getStudent,
  getStaff,
  setImagesData,
  setExcleData,
  getSchoolById,
  StaffSignature,
  StaffSignatureDownload,
} = require("../controllers/userControllers");
const isAuthenticated = require("../middlewares/auth");
const router = express.Router();

const updated = require("../middlewares/multer");
const upload = require("../middlewares/multer");

// const isAuthenticated = require("../middlewares/auth");

router.post("/curr", isAuthenticated, currUser);

router.post("/registration", userRegistration);

router.post("/activate/user", userActivation);

router.post("/login", userLogin);

router.post("/school/login", SchooluserLogin);

router.get("/profile", isAuthenticated, userProfile);

router.post("/forgetpassword/email", userForgetPasswordsendMail);

router.post("/forgetpassword/code", userForgetPasswordVerify);

router.post("/edit", isAuthenticated, EditUser);

router.post("/avatar", isAuthenticated, userAvatar);

router.post("/updatepassword", isAuthenticated, updatePassword);

router.post("/isactive/school/:id", isAuthenticated, ChangeActive);

router.post("/registration/school", upload, isAuthenticated, addSchool);

router.post("/schools", isAuthenticated, allSchool);

router.get("/school/requiredfields/:id", isAuthenticated, SchoolrequiredFields);

router.post("/avatar", upload, isAuthenticated, userAvatar);

router.post("/edit/school/:id", upload, isAuthenticated, editSchool);

router.post("/delete/school/:id", isAuthenticated, deleteSchool);

router.post("/registration/student/:id", upload,  addStudent);

router.post("/registration/staff/:id", upload,  addStaff);

router.get("/student/:id", upload, getStudent);

router.get("/staff/:id", upload, getStaff);

router.post("/edit/student/:id", upload, editStudent);

router.post("/edit/staff/:id", upload, editStaff);

router.post("/student/avatars/:id", upload, StudentsAvatars);

router.post("/staff/avatars/:id", upload, StaffAvatars);
router.post("/staff/signature/:id", upload, isAuthenticated, StaffSignature);

// delete routes
router.post("/delete/student/:id", deleteStudent);
router.post("/delete/staff/:id", deleteStaffcurr);
//ALL Data
router.post("/students/:id", getAllStudentsInSchool);
router.post("/staffs/:id", getAllStaffInSchool);

router.post("/school/search", isAuthenticated, SerchSchool);

router.post("/school/imagesData/:id", isAuthenticated, setImagesData);
router.post("/school/excleData/:id", isAuthenticated, setExcleData);

// Student Status
router.post("/student/change-status/readyto/:id", updateStudentStatusToPrint);
router.post("/student/change-status/pending/:id", updateStudentStatusToPending);
router.post("/student/change-status/printed/:id", updateStudentStatusToPrinted);
// Staff Status
router.post("/staff/change-status/readyto/:id", updateStaffStatusToPrint);
router.post("/staff/change-status/pending/:id", updateStaffStatusToPending);
router.post("/staff/change-status/Printed/:id", updateStaffStatusToPrinted);

// Multiple Delete
router.post("/students/delete/:id", deleteStudents);
router.post("/staffs/delete/:id", deleteStaff);

router.post("/studentlist/excel/:id", isAuthenticated, studentListExcel);

router.post("/bar-chart", isAuthenticated, GraphData);

router.get("/excel/data/:id", isAuthenticated, ExcelData);

router.get("/staff/excel/data/:id", isAuthenticated, ExcelDataStaff);

router.post("/student/images/:id", isAuthenticated, StaffAvatarsDownload);

router.post("/staff/images/:id", isAuthenticated, StaffNewAvatarsDownload);
router.post("/staff/signatureNew/:id", isAuthenticated, StaffSignatureDownload);

router.get("/search/student/:id", isAuthenticated, SerchStudent);

// router.post("student/avatars", upload , isAuthenticated ,StudentsAvatars);

// router.get("/logout",isAuthenticated, userLongOut);

// router.put("/user",isAuthenticated,updateUserInfo)
// router.post("/uplaad/excel",ExcelUpload)

// add on
router.get("/getschool/:id", getSchoolById);
router.post("/student/:id", upload, getStudent);

router.get("/students/count/:schoolId", async (req, res, next) => {
  const schoolId = req.params.schoolId;

  try {
    // Get the count of students for the given school ID
    const studentCount = await Student.countDocuments({ school: schoolId });

    // Return the student count as a response
    res.json({
      success: true,
      studentCount,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching student count",
      error: error.message,
    });
  }
});

router.get("/staff/count/:schoolId", async (req, res, next) => {
  const schoolId = req.params.schoolId;

  try {
    // Get the count of staff for the given school ID
    const staffCount = await Staff.countDocuments({ school: schoolId });

    // Return the staff count as a response
    res.json({
      success: true,
      staffCount,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching staff count",
      error: error.message,
    });
  }
});

router.get("/students/no-photo/:schoolId", async (req, res) => {
  try {
    console.log(req.params);
    const { schoolId } = req.params; // Extract schoolId from URL parameters

    const {
      status,
      studentClass,
      section,
      course,
      limit = 50,
      offset = 0,
    } = req.query; // Add limit and offset

    let queryObj = {
      school: schoolId,
      "avatar.url": {
        $in: [
          "",
          null,
          "https://cardpro.co.in/login.jpg",
          "https://plus.unsplash.com/premium_photo-1699534403319-978d740f9297?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        ],
      },
    };
 
    const uniqueStudents = await Student.distinct("class", queryObj);

    // console.log(uniqueStudents)
    // Adding status filter if provided
    if (status) {
      queryObj.status = status;
    }

    // Adding class and section filter if provided
    // Function to escape special characters for regex
    function escapeRegex(value) {
      return value.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    }

    if (studentClass) {
      if (studentClass === "no-class" || studentClass === "") {
        queryObj.class = null; // Logic to filter for "Without Class Name"
      } else {
        const escapedClassName = escapeRegex(studentClass); // Escape special characters
        queryObj.class = { $regex: `^${escapedClassName}$`, $options: "i" }; // Exact match with regex
      }
    }
    if (course) {
      if (course === "no-class" || course === "") {
        queryObj.course = null; // Logic to filter for "Without Class Name"
      } else {
        const escapedcourseName = escapeRegex(course); // Escape special characters
        queryObj.course = { $regex: `^${escapedcourseName}$`, $options: "i" }; // Exact match with regex
      }
    }

    if (section) {
      queryObj.section = { $regex: section, $options: "i" };
    }

    function escapeRegex(value) {
      return value.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    }

    if (studentClass && studentClass !== "no-class" && studentClass !== "") {
      queryObj.class = { $regex: `^${escapeRegex(studentClass)}$`, $options: "i" };
    }
    if (course && course !== "no-class" && course !== "") {
      queryObj.course = { $regex: `^${escapeRegex(course)}$`, $options: "i" };
    }
    if (section) {
      queryObj.section = { $regex: `^${escapeRegex(section)}$`, $options: "i" };
    }
    

    // Add pagination with limit and offset
    const students = await Student.find(queryObj)
      .populate({
        path: "school", // Populate the 'school' field
        select: "name", // Select only the 'name' field from the School model
      })
      .skip(parseInt(offset)) // Skip documents for pagination
      .limit(parseInt(limit)); // Limit the number of documents returned

    if (students.length === 0) {
      return res
        .status(404)
        .json({ message: "No students without a photo found." });
    }

    return res.status(200).json({ students, uniqueStudents });

  } catch (error) {
    console.error("Error fetching students without photo:", error);
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
});

router.put("/students/:id/avatar", async (req, res) => {
  try {
    const { id } = req.params; // Student ID from URL
    const { publicId, url } = req.body; // Avatar details from request body
    console.log(req.body);
    // Set default values for avatar if not provided
    const defaultAvatarUrl = "https://cardpro.co.in/login.jpg";

    const updatedAvatar = {
      publicId: publicId || "",
      url: url || defaultAvatarUrl,
    };

    // Update only the avatar field for the student
    const student = await Student.findByIdAndUpdate(
      id,
      { avatar: updatedAvatar },
      { new: true, runValidators: true } // Return the updated document and run validation
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({ message: "Avatar updated successfully", student });
  } catch (error) {
    console.error("Error updating avatar:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});



async function generateReport(queryObj = {}) {
  try {
    // Fetch all unique classes based on the query, including students without class
    const classes = await Student.distinct("class", queryObj);

    // Ensure "No Class" category is included
    if (!classes.includes(null) && !classes.includes(undefined)) {
      classes.push("No Class");
    }

    // Prepare a result object to store the counts of each status for each class.
    const result = [];

    for (const className of classes) {
      const query = className === "No Class" ? { class: { $exists: false }, ...queryObj } : { class: className, ...queryObj };

      // Get the count of students for each status and the total number of students in the class
      const classData = {
        class: className,
        Panding: await Student.countDocuments({ ...query, status: "Panding" }),
        "Ready to print": await Student.countDocuments({ ...query, status: "Ready to print" }),
        Printed: await Student.countDocuments({ ...query, status: "Printed" }),
        totalStudents: await Student.countDocuments(query)  // Count all students in the class
      };

      result.push(classData);
    }

    // Fetch the school name based on the provided query (school ID).
    const schoolId = queryObj.school || "";
    const school = await School.findById(schoolId);
    const schoolName = school ? school.name : "Unknown School";

    // Resolve the absolute path of the EJS template
    const templatePath = path.resolve(__dirname, "../template/report_templates.ejs");
    const html = await ejs.renderFile(templatePath, { schoolName, result });

    // Generate PDF using html-pdf
    return new Promise((resolve, reject) => {
      htmlPdf.create(html).toBuffer((err, buffer) => {
        if (err) {
          reject("Error generating PDF: " + err);
        } else {
          resolve(buffer);
        }
      });
    });
  } catch (error) {
    throw new Error("Error generating report: " + error.message);
  }
}


// async function generateStaffReport(queryObj = {}) {
//   try {
//     console.log('Query Object:', queryObj);

//     // Fetch all unique staff types and institutes based on the query
//     const staffTypes = await Staff.distinct("staffType", queryObj);
//     const institutes = await Staff.distinct("institute", queryObj);

//     console.log('Staff Types:', staffTypes);
//     console.log('Institutes:', institutes);

//     const result = {
//       staffTypeInstitute: [],
//       staffTypeOnly: [],
//       instituteOnly: []
//     };

//     // Check conditions for both staffType and institute
//     if (queryObj.staffType ||  queryObj.institute) {
//       console.log('Fetching data for both staffType and institute');
//       const query = { ...queryObj };
//       const staffData = {
//         staffType: queryObj.staffType,
//         institute: queryObj.institute,
//         Panding: await Staff.countDocuments({ staffType: queryObj.staffType, status: "Panding" }),
//         "Ready to print": await Staff.countDocuments({ staffType: queryObj.staffType, status: "Ready to print" }),
//         Printed: await Staff.countDocuments({ staffType: queryObj.staffType, status: "Printed" }),
//         totalStaff: await Staff.countDocuments({ staffType: queryObj.staffType }),
//       };
      

//       console.log('Staff Data for both staffType and institute:', staffData);

//       result.staffTypeInstitute.push(staffData);
//     } else if (queryObj.staffType) {
//       console.log('Fetching data for staffType only');
//       for (const staffType of staffTypes) {
//         const query = { ...queryObj, staffType };
//         const staffData = {
//           staffType,
//           Panding: await Staff.countDocuments({ ...query, status: "Panding" }),
//           "Ready to print": await Staff.countDocuments({ ...query, status: "Ready to print" }),
//           Printed: await Staff.countDocuments({ ...query, status: "Printed" }),
//           totalStaff: await Staff.countDocuments(query),
//         };

//         console.log('Staff Data for staffType:', staffData);

//         result.staffTypeOnly.push(staffData);
//       }
//     } else if (queryObj.institute) {
//       console.log('Fetching data for institute only');
//       for (const institute of institutes) {
//         const query = { ...queryObj, institute };
//         const staffData = {
//           institute,
//           Panding: await Staff.countDocuments({ ...query, status: "Panding" }),
//           "Ready to print": await Staff.countDocuments({ ...query, status: "Ready to print" }),
//           Printed: await Staff.countDocuments({ ...query, status: "Printed" }),
//           totalStaff: await Staff.countDocuments(query),
//         };

//         console.log('Staff Data for institute:', staffData);

//         result.instituteOnly.push(staffData);
//       }
//     }

//     console.log('Final Result:', result);

//     // Fetch the school name based on the query (similar to student report)
//     const schoolId = queryObj.school || "";
//     const school = await School.findById(schoolId);
//     const schoolName = school ? school.name : "Unknown School";

//     // Resolve the absolute path of the EJS template
//     const templatePath = path.resolve(__dirname, "../template/staff_report_template.ejs");
//     const html = await ejs.renderFile(templatePath, { schoolName, result });

//     // Generate the PDF
//     return new Promise((resolve, reject) => {
//       htmlPdf.create(html).toBuffer((err, buffer) => {
//         if (err) {
//           reject("Error generating PDF: " + err);
//         } else {
//           resolve(buffer);
//         }
//       });
//     });
//   } catch (error) {
//     console.error('Error generating report:', error);
//     throw new Error("Error generating report: " + error.message);
//   }
// }


async function generateStaffReport(queryObj = {}) {
  try {
    // Fetch all unique staff types based on the query, including staff without a type
    const staffTypes = await Staff.distinct("staffType", queryObj);

    // Ensure "No Staff Type" category is included
    if (!staffTypes.includes(null) && !staffTypes.includes(undefined)) {
      staffTypes.push("No Staff Type");
    }

    // Prepare a result object to store the counts of each status for each staff type.
    const result = [];

    for (const staffType of staffTypes) {
      const query = staffType === "No Staff Type" ? { staffType: { $exists: false }, ...queryObj } : { staffType, ...queryObj };

      // Get the count of staff for each status and the total number of staff in the type
      const staffData = {
        staffType,
        Panding: await Staff.countDocuments({ ...query, status: "Panding" }),
        "Ready to print": await Staff.countDocuments({ ...query, status: "Ready to print" }),
        Printed: await Staff.countDocuments({ ...query, status: "Printed" }),
        totalStaff: await Staff.countDocuments(query)  // Count all staff in the type
      };

      result.push(staffData);
    }

    // Fetch the school name based on the provided query (school ID).
    const schoolId = queryObj.school || "";
    const school = await School.findById(schoolId);
    const schoolName = school ? school.name : "Unknown School";

    // Resolve the absolute path of the EJS template
    const templatePath = path.resolve(__dirname, "../template/staff_report_template.ejs");
    const html = await ejs.renderFile(templatePath, { schoolName, result });

    // Generate PDF using html-pdf
    return new Promise((resolve, reject) => {
      htmlPdf.create(html).toBuffer((err, buffer) => {
        if (err) {
          reject("Error generating PDF: " + err);
        } else {
          resolve(buffer);
        }
      });
    });
  } catch (error) {
    throw new Error("Error generating report: " + error.message);
  }
}





// Route to generate and download the report PDF
router.get("/generate-report", async (req, res) => {
  try {
    // Extract school ID from query params (or any other filters)
    const { schoolId,role } = req.query;
    const queryObj = { school: schoolId };
    let pdfBuffer;
    // Call the generateReport function
    if(role =="student"){
      pdfBuffer  = await generateReport(queryObj);

    }
    if(role === 'staff'){
      console.log("first")
      pdfBuffer  = await generateStaffReport(queryObj);

    }

    // Set headers to serve PDF as a response
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=student_report.pdf");

    // Send the PDF buffer as a response
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error generating the report.");
  }
});



module.exports = router;
