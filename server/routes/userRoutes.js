const express = require("express");
const Student = require("../models/studentModel");
const Staff = require("../models/staffModel");
const School = require("../models/schoolModel");

const ejs = require("ejs");
const cloudinary = require("cloudinary");

cloudinary.v2.config({
  cloud_name: "dubvmkr0l",
  api_key: process.env.CLOUDINARY_PUBLIC_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

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

router.post("/registration/student/:id", upload, addStudent);

router.post("/registration/staff/:id", upload, addStaff);

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
      queryObj.class = {
        $regex: `^${escapeRegex(studentClass)}$`,
        $options: "i",
      };
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

const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

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
      const query =
        className === "No Class"
          ? { class: { $exists: false }, ...queryObj }
          : { class: className, ...queryObj };

      // Get the count of students for each status and the total number of students in the class
      const classData = {
        class: className,
        Panding: await Student.countDocuments({ ...query, status: "Panding" }),
        "Ready to print": await Student.countDocuments({
          ...query,
          status: "Ready to print",
        }),
        Printed: await Student.countDocuments({ ...query, status: "Printed" }),
        totalStudents: await Student.countDocuments(query), // Count all students in the class
      };

      result.push(classData);
    }

    // Fetch the school name based on the provided query (school ID).
    const schoolId = queryObj.school || "";
    const school = await School.findById(schoolId);
    const schoolName = school ? school.name : "Unknown School";

    // Resolve the absolute path of the EJS template
    const templatePath = path.resolve(
      __dirname,
      "../template/report_templates.ejs"
    );
    const html = await ejs.renderFile(templatePath, { schoolName, result });

    // Use Puppeteer to generate the PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(html);
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true, // This ensures that background colors and images are rendered
    });

    // Save the PDF to the server's file system
    const filePath = path.join(__dirname, "../reports", "student_report.pdf");
    fs.writeFileSync(filePath, pdfBuffer);

    await browser.close();
    return filePath; // Return the file path to be used later
  } catch (error) {
    throw new Error("Error generating report: " + error.message);
  }
}

async function generateStaffReport(queryObj = {}, data) {
  try {
    const { staffType, institute } = data;

    const result = [];
    let heading = "Not Available";

    if (staffType === "true") {
      const staffTypes = await Staff.distinct("staffType", queryObj);
      if (!staffTypes.includes(null) && !staffTypes.includes(undefined)) {
        staffTypes.push("No Staff Type");
      }

      heading = "Staff Type";
      for (const type of staffTypes) {
        const query =
          type === "No Staff Type"
            ? { staffType: { $exists: false }, ...queryObj }
            : { staffType: type, ...queryObj };
        result.push({
          category: type,
          Panding: await Staff.countDocuments({ ...query, status: "Panding" }),
          "Ready to print": await Staff.countDocuments({
            ...query,
            status: "Ready to print",
          }),
          Printed: await Staff.countDocuments({ ...query, status: "Printed" }),
          totalStaff: await Staff.countDocuments(query),
        });
      }
    }

    if (institute === "true") {
      const institutes = await Staff.distinct("institute", queryObj);
      if (!institutes.includes(null) && !institutes.includes(undefined)) {
        institutes.push("No Institute");
      }
      heading = "Institute";

      for (const inst of institutes) {
        const query =
          inst === "No Institute"
            ? { institute: { $exists: false }, ...queryObj }
            : { institute: inst, ...queryObj };
        result.push({
          category: inst,
          Panding: await Staff.countDocuments({ ...query, status: "Panding" }),
          "Ready to print": await Staff.countDocuments({
            ...query,
            status: "Ready to print",
          }),
          Printed: await Staff.countDocuments({ ...query, status: "Printed" }),
          totalStaff: await Staff.countDocuments(query),
        });
      }
    }

    if (result.length === 0) {
      throw new Error("No data found for the report.");
    }

    const schoolId = queryObj.school || "";
    const school = await School.findById(schoolId);
    console.log(school);
    const schoolName = school ? school.name : "Unknown School";
    const templatePath = path.resolve(
      __dirname,
      "../template/staff_report_template.ejs"
    );
    const html = await ejs.renderFile(templatePath, {
      schoolName,
      result,
      heading,
    });

    // Use Puppeteer to generate the PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(html);
    const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });

    // Save the PDF to the server's file system
    const filePath = path.join(__dirname, "../reports", "staff_report.pdf");
    fs.writeFileSync(filePath, pdfBuffer);

    await browser.close();
    return filePath; // Return the file path to be used later
  } catch (error) {
    throw new Error("Error generating report: " + error.message);
  }
}

// Route to generate and download the report PDF
router.get("/generate-report", async (req, res) => {
  try {
    // Extract school ID from query params (or any other filters)
    const { schoolId, role, staffType, institute } = req.query;
    const queryObj = { school: schoolId };
    const data = { staffType, institute };

    let filePath;

    // Call the generateReport function
    if (role === "student") {
      filePath = await generateReport(queryObj);
    }
    if (role === "staff") {
      filePath = await generateStaffReport(queryObj, data);
    }

    // Set headers to serve PDF as a response
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=report.pdf");

    // Send the PDF as a file from the server
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error("Error sending the file:", err);
        res.status(500).send("Error generating the report.");
      } else {
        // Optionally, remove the file after it's been sent to the client
        fs.unlinkSync(filePath);
      }
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error generating the report.");
  }
});

router.get("/get-classes/:schoolId", async (req, res) => {
  try {
    const { schoolId } = req.params;

    const school = await School.findById(schoolId).select("name");

    if (!school) {
      return res
        .status(404)
        .json({ success: false, message: "School not found" });
    }
    const classes = await Student.distinct("class", { school: schoolId });

    res.json({ success: true, classes, schoolName: school.name });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching classes" });
  }
});

// Bulk update class names
router.put("/update-classes", async (req, res) => {
  try {
    const { schoolId, classUpdates } = req.body; // classUpdates = { oldClassName: newClassName }

    for (const oldClass in classUpdates) {
      await Student.updateMany(
        { school: schoolId, class: oldClass },
        { $set: { class: classUpdates[oldClass], status: "Panding" } }
      );
    }

    res.json({ success: true, message: "Classes updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating classes" });
  }
});

router.put("/remove-all-photos", async (req, res) => {
  try {
    const { schoolId } = req.body;

    // Find all students of the given schoolId
    const students = await Student.find({ school: schoolId });

    if (!students || students.length === 0) {
      return res.status(404).json({ message: "No students found" });
    }

    // Loop through each student to delete their photos from Cloudinary
    for (const student of students) {
      // Check if the avatar is hosted on Cloudinary
      if (student.avatar && student.avatar.publicId) {
        // Delete image from Cloudinary
        await cloudinary.uploader.destroy(student.avatar.publicId);
      }

      // Reset the avatar to default image
      student.avatar = {
        publicId: "",
        url: "https://cardpro.co.in/login.jpg", // default image URL
      };

      // Save the student record after resetting the avatar
      await student.save();
    }

    res.json({ message: "All photos removed and reset to default image" });
  } catch (error) {
    console.error("Error removing photos:", error);
    res.status(500).json({ message: "Error removing photos" });
  }
});

// Route to delete class
router.put("/delete-class", async (req, res) => {
  try {
    const { schoolId, className } = req.body;

    // Find all students of the given class
    const students = await Student.find({ school: schoolId, class: className });

    // Loop through each student to delete their image from Cloudinary if it exists
    for (const student of students) {
      if (student.avatar.publicId) {
        // Delete image from Cloudinary
        await cloudinary.uploader.destroy(student.avatar.publicId);
      }

      // Delete the student from the database
      await Student.deleteOne({ _id: student._id });
    }

    res.json({
      message:
        "Class deleted successfully, students removed and images deleted",
    });
  } catch (error) {
    console.error("Error deleting class:", error);
    res.status(500).json({ message: "Error deleting class" });
  }
});

const sanitizeInput = (input) => {
  return input?.replace(/[-/.\s]/g, "").toLowerCase(); // Remove - / . space and convert to lowercase
};

// student and stafff
router.get("/:schoolId/fields", async (req, res) => {
  try {
    const school = await School.findById(req.params.schoolId);
    res.json({
      requiredFields: school.requiredFields,
      extraFields: school.extraFields,
      extraFieldsStaff: school.extraFieldsStaff,
      requiredFieldsStaff: school.requiredFieldsStaff,
    });
  } catch (error) {
    res.status(500).json({ error: "Error fetching fields" });
  }
});

router.post("/:schoolId/save-login", async (req, res) => {
  try {
    const { userName, password, customPassword, staff, student } = req.body;
    const school = await School.findById(req.params.schoolId);

    if (student) {
      school.studentLogin = {
        userName,
        password,
        customPassword: !!customPassword,
      };
    }

    if (staff) {
      school.staffLogin = {
        userName,
        password,
        customPassword: !!customPassword,
      };
    }

    await school.save();

    res.json({ message: "Login fields saved successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error saving login fields" });
  }
});




router.post("/student-login", async (req, res) => {
  try {
    const { schoolId, userName, password } = req.body;

    // School find karo
    const school = await School.findById(schoolId);
    if (!school) {
      return res.status(404).json({ error: "School not found" });
    }

    // Username aur password ka field naam find karo
    let usernameField = school.studentLogin.userName;
    if (usernameField === "Student Name") {
      usernameField = "Name";
    }
    usernameField = usernameField.toLowerCase();

    let passwordField = school.studentLogin.password;

    // Sanitized username and password
    const sanitizedUserName = sanitizeInput(userName);
    const sanitizedPassword = sanitizeInput(password);

    const studentsList = await Student.find({ school: schoolId });

    let student = null;
    const foundStudent = studentsList.find(
      (s) =>
        sanitizeInput(s.name || "") === sanitizedUserName ||
        sanitizeInput(s.extraFields?.name || "") === sanitizedUserName
    );

    if (!foundStudent) {
      console.log("No student found after manual match.");
    } else {
      student = foundStudent;
    }

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    if (school.studentLogin.customPassword) {
      console.log("helllo");

      if (passwordField === password) {
        return res.json({
          message: "Login successful",
          success: true,
          studentId: student._id, // 👈 Yahan se frontend ko student ki ID milegi
        });
      }
    }

    // Password check karo (normal field se)

    console.log(passwordField);
    if (passwordField === "Student Name") {
      passwordField = "name";
    }
    if (
      sanitizeInput(student[passwordField]) === sanitizedPassword ||
      sanitizeInput(student.extraFields.get(passwordField)) ===
        sanitizedPassword
    ) {
      console.log("first");
      return res.json({
        message: "Login successful",
        success: true,
        studentId: student._id, // 👈 Yahan se frontend ko student ki ID milegi
      });
    }

    return res.status(401).json({ error: "Invalid username or password" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error during login" });
  }
});





router.post("/staff-login", async (req, res) => {
  try {
    const { schoolId, userName, password } = req.body;

    // School find karo
    const school = await School.findById(schoolId);
    if (!school) {
      return res.status(404).json({ error: "School not found" });
    }

    // Username aur password ka field naam find karo
    let usernameField = school.staffLogin.userName;
 
    usernameField = usernameField.toLowerCase();

    let passwordField = school.staffLogin.password.toLowerCase();

    // Sanitized username and password
    const sanitizedUserName = sanitizeInput(userName);
    const sanitizedPassword = sanitizeInput(password);

    const staffList = await Staff.find({ school: schoolId });

    let staff = null;
    const foundStaff = staffList.find(
      (s) =>
        sanitizeInput(s.name || "") === sanitizedUserName ||
        sanitizeInput(s.extraFields?.name || "") === sanitizedUserName
    );

    if (!foundStaff) {
      console.log("No staff found after manual match.");
    } else {
      staff = foundStaff;
    }

    if (!staff) {
      return res.status(404).json({ error: "Staff not found" });
    }

    if (school.staffLogin.customPassword) {
      console.log("helllo");

      if (passwordField === password) {
        return res.json({
          message: "Login successful",
          success: true,
          staffId: staff._id, // 👈 Yahan se frontend ko staff ki ID milegi
        });
      }
    }

    // Password check karo (normal field se)

    console.log(sanitizeInput(staff[passwordField]));
  
    if (
      sanitizeInput(staff[passwordField]) === sanitizedPassword ||
      sanitizeInput(staff.extraFieldsStaff.get(passwordField)) ===
        sanitizedPassword
    ) {
      console.log("first");
      return res.json({
        message: "Login successful",
        success: true,
        staffId: staff._id, // 👈 Yahan se frontend ko staff ki ID milegi
      });
    }

    return res.status(401).json({ error: "Invalid username or password" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error during login" });
  }
});



router.get('/students', async (req, res) => {
  try {
    const schoolId = req.query.schoolId || '6781ec18f03a8b8ff5bf73b3';
    const students = await Student.find({ school: schoolId });
    const school = await School.findById(schoolId);

    // Assuming the school has a 'photoBaseUrl' field
    const photoBaseUrl = school.photoBaseUrl || 'http://localhost:4010/photos/';

    const studentsWithPhotoUrls = students.map(student => ({
      ...student.toObject(),
      photoUrl: student.photoName ? `${photoBaseUrl}${student.photoName}` : null
    }));

    res.json(studentsWithPhotoUrls);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Error fetching students' });
  }
});


router.get('/schoolD', async (req, res) => {
  try {
    const schoolId = req.query.schoolId || '6781ec18f03a8b8ff5bf73b3';
     const school = await School.findById(schoolId);

 

    res.json(school);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Error fetching students' });
  }
});


router.post('/save-template', async (req, res) => {
  try {
    const { schoolId, template } = req.body;

    console.log("Incoming Data:", req.body); // Debugging log

    let school = await School.findById(schoolId);

    if (!school) {
      console.log("❌ School Not Found!");
      return res.status(404).json({ message: 'School not found' });
    }

    console.log("✅ Before Update:", school.cardTemplate || "Not Defined"); // Debugging log

    // ✅ Ensure `cardTemplate` is initialized
    school.cardTemplate = template;

    // ✅ Save the updated school document
    await school.save();

    console.log("✅ After Update:", school.cardTemplate); // Debugging log

    res.json({ message: 'Template saved successfully', school });
  } catch (error) {
    console.error('❌ Error saving template:', error);
    res.status(500).json({ message: 'Error saving template', error });
  }
});



module.exports = router;
