const express = require("express");
const Student = require('../models/studentModel')
const Staff = require('../models/staffModel')

const { ExcelUpload, 
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
    StaffSignatureDownload} = require("../controllers/userControllers");
const isAuthenticated = require("../middlewares/auth");
const router = express.Router();

const updated = require("../middlewares/multer");
const upload = require("../middlewares/multer");

// const isAuthenticated = require("../middlewares/auth");

router.post("/curr",isAuthenticated, currUser)

router.post("/registration",userRegistration);

router.post("/activate/user",userActivation);

router.post("/login",userLogin);

router.post("/school/login",SchooluserLogin);

router.get("/profile",isAuthenticated, userProfile);

router.post("/forgetpassword/email",userForgetPasswordsendMail);

router.post("/forgetpassword/code",userForgetPasswordVerify);

router.post("/edit", isAuthenticated, EditUser);

router.post("/avatar", isAuthenticated, userAvatar);

router.post("/updatepassword", isAuthenticated, updatePassword);

router.post("/isactive/school/:id", isAuthenticated, ChangeActive);

router.post("/registration/school",upload, isAuthenticated ,addSchool);

router.post("/schools", isAuthenticated ,allSchool);

router.get("/school/requiredfields/:id", isAuthenticated ,SchoolrequiredFields);

router.post("/avatar",upload, isAuthenticated ,userAvatar);

router.post("/edit/school/:id",upload, isAuthenticated ,editSchool);

router.post("/delete/school/:id", isAuthenticated ,deleteSchool);

router.post("/students/:id", getAllStudentsInSchool);

router.post("/staffs/:id", getAllStaffInSchool);

router.post("/registration/student/:id", upload, isAuthenticated ,addStudent);

router.post("/registration/staff/:id", upload, isAuthenticated ,addStaff);

router.get("/student/:id", upload, getStudent);

router.get("/staff/:id", upload, getStaff);

router.post("/edit/student/:id", upload, editStudent);

router.post("/edit/staff/:id", upload, editStaff);

router.post("/student/avatars/:id", upload,  StudentsAvatars);

router.post("/staff/avatars/:id", upload,  StaffAvatars);
router.post("/staff/signature/:id", upload, isAuthenticated , StaffSignature);


// delete routes
router.post("/delete/student/:id", deleteStudent);
router.post("/delete/staff/:id", deleteStaffcurr);


router.post("/school/search", isAuthenticated ,SerchSchool);

router.post("/school/imagesData/:id",isAuthenticated,setImagesData)
router.post("/school/excleData/:id",isAuthenticated,setExcleData)



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


router.post("/studentlist/excel/:id", isAuthenticated ,studentListExcel);

router.post("/bar-chart", isAuthenticated ,GraphData);

router.get("/excel/data/:id", isAuthenticated ,ExcelData);

router.get("/staff/excel/data/:id", isAuthenticated ,ExcelDataStaff);

router.post("/student/images/:id", isAuthenticated ,StaffAvatarsDownload);

router.post("/staff/images/:id", isAuthenticated ,StaffNewAvatarsDownload);
router.post("/staff/signatureNew/:id", isAuthenticated ,StaffSignatureDownload);

router.get("/search/student/:id", isAuthenticated ,SerchStudent);






// router.post("student/avatars", upload , isAuthenticated ,StudentsAvatars);

// router.get("/logout",isAuthenticated, userLongOut);

// router.put("/user",isAuthenticated,updateUserInfo)
// router.post("/uplaad/excel",ExcelUpload)

// add on 
router.get("/getschool/:id", getSchoolById);
router.post("/student/:id", upload, getStudent);

router.get('/students/count/:schoolId', async (req, res, next) => {
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
  })
  
  router.get('/staff/count/:schoolId', async (req, res, next) => {
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
      console.log(req.params)
      const { schoolId } = req.params; // Extract schoolId from URL parameters
      const { status, studentClass, section, course, limit = 50, offset = 0 } = req.query; // Add limit and offset
      
      let queryObj = {
        school: schoolId,
        "avatar.url": "https://plus.unsplash.com/premium_photo-1699534403319-978d740f9297?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      };
  
      function escapeRegex(value) {
        return value.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
      }
  
      if (status) {
        queryObj.status = status;
      }
      if (studentClass) {
        queryObj.class =
          studentClass === "no-class" || studentClass === ""
            ? null
            : { $regex: `^${escapeRegex(studentClass)}$`, $options: "i" };
      }
      if (course) {
        queryObj.course =
          course === "no-class" || course === ""
            ? null
            : { $regex: `^${escapeRegex(course)}$`, $options: "i" };
      }
      if (section) {
        queryObj.section = { $regex: section, $options: "i" };
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
        return res.status(404).json({ message: "No students without a photo found." });
      }
  
      return res.status(200).json(students);
    } catch (error) {
      console.error("Error fetching students without photo:", error);
      return res.status(500).json({ message: "Server Error", error: error.message });
    }
  });
  


  router.put("/students/:id/avatar", async (req, res) => {
    try {
      const { id } = req.params; // Student ID from URL
      const { publicId, url } = req.body; // Avatar details from request body
  console.log(req.body)
      // Set default values for avatar if not provided
      const defaultAvatarUrl =
        "https://plus.unsplash.com/premium_photo-1699534403319-978d740f9297?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
  
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

module.exports = router;