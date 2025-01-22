const env = require("dotenv");
env.config({ path: "./.env" });
const { catchAsyncErron } = require("../middlewares/catchAsyncError");
const errorHandler = require("../utils/errorHandler");
const Student = require("../models/studentModel");
const School = require("../models/schoolModel");
const User = require("../models/userModel");
const generateTokens = require("../utils/generateTokens");
const path = require("path");
const Staff = require("../models/staffModel");
const ExcelJS = require("exceljs");
const request = require("request");
const yazl = require("yazl");

exports.allUsers = catchAsyncErron(async (req, res, next) => {
    let searchQuery = req.query.q;
    if (!searchQuery) {
      const users = await User.find().populate('schools');
      res.status(201).json({
        succcess: true,
        message: "successfully Fatch users",
        users: users,
    });
    } else {
      // Search based on provided parameter
      const users = await searchUsers(searchQuery);
      res.status(201).json({
        succcess: true,
        message: "successfully Fatch users",
        users: users,
      });
    }
    
    async function searchUsers(query) {
      const searchRegex = new RegExp(query, "i");
  
      const queryObj = {
      $or: [
        { name: { $regex: searchRegex } }, // Search in first name
        { email: { $regex: searchRegex } },  // Search in last name
      ]
      };
  
      return User.find(queryObj);
    }
    
});

exports.allSchoolsadmin = catchAsyncErron(async (req, res, next) => {
    const schools = await School.find();
    console.log(schools)
    res.status(201).json({
        succcess: true,
        message: "successfully Fatch users",
        schools: schools,
      });
});

exports.allStudents = catchAsyncErron(async (req, res, next) => {
    const students = await Student.find();
    res.status(201).json({
        succcess: true,
        message: "successfully Fatch users",
        students: students,
      });
});

exports.allSaffs = catchAsyncErron(async (req, res, next) => {
    const staffs = await Staff.find();
    res.status(201).json({
        succcess: true,
        message: "successfully Fatch users",
        staffs: staffs,
      });
});

exports.allSchoolStudents = catchAsyncErron(async (req, res, next) => {
    const schoolId = req.params.id;
    const students = await Student.find({school:schoolId});
    res.status(201).json({
        succcess: true,
        message: "successfully Fatch users",
        students: students,
      });
});

exports.allSchoolStaff = catchAsyncErron(async (req, res, next) => {
    const schoolId = req.params.id;
    const staffs = await Staff.find({school:schoolId});
    res.status(201).json({
        succcess: true,
        message: "successfully Fatch users",
        staffs: staffs,
      });
});

exports.changeSchooLimit = catchAsyncErron(async (req, res, next) => {
    const schoolId = req.params.id;
    const limit = req.query.limit;

    const user = await  User.findById(req.id);
    user.schoolLimit = limit;
    user.save();
    res.status(201).json({
        succcess: true,
        message: "successfully set limit",
        user
    });
}); 



exports.setExcelData = catchAsyncErron(async (req, res, next) => {
   const id = req.params.id;
   const user = await User.findById(id);
   user.exportExcel = !user.exportExcel;
   await user.save();
   res.status(201).json({
    succcess: true,
    message: "successfully change export data",
    user
   })
});

exports.setImagesData = catchAsyncErron(async (req, res, next) => {
   const id = req.params.id;
   const user = await User.findById(id);
   user.exportImage = !user.exportImage;
   await user.save();
   res.status(201).json({
    succcess: true,
    message: "successfully change export data",
    user
   })
});




exports.setExcelData = catchAsyncErron(async (req, res, next) => {
  const id = req.params.id;
  const user = await User.findById(id);
  user.exportExcel = !user.exportExcel;
  await user.save();
  res.status(201).json({
   succcess: true,
   message: "successfully change export data",
   user
  })
});

exports.setSchoolLimit = catchAsyncErron(async (req, res, next) => {
  const id = req.params.id;
  const user = await User.findById(id);
  user.exportExcel = !user.exportExcel;
  await user.save();
  res.status(201).json({
   succcess: true,
   message: "successfully change export data",
   user
  })
});

exports.FindUser = catchAsyncErron(async (req, res, next) => {
  const id = req.params.id;
  const user = await User.findById(id);
  if(!user) return next(new errorHandler("User not found",401));
  res.status(201).json({
   user
  })
});

exports.updateUserLimit = catchAsyncErron(async (req, res, next) => {
  const id = req.params.id;
  const user = await User.findById(id);
  if(!user) return next(new errorHandler("User not found",401));
  user.staffLimit = req.body.staffLimit;
  user.studentLimit = req.body.studentLimit;
  user.schoolLimit = req.body.schoolLimit;

  await user.save();


  res.status(201).json({
   user
  })
});

exports.getDashboardData = async (req, res) => {
  try {
    // Fetch counts
    const totalSchools = await School.countDocuments({});
    const totalStudents = await Student.countDocuments({});
    const totalDistributors = await User.countDocuments({}); // Update based on your distributor schema.

    // Send response
    res.status(200).json({
      success: true,
      data: {
        totalSchools,
        totalStudents,
        totalDistributors,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard data",
    });
  }
};


exports.getChartData = async (req, res) => {
  try {
    // Fetch and group students by date
    const studentData = await Student.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          studentsCount: { $sum: 1 },
        },
      },
    ]);

    // Fetch and group schools (distributors) by date
    const schoolData = await School.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          distributorsCount: { $sum: 1 },
        },
      },
    ]);

    // Combine the data
    const combinedData = {};

    // Add student data to the combinedData object
    studentData.forEach((item) => {
      combinedData[item._id] = {
        date: item._id,
        students: item.studentsCount,
        distributors: 0, // Default value
      };
    });

    // Add school data to the combinedData object
    schoolData.forEach((item) => {
      if (combinedData[item._id]) {
        combinedData[item._id].distributors = item.distributorsCount;
      } else {
        combinedData[item._id] = {
          date: item._id,
          students: 0, // Default value
          distributors: item.distributorsCount,
        };
      }
    });

    // Convert combinedData object into an array
    const chartData = Object.values(combinedData);

    res.status(200).json({
      success: true,
      data: chartData,
    });
  } catch (error) {
    console.error("Error fetching chart data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch chart data",
    });
  }
};