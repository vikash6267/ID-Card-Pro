const env = require("dotenv");
env.config({ path: "./.env" });
const { catchAsyncErron } = require("../middlewares/catchAsyncError");
const errorHandler = require("../utils/errorHandler");
const sendmail = require("../utils/sendmail");
const activationToken = require("../utils/activationToken");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const Student = require("../models/studentModel");
const School = require("../models/schoolModel");
const User = require("../models/userModel");
const school = require("../models/schoolModel");
const student = require("../models/studentModel");
const generateTokens = require("../utils/generateTokens");
const moment = require("moment");
const path = require("path");
const Staff = require("../models/staffModel");
const ExcelJS = require("exceljs");
const request = require("request");
const yazl = require("yazl");
const bcrypt = require("bcrypt");
const archiver = require("archiver");
const axios = require("axios");

// var nodeExcel = require('excel-export');
// const generateTokens = require("../utils/generateTokens");
// // const cloudinary = require("cloudinary").v2;

// exports.homepage = catchAsyncErron((req, res, next) => {});

const cloudinary = require("cloudinary");

cloudinary.v2.config({
  cloud_name: "dubvmkr0l",
  api_key: process.env.CLOUDINARY_PUBLIC_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

const xlsx = require("xlsx");
const fs = require("fs");
const getDataUri = require("../middlewares/daraUri");
const { log } = require("console");
const getNextSequenceValue = require("./counter");
const { default: mongoose } = require("mongoose");

exports.currUser = catchAsyncErron(async (req, res, next) => {
  const id = req.id;
  console.log(id);
  console.log("currUser");

  let user = await User.findById(id);

  if (!user) {
    // If user is not found, search for a school with the same id
    const school = await School.findById(id);

    if (school) {
      // If school is found, assign the school to user
      user = {
        school,
        role: "school",
      };
    } else {
      // If neither user nor school is found, return an error
      return next(new errorHandler("User not found", 401));
    }
  } else {
    // If user is found, add the role field to user
    user.role = "student";
  }
  console.log(user);
  res.status(201).json({
    success: true,
    message: "Successfully",
    user,
  });
});

exports.userRegistration = catchAsyncErron(async (req, res, next) => {
  const { name, email, password, contact, city, district, state, companyName } =
    req.body;
  console.log(req.body);

  if (
    !name ||
    !email ||
    !password ||
    !contact ||
    !city ||
    !district ||
    !state ||
    !companyName
  )
    return next(new errorHandler(`fill all deatils`));

  const isEmailExit = await User.findOne({ email: email });
  if (isEmailExit)
    return next(new errorHandler("User With This Email Address Already Exits"));

  const ActivationCode = Math.floor(1000 + Math.random() * 9000);

  const user = {
    name,
    email,
    contact,
    password,
    city,
    district,
    state,
    companyName,
  };

  const data = { name: name, activationCode: ActivationCode };

  try {
    await sendmail(
      res,
      next,
      email,
      "Verification code",
      "activationMail.ejs",
      data
    );
    console.log("extracted");
    let token = await activationToken(user, ActivationCode);
    let options = {
      httpOnly: true,
      secure: true,
    };
    res.status(200).cookie("token", token, options).json({
      succcess: true,
      type: "distibuter",
      message: "successfully send mail pleas check your Mail",
      Token: token,
    });
  } catch (error) {
    return next(new errorHandler(error.message, 400));
  }
});

exports.userForgetPasswordsendMail = catchAsyncErron(async (req, res, next) => {
  const { email } = req.body;

  if (!email) return next(new errorHandler(`pleas provide email`));

  const user = await User.findOne({ email: email });

  if (!user)
    return next(
      new errorHandler("User With This Email Address Not Found", 404)
    );

  const ActivationCode = Math.floor(1000 + Math.random() * 9000);

  const data = { name: user.name, activationCode: ActivationCode };

  user.resetpasswordToken = 1;
  user.save();

  try {
    await sendmail(
      res,
      next,
      email,
      "Password Reset code",
      "forgetpassword.ejs",
      data
    );
    let token = await activationToken(user, ActivationCode);

    let options = {
      httpOnly: true,
      secure: true,
    };
    res.status(200).cookie("token", token, options).json({
      succcess: true,
      message: "successfully send mail pleas check your Mail",
      Token: token,
    });
  } catch (error) {
    return next(new errorHandler(error.message, 400));
  }
});

exports.userForgetPasswordVerify = catchAsyncErron(async (req, res, next) => {
  let { activationCode, password } = req.body;

  if (!activationCode)
    return next(new errorHandler("Provide Reset Password Code"));

  const token = req.header("Authorization");

  if (!token) return next(new errorHandler("please provide token", 401));

  const { user, ActivationCode } = await jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET
  );
  console.log(user);

  if (!user) return next(new errorHandler("Invelide Token"));

  const currUser = await User.findById(user._id).select("+password").exec();
  console.log(currUser);

  if (!currUser) return next(new errorHandler("User not Found"));

  if (activationCode != ActivationCode)
    return next(new errorHandler("Wrong Activation Code"));
  if (currUser.resetpasswordToken == 0)
    return next(new errorHandler("You alredy used this Code"));

  // const currentuser = await User.findByIdAndUpdate(
  //   currUser,
  //   { password: password, resetpasswordToken: 0 },
  //   {
  //     new: true,
  //   }
  // );
  currUser.password = password;
  await currUser.save();

  // currUser.resetpasswordToken = 0
  // currUser.save();
  // currUser.password = ""

  const { accesToken } = generateTokens(currUser);

  currUser.password = "";

  const options = {
    httpOnly: true,
    secure: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  };

  res.status(201).cookie("Token", accesToken, options).json({
    succcess: true,
    message: "successfully update password",
    user: currUser,
    token: accesToken,
  });
});

exports.userProfile = catchAsyncErron(async (req, res, next) => {
  const id = req.id;

  const user = await User.findById(id);
  res.status(200).json({
    succcess: true,
    user: user,
  });
});

exports.userActivation = catchAsyncErron(async (req, res, next) => {
  let { activationCode } = req.body;
  console.log(req.body);

  if (!activationCode) return next(new errorHandler("Provide Activation Code"));

  const token = req.header("Authorization");
  console.log(token);
  const { user, ActivationCode } = await jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET
  );

  if (!user) return next(new errorHandler("Invelide Token"));

  const isEmailExit = await User.findOne({ email: user.email });
  if (isEmailExit)
    return next(new errorHandler("User With This Email Address Already Exits"));

  if (activationCode != ActivationCode)
    return next(new errorHandler("Wrong Activation Code"));

  let { name, email, password, contact, city, district, state, companyName } =
    user;

  const newUser = await User.create({
    name,
    email,
    password,
    contact,
    city,
    district,
    state,
    companyName,
    isVerified: true,
  });
  await newUser.save();

  const { accesToken } = generateTokens(newUser);

  user.password = "";

  const options = {
    httpOnly: true,
    secure: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  };

  res.status(201).cookie("Token", accesToken, options).json({
    succcess: true,
    message: "successfully register",
    user: user,
    token: accesToken,
  });
});

exports.userLogin = catchAsyncErron(async (req, res, next) => {
  const { email, password } = req.body;
  console.log(req.body);

  if (!email || !password)
    return next(new errorHandler("Pleas fill all details"));

  const user = await User.findOne({ email: email }).select("+password").exec();
  if (!user) return next(new errorHandler("User Not Found", 404));

  const isMatch = await user.comparePassword(password);
  if (!isMatch) return next(new errorHandler("Wrong Credientials", 500));

  const { accesToken } = generateTokens(user);

  await user.save();
  user.password = "";

  const options = {
    httpOnly: true,
    secure: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  };

  res.status(200).cookie("Token", accesToken, options).json({
    succcess: true,
    type: "distibuter",
    message: "successfully login",
    user: user,
    token: accesToken,
  });
});

exports.SchooluserLogin = catchAsyncErron(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new errorHandler("Pleas fill all details"));
  console.log(password);

  const school = await School.findOne({ email: email })
    .select("+password")
    .exec();
  console.log(school);
  if (!school) return next(new errorHandler("School Not Found", 404));
  // console.log(school.password)

  console.log(password);
  console.log(school.password);

  const isMatch = await school.comparepassword(password);
  // const isMatch = await bcrypt.compare(password, school.password);
  console.log(isMatch);

  if (!isMatch) return next(new errorHandler("Wrong Credientials", 500));

  const { accesToken } = generateTokens(school);

  await school.save();
  school.password = "";

  const options = {
    httpOnly: true,
    secure: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  };

  res.status(200).cookie("Token", accesToken, options).json({
    succcess: true,
    type: "school",
    message: "successfully login",
    school: school,
    token: accesToken,
  });
});

exports.EditUser = catchAsyncErron(async (req, res, next) => {
  const id = req.id;

  const updates = req.body;

  // Find the user by ID and update their details
  const user = await User.findByIdAndUpdate(id, updates, { new: true });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Respond with the updated user details
  res.status(200).json(user);
});

exports.updatePassword = catchAsyncErron(async (req, res, next) => {
  const id = req.id;
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(id).select("+password");

  user.password = newPassword;

  await user.save();

  // Respond with the updated user details
  res.status(200).json(user);
});

exports.userLongOut = catchAsyncErron(async (req, res, next) => {
  const options = {
    httpOnly: true,
    secure: true,
  };
  res.clearCookie("Token", options).json({
    succcess: true,
    message: "successfully logout",
  });
});

// exports.refresh = catchAsyncErron(async (req, res, next) => {
//   const token =
//     req.cookies?.refreshToken ||
//     req.header("Authorization")?.replace("Bearer ", "");

//   if (!token) {
//     return next(new errorHandler("Unauthorized request", 401));
//   }

//   // check user in cache
//   const session = await redis.get(decoded._id);
//   if (!session) {
//     return next(new errorHandler("Could Not Refresh Token", 400));
//   }

//   const user = JSON.parse(session);
// });

// exports.addSchool = catchAsyncErron(async (req, res, next) => {
//   const id = req.id;
//   const schoolName = req.body.schoolName;

//   res.status(200)
//     .json({
//       succcess: true,
//       message: "successfully Added Name",
//       user: user
//     });
// });

exports.userAvatar = catchAsyncErron(async (req, res, next) => {
  const file = req.file;

  if (!file) {
    return res.status(400).send("No file uploaded.");
  }
  const files = req.file.path;
  console.log(files);
});

const sanitizeFields = (fields) => {
  if (Array.isArray(fields)) {
    return fields.map((item) => {
      if (item && typeof item === "object") {
        // For each object, replace periods in the 'name' field
        const sanitizedItem = { ...item };

        // Sanitize the 'name' key specifically
        if (sanitizedItem.name) {
          sanitizedItem.name = sanitizedItem.name.replace(/\./g, "_"); // Replace periods with underscores
        }

        // If you want to sanitize other fields like '_id', you can add a similar logic here.
        if (sanitizedItem._id) {
          sanitizedItem._id = sanitizedItem._id.replace(/\./g, "_"); // Replace periods in _id if needed
        }

        return sanitizedItem;
      }
      return item;
    });
  }
  return fields;
};

exports.addSchool = catchAsyncErron(async (req, res, next) => {
  try {
    console.log(req.body);
    const id = req.id;
    const file = req.files && req.files[0] ? req.files[0] : null;

    // Get user from DB
    const user = await User.findById(id);
    if (!user) return next(new errorHandler("User not found"));

    let {
      name,
      email,
      contact,
      password,
      requiredFields,
      requiredFieldsStaff,
      extraFields,
      extraFieldsStaff,
    } = req.body;

    if (!name) return next(new errorHandler("School name is Required"));
    if (!email) return next(new errorHandler("Email is Required"));
    if (!contact) return next(new errorHandler("Contact is Required"));
    if (!password) return next(new errorHandler("Password is Required"));

    // Sanitize requiredFields and extraFieldsStaff if they are in string format
    if (typeof requiredFields === "string") {
      requiredFields = requiredFields.split(",").map((item) => item.trim());
    }

    if (typeof requiredFieldsStaff === "string") {
      requiredFieldsStaff = requiredFieldsStaff
        .split(",")
        .map((item) => item.trim());
    }

    // Apply sanitizeFields to extraFields and extraFieldsStaff
    extraFields = sanitizeFields(extraFields);
    extraFieldsStaff = sanitizeFields(extraFieldsStaff);

    console.log(extraFieldsStaff);

    const currSchool = await School.create({
      name,
      email,
      contact,
      password,
      requiredFields,
      requiredFieldsStaff,
      extraFields,
      extraFieldsStaff,
    });

    console.log(currSchool);

    currSchool.showPassword = password;
    currSchool.requiredFields = requiredFields;
    currSchool.requiredFieldsStaff = requiredFieldsStaff;
    currSchool.extraFields = extraFields; // Save extraFields in the school model
    await currSchool.save();

    console.log(user);
    user.schools.push(currSchool._id);
    await user.save();
    currSchool.user = user._id;

    // Handle file upload if there is a file
    if (file) {
      const fileUri = getDataUri(file);
      const myavatar = await cloudinary.v2.uploader.upload(fileUri.content);
      console.log(myavatar);

      currSchool.logo = {
        publicId: myavatar.public_id,
        url: myavatar.secure_url,
      };
    }

    await currSchool.save();

    res.status(200).json({
      success: true,
      message: "Successfully registered",
      user: user,
      school: currSchool,
    });
  } catch (error) {
    console.error("Error during school registration:", error);
    return next(new errorHandler(error.message || "Something went wrong"));
  }
});

// Function to sanitize the 'name' field inside extraFields and extraFieldsStaff

exports.editSchool = catchAsyncErron(async (req, res, next) => {
  const schoolId = req.params.id;
  console.log(req.params);
  console.log(req.body);

  // Sanitize extraFields and extraFieldsStaff
  if (req.body.extraFields) {
    req.body.extraFields = sanitizeFields(req.body.extraFields);
  }

  if (req.body.extraFieldsStaff) {
    req.body.extraFieldsStaff = sanitizeFields(req.body.extraFieldsStaff);
  }

  const updatedSchool = await School.findByIdAndUpdate(schoolId, req.body, {
    new: true,
  });
  console.log(updatedSchool);

  let file = null;

  if (req.files && req.files[0]) {
    file = req.files[0];
  }
  console.log(file);

  if (file) {
    const currentSchool = await School.findById(schoolId);

    if (currentSchool.logo.publicId !== "") {
      await cloudinary.v2.uploader.destroy(
        currentSchool.logo.publicId,
        (error, result) => {
          if (error) {
            console.error("Error deleting file from Cloudinary:", error);
          } else {
            console.log("File deleted successfully:", result);
          }
        }
      );
    }

    const fileUri = getDataUri(file);
    const myavatar = await cloudinary.v2.uploader.upload(fileUri.content);

    currentSchool.logo = {
      publicId: myavatar.public_id,
      url: myavatar.secure_url,
    };
    currentSchool.save();

    res.status(200).json({
      success: true,
      message: "School updated successfully",
      school: currentSchool,
    });
  }

  // Check if the school was found and updated successfully
  res.status(200).json({
    success: true,
    message: "School updated successfully",
    school: updatedSchool,
  });
});

exports.deleteSchool = catchAsyncErron(async (req, res, next) => {
  const schoolId = req.params.id; // The ID of the school to delete

  // Attempt to find and delete the school by its ID
  const school = await School.findById(schoolId);

  if (!school) {
    return res.status(404).json({ message: "School not found" });
  }

  // Delete all associated students
  await Student.deleteMany({ school: schoolId });

  // Delete all associated students
  await Staff.deleteMany({ school: schoolId });

  // Delete the school itself
  await School.findByIdAndDelete(schoolId);

  // If the school was successfully deleted, return a success response
  res.status(200).json({
    success: true,
    message: "School deleted successfully",
    school: school,
  });
});

exports.ChangeActive = catchAsyncErron(async (req, res, next) => {
  const schoolId = req.params.id; // The ID of the school to delete

  // Attempt to find and delete the school by its ID
  const currSchool = await School.findById(schoolId);

  // If no school was found with the given ID, return an error
  if (!currSchool) {
    return next(
      new errorHandler(`School not found with id of ${schoolId}`, 404)
    );
  }

  currSchool.isActive = !currSchool.isActive;

  currSchool.save();
  // If the school was successfully deleted, return a success response
  res.status(200).json({
    success: true,
    message: "School deleted successfully",
    school: currSchool,
  });
});

exports.addStudent = catchAsyncErron(async (req, res, next) => {
  const id = req.id;
  let file = null;

  const user = await User.findById(id);
  if (user) {
    const schoolID = req.params.id;
    const currSchool = await School.findById(schoolID);

    if (!currSchool) return next(new errorHandler("invalidate School ID"));

    const { name } = req.body;

    console.log(req.body);
    if (!name) return next(new errorHandler("name is Required"));

    // if (!fatherName) return next(new errorHandler("fathername is Required"));

    let currStudent = {
      name,
    };

    if (req.body.fatherName) {
      currStudent.fatherName = req.body.fatherName;
    }
    if (req.body.extraFields) {
      currStudent.extraFields = req.body.extraFields;
    }

    if (req.body.motherName) {
      currStudent.motherName = req.body.motherName;
    }
    if (req.body.gender) {
      currStudent.gender = req.body.gender;
    }
    if (req.body.dob) {
      currStudent.dob = req.body.dob;
    }
    if (req.body.contact) {
      currStudent.contact = req.body.contact;
    }
    if (req.body.email) {
      currStudent.email = req.body.email;
    }
    if (req.body.address) {
      currStudent.address = req.body.address;
    }
    if (req.body.rollNo) {
      currStudent.rollNo = req.body.rollNo;
    }
    if (req.body.class) {
      currStudent.class = req.body.class;
    } else {
      currStudent.class = null;
    }
    if (req.body.section) {
      currStudent.section = req.body.section;
    } else {
      currStudent.section = null;
    }
    if (req.body.session) {
      currStudent.session = req.body.session;
    }
    if (req.body.admissionNo) {
      currStudent.admissionNo = req.body.admissionNo;
    }
    if (req.body.busNo) {
      currStudent.busNo = req.body.busNo;
    }
    if (req.body.bloodGroup) {
      currStudent.bloodGroup = req.body.bloodGroup;
    }
    if (req.body.studentID) {
      currStudent.studentID = req.body.studentID;
    }
    if (req.body.aadharNo) {
      currStudent.aadharNo = req.body.aadharNo;
    }
    if (req.body.ribbionColour) {
      currStudent.ribbionColour = req.body.ribbionColour;
    }
    if (req.body.routeNo) {
      currStudent.routeNo = req.body.routeNo;
    }
    if (req.body.aadharNo) {
      currStudent.aadharNo = req.body.aadharNo;
    }

    // Additional fields
    if (req.body.houseName) {
      currStudent.houseName = req.body.houseName;
    }
    if (req.body.validUpTo) {
      currStudent.validUpTo = req.body.validUpTo; // Ensure date format validation if needed
    }
    if (req.body.course) {
      currStudent.course = req.body.course;
    } else {
      currStudent.course = null;
    }
    if (req.body.batch) {
      currStudent.batch = req.body.batch;
    }
    if (req.body.idNo) {
      currStudent.idNo = req.body.idNo;
    }
    if (req.body.regNo) {
      currStudent.regNo = req.body.regNo;
    }
    if (req.body.extraField1) {
      currStudent.extraField1 = req.body.extraField1;
    }
    if (req.body.extraField2) {
      currStudent.extraField2 = req.body.extraField2;
    }

    const student = await Student.create(currStudent);
    // if(req.body.avatar){

    // }

    student.school = currSchool._id;
    student.user = id;
    student.photoNameUnuiq = await getNextSequenceValue("studentName");
    const { publicId, url } = req.body;

    // Assign default values if fields are empty
    student.avatar = {
      publicId: publicId || null, // Default to `null` if no `publicId` is provided
      url: url || "https://plus.unsplash.com/premium_photo-1699534403319-978d740f9297?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Default URL
    };
    

    student.save();

    res.status(200).json({
      succcess: true,
      message: "successfully Register",
      user: user,
      student: student,
    });
  }
  const school = await School.findById(id);
  if (school) {
    const schoolID = req.params.id;
    const currSchool = await School.findById(schoolID);

    if (!currSchool) return next(new errorHandler("invalidate School ID"));

    const { name, fatherName } = req.body;

    console.log(req.body);
    if (!name) return next(new errorHandler("name is Required"));

    let currStudent = {
      name,
    };

    if (req.body.fatherName) {
      currStudent.fatherName = req.body.fatherName;
    }
    if (req.body.extraFields) {
      currStudent.extraFields = req.body.extraFields;
    }
    if (req.body.motherName) {
      currStudent.motherName = req.body.motherName;
    }
    if (req.body.gender) {
      currStudent.gender = req.body.gender;
    }
    if (req.body.dob) {
      currStudent.dob = req.body.dob;
    }
    if (req.body.contact) {
      currStudent.contact = req.body.contact;
    }
    if (req.body.email) {
      currStudent.email = req.body.email;
    }
    if (req.body.address) {
      currStudent.address = req.body.address;
    }
    if (req.body.rollNo) {
      currStudent.rollNo = req.body.rollNo;
    }
    if (req.body.class) {
      currStudent.class = req.body.class;
    }
    if (req.body.section) {
      currStudent.section = req.body.section;
    }
    if (req.body.session) {
      currStudent.session = req.body.session;
    }
    if (req.body.admissionNo) {
      currStudent.admissionNo = req.body.admissionNo;
    }
    if (req.body.busNo) {
      currStudent.busNo = req.body.busNo;
    }
    if (req.body.bloodGroup) {
      currStudent.bloodGroup = req.body.bloodGroup;
    }
    if (req.body.studentID) {
      currStudent.studentID = req.body.studentID;
    }
    if (req.body.aadharNo) {
      currStudent.aadharNo = req.body.aadharNo;
    }
    if (req.body.ribbionColour) {
      currStudent.ribbionColour = req.body.ribbionColour;
    }
    if (req.body.routeNo) {
      currStudent.routeNo = req.body.routeNo;
    }
    if (req.body.aadharNo) {
      currStudent.aadharNo = req.body.aadharNo;
    }

    const student = await Student.create(currStudent);
    // if(req.body.avatar){

    // }

    student.school = currSchool._id;
    student.user = school.user;

    if (file) {
      const fileUri = getDataUri(file);

      const myavatar = await cloudinary.v2.uploader.upload(fileUri.content);

      console.log(myavatar);

      student.avatar = {
        publicId: myavatar.public_id,
        url: myavatar.secure_url,
      };
    }
    student.save();

    res.status(200).json({
      succcess: true,
      message: "successfully Register",
      student: student,
    });
  }
});

exports.editStudent = catchAsyncErron(async (req, res, next) => {
  try {
    const studentId = req.params.id;
    console.log(studentId);
    const updates = req.body; // The updates from the request body.
    console.log(updates);

    const updatedStudent = await Student.findByIdAndUpdate(studentId, updates, {
      new: true,
    });

    if (req.body.name) {
      let nameStudent = await Student.findById(req.id);
      updatedStudent.name = req.body.name;
      await updatedStudent.save();
    }

    let file = null;

    if (req.files && req.files[0]) {
      file = req.files[0];
    }

    if (file) {
      const currStudent = await Student.findById(studentId);
      if (currStudent.avatar.publicId !== "") {
        await cloudinary.v2.uploader.destroy(
          currStudent.avatar.publicId,
          (error, result) => {
            if (error) {
              console.error("Error deleting file from Cloudinary:", error);
            } else {
              console.log("File deleted successfully:", result);
            }
          }
        );
      }

      const fileUri = getDataUri(file);
      const myavatar = await cloudinary.v2.uploader.upload(fileUri.content);

      currStudent.avatar = {
        publicId: myavatar.public_id,
        url: myavatar.secure_url,
      };
      await currStudent.save();

      return res.status(200).json({
        success: true,
        message: "Student updated successfully",
        student: currStudent,
      });
    }

    // Respond with the updated student information.
    res.status(200).json({
      success: true,
      message: "Student updated successfully",
      student: updatedStudent,
    });
  } catch (error) {
    console.error("Error updating student:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the student",
      error: error.message,
    });
  }
});

exports.addStaff = catchAsyncErron(async (req, res, next) => {
  try {
    const id = req.id;
    let file = null;

    console.log(req.body);

    const user = await User.findById(id);

    if (user) {
      const schoolID = req.params.id;
      const currSchool = await School.findById(schoolID);

      if (!currSchool) return next(new errorHandler("Invalid School ID"));

      const { name, fatherName } = req.body;

      console.log(req.body);
      if (!name) return next(new errorHandler("Name is Required"));

      let currStaff = { name };

      if (req.body.fatherName) {
        currStaff.fatherName = req.body.fatherName;
      }
      if (req.body.extraFieldsStaff) {
        currStaff.extraFieldsStaff = req.body.extraFieldsStaff;
      }
      if (req.body.husbandName) {
        currStaff.husbandName = req.body.husbandName;
      }
      if (req.body.dob) {
        currStaff.dob = req.body.dob;
      }
      if (req.body.contact) {
        currStaff.contact = req.body.contact;
      }
      if (req.body.email) {
        currStaff.email = req.body.email;
      }
      if (req.body.address) {
        currStaff.address = req.body.address;
      }
      if (req.body.qualification) {
        currStaff.qualification = req.body.qualification;
      }
      if (req.body.designation) {
        currStaff.designation = req.body.designation;
      }
      if (req.body.staffType) {
        currStaff.staffType = req.body.staffType;
      }
      if (req.body.doj) {
        currStaff.doj = req.body.doj;
      }
      if (req.body.uid) {
        currStaff.uid = req.body.uid;
      }
      if (req.body.staffID) {
        currStaff.staffID = req.body.staffID;
      }
      if (req.body.udiseCode) {
        currStaff.udiseCode = req.body.udiseCode;
      }
      if (req.body.schoolName) {
        currStaff.schoolName = req.body.schoolName;
      }
      if (req.body.bloodGroup) {
        currStaff.bloodGroup = req.body.bloodGroup;
      }
      if (req.body.dispatchNo) {
        currStaff.dispatchNo = req.body.dispatchNo;
      }
      if (req.body.dateOfissue) {
        currStaff.dateOfissue = req.body.dateOfissue;
      }
      if (req.body.ihrmsNo) {
        currStaff.ihrmsNo = req.body.ihrmsNo;
      }
      if (req.body.beltNo) {
        currStaff.beltNo = req.body.beltNo;
      }

      if (req.body.jobStatus) {
        currStaff.jobStatus = req.body.jobStatus;
      }
      if (req.body.licenceNo) {
        currStaff.licenceNo = req.body.licenceNo;
      }
      if (req.body.panCardNo) {
        currStaff.panCardNo = req.body.panCardNo;
      }
      if (req.body.adharNo) {
        currStaff.adharNo = req.body.adharNo;
      }
      if (req.body.idNo) {
        currStaff.idNo = req.body.idNo;
      }
      // Extra fields
      if (req.body.extraField1) {
        currStaff.extraField1 = req.body.extraField1;
      }
      if (req.body.extraField2) {
        currStaff.institute = req.body.extraField2;
      } else {
        currStaff.institute = null;
      }

      console.log(currStaff);

      const staff = await Staff.create(currStaff);

      staff.school = currSchool._id;
      staff.user = id;
      staff.photoNameUnuiq = await getNextSequenceValue("staffName");
      staff.signatureNameUnuiq = await getNextSequenceValue("staffSignature");

      const { publicId, url } = req.body;

      staff.avatar = {
        publicId: publicId,
        url: url,
      };
      if (req.body.SignatureData) {
        staff.signatureImage = {
          publicId: req.body.SignatureData.publicId,
          url: req.body.SignatureData.url,
        };
      }

      await staff.save();

      res.status(200).json({
        success: true,
        message: "Successfully Registered",
        user: user,
        staff: staff,
      });
    }

    const school = await School.findById(id);
    if (school) {
      const schoolID = req.params.id;
      const currSchool = await School.findById(schoolID);

      if (!currSchool) return next(new errorHandler("Invalid School ID"));

      const { name, fatherName } = req.body;

      console.log(req.body);
      if (!name) return next(new errorHandler("Name is Required"));

      let currStaff = { name };

      if (req.body.fatherName) {
        currStaff.fatherName = req.body.fatherName;
      }

      if (req.body.extraFieldsStaff) {
        currStaff.extraFieldsStaff = req.body.extraFieldsStaff;
      }

      if (req.body.husbandName) {
        currStaff.husbandName = req.body.husbandName;
      }
      if (req.body.dob) {
        currStaff.dob = req.body.dob;
      }
      if (req.body.contact) {
        currStaff.contact = req.body.contact;
      }
      if (req.body.email) {
        currStaff.email = req.body.email;
      }
      if (req.body.address) {
        currStaff.address = req.body.address;
      }
      if (req.body.qualification) {
        currStaff.qualification = req.body.qualification;
      }
      if (req.body.designation) {
        currStaff.designation = req.body.designation;
      }
      if (req.body.staffType) {
        currStaff.staffType = req.body.staffType;
      }
      if (req.body.doj) {
        currStaff.doj = req.body.doj;
      }
      if (req.body.uid) {
        currStaff.uid = req.body.uid;
      }
      if (req.body.staffID) {
        currStaff.staffID = req.body.staffID;
      }
      if (req.body.udiseCode) {
        currStaff.udiseCode = req.body.udiseCode;
      }
      if (req.body.schoolName) {
        currStaff.schoolName = req.body.schoolName;
      }
      if (req.body.bloodGroup) {
        currStaff.bloodGroup = req.body.bloodGroup;
      }
      if (req.body.dispatchNo) {
        currStaff.dispatchNo = req.body.dispatchNo;
      }
      if (req.body.dateOfissue) {
        currStaff.dateOfissue = req.body.dateOfissue;
      }
      if (req.body.ihrmsNo) {
        currStaff.ihrmsNo = req.body.ihrmsNo;
      }
      if (req.body.beltNo) {
        currStaff.beltNo = req.body.beltNo;
      }
      if (req.body.jobStatus) {
        currStaff.jobStatus = req.body.jobStatus;
      }
      if (req.body.licenceNo) {
        currStaff.licenceNo = req.body.licenceNo;
      }
      if (req.body.panCardNo) {
        currStaff.panCardNo = req.body.panCardNo;
      }
      if (req.body.adharNo) {
        currStaff.adharNo = req.body.adharNo;
      }
      if (req.body.idNo) {
        currStaff.idNo = req.body.idNo;
      }
      // Extra fields
      if (req.body.extraField1) {
        currStaff.extraField1 = req.body.extraField1;
      }
      if (req.body.extraField2) {
        currStaff.extraField2 = req.body.extraField2;
      }

      const staff = await Staff.create(currStaff);

      staff.school = currSchool._id;
      staff.user = school.user;

      const { publicId, url } = req.body;
      staff.photoNameUnuiq = await getNextSequenceValue("staffName");

      staff.avatar = {
        publicId: publicId,
        url: url,
      };

      await staff.save();

      res.status(200).json({
        success: true,
        message: "Successfully Registered",
        staff: staff,
      });
    }
  } catch (error) {
    console.log(error);
    next(new errorHandler("Something went wrong, please try again later"));
  }
});

exports.editStaff = catchAsyncErron(async (req, res, next) => {
  const staffId = req.params.id;
  console.log(req.body);
  const updates = req.body; // The updates from the request body.

  const updatedStudent = await Staff.findByIdAndUpdate(staffId, updates, {
    new: true,
  });

  let file = null;

  if (req.files && req.files[0]) {
    file = req.files[0];
  }
  console.log(file);

  if (file) {
    const currStudent = await Staff.findById(staffId);
    if (currStudent.avatar.publicId !== "") {
      await cloudinary.v2.uploader.destroy(
        currStudent.avatar.publicId,
        (error, result) => {
          if (error) {
            console.error("Error deleting file from Cloudinary:", error);
          } else {
            console.log("File deleted successfully:", result);
          }
        }
      );
    }

    const fileUri = getDataUri(file);
    const myavatar = await cloudinary.v2.uploader.upload(fileUri.content);

    currStudent.avatar = {
      publicId: myavatar.public_id,
      url: myavatar.secure_url,
    };
    currStudent.save();

    res.status(200).json({
      success: true,
      message: "Staff updated successfully",
      student: currStudent,
    });
  }

  // Respond with the updated student information.
  res.status(200).json({
    success: true,
    message: "Staff updated successfully",
    student: updatedStudent,
  });
});

exports.changeStudentAvatar = catchAsyncErron(async (req, res, next) => {
  const id = req.id;
  const studentId = req.params.id;
  const student = await Student.findById(studentId);
  if (student.avatar.publicId !== "") {
    await cloudinary.uploader.destroy(
      student.avatar.publicId,
      (error, result) => {
        if (error) {
          console.error("Error deleting file from Cloudinary:", error);
        } else {
          console.log("File deleted successfully:", result);
        }
      }
    );
  }
  const studentAvatar = await cloudinary.uploader.upload(
    filepath.tempFilePath,
    {
      folder: "school",
    }
  );

  student.logo = {
    fileId: studentAvatar.public_id,
    url: studentAvatar.secure_url,
  };

  await student.save();

  res.status(200).json({
    success: true,
    message: "Student Avatar Update successfully",
    school: student,
  });
});

exports.deleteStudent = catchAsyncErron(async (req, res, next) => {
  const studentId = req.params.id; // Assuming the student ID is in the URL.

  // Attempt to find the student by ID and delete it.
  const deletedStudent = await Student.findByIdAndDelete(studentId);

  if (!deletedStudent) {
    // If no student was found with the given ID, return an error response.
    return next(
      new errorHandler(`Student not found with id of ${studentId}`, 404)
    );
  }

  // Respond with a success message indicating the student was deleted.
  res.status(200).json({
    success: true,
    message: "Student deleted successfully",
  });
});

exports.deleteStaffcurr = catchAsyncErron(async (req, res, next) => {
  const studentId = req.params.id; // Assuming the student ID is in the URL.

  // Attempt to find the student by ID and delete it.
  const deletedStudent = await Staff.findByIdAndDelete(studentId);

  if (!deletedStudent) {
    // If no student was found with the given ID, return an error response.
    return next(
      new errorHandler(`Staff not found with id of ${studentId}`, 404)
    );
  }

  // Respond with a success message indicating the student was deleted.
  res.status(200).json({
    success: true,
    message: "Staff deleted successfully",
  });
});

exports.allSchool = catchAsyncErron(async (req, res, next) => {
  const id = req.id; // Assuming the student ID is in the URL.

  // Attempt to find the student by ID and delete it.
  const schools = await School.find({ user: id });

  // Prepare an array to store modified school data with student count.
  const modifiedSchools = [];

  // Iterate through each school to find the count of students in it.
  for (const school of schools) {
    // Find the count of students belonging to the current school.
    const studentCount = await Student.countDocuments({ school: school._id });

    // Create a modified school object with the student count.
    const modifiedSchool = {
      _id: school._id,
      name: school.name,
      email: school.email,
      contact: school.contact,
      address: school.address,
      logo: school.logo,
      code: school.code,
      requiredFields: school.requiredFields,
      requiredFieldsStaff: school.requiredFieldsStaff,
      extraFields: school?.extraFields,
      extraFieldsStaff: school?.extraFieldsStaff,
      createdAt: school.createdAt,
      showPassword: school.showPassword ? school.showPassword : "No Availble",
      // Add other school properties as needed.
      studentCount: studentCount,
      isActive: school.isActive,
    };

    // Push the modified school object into the array.
    modifiedSchools.push(modifiedSchool);
  }

  // Respond with a success message indicating the student was deleted.
  res.status(200).json({
    success: true,
    schools: modifiedSchools,
  });
});

// Assuming you have required necessary modules and defined Student model

exports.getAllStudentsInSchool = catchAsyncErron(async (req, res, next) => {
  try {
    const schoolId = req.params.id; // School ID from request params
    const status = req.query.status; // Status from query parameters
    const search = req.query.search; // Search term from query parameters
    const studentClass = req.query.studentClass; // Search term from query parameters
    const section = req.query.section; // Search term from query parameters
    const course = req.query.course; // Search term from query parameters

    console.log(course);
    let queryObj = { school: new mongoose.Types.ObjectId(schoolId) };
    const SchoolData = await School.findById(schoolId);
    let statusObj =  { school: new mongoose.Types.ObjectId(schoolId)  }

    const uniqueStudents = await Student.distinct("class", queryObj);
    // Replace "studentID" with the field you consider unique
    const uniqueSection = SchoolData.requiredFields.includes("Section")
      ? await Student.distinct("section", queryObj)
      : []; // Replace "studentID" with the field you consider unique
    const uniqueCourse = SchoolData.requiredFields.includes("Course")
      ? await Student.distinct("course", queryObj)
      : []; // Replace "studentID" with the field you consider unique

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
        statusObj.class = null; // Logic to filter for "Without Class Name"
      } else {
        const escapedClassName = escapeRegex(studentClass); // Escape special characters
        queryObj.class = { $regex: `^${escapedClassName}$`, $options: "i" }; // Exact match with regex
        statusObj.class = { $regex: `^${escapedClassName}$`, $options: "i" }; // Exact match with regex
      }
    }
    if (course) {
      if (course === "no-class" || course === "") {
        queryObj.course = null; // Logic to filter for "Without Class Name"
        statusObj.course = null; // Logic to filter for "Without Class Name"
      } else {
        const escapedcourseName = escapeRegex(course); // Escape special characters
        queryObj.course = { $regex: `^${escapedcourseName}$`, $options: "i" }; // Exact match with regex
        statusObj.course = { $regex: `^${escapedcourseName}$`, $options: "i" }; // Exact match with regex
      }
    }

    if (section) {
      queryObj.section = { $regex: section, $options: "i" };
      statusObj.section = { $regex: section, $options: "i" };
    }

    // If there is a search term, add the search logic
    if (search) {
      queryObj.$or = [
        { name: { $regex: search, $options: "i" } },
        // { rollNo: { $regex: search, $options: "i" } },
        // { section: { $regex: search, $options: "i" } },
        // { class: { $regex: search, $options: "i" } },
        // { fatherName: { $regex: search, $options: "i" } },
        // { motherName: { $regex: search, $options: "i" } },
        // { contact: { $regex: search, $options: "i" } },
        // { email: { $regex: search, $options: "i" } },
        // { admissionNo: { $regex: search, $options: "i" } },
        // { studentID: { $regex: search, $options: "i" } },
        // { aadharNo: { $regex: search, $options: "i" } },
        // { regNo: { $regex: search, $options: "i" } },
        {
          $expr: {
            $gt: [
              {
                $size: {
                  $filter: {
                    input: {
                      $ifNull: [{ $objectToArray: "$extraFields" }, []], // Ensure this is an array
                    },
                    as: "field",
                    cond: {
                      $regexMatch: {
                        input: "$$field.v",
                        regex: search,
                        options: "i",
                      },
                    },
                  },
                },
              },
              0,
            ],
          },
        },

        // You can add more fields here as needed
      ];
      statusObj.$or = [
        { name: { $regex: search, $options: "i" } },
        // { rollNo: { $regex: search, $options: "i" } },
        // { section: { $regex: search, $options: "i" } },
        // { class: { $regex: search, $options: "i" } },
        // { fatherName: { $regex: search, $options: "i" } },
        // { motherName: { $regex: search, $options: "i" } },
        // { contact: { $regex: search, $options: "i" } },
        // { email: { $regex: search, $options: "i" } },
        // { admissionNo: { $regex: search, $options: "i" } },
        // { studentID: { $regex: search, $options: "i" } },
        // { aadharNo: { $regex: search, $options: "i" } },
        // { regNo: { $regex: search, $options: "i" } },
        {
          $expr: {
            $gt: [
              {
                $size: {
                  $filter: {
                    input: {
                      $ifNull: [{ $objectToArray: "$extraFields" }, []], // Ensure this is an array
                    },
                    as: "field",
                    cond: {
                      $regexMatch: {
                        input: "$$field.v",
                        regex: search,
                        options: "i",
                      },
                    },
                  },
                },
              },
              0,
            ],
          },
        },

        // You can add more fields here as needed
      ];
    }

    // Pagination parameters
    const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
    const limit = parseInt(req.query.limit) || 10; // Default to 10 students per page

    // Find all students based on the queryObj

    const totalStudents = await Student.countDocuments(queryObj); // Count total students for pagination
    const students = await Student.find(queryObj)
      .skip((page - 1) * limit) // Skip the results based on the page number
      .limit(limit); // Limit the number of results per page

  

    const studentsWithRole = students.map((student) => {
      return {
        ...student.toObject(),
        extraFields: Object.fromEntries(student.extraFields), // Convert Map to Object
        role: "student",
      };
    });

    let staffCountByStatus = {};
    try {
      staffCountByStatus = await Student.aggregate([
        {
          $match: statusObj,
        },
        {
          $group: {
            _id: "$status", // Grouping by status
            count: { $sum: 1 }, // Count the number of documents for each status
          },
        },
      ]);

      console.log(staffCountByStatus);
    } catch (error) {
      console.log(error);
    }


    if (!students || students.length === 0) {
      return res.json({
        success: false,
        role: "student",
        message: "No students found for the provided school ID",
      staffCountByStatus,

      });
    }
    // Respond with the list of students and pagination info
    res.status(200).json({
      success: true,
      message: "Students found for the provided school ID",
      students: studentsWithRole,
      pagination: {
        totalStudents,
        totalPages: Math.ceil(totalStudents / limit),
        currentPage: page,
        pageSize: limit,
      },
      uniqueStudents,
      uniqueSection,
      uniqueCourse,
      staffCountByStatus,
    });
  } catch (error) {
    console.error("Error in getAllStudentsInSchool route:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

exports.getAllStaffInSchool = catchAsyncErron(async (req, res, next) => {
  const schoolId = req.params.id; // School ID from request params
  const status = req.query.status; // State from query parameters
  const staffType = req.query.staffType; // Search term from query parameters
  const institute = req.query.institute; // Search term from query parameters
  const search = req.query.search; // Search term from query parameters

  let queryObj = { school: new mongoose.Types.ObjectId(schoolId) };

  let statusObj = { school: new mongoose.Types.ObjectId(schoolId) };

  const StaffData = await School.findById(schoolId);
  const staffTypes = StaffData.requiredFieldsStaff.includes("Staff Type")
    ? await Staff.distinct("staffType", queryObj)
    : [];
  const instituteUni = StaffData.requiredFieldsStaff.includes("Institute")
    ? await Staff.distinct("institute", queryObj)
    : [];

  if (search) {
    queryObj.$or = [
      { name: { $regex: search, $options: "i" } },

      {
        $expr: {
          $gt: [
            {
              $size: {
                $filter: {
                  input: {
                    $ifNull: [{ $objectToArray: "$extraFieldsStaff" }, []], // Ensure this is an array
                  },
                  as: "field",
                  cond: {
                    $regexMatch: {
                      input: "$$field.v",
                      regex: search,
                      options: "i",
                    },
                  },
                },
              },
            },
            0,
          ],
        },
      },

      // You can add more fields here as needed
    ];
  }
  if (search) {
    statusObj.$or = [
      { name: { $regex: search, $options: "i" } },

      {
        $expr: {
          $gt: [
            {
              $size: {
                $filter: {
                  input: {
                    $ifNull: [{ $objectToArray: "$extraFieldsStaff" }, []], // Ensure this is an array
                  },
                  as: "field",
                  cond: {
                    $regexMatch: {
                      input: "$$field.v",
                      regex: search,
                      options: "i",
                    },
                  },
                },
              },
            },
            0,
          ],
        },
      },

      // You can add more fields here as needed
    ];
  }

  if (status) {
    queryObj.status = status; // Assuming your student schema has a 'state' field
  }
  function escapeRegex(value) {
    return value.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
  }

  if (staffType) {
    if (staffType === "no-staff" || staffType === "") {
      queryObj.staffType = null; // Logic to filter for "Without Class Name"
      statusObj.staffType = null; // Logic to filter for "Without Class Name"
    } else {
      const escapedClassName = escapeRegex(staffType); // Escape special characters
      queryObj.staffType = { $regex: `^${escapedClassName}$`, $options: "i" }; // Exact match with regex
      statusObj.staffType = { $regex: `^${escapedClassName}$`, $options: "i" }; // Exact match with regex
    }
  }
  if (institute) {
    if (institute === "no-staff" || institute === "") {
      queryObj.institute = null; // Logic to filter for "Without Class Name"
      statusObj.institute = null; // Logic to filter for "Without Class Name"
    } else {
      const escapedClassName = escapeRegex(institute); // Escape special characters
      queryObj.institute = { $regex: `^${escapedClassName}$`, $options: "i" }; // Exact match with regex
      statusObj.institute = { $regex: `^${escapedClassName}$`, $options: "i" }; // Exact match with regex
    }
  }
  // Find all staff in the given school using the school ID
  let staff = await Staff.find(queryObj);
  // console.log(staff);

  if (!staff || staff.length === 0) {
    // If no staff are found for the given school, return an appropriate response
    return res.json({
      success: false,
      role: "Staff",
      message: "No staff found for the provided school ID",
    });
  }

  const staffWithRole = staff.map((student) => {
    return {
      ...student.toObject(),
      extraFieldsStaff: Object.fromEntries(student.extraFieldsStaff), // Convert Map to Object

      role: "staff",
    };
  });

  // Pagination parameters
  const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
  const limit = parseInt(req.query.limit) || 10; // Default to 10 students per page

  // Find all students based on the queryObj

  const totalStudents = await Staff.countDocuments(queryObj); // Count total students for pagination
  const students = await Staff.find(queryObj)
    .skip((page - 1) * limit) // Skip the results based on the page number
    .limit(limit); // Limit the number of results per page

  let staffCountByStatus = {};
  try {
    staffCountByStatus = await Staff.aggregate([
      {
        $match: statusObj,
      },
      {
        $group: {
          _id: "$status", // Grouping by status
          count: { $sum: 1 }, // Count the number of documents for each status
        },
      },
    ]);
  } catch (error) {
    console.log(error);
  }
  // Respond with the list of staff found in the school
  res.status(200).json({
    success: true,
    role: "Staff",
    message: "Students found for the provided school ID",
    staff: staffWithRole,
    pagination: {
      totalStudents,
      totalPages: Math.ceil(totalStudents / limit),
      currentPage: page,
      pageSize: limit,
    },
    staffTypes,
    staffCountByStatus,
    instituteUni,
  });
});

// ---------------------StatusReaduToPrint----------------

exports.updateStudentStatusToPrint = catchAsyncErron(async (req, res, next) => {
  const schoolID = req.params.id;
  let { studentIds } = req.body; // Assuming both are passed in the request body

  if (typeof studentIds === "string") {
    try {
      studentIds = JSON.parse(`[${studentIds}]`);
    } catch (error) {
      // If JSON.parse fails, split the string by commas and manually remove quotes
      studentIds = studentIds
        .split(",")
        .map((id) => id.trim().replace(/^"|"$/g, ""));
    }
  }

  // Validate inputs (schoolId and studentIds)
  if (!schoolID || !studentIds) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid request. Please provide a school ID and a list of student IDs.",
    });
  }

  // Update status of students
  const updated = await Student.updateMany(
    {
      _id: { $in: studentIds }, // Filter documents by student IDs
      school: schoolID, // Ensure the students belong to the specified school
    },
    {
      $set: { status: "Ready to print" }, // Set the status to "Ready to print"
    }
  );

  // If no documents were updated, it could mean invalid IDs were provided or they don't match the school ID
  if (updated.matchedCount === 0) {
    return res.status(404).json({
      success: false,
      message: "No matching students found for the provided IDs and school ID.",
    });
  }

  res.status(200).json({
    success: true,
    message: `${updated.modifiedCount} students' status updated to "Ready to print"`,
  });
});

// ---------------------StatusPending------------

exports.updateStudentStatusToPending = catchAsyncErron(
  async (req, res, next) => {
    const schoolID = req.params.id;
    let { studentIds } = req.body; // Assuming both are passed in the request body

    if (typeof studentIds === "string") {
      try {
        studentIds = JSON.parse(`[${studentIds}]`);
      } catch (error) {
        // If JSON.parse fails, split the string by commas and manually remove quotes
        studentIds = studentIds
          .split(",")
          .map((id) => id.trim().replace(/^"|"$/g, ""));
      }
    }

    // Validate inputs (schoolId and studentIds)
    if (!schoolID || !studentIds) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid request. Please provide a school ID and a list of student IDs.",
      });
    }

    // Update status of students
    const updated = await Student.updateMany(
      {
        _id: { $in: studentIds }, // Filter documents by student IDs
        school: schoolID, // Ensure the students belong to the specified school
      },
      {
        $set: { status: "Panding" }, // Set the status to "Ready to print"
      }
    );

    // If no documents were updated, it could mean invalid IDs were provided or they don't match the school ID
    if (updated.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message:
          "No matching students found for the provided IDs and school ID.",
      });
    }

    res.status(200).json({
      success: true,
      message: `${updated.modifiedCount} students' status updated to "Panding"`,
    });
  }
);

// ---------------------StatusPrint------------

exports.updateStudentStatusToPrinted = catchAsyncErron(
  async (req, res, next) => {
    const schoolID = req.params.id;
    let { studentIds } = req.body; // Assuming both are passed in the request body
    console.log(studentIds);
    if (typeof studentIds === "string") {
      try {
        studentIds = JSON.parse(`[${studentIds}]`);
      } catch (error) {
        // If JSON.parse fails, split the string by commas and manually remove quotes
        studentIds = studentIds
          .split(",")
          .map((id) => id.trim().replace(/^"|"$/g, ""));
      }
    }

    // Validate inputs (schoolId and studentIds)
    if (!schoolID || !studentIds) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid request. Please provide a school ID and a list of student IDs.",
      });
    }

    // Update status of students
    const updated = await Student.updateMany(
      {
        _id: { $in: studentIds }, // Filter documents by student IDs
        school: schoolID, // Ensure the students belong to the specified school
      },
      {
        $set: { status: "Printed" }, // Set the status to "Ready to print"
      }
    );

    // If no documents were updated, it could mean invalid IDs were provided or they don't match the school ID
    if (updated.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message:
          "No matching students found for the provided IDs and school ID.",
      });
    }

    res.status(200).json({
      success: true,
      message: `${updated.modifiedCount} students' status updated to "Printed"`,
    });
  }
);

exports.deleteStudents = catchAsyncErron(async (req, res, next) => {
  const schoolID = req.params.id;
  let { studentIds } = req.body; // Assuming both are passed in the request body
  console.log(studentIds);
  if (typeof studentIds === "string") {
    try {
      studentIds = JSON.parse(`[${studentIds}]`);
    } catch (error) {
      // If JSON.parse fails, split the string by commas and manually remove quotes
      studentIds = studentIds
        .split(",")
        .map((id) => id.trim().replace(/^"|"$/g, ""));
    }
  }

  // Validate inputs (schoolId and studentIds)
  if (!schoolID || !studentIds) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid request. Please provide a school ID and a list of student IDs.",
    });
  }

  // Update status of students
  const updated = await Student.deleteMany({
    _id: { $in: studentIds }, // Filter documents by student IDs
    school: schoolID, // Ensure the students belong to the specified school
  });

  // If no documents were updated, it could mean invalid IDs were provided or they don't match the school ID
  if (updated.matchedCount === 0) {
    return res.status(404).json({
      success: false,
      message: "No matching students found for the provided IDs and school ID.",
    });
  }

  res.status(200).json({
    success: true,
    message: `${updated.modifiedCount} students' status updated to "Printed"`,
  });
});

// ---------------------StatusReaduToPrint Staff----------------

exports.updateStaffStatusToPrint = catchAsyncErron(async (req, res, next) => {
  const schoolID = req.params.id;
  let { staffIds } = req.body; // Assuming both are passed in the request body

  if (typeof staffIds === "string") {
    try {
      staffIds = JSON.parse(`[${staffIds}]`);
    } catch (error) {
      // If JSON.parse fails, split the string by commas and manually remove quotes
      staffIds = staffIds
        .split(",")
        .map((id) => id.trim().replace(/^"|"$/g, ""));
    }
  }

  // Validate inputs (schoolId and studentIds)
  if (!schoolID || !staffIds) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid request. Please provide a school ID and a list of student IDs.",
    });
  }

  // Update status of students
  const updated = await Staff.updateMany(
    {
      _id: { $in: staffIds }, // Filter documents by student IDs
      school: schoolID, // Ensure the students belong to the specified school
    },
    {
      $set: { status: "Ready to print" }, // Set the status to "Ready to print"
    }
  );

  // If no documents were updated, it could mean invalid IDs were provided or they don't match the school ID
  if (updated.matchedCount === 0) {
    return res.status(404).json({
      success: false,
      message: "No matching students found for the provided IDs and school ID.",
    });
  }

  res.status(200).json({
    success: true,
    message: `${updated.modifiedCount} students' status updated to "Ready to print"`,
  });
});

// ---------------------StatusPending  Staff------------

exports.updateStaffStatusToPending = catchAsyncErron(async (req, res, next) => {
  const schoolID = req.params.id;
  let { staffIds } = req.body; // Assuming both are passed in the request body

  if (typeof staffIds === "string") {
    try {
      staffIds = JSON.parse(`[${staffIds}]`);
    } catch (error) {
      // If JSON.parse fails, split the string by commas and manually remove quotes
      staffIds = staffIds
        .split(",")
        .map((id) => id.trim().replace(/^"|"$/g, ""));
    }
  }

  // Validate inputs (schoolId and staffIds)
  if (!schoolID || !staffIds) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid request. Please provide a school ID and a list of Staff IDs.",
    });
  }

  // Update status of students
  const updated = await Staff.updateMany(
    {
      _id: { $in: staffIds }, // Filter documents by student IDs
      school: schoolID, // Ensure the students belong to the specified school
    },
    {
      $set: { status: "Panding" }, // Set the status to "Ready to print"
    }
  );

  // If no documents were updated, it could mean invalid IDs were provided or they don't match the school ID
  if (updated.matchedCount === 0) {
    return res.status(404).json({
      success: false,
      message: "No matching staff found for the provided IDs and school ID.",
    });
  }

  res.status(200).json({
    success: true,
    message: `${updated.modifiedCount} staff' status updated to "Panding"`,
  });
});

// ---------------------StatusPrint  Staff------------

exports.updateStaffStatusToPrinted = catchAsyncErron(async (req, res, next) => {
  const schoolID = req.params.id;
  let { staffIds } = req.body; // Assuming both are passed in the request body

  if (typeof staffIds === "string") {
    try {
      staffIds = JSON.parse(`[${staffIds}]`);
    } catch (error) {
      // If JSON.parse fails, split the string by commas and manually remove quotes
      staffIds = staffIds
        .split(",")
        .map((id) => id.trim().replace(/^"|"$/g, ""));
    }
  }

  // Validate inputs (schoolId and staffIds)
  if (!schoolID || !staffIds) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid request. Please provide a school ID and a list of staff IDs.",
    });
  }

  // Update status of students
  const updated = await Staff.updateMany(
    {
      _id: { $in: staffIds }, // Filter documents by student IDs
      school: schoolID, // Ensure the students belong to the specified school
    },
    {
      $set: { status: "Printed" }, // Set the status to "Ready to print"
    }
  );

  // If no documents were updated, it could mean invalid IDs were provided or they don't match the school ID
  if (updated.matchedCount === 0) {
    return res.status(404).json({
      success: false,
      message: "No matching Staff found for the provided IDs and school ID.",
    });
  }

  res.status(200).json({
    success: true,
    message: `${updated.modifiedCount} Staff' status updated to "Printed"`,
  });
});

exports.deleteStaff = catchAsyncErron(async (req, res, next) => {
  const schoolID = req.params.id;
  let { staffIds } = req.body; // Assuming both are passed in the request body
  console.log(staffIds);
  if (typeof staffIds === "string") {
    try {
      staffIds = JSON.parse(`[${staffIds}]`);
    } catch (error) {
      // If JSON.parse fails, split the string by commas and manually remove quotes
      staffIds = staffIds
        .split(",")
        .map((id) => id.trim().replace(/^"|"$/g, ""));
    }
  }

  // Validate inputs (schoolId and studentIds)
  if (!schoolID || !staffIds) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid request. Please provide a school ID and a list of student IDs.",
    });
  }

  // Update status of students
  const updated = await Staff.deleteMany({
    _id: { $in: staffIds }, // Filter documents by student IDs
    school: schoolID, // Ensure the students belong to the specified school
  });

  // If no documents were updated, it could mean invalid IDs were provided or they don't match the school ID
  if (updated.matchedCount === 0) {
    return res.status(404).json({
      success: false,
      message: "No matching students found for the provided IDs and school ID.",
    });
  }

  res.status(200).json({
    success: true,
    message: `${updated.modifiedCount} students' status updated to "Printed"`,
  });
});

// exports.studentListExcel = catchAsyncErron(async (req, res, next) => {
//   const schoolID = req.params.id;

//   try {
//       // Find all students belonging to the specified school
//       const students = await Student.find({ school: schoolID });

//       if (students.length === 0) {
//           return res.status(404).send("No students found for the provided school ID.");
//       }

//       // Format student data into an array of arrays (rows)
//       const rows = students.map(student => [
//           student.name,
//           student.fatherName,
//           student.motherName,
//           student.class,
//           student.section,
//           student.contact,
//           student.address,
//           // Add other fields as needed
//       ]);

//       // Add headers for each column
//       const headers = [
//           "Student Name",
//           "Father's Name",
//           "Mother's Name",
//           "Class",
//           "Section",
//           "Contact",
//           "Address",
//           // Add other headers as needed
//       ];

//       // Insert headers as the first row
//       rows.unshift(headers);

//       // Create a new workbook
//       const wb = xlsx.utils.book_new();

//       // Add a worksheet to the workbook
//       const ws = xlsx.utils.aoa_to_sheet(rows);

//       // Add the worksheet to the workbook
//       xlsx.utils.book_append_sheet(wb, ws, "Students");

//       // Write the workbook to a file
//       const fileName = `students_${schoolID}.xlsx`;
//       const filePath = `./${fileName}`;
//       xlsx.writeFile(wb, filePath);
//       console.log(fileName)
//       console.log(filePath)

//       // Send the file to the user as an attachment
//       res.download(filePath, fileName, () => {
//           // After the file is sent, delete it from the server
//           fs.unlinkSync(filePath);
//       });

//   } catch (err) {
//       console.error("Error downloading students:", err);
//       return res.status(500).send("Error downloading students.");
//   }
// });

exports.studentListExcel = catchAsyncErron(async (req, res, next) => {
  const schoolID = req.params.id;

  try {
    // Find all students belonging to the specified school
    const students = await Student.find({ school: schoolID });

    if (students.length === 0) {
      return res
        .status(404)
        .send("No students found for the provided school ID.");
    }

    // Format student data into an array of arrays (rows)
    const rows = students.map((student) => [
      student.name,
      student.fatherName,
      student.motherName,
      student.class,
      student.section,
      student.contact,
      student.address,
      // Add other fields as needed
    ]);

    // Add headers for each column
    const headers = [
      "Student Name",
      "Father's Name",
      "Mother's Name",
      "Class",
      "Section",
      "Contact",
      "Address",
      // Add other headers as needed
    ];

    // Insert headers as the first row
    rows.unshift(headers);

    // Create a new workbook
    const wb = xlsx.utils.book_new();

    // Add a worksheet to the workbook
    const ws = xlsx.utils.aoa_to_sheet(rows);

    // Add the worksheet to the workbook
    xlsx.utils.book_append_sheet(wb, ws, "Students");

    // Write the workbook to a buffer
    const buffer = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });
    buffer;

    // Set response headers to indicate that you're sending an Excel file
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=students_${schoolID}.xlsx`
    );

    // Send the Excel file data in the response body
    res.send(buffer);
  } catch (err) {
    console.error("Error downloading students:", err);
    return res.status(500).send("Error downloading students.");
  }
});

exports.SerchSchool = catchAsyncErron(async (req, res, next) => {
  try {
    const id = req.id;
    const searchQuery = req.query.q; // Get search query from URL query parameters
    console.log(searchQuery);

    const jobs = await searchSchool(searchQuery, id);
    res.json(jobs);
  } catch (error) {
    console.error("Error in SearchJobs route:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }

  async function searchSchool(query, location) {
    const searchRegex = new RegExp(query, "i"); // 'i' for case-insensitive
    console.log("call");
    const queryObj = {
      name: { $regex: searchRegex },
      user: req.id,
    };

    return School.find(queryObj);
  }
});

exports.setImagesData = catchAsyncErron(async (req, res, next) => {
  try {
    const id = req.params.id;

    // Find the school by ID
    const school = await School.findById(id);
    if (!school) {
      return res.status(404).json({
        success: false,
        message: "School not found",
      });
    }

    // Toggle the exportImages flag
    school.exportImages = !school.exportImages;

    // Save the updated school document
    await school.save();

    // Send the response back with updated school
    res.status(201).json({
      success: true,
      message: "Successfully changed export data",
      school,
    });
  } catch (error) {
    next(error); // Pass error to the global error handler
  }
});

exports.setExcleData = catchAsyncErron(async (req, res, next) => {
  try {
    const id = req.params.id;

    // Find the school by ID
    const school = await School.findById(id);
    if (!school) {
      return res.status(404).json({
        success: false,
        message: "School not found",
      });
    }

    school.exportExcel = !school.exportExcel;

    await school.save();

    // Send the response back with updated school
    res.status(201).json({
      success: true,
      message: "Successfully changed export data",
      school,
    });
  } catch (error) {
    next(error); // Pass error to the global error handler
  }
});

exports.SchoolrequiredFields = catchAsyncErron(async (req, res, next) => {
  try {
    const id = req.params.id;

    const school = await School.findById(id);
    if (!school) return next(new errorHandler("School Not Found", 401));

    const requiredFieldsString = school.requiredFields.join(", ");
    const requiredFieldsStaffString = school.requiredFieldsStaff.join(", ");

    res.json({
      requiredFields: requiredFieldsString,
      requiredFieldsStaff: requiredFieldsStaffString,
    });
  } catch (error) {
    console.error("Error in SearchJobs route:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

exports.GraphData = catchAsyncErron(async (req, res, next) => {
  let { year, month } = req.query;

  // If year and month are not provided, default to the current month and year
  if (!year || !month) {
    const currentDate = moment(); // Get the current date
    year = currentDate.format("YYYY"); // Extract current year
    month = currentDate.format("MM"); // Extract current month
  }

  // Parse the year and month provided by the user
  const selectedDate = moment(`${year}-${month}`, "YYYY-MM");

  // Determine the start and end dates for the specified month and year
  const startDate = selectedDate.startOf("month");
  const endDate = selectedDate.endOf("month");

  // Calculate the start date of four weeks ago
  const fourWeeksAgo = moment(startDate).subtract(4, "weeks");

  try {
    // Query the database to find schools registered within the last four weeks of the specified month and year
    const registeredSchools = await School.find({
      createdAt: {
        $gte: fourWeeksAgo.toDate(), // Convert moment object to Date
        $lte: endDate.toDate(), // Convert moment object to Date
      },
    });

    const registeredStudents = await Student.find({
      createdAt: {
        $gte: fourWeeksAgo.toDate(), // Convert moment object to Date
        $lte: endDate.toDate(), // Convert moment object to Date
      },
    });

    // Initialize an array to store the counts of registered schools for each week
    const weeklyCounts = [];
    const weeklyCountsStrudent = [];

    // Calculate the number of schools registered in each week
    for (let i = 0; i < 4; i++) {
      const startDateOfWeek = moment(fourWeeksAgo).add(i, "weeks");
      const endDateOfWeek = moment(startDateOfWeek).endOf("week");
      const count = registeredSchools.filter(
        (school) =>
          moment(school.createdAt).isBetween(
            startDateOfWeek,
            endDateOfWeek,
            null,
            "[]"
          ) // Check if createdAt is within the week range
      ).length;
      weeklyCounts.push(count);
    }

    for (let i = 0; i < 4; i++) {
      const startDateOfWeek = moment(fourWeeksAgo).add(i, "weeks");
      const endDateOfWeek = moment(startDateOfWeek).endOf("week");
      const count = registeredStudents.filter(
        (student) =>
          moment(student.createdAt).isBetween(
            startDateOfWeek,
            endDateOfWeek,
            null,
            "[]"
          ) // Check if createdAt is within the week range
      ).length;
      weeklyCountsStrudent.push(count);
    }

    const schoolCount = await School.countDocuments({ user: req.id });

    const studntCount = await Student.countDocuments({ user: req.id });

    const staffCount = await Staff.countDocuments({ user: req.id });

    // Format the data for the bar chart
    const barChartData = {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      school: weeklyCounts,
      student: weeklyCountsStrudent,
      schoolCount: schoolCount,
      studentCount: studntCount,
      staffCount: staffCount,
    };

    // Send the formatted data as a response to the user
    res.json(barChartData);
  } catch (error) {
    console.error("Error fetching school registration data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// exports.StudentsAvatars = catchAsyncErron(async (req, res, next) => {
//   const studentId = req.params.id;

//   const school = await Student.findById(studentId);

//   const files = req.files;
//   const students = await files.map(async (file) => {
//     const fileName = path.parse(file.originalname).name;
//     console.log(fileName);
//     const currStudent = await Student.findOne({
//       school: studentId,
//       photoName: fileName,
//     });
//     console.log(currStudent);
//     if (currStudent) {
//       if (currStudent.avatar.publicId !== "") {
//         await cloudinary.v2.uploader.destroy(
//           currStudent.avatar.publicId,
//           (error, result) => {
//             if (error) {
//               console.error("Error deleting file from Cloudinary:", error);
//             } else {
//               console.log("File deleted successfully:", result);
//             }
//           }
//         );
//       }
//       const fileUri = getDataUri(file);
//       const myavatar = await cloudinary.v2.uploader.upload(fileUri.content);

//       currStudent.avatar = {
//         publicId: myavatar.public_id,
//         url: myavatar.url,
//       };
//       await currStudent.save();
//       console.log(currStudent)
//       return currStudent;
//     }
//   });
//   console.log(students)
//   // Respond with the updated student information.
//   res.status(200).json({
//     success: true,
//     message: "send photos",
//     students
//   });
// });

exports.StudentsAvatars = catchAsyncErron(async (req, res, next) => {
  console.log("enter");

  const studentId = req.params.id;

  try {
    const school = await School.findById(studentId);
    if (!school) {
      res.write(
        `data: ${JSON.stringify({
          success: false,
          message: "School not found",
        })}\n\n`
      );
      return res.end();
    }

    //     // Get the total number of students
    //     const totalStudents = await Student.countDocuments({ school: studentId });
    //     const totalPhotos = req.files.length;
    // console.log(totalStudents)
    //     // Check if the number of photos exceeds the number of students
    //     if (totalStudents < totalPhotos) {
    //       res.write(
    //         `data: ${JSON.stringify({
    //           success: false,
    //           message: `There are only ${totalStudents} students. Please add students first to match the number of photos.`,
    //         })}\n\n`
    //       );
    //       return res.end(); // Stop processing and return
    //     }

    const files = req.files;
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const students = [];

    // Set headers for Server-Sent Events (SSE)
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    for (const file of files) {
      const fileName = path.parse(file.originalname).name;
      const currStudent = await Student.findOne({
        school: studentId,
        photoName: fileName,
      });
      console.log(currStudent);

      if (currStudent) {
        if (currStudent.avatar.publicId !== "") {
          try {
            await cloudinary.v2.uploader.destroy(currStudent.avatar.publicId);
            console.log("File deleted successfully");
          } catch (error) {
            console.error("Error deleting file from Cloudinary:", error);
          }
        }

        const fileUri = getDataUri(file);

        try {
          const myavatar = await cloudinary.v2.uploader.upload(fileUri.content);
          currStudent.avatar = {
            publicId: myavatar.public_id,
            url: myavatar.secure_url,
          };
          currStudent.photoName = "";
          await currStudent.save();

          students.push(currStudent);

          // Send processing status to the frontend
          res.write(
            `data: ${JSON.stringify({
              success: true,
              message: `Processing photo ${students.length} of ${files.length}`,
              student: currStudent,
            })}\n\n`
          );
        } catch (error) {
          console.error("Error uploading file to Cloudinary:", error);
        }

        // Wait for 2 seconds before processing the next file
        await delay(2000);
      }
    }

    // Final response after all files are processed
    res.write(
      `data: ${JSON.stringify({
        success: true,
        message: "All photos updated successfully",
        students,
      })}\n\n`
    );
    res.end(); // Close the SSE connection
  } catch (error) {
    console.error("Error:", error);
    res.write(
      `data: ${JSON.stringify({
        success: false,
        message: "An error occurred while processing photos",
        error: error.message,
      })}\n\n`
    );
    res.end();
  }
});

exports.StaffAvatars = catchAsyncErron(async (req, res, next) => {
  console.log("enter");

  const studentId = req.params.id;

  try {
    const school = await School.findById(studentId);
    if (!school) {
      res.write(
        `data: ${JSON.stringify({
          success: false,
          message: "School not found",
        })}\n\n`
      );
      return res.end();
    }

    const files = req.files;
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const students = [];

    // Set headers for Server-Sent Events (SSE)
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    for (const file of files) {
      const fileName = path.parse(file.originalname).name;
      const currStudent = await Staff.findOne({
        school: studentId,
        photoName: fileName,
      });
      console.log(currStudent);

      if (currStudent) {
        if (currStudent.avatar.publicId !== "") {
          try {
            await cloudinary.v2.uploader.destroy(currStudent.avatar.publicId);
            console.log("File deleted successfully");
          } catch (error) {
            console.error("Error deleting file from Cloudinary:", error);
          }
        }

        const fileUri = getDataUri(file);

        try {
          const myavatar = await cloudinary.v2.uploader.upload(fileUri.content);
          currStudent.avatar = {
            publicId: myavatar.public_id,
            url: myavatar.secure_url,
          };
          currStudent.photoName = "";
          await currStudent.save();

          students.push(currStudent);

          // Send processing status to the frontend
          res.write(
            `data: ${JSON.stringify({
              success: true,
              message: `Processing photo ${students.length} of ${files.length}`,
              student: currStudent,
            })}\n\n`
          );
        } catch (error) {
          console.error("Error uploading file to Cloudinary:", error);
        }

        // Wait for 2 seconds before processing the next file
        await delay(2000);
      }
    }

    // Final response after all files are processed
    res.write(
      `data: ${JSON.stringify({
        success: true,
        message: "All photos updated successfully",
        students,
      })}\n\n`
    );
    res.end(); // Close the SSE connection
  } catch (error) {
    console.error("Error:", error);
    res.write(
      `data: ${JSON.stringify({
        success: false,
        message: "An error occurred while processing photos",
        error: error.message,
      })}\n\n`
    );
    res.end();
  }
});

exports.StaffSignature = catchAsyncErron(async (req, res, next) => {
  console.log("enter");

  const staffId = req.params.id;

  try {
    const school = await School.findById(staffId);
    if (!school) {
      res.write(
        `data: ${JSON.stringify({
          success: false,
          message: "School not found",
        })}\n\n`
      );
      return res.end();
    }

    const files = req.files;
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const staff = [];

    // Set headers for Server-Sent Events (SSE)
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    for (const file of files) {
      const fileName = path.parse(file.originalname).name;
      const currStaff = await Staff.findOne({
        school: staffId,
        signatureName: fileName,
      });
      console.log(currStaff);

      if (currStaff) {
        if (currStaff.signatureImage.publicId !== "") {
          try {
            await cloudinary.v2.uploader.destroy(
              currStaff.signatureImage.publicId
            );
            console.log("File deleted successfully");
          } catch (error) {
            console.error("Error deleting file from Cloudinary:", error);
          }
        }

        const fileUri = getDataUri(file);

        try {
          const myavatar = await cloudinary.v2.uploader.upload(fileUri.content);
          currStaff.signatureImage = {
            publicId: myavatar.public_id,
            url: myavatar.secure_url,
          };
          currStaff.signatureName = "";
          await currStaff.save();

          staff.push(currStaff);

          // Send processing status to the frontend
          res.write(
            `data: ${JSON.stringify({
              success: true,
              message: `Processing photo ${staff.length} of ${files.length}`,
              staff: currStaff,
            })}\n\n`
          );
        } catch (error) {
          console.error("Error uploading file to Cloudinary:", error);
        }

        // Wait for 2 seconds before processing the next file
        await delay(2000);
      }
    }

    // Final response after all files are processed
    res.write(
      `data: ${JSON.stringify({
        success: true,
        message: "All photos updated successfully",
        staff,
      })}\n\n`
    );
    res.end(); // Close the SSE connection
  } catch (error) {
    console.error("Error:", error);
    res.write(
      `data: ${JSON.stringify({
        success: false,
        message: "An error occurred while processing photos",
        error: error.message,
      })}\n\n`
    );
    res.end();
  }
});

// exports.StaffAvatars = catchAsyncErron(async (req, res, next) => {
//   const studentId = req.params.id;

//   // const school = await Student.findById(studentId);

//   const files = req.files;
//   console.log(files);
//   const staffs = await Promise.all(
//     files.map(async (file) => {
//       const fileName = path.parse(file.originalname).name;
//       console.log(fileName);
//       const currStaff = await Staff.findOne({
//         school: studentId,
//         photoName: fileName,
//       });
//       console.log(currStaff);
//       if (currStaff) {
//         if (currStaff.avatar.publicId !== "") {
//           await cloudinary.v2.uploader.destroy(
//             currStaff.avatar.publicId,
//             (error, result) => {
//               if (error) {
//                 console.error("Error deleting file from Cloudinary:", error);
//               } else {
//                 console.log("File deleted successfully:", result);
//               }
//             }
//           );
//         }
//         const fileUri = getDataUri(file);
//         const myavatar = await cloudinary.v2.uploader.upload(fileUri.content);

//         currStaff.avatar = {
//           publicId: myavatar.public_id,
//           url: myavatar.secure_url,
//         };
//         await currStaff.save();
//         console.log(currStaff);
//         return currStaff;
//       }
//     })
//   );
//   console.log(staffs);
//   // Respond with the updated student information.
//   res.status(200).json({
//     success: true,
//     message: "send photos",
//     staffs,
//   });
// });

// exports.ExcelStudentData = catchAsyncErron(async (req, res, next) => {
//   try {
//     console.log("hit")
//     let schoolID = req.params.id
//     let { status } = req.query;
//     console.log(status)
//     // Fetch all users from the database
//     const users = await Student.find({status:status,school:schoolID});
//     // console.log(users)

//     // Create a new workbook and worksheet
//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet('Users');

//     // Define worksheet headers
//     worksheet.columns = [
//       { header: 'Name', key: 'name', width: 20 },
//       { header: 'Father Name', key: 'fatherName', width: 20 },
//       { header: 'Mother Name', key: 'motherName', width: 20 },
//       { header: 'Date of Birth', key: 'dob', width: 15 },
//       { header: 'Contact', key: 'contact', width: 15 },
//       { header: 'Email', key: 'email', width: 20 },
//       { header: 'Address', key: 'address', width: 30 },
//       { header: 'Roll No', key: 'rollNo', width: 30 },
//       { header: 'Class', key: 'class', width: 30 },
//       { header: 'Session', key: 'session', width: 30 },
//       { header: 'AdmissionNo', key: 'admissionNo', width: 30 },
//       { header: 'Bus No', key: 'busNo', width: 30 },
//       { header: 'BloodGroup', key: 'bloodGroup', width: 30 },
//       { header: 'Student ID', key: 'studentID', width: 30 },
//       { header: 'Aadhar No', key: 'aadharNo', width: 30 },
//       { header: 'Ribbion Colour', key: 'ribbionColour', width: 30 },
//       { header: 'Route No', key: 'routeNo', width: 30 },
//       // Add more columns as needed
//     ];

//     // Populate worksheet with user data
//     users.forEach(user => {
//       console.log("run loop")
//       worksheet.addRow({
//         name: user.name,
//         fatherName: user.fatherName,
//         motherName: user.motherName,
//         dob: user.dob,
//         contact: user.contact,
//         email: user.email,
//         address: user.address,
//         address: user.address,
//         rollNo: user.rollNo,
//         class: user.class,
//         session: user.session,
//         admissionNo: user.admissionNo,
//         busNo: user.busNo,
//         bloodGroup: user.bloodGroup,
//         studentID: user.studentID,
//         aadharNo: user.aadharNo,
//         ribbionColour: user.ribbionColour,
//         routeNo: user.routeNo,
//         // Add more fields as needed
//       });
//     });

//     // Set response headers
//     res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//     res.setHeader('Content-Disposition', 'attachment; filename="student.xlsx"');

//     // Serialize workbook to response
//     await workbook.xlsx.write(res);

//     res.end(workbook);

//     // End response
//     // res.send({message:"genetea suceess"})
//   } catch (error) {
//     console.error('Error downloading users:', error);
//     res.status(500).send('Error downloading users');
//   }
// });

// exports.ExcelStudentData = catchAsyncErron(async (req, res, next) => {
//   try {
//     console.log("hit")
//     let schoolID = req.params.id;
//     let { status } = req.body; // Extract status from request body
//     console.log(status);

//     // Fetch all users from the database
//     const users = await Student.find({ status: status, school: schoolID });

//     // Create a new workbook and worksheet
//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet('Users');

//     // Define worksheet headers
//     worksheet.columns = [
//       { header: 'Name', key: 'name', width: 20 },
//       { header: 'Father Name', key: 'fatherName', width: 20 },
//       { header: 'Mother Name', key: 'motherName', width: 20 },
//       { header: 'Date of Birth', key: 'dob', width: 15 },
//       { header: 'Contact', key: 'contact', width: 15 },
//       { header: 'Email', key: 'email', width: 20 },
//       { header: 'Address', key: 'address', width: 30 },
//       { header: 'Roll No', key: 'rollNo', width: 30 },
//       { header: 'Class', key: 'class', width: 30 },
//       { header: 'Session', key: 'session', width: 30 },
//       { header: 'AdmissionNo', key: 'admissionNo', width: 30 },
//       { header: 'Bus No', key: 'busNo', width: 30 },
//       { header: 'BloodGroup', key: 'bloodGroup', width: 30 },
//       { header: 'Student ID', key: 'studentID', width: 30 },
//       { header: 'Aadhar No', key: 'aadharNo', width: 30 },
//       { header: 'Ribbion Colour', key: 'ribbionColour', width: 30 },
//       { header: 'Route No', key: 'routeNo', width: 30 },
//       // Add more columns as needed
//     ];

//     // Populate worksheet with user data
//     users.forEach(user => {
//       console.log("run loop")
//       worksheet.addRow({
//         name: user.name,
//         fatherName: user.fatherName,
//         motherName: user.motherName,
//         dob: user.dob,
//         contact: user.contact,
//         email: user.email,
//         address: user.address,
//         address: user.address,
//         rollNo: user.rollNo,
//         class: user.class,
//         session: user.session,
//         admissionNo: user.admissionNo,
//         busNo: user.busNo,
//         bloodGroup: user.bloodGroup,
//         studentID: user.studentID,
//         aadharNo: user.aadharNo,
//         ribbionColour: user.ribbionColour,
//         routeNo: user.routeNo,
//         // Add more fields as needed
//       });
//     });

//     // Set response headers
//     res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//     res.setHeader('Content-Disposition', 'attachment; filename="users.xlsx"');

//     // Serialize workbook to response
//     await workbook.xlsx.write(res);

//     // End response
//     res.end();
//   } catch (error) {
//     console.error('Error downloading users:', error);
//     res.status(500).send('Error downloading users');
//   }
// });

//

// exports.StaffAvatarsDownload = catchAsyncErron(async (req, res, next) => {
//   const studentId = req.params.id;
//   let { status } = req.body;

//   const studetsImages = await Student.find({school:studentId, status:status});

//     // Extract avatars from the results
//     const avatars = studentsAvatars.map(student => student.avatar);

//     // Set response headers
//     res.setHeader('Content-Type', 'application/json');

//     // Send avatars in the response
//     res.status(200).json(avatars);
// });

// exports.StaffAvatarsDownload = catchAsyncErron(async (req, res, next) => {
//   console.log("hit");
//   const studentId = req.params.id;
//   let { status } = req.body;
//   console.log(status);

//   try {
//     // Fetch students' avatars from the database based on school id and status
//     const studentsAvatars = await Student.find({
//       school: studentId,
//       status: status,
//     }).select("avatar");
//     console.log(studentsAvatars);

//     // Set response headers
//     res.setHeader("Content-Type", "application/zip");
//     res.setHeader("Content-Disposition", 'attachment; filename="avatars.zip"');

//     // Create a writable stream to zip the images
//     const zipStream = new yazl.ZipFile();

//     // Add each avatar to the zip file
//     studentsAvatars.forEach((student) => {
//       // Assuming the avatar is stored as a URL, you may need to adjust this part based on how avatars are stored
//       const imageUrl = student.avatar.url;
//       const imageName = student._id + ".jpg"; // Naming the image file with student ID

//       // Download the image and add it to the zip file
//       const imageStream = request.get(imageUrl); // Use request module to download the image (you may need to install it)
//       zipStream.addReadStream(imageStream, imageName);
//     });

//     // Pipe the zip file to the response
//     zipStream.outputStream.pipe(res);

//     // End the zip stream
//     zipStream.end();
//   } catch (error) {
//     console.error("Error downloading student avatars:", error);
//     res.status(500).send("Error downloading student avatars");
//   }
// });

//stuednt
exports.StaffAvatarsDownload = catchAsyncErron(async (req, res, next) => {
  const schoolId = req.params.id; // School ID from URL parameter
  const { status } = req.body; // Status from request body

  try {
    // Fetch school details and student data
    const school = await School.findById(schoolId); // Assuming you have a School model
    if (!school) {
      return res
        .status(404)
        .json({ success: false, message: "School not found" });
    }

    const students = await Student.find({ school: schoolId, status });
    if (!students.length) {
      return res
        .status(404)
        .json({ success: false, message: "No students found" });
    }

    const studentAvatars = students.map((student, index) => ({
      url:
        student?.avatar?.url ||
        "https://plus.unsplash.com/premium_photo-1699534403319-978d740f9297?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      name: `${student.photoNameUnuiq}`,
    }));

    // Create a temporary directory to store the avatars
    const tempDir = path.join(__dirname, "temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    // Download the images and save them locally with student names
    for (let { url, name } of studentAvatars) {
      try {
        const response = await axios({
          url,
          method: "GET",
          responseType: "stream",
        });

        const filePath = path.join(tempDir, `${name.replace(/ /g, "_")}.jpg`);
        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        // Wait until the image is fully downloaded
        await new Promise((resolve, reject) => {
          writer.on("finish", resolve);
          writer.on("error", reject);
        });
      } catch (error) {
        console.error(`Failed to download avatar from ${url}:`, error.message);
      }
    }

    // Create a ZIP file named after the school
    const zipFileName = `${school.name.replace(/ /g, "_")}_avatars.zip`;
    console.log(zipFileName);
    const zipFilePath = path.join(__dirname, zipFileName);
    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    archive.pipe(output);

    // Add all the downloaded files to the ZIP archive
    const files = fs.readdirSync(tempDir);
    files.forEach((file) => {
      const filePath = path.join(tempDir, file);
      archive.file(filePath, { name: file });
    });

    await archive.finalize();

    // Cleanup the temporary directory after creating the ZIP file
    fs.rmSync(tempDir, { recursive: true, force: true });

    // Send the ZIP file to the client
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${zipFileName}"`
    );
    res.setHeader("Content-Type", "application/zip");
    const readStream = fs.createReadStream(zipFilePath);
    readStream.pipe(res);

    // Once the ZIP is sent, delete it from the server
    readStream.on("close", () => {
      fs.unlinkSync(zipFilePath); // Clean up the ZIP file
    });
  } catch (error) {
    console.error("Error while creating or downloading ZIP file:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

//staff
exports.StaffNewAvatarsDownload = catchAsyncErron(async (req, res, next) => {
  const schoolId = req.params.id; // School ID from URL parameter
  const { status } = req.body; // Status from request body

  try {
    // Fetch school details and student data
    const school = await School.findById(schoolId); // Assuming you have a School model
    if (!school) {
      return res
        .status(404)
        .json({ success: false, message: "School not found" });
    }

    const students = await Staff.find({ school: schoolId, status });
    if (!students.length) {
      return res
        .status(404)
        .json({ success: false, message: "No students found" });
    }

    const studentAvatars = students.map((student, index) => ({
      url:
        student.avatar?.url ||
        "https://plus.unsplash.com/premium_photo-1699534403319-978d740f9297?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      name: `IMG${student.photoNameUnuiq}`,
    }));

    // Create a temporary directory to store the avatars
    const tempDir = path.join(__dirname, "temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    // Download the images and save them locally with student names
    for (let { url, name } of studentAvatars) {
      try {
        const response = await axios({
          url,
          method: "GET",
          responseType: "stream",
        });

        const filePath = path.join(tempDir, `${name.replace(/ /g, "_")}.jpg`);
        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        // Wait until the image is fully downloaded
        await new Promise((resolve, reject) => {
          writer.on("finish", resolve);
          writer.on("error", reject);
        });
      } catch (error) {
        console.error(`Failed to download avatar from ${url}:`, error.message);
      }
    }

    // Create a ZIP file named after the school
    const zipFileName = `${school.name.replace(/ /g, "_")}_avatars.zip`;
    console.log(zipFileName);
    const zipFilePath = path.join(__dirname, zipFileName);
    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    archive.pipe(output);

    // Add all the downloaded files to the ZIP archive
    const files = fs.readdirSync(tempDir);
    files.forEach((file) => {
      const filePath = path.join(tempDir, file);
      archive.file(filePath, { name: file });
    });

    await archive.finalize();

    // Cleanup the temporary directory after creating the ZIP file
    fs.rmSync(tempDir, { recursive: true, force: true });

    // Send the ZIP file to the client
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${zipFileName}"`
    );
    res.setHeader("Content-Type", "application/zip");
    const readStream = fs.createReadStream(zipFilePath);
    readStream.pipe(res);

    // Once the ZIP is sent, delete it from the server
    readStream.on("close", () => {
      fs.unlinkSync(zipFilePath); // Clean up the ZIP file
    });
  } catch (error) {
    console.error("Error while creating or downloading ZIP file:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

//staff signature
exports.StaffSignatureDownload = catchAsyncErron(async (req, res, next) => {
  const schoolId = req.params.id; // School ID from URL parameter
  const { status } = req.body; // Status from request body

  try {
    // Fetch school details and student data
    const school = await School.findById(schoolId); // Assuming you have a School model
    if (!school) {
      return res
        .status(404)
        .json({ success: false, message: "School not found" });
    }

    const students = await Staff.find({ school: schoolId, status });
    if (!students.length) {
      return res
        .status(404)
        .json({ success: false, message: "No students found" });
    }

    const studentAvatars = students.map((student, index) => ({
      url:
        student.signatureImage?.url ||
        "https://plus.unsplash.com/premium_photo-1699534403319-978d740f9297?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      name: `SIG${student.signatureNameUnuiq}`,
    }));

    // Create a temporary directory to store the avatars
    const tempDir = path.join(__dirname, "temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    // Download the images and save them locally with student names
    for (let { url, name } of studentAvatars) {
      try {
        const response = await axios({
          url,
          method: "GET",
          responseType: "stream",
        });

        const filePath = path.join(tempDir, `${name.replace(/ /g, "_")}.jpg`);
        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        // Wait until the image is fully downloaded
        await new Promise((resolve, reject) => {
          writer.on("finish", resolve);
          writer.on("error", reject);
        });
      } catch (error) {
        console.error(`Failed to download avatar from ${url}:`, error.message);
      }
    }

    // Create a ZIP file named after the school
    const zipFileName = `${school.name.replace(/ /g, "_")}_Siganture.zip`;
    console.log(zipFileName);
    const zipFilePath = path.join(__dirname, zipFileName);
    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    archive.pipe(output);

    // Add all the downloaded files to the ZIP archive
    const files = fs.readdirSync(tempDir);
    files.forEach((file) => {
      const filePath = path.join(tempDir, file);
      archive.file(filePath, { name: file });
    });

    await archive.finalize();

    // Cleanup the temporary directory after creating the ZIP file
    fs.rmSync(tempDir, { recursive: true, force: true });

    // Send the ZIP file to the client
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${zipFileName}"`
    );
    res.setHeader("Content-Type", "application/zip");
    const readStream = fs.createReadStream(zipFilePath);
    readStream.pipe(res);

    // Once the ZIP is sent, delete it from the server
    readStream.on("close", () => {
      fs.unlinkSync(zipFilePath); // Clean up the ZIP file
    });
  } catch (error) {
    console.error("Error while creating or downloading ZIP file:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// exports.StaffNewAvatarsDownload = catchAsyncErron(async (req, res, next) => {
//   const schoolId = req.params.id;
//   let {status} = req.body;

//   try {
//     // Fetch students' avatars from the database based on school id and status
//     const students = await Staff.find({school: schoolId, status: status});
//     const studentAvatars = students.map((student) => student.avatar.url);
//     console.log(studentAvatars);

//     res.status(200).json({
//       success: true,
//       role: "Staff",
//       staffImages: studentAvatars,
//     });
//   } catch (error) {
//     console.error("Error downloading student avatars:", error);
//     res.status(500).send("Error downloading student avatars");
//   }
// });

exports.ExcelData = catchAsyncErron(async (req, res, next) => {
  const schoolId = req.params.id;
  const status = req.query.status;

  try {
    // Fetch the school data to get the dynamic extra fields
    const school = await School.findById(schoolId);
    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    // School's extraFields (assumed to be part of the school schema)
    const schoolExtraFields = school.extraFields || [];
    const requiredFields = school.requiredFields || [];
    console.log(requiredFields);

    // Fetch all users (students) from the database
    const users = await Student.find({ school: schoolId, status: status });

    // Create a new Excel workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Users");

    // Static columns for required fields
    const staticColumnsAll = [
      { header: "SR NO.", key: "srno", width: 15 },
      { header: "PHOTO NO.", key: "photoName", width: 15 },
      { header: "STUDENT NAME", key: "name", width: 20 },
      requiredFields.includes("Father's Name") && {
        header: "FATHER'S NAME",
        key: "fatherName",
        width: 20,
      },
      requiredFields.includes("Mother's Name") && {
        header: "MOTHER'S NAME",
        key: "motherName",
        width: 20,
      },
      requiredFields.includes("Date of Birth") && {
        header: "DATE OF BIRTH",
        key: "dob",
        width: 15,
      },
      requiredFields.includes("Contact No.") && {
        header: "CONTACT NO.",
        key: "contact",
        width: 15,
      },
      requiredFields.includes("Address") && {
        header: "ADDRESS",
        key: "address",
        width: 30,
      },
      requiredFields.includes("Roll No.") && {
        header: "ROLL NO.",
        key: "rollNo",
        width: 30,
      },
      requiredFields.includes("Class") && {
        header: "CLASS",
        key: "class",
        width: 30,
      },
      requiredFields.includes("Session") && {
        header: "SESSION",
        key: "session",
        width: 30,
      },
      requiredFields.includes("Section") && {
        header: "SECTION",
        key: "section",
        width: 30,
      },
      requiredFields.includes("Admission No.") && {
        header: "ADMISSION NO.",
        key: "admissionNo",
        width: 30,
      },
      requiredFields.includes("Blood Group") && {
        header: "BLOOD GROUP",
        key: "bloodGroup",
        width: 30,
      },
      requiredFields.includes("Student ID") && {
        header: "STUDENT ID",
        key: "studentID",
        width: 30,
      },
      requiredFields.includes("Aadhar No.") && {
        header: "AADHAR NO.",
        key: "aadharNo",
        width: 30,
      },
      requiredFields.includes("Ribbon Colour") && {
        header: "RIBBON COLOUR",
        key: "ribbionColour",
        width: 30,
      },
      requiredFields.includes("Route No.") && {
        header: "ROUTE NO./TRANSPORT",
        key: "routeNo",
        width: 30,
      },
      requiredFields.includes("House Name") && {
        header: "HOUSE NAME",
        key: "houseName",
        width: 30,
      },
      requiredFields.includes("Valid Up To") && {
        header: "VALID UP TO",
        key: "validUpTo",
        width: 30,
      },
      requiredFields.includes("Course") && {
        header: "COURSE",
        key: "course",
        width: 30,
      },
      requiredFields.includes("Batch") && {
        header: "BATCH",
        key: "batch",
        width: 30,
      },
      requiredFields.includes("ID No.") && {
        header: "ID NO.",
        key: "idNo",
        width: 30,
      },
      requiredFields.includes("Reg. No.") && {
        header: "REG. NO.",
        key: "regNo",
        width: 30,
      },
      requiredFields.includes("Extra Field-1") && {
        header: "EXTRA FIELD-1",
        key: "extraField1",
        width: 30,
      },
      requiredFields.includes("Extra Field-2") && {
        header: "EXTRA FIELD-2",
        key: "extraField2",
        width: 30,
      },
    ];
    const staticColumns = staticColumnsAll.filter(Boolean);

    // Add dynamic school extra fields to columns
    schoolExtraFields.forEach((field, index) => {
      staticColumns.push({
        header: field.name || `EXTRA FIELD-${index + 1}`,
        key: field.name,
        width: 30,
      });
    });

    // Define worksheet columns dynamically
    worksheet.columns = staticColumns;
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFF" } }; // White text
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "4CAF50" },
    }; // Green background

    // Add data rows for each student
    users.forEach((user, index) => {
      // Extract the student's extraFields map and ensure we match it with the school fields
      const extraFields = user.extraFields || {};

      const row = {
        srno: `${index + 1}`, // Sequential PhotoName field
        photoName: user.photoNameUnuiq, // Sequential PhotoName field
        name: user.name,
        fatherName: user.fatherName,
        motherName: user.motherName,
        dob: user.dob,
        contact: user.contact,
        // email: user.email,
        address: user.address,
        rollNo: user.rollNo,
        class: user.class,
        section: user.section,
        session: user.session,
        admissionNo: user.admissionNo,
        // busNo: user.busNo,
        bloodGroup: user.bloodGroup,
        studentID: user.studentID,
        aadharNo: user.aadharNo,
        ribbionColour: user.ribbionColour,
        routeNo: user.routeNo,

        houseName: user.houseName, // New field
        validUpTo: user.validUpTo, // New field
        course: user.course, // New field
        batch: user.batch, // New field
        idNo: user.idNo, // New field
        regNo: user.regNo, // New field
        extraField1: user.extraField1, // New field
        extraField2: user.extraField2, // New field
      };

      // Add dynamic extra fields to each row, matching school fields
      schoolExtraFields.forEach((field) => {
        row[field.name] = extraFields.get(field.name) || ""; // Use Map's `get` method to access the field
      });

      worksheet.addRow(row);
    });

    // Set headers for file download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=users.xlsx");

    // Write the Excel file to the response
    await workbook.xlsx.write(res);

    // End the response
    res.end();
  } catch (error) {
    console.error("Error generating Excel file:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

exports.ExcelDataStaff = catchAsyncErron(async (req, res, next) => {
  const schoolId = req.params.id;
  const status = req.query.status;

  try {
    // Fetch the school data to get the dynamic extra fields
    const school = await School.findById(schoolId);
    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    // School's extraFields (assumed to be part of the school schema)
    const schoolExtraFields = school.extraFieldsStaff || [];
    const requiredFieldsStaff = school.requiredFieldsStaff || []; // assuming this is an array of required fields
    console.log(requiredFieldsStaff);

    // Fetch all staff members from the database
    const staffMembers = await Staff.find({ school: schoolId, status: status });

    // Create a new Excel workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Staff");

    // Static columns for required fields
    const staticColumnsAll = [
      { header: "SR NO.", key: "srno", width: 15 },
      { header: "PHOTO NO.", key: "photoNameUnuiq", width: 20 },
      { header: "Signature Photo NO.", key: "signatureNo", width: 20 },
      { header: "Name", key: "name", width: 20 },
      requiredFieldsStaff.includes("Father's Name") && {
        header: "FATHER'S NAME",
        key: "fatherName",
        width: 20,
      },
      requiredFieldsStaff.includes("Husband's Name") && {
        header: "HUSBAND'S NAME",
        key: "husbandName",
        width: 20,
      },
      requiredFieldsStaff.includes("Date of Birth") && {
        header: "DATE OF BIRTH",
        key: "dob",
        width: 15,
      },
      requiredFieldsStaff.includes("Contact No.") && {
        header: "CONTACT NO.",
        key: "contact",
        width: 15,
      },
      requiredFieldsStaff.includes("E-mail") && {
        header: "EMAIL",
        key: "email",
        width: 20,
      },
      requiredFieldsStaff.includes("Address") && {
        header: "ADDRESS",
        key: "address",
        width: 30,
      },
      requiredFieldsStaff.includes("Qualification") && {
        header: "QUALIFICATION",
        key: "qualification",
        width: 20,
      },
      requiredFieldsStaff.includes("Designation") && {
        header: "DESIGNATION",
        key: "designation",
        width: 20,
      },
      requiredFieldsStaff.includes("Staff Type") && {
        header: "STAFF TYPE",
        key: "staffType",
        width: 15,
      },
      requiredFieldsStaff.includes("Date of Joining") && {
        header: "DATE OF JOINING",
        key: "doj",
        width: 15,
      },
      requiredFieldsStaff.includes("Staff ID") && {
        header: "STAFF ID",
        key: "staffID",
        width: 15,
      },
      requiredFieldsStaff.includes("UDISE Code") && {
        header: "UDISE CODE",
        key: "udiseCode",
        width: 20,
      },
      requiredFieldsStaff.includes("School Name") && {
        header: "SCHOOL/INSTITUTE/OFFICE NAME",
        key: "schoolName",
        width: 30,
      },
      requiredFieldsStaff.includes("Blood Group") && {
        header: "BLOOD GROUP",
        key: "bloodGroup",
        width: 15,
      },
      requiredFieldsStaff.includes("Dispatch No.") && {
        header: "DISPATCH NO.",
        key: "dispatchNo",
        width: 15,
      },
      requiredFieldsStaff.includes("Date of Issue") && {
        header: "DATE OF ISSUE",
        key: "dateOfIssue",
        width: 15,
      },
      requiredFieldsStaff.includes("IHRMS No.") && {
        header: "IHRMS NO.",
        key: "ihrmsNo",
        width: 15,
      },
      requiredFieldsStaff.includes("Belt No.") && {
        header: "BELT NO.",
        key: "beltNo",
        width: 15,
      },
      requiredFieldsStaff.includes("Licence No.") && {
        header: "LICENCE NO.",
        key: "licenceNo",
        width: 20,
      },
      requiredFieldsStaff.includes("ID No.") && {
        header: "ID NO.",
        key: "idNo",
        width: 20,
      },
      requiredFieldsStaff.includes("Job Status") && {
        header: "JOB STATUS",
        key: "jobStatus",
        width: 20,
      },
      requiredFieldsStaff.includes("PAN Card No.") && {
        header: "PAN CARD NO.",
        key: "panCardNo",
        width: 20,
      },
      requiredFieldsStaff.includes("Extra Field 1") && {
        header: "EXTRA FIELD 1",
        key: "extraField1",
        width: 20,
      },
      requiredFieldsStaff.includes("Extra Field 2") && {
        header: "EXTRA FIELD 2",
        key: "extraField2",
        width: 20,
      },
    ];

    const staticColumns = staticColumnsAll.filter(Boolean);

    // Add dynamic school extra fields to columns
    schoolExtraFields.forEach((field, index) => {
      staticColumns.push({
        header: field.name || `EXTRA FIELD-${index + 1}`,
        key: field.name,
        width: 30,
      });
    });

    // Define worksheet columns dynamically
    worksheet.columns = staticColumns;
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFF" } }; // White text
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "4CAF50" },
    }; // Green background

    // Add data rows for each staff member
    staffMembers.forEach((staff, index) => {
      const extraFields = staff.extraFieldsStaff || {};

      const row = {
        srno: `${index + 1}`, // Sequential SR NO.
        photoNameUnuiq: `IMG${staff.photoNameUnuiq}`,
        signatureNo: `SIG${staff.signatureNameUnuiq}`,
        name: staff.name,
        fatherName: staff.fatherName,
        husbandName: staff.husbandName,
        dob: staff.dob,
        contact: staff.contact,
        email: staff.email,
        address: staff.address,
        qualification: staff.qualification,
        designation: staff.designation,
        staffType: staff.staffType,
        doj: staff.doj,
        staffID: staff.staffID,
        udiseCode: staff.udiseCode,
        schoolName: staff.schoolName,
        bloodGroup: staff.bloodGroup,
        dispatchNo: staff.dispatchNo,
        dateOfIssue: staff.dateOfIssue,
        ihrmsNo: staff.ihrmsNo,
        beltNo: staff.beltNo,
        licenceNo: staff.licenceNo,
        idNo: staff.idNo,
        jobStatus: staff.jobStatus,
        panCardNo: staff.panCardNo,
        extraField1: staff.extraField1,
        extraField2: staff.extraField2,
      };

      // Add dynamic extra fields to each row, matching school fields
      schoolExtraFields.forEach((field) => {
        row[field.name] = extraFields.get(field.name) || ""; // Use Map's `get` method to access the field
      });

      worksheet.addRow(row);
    });

    // Set headers for file download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=staff.xlsx");

    // Write the Excel file to the response
    await workbook.xlsx.write(res);

    // End the response
    res.end();
  } catch (error) {
    console.error("Error generating Excel file:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

exports.SerchStudent = catchAsyncErron(async (req, res, next) => {
  try {
    const schoolId = req.params.id;
    const { q } = req.query;

    // Define the search criteria
    const searchCriteria = {
      school: schoolId, // Filter by school ID
      $or: [
        { name: { $regex: `^${q}`, $options: "i" } }, // Search by name
        { class: q }, // Search by class
      ],
    };

    // Find students matching the search criteria
    const students = await Student.find(searchCriteria);

    res.json(students);
  } catch (error) {
    console.error("Error searching for students:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

exports.getStudent = catchAsyncErron(async (req, res, next) => {
  const studentId = req.params.id;
  console.log(studentId);

  const student = await Student.findById(studentId);
  console.log(student);

  // Respond with the updated student information.
  res.status(200).json({
    success: true,
    message: "Student",
    student: student,
  });
});

exports.getStaff = catchAsyncErron(async (req, res, next) => {
  const staffId = req.params.id;
  console.log(staffId);

  const staff = await Staff.findById(staffId);

  // Respond with the updated student information.
  res.status(200).json({
    success: true,
    message: "Staff",
    staff: staff,
  });
});

exports.getSchoolById = async (req, res) => {
  try {
    const { id } = req.params; // Get the schoolId from URL params
    const school = await School.findById(id); // Fetch school from database

    if (!school) {
      return res
        .status(404)
        .json({ success: false, message: "School not found" });
    }

    return res.status(200).json({ success: true, data: school });
  } catch (err) {
    console.error("Error fetching school data:", err);
    return res
      .status(500)
      .json({ success: false, message: "Error retrieving school data" });
  }
};
