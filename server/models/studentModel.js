const mongoose = require("mongoose");

const studentModel = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Student Name is Required"],
      minLength: [1, "Name should be at least 3 characters"],
    },
    fatherName: {
      type: String,
      minLength: [1, "Father's Name should be at least 3 characters"],
    },
    motherName: {
      type: String,
      minLength: [1, "Mother's Name should be at least 3 characters"],
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Others"],
    },
    dob: {
      type: String,
    },
    contact: {
      type: String,
    },
    email: {
      type: String,
    },
    address: {
      type: String,
    },
    avatar: {
      type: Object,
      default: {
        publicId: "",
        url: "https://cardpro.co.in/login.jpg",
      },
    },
    rollNo: String,
    parentChanges: String,
    isDuplicate: String,
    class: String,
    section: String,
    session: String,
    admissionNo: String,
    busNo: String,
    bloodGroup: String,
    studentID: String,
    aadharNo: String,
    ribbionColour: String,
    routeNo: String,
    photoName: String,
    photoNameUnuiq: String,
    // Added fields
    houseName: String,
    validUpTo: String,
    course: String,
    batch: String,
    idNo: String,
    regNo: String,
    extraField1: String,
    extraField2: String,

    extraFields: {
      type: Map,
      of: String, // You can use `String`, `Mixed`, or any other type based on your needs
      default: {},
    },
    school: { type: mongoose.Schema.Types.ObjectId, ref: "school" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    status: {
      type: String,
      enum: ["Panding", "Ready to print", "Printed"],
      default: "Panding",
    },
  },
  { timestamps: true }
);

const student = mongoose.model("student", studentModel);
module.exports = student;
