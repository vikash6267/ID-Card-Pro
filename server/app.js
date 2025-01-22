const env = require("dotenv");
env.config({ path: "./.env" });
const express = require("express");
const connectDb = require("./models/database");
const app = express();
const cors = require("cors");
const fileUpload = require("express-fileupload");

// DataBase Conection
// require("./models/database.js").connectDatabase();

// Database Connection
connectDb.databaseConnect();

// body parser
app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ limit: "500mb", extended: true }));
const cookieParser = require("cookie-parser");

// app.use((req, res, next) => {
//   req.setTimeout(3600000); // 1 hour in milliseconds
//   next();
// });

// app.use(
// 	fileUpload({
// 		useTempFiles: true,
// 		tempFileDir: "/tmp/",
// 	})
// );
//loger
const logger = require("morgan");
app.use(logger("dev"));

app.use(cookieParser());

// CORS setup
const allowedOrigins = [
  "https://id-card-ten.vercel.app",
  "http://localhost:3000",
  "https://id-card-bvxf-8tw7c7o4g-arpits-projects-1c6b9bf9.vercel.app",
  "https://id-card-bvxf.vercel.app",
  "http://www.cardpro.co.in/",
  "https://www.cardpro.co.in",
  "https://cardpro.co.in",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "Content-Disposition"],
    exposedHeaders: ["Content-Disposition"], // Include this
    optionsSuccessStatus: 200, // Address potential preflight request issues
  })
);

const readXlsxFile = require("read-excel-file/node");
const Student = require("./models/studentModel.js");
const School = require("./models/schoolModel.js");
const upload = require("./middlewares/multer.js");
const isAuthenticated = require("./middlewares/auth.js");
const Staff = require("./models/staffModel.js");

//routed
app.get("/", (req, res) => {
  res.send("wellocm");
});

const errorHandler = require("./utils/errorHandler");

app.post(
  "/upload-excel/:id",
  upload,
 
  async (req, res, next) => {
    const file = req.files[0];
    const mappings = JSON.parse(req.body.data); // Mapping data sent from frontend
    const extraMapping = JSON.parse(req.body.extra); // Mapping data for extra fields sent from frontend
    console.log(extraMapping);
    const cleanMapping = (data) => {
      const cleanedData = {};
      for (let key in data) {
        const cleanedKey = key.replace(/[\s.'-]+/g, ""); // Remove spaces and special characters
        cleanedData[cleanedKey] = data[key];
      }
      return cleanedData;
    };

    // Clean the received mapping data
    const cleanedMappings = cleanMapping(mappings);
    console.log("Extra Mapping Data: ", cleanedMappings);

    if (!file) {
      return res.status(400).send("No file uploaded.");
    }

    const schoolID = req.params.id;

    const rows = await readXlsxFile(req.files[0].buffer);
    if (rows.length < 2) {
      return res.status(400).send("Excel file does not contain data.");
    }

    const [headers, ...dataRows] = rows;
    const newheader = headers.map((header) =>
      header !== null ? header : header
    );

    // Static column indexes mapping
    const columnIndex = {
      name: newheader.indexOf(cleanedMappings?.StudentName || ""),
      fatherName: newheader.indexOf(cleanedMappings?.FathersName || ""),
      motherName: newheader.indexOf(cleanedMappings?.MothersName || ""),
      class: newheader.indexOf(cleanedMappings?.Class || ""),
      section: newheader.indexOf(cleanedMappings?.Section || ""),
      contact: newheader.indexOf(cleanedMappings?.ContactNo || ""),
      address: newheader.indexOf(cleanedMappings?.Address || ""),
      dob: newheader.indexOf(cleanedMappings?.DateofBirth || ""),
      admissionNo: newheader.indexOf(cleanedMappings?.AdmissionNo || ""),
      rollNo: newheader.indexOf(cleanedMappings?.RollNo || ""),
      studentId: newheader.indexOf(cleanedMappings?.StudentID || ""),
      adharNo: newheader.indexOf(cleanedMappings?.AadharNo || ""),
      routeNo: newheader.indexOf(cleanedMappings?.RouteNo || ""),
      photoName: newheader.indexOf(cleanedMappings?.PhotoNo || ""),

      houseName: newheader.indexOf(cleanedMappings?.HouseName || ""),
      validUpTo: newheader.indexOf(cleanedMappings?.ValidUpTo || ""),
      course: newheader.indexOf(cleanedMappings?.Course || ""),
      batch: newheader.indexOf(cleanedMappings?.Batch || ""),
      idNo: newheader.indexOf(cleanedMappings?.IDNo || ""),
      regNo: newheader.indexOf(cleanedMappings?.RegNo || ""),
      extraField1: newheader.indexOf(cleanedMappings?.ExtraField1 || ""),
      extraField2: newheader.indexOf(cleanedMappings?.ExtraField2 || ""),
    };

    // Dynamically handle extra fields from extraMapping
    const extraFields = {}; // Initialize extraFields object to hold the extra fields
    for (const [key, value] of Object.entries(extraMapping)) {
      const normalizedValue = value.trim().toLowerCase();

      columnIndex[key] = newheader.findIndex(
        (item) => item.trim().toLowerCase() === normalizedValue
      );

      if (columnIndex[key] !== -1) {
        extraFields[key] = value;
      } else {
        extraFields[key] = null;
        console.log(`Key '${key}' not found in newheader`);
      }
    }

    console.log("Final Mapped Extra Fields: ", extraFields);

    console.log(
      "Normalized newheader: ",
      newheader.map((item) => item.trim().toLowerCase())
    );
    console.log(
      "Normalized extraMapping values: ",
      Object.values(extraMapping).map((value) => value.trim().toLowerCase())
    );

    if (columnIndex.name === -1) {
      return next(new errorHandler("Name is Required"));
    }

    const cleanKey = (key) => key.replace(/\./g, "_"); // Only replace periods with underscores

    // Map each row to student data object
    const studentData = await Promise.all(
      dataRows.map(async (row) => {
        const student = {
          name: row[columnIndex.name],
          fatherName: row[columnIndex.fatherName],
          motherName: row[columnIndex.motherName],
          class: row[columnIndex.class],
          section: row[columnIndex.section],
          contact: row[columnIndex.contact],
          address: row[columnIndex.address],
          dob: row[columnIndex.dob],
          admissionNo: row[columnIndex.admissionNo],
          rollNo: row[columnIndex.rollNo],
          studentID: row[columnIndex.studentId],
          aadharNo: row[columnIndex.adharNo],
          routeNo: row[columnIndex.routeNo],
          photoName: row[columnIndex.photoName],
          houseName: row[columnIndex.houseName], // New field
          validUpTo: row[columnIndex.validUpTo], // New field
          course: row[columnIndex.course], // New field
          batch: row[columnIndex.batch], // New field
          idNo: row[columnIndex.idNo], // New field
          regNo: row[columnIndex.regNo], // New field
          extraField1: row[columnIndex.extraField1], // New field
          extraField2: row[columnIndex.extraField2], // New field
          school: schoolID,
          user: req.id,
          photoNameUnuiq: await getNextSequenceValue("studentName"),
          extraFields: new Map(), // Initialize extraFields as a Map
        };

        // Normalize the newheader for comparison
        const normalizedNewHeader = newheader.map((item) =>
          item.trim().toLowerCase()
        );

        for (const [extraKey, mappedValue] of Object.entries(extraFields)) {
          const normalizedMappedValue = mappedValue.trim().toLowerCase();
          const columnIndexForExtraField = normalizedNewHeader.indexOf(
            normalizedMappedValue
          );

          if (columnIndexForExtraField !== -1) {
            const sanitizedKey = cleanKey(extraKey);
            student.extraFields.set(
              sanitizedKey,
              row[columnIndexForExtraField]
            );
          } else {
            const sanitizedKey = cleanKey(extraKey);
            student.extraFields.set(sanitizedKey, "Field Not Found");
          }
        }

        return student;
      })
    );

    console.log("Final Student Data: ", studentData);

    try {
      // Fetch all existing students for the current school
      const existingStudents = await Student.find({ school: schoolID });

      // Normalize existing students for comparison
      const normalizedExistingStudents = existingStudents.map((student) => ({
        name: student.name?.trim().toLowerCase(),
        fatherName: student.fatherName?.trim().toLowerCase(),
        motherName: student.motherName?.trim().toLowerCase(),
        class: student.class?.trim().toLowerCase(),
        section: student.section?.trim().toLowerCase(),
        contact: student.contact?.trim().toLowerCase(),
        dob: student.dob?.trim().toLowerCase(),
        admissionNo: student.admissionNo?.trim().toLowerCase(),
        rollNo: student.rollNo?.trim().toLowerCase(),
        aadharNo: student.aadharNo?.trim().toLowerCase(),
      }));

      const nonDuplicateStudents = [];
      const duplicateEntries = [];

      for (const student of studentData) {
        const isDuplicate = normalizedExistingStudents.some(
          (existingStudent) => {
            return (
              existingStudent.name === student.name?.trim().toLowerCase() &&
              existingStudent.fatherName ===
                student.fatherName?.trim().toLowerCase() &&
              existingStudent.motherName ===
                student.motherName?.trim().toLowerCase() &&
              existingStudent.class === student.class?.trim().toLowerCase() &&
              existingStudent.section ===
                student.section?.trim().toLowerCase() &&
              existingStudent.contact ===
                student.contact?.trim().toLowerCase() &&
              existingStudent.dob === student.dob?.trim().toLowerCase() &&
              existingStudent.admissionNo ===
                student.admissionNo?.trim().toLowerCase() &&
              existingStudent.rollNo === student.rollNo?.trim().toLowerCase() &&
              existingStudent.aadharNo ===
                student.aadharNo?.trim().toLowerCase()
            );
          }
        );

        if (isDuplicate) {
          duplicateEntries.push(student);
        } else {
          nonDuplicateStudents.push(student);
        }
      }

      if (nonDuplicateStudents.length > 0) {
        const insertedStudents = await Student.insertMany(nonDuplicateStudents);
        res.status(200).json({
          success: true,
          message: `${insertedStudents.length} students inserted successfully.`,
          duplicates: duplicateEntries,
        });
      } else {
        res.status(200).json({
          success: true,
          message: "No new students were inserted. All entries are duplicates.",
          duplicates: duplicateEntries,
        });
      }
    } catch (err) {
      console.log(err);
      return next(err); // Handle any database errors
    }

    // try {
    //   // Insert the student data into the database
    //   const insertedStudents = await Student.insertMany(studentData);
    //   res.status(200).json({
    //     success: true,
    //     message: `${insertedStudents.length} students inserted successfully.`,
    //     data: insertedStudents,
    //   });
    // } catch (err) {
    //   console.log(err)
    //   return next(err); // Handle any database errors
    // }
  }
);

app.post(
  "/upload-excel/staff/:id",
  upload,
 
  async (req, res) => {
    const file = req.files[0];

    const mappings = JSON.parse(req.body.data); // Mapping data sent from frontend
    const extraMapping = JSON.parse(req.body.extra); // Mapping data for extra fields sent from frontend

    console.log(mappings)

    
    const cleanMapping = (data) => {
      const cleanedData = {};
      for (let key in data) {
        const cleanedKey = key.replace(/[\s.'-]+/g, ""); // Remove spaces and special characters
        cleanedData[cleanedKey] = data[key];
      }
      return cleanedData;
    };

    // Clean the received mapping data
    const cleanedMappings = cleanMapping(mappings);
    console.log("Extra Mapping Data: ", extraMapping);

    if (!file) {
      return res.status(400).send("No file uploaded.");
    }
    const files = req.files[0].path;

    const schoolID = req.params.id;
    const school = await School.findById(schoolID);

    const rows = await readXlsxFile(req.files[0].buffer);

    if (rows.length < 2) {
      return res.status(400).send("Excel file does not contain data.");
    }

    const [headers, ...dataRows] = rows;
    console.log(rows);
    const newheader = headers.map((header) => {
      // Convert to uppercase only if header is not null
      if (header !== null) {
        return header;
      } else {
        return header; // Return null as is
      }
    });
    console.log("newheader", newheader);

    const columnIndex = {
      name: newheader.indexOf(cleanedMappings.Name || ""),
      fatherName: newheader.indexOf(cleanedMappings.FathersName || ""),
      husbandName: newheader.indexOf(cleanedMappings.HusbandsName || ""),
      qualification: newheader.indexOf(cleanedMappings.Qualification || ""),
      doj: newheader.indexOf(cleanedMappings.DateofJoining || ""),
      contact: newheader.indexOf(cleanedMappings.ContactNo || ""),
      address: newheader.indexOf(cleanedMappings.Address || ""),
      dob: newheader.indexOf(cleanedMappings.DateofBirth || ""),
      staffID: newheader.indexOf(cleanedMappings.StaffID || ""),
      schoolName: newheader.indexOf(cleanedMappings.OfficeName || ""),
      dispatchNo: newheader.indexOf(cleanedMappings.DispatchNo || ""),
      ihrmsNo: newheader.indexOf(cleanedMappings.IHRMSNo || ""),
      designation: newheader.indexOf(cleanedMappings.Designation || ""),
      uid: newheader.indexOf(cleanedMappings.UIDNo || ""),
      email: newheader.indexOf(cleanedMappings.Email || ""),
      udiseCode: newheader.indexOf(cleanedMappings.UDISECode || ""),
      bloodGroup: newheader.indexOf(cleanedMappings.BloodGroup || ""),
      beltNo: newheader.indexOf(cleanedMappings.BeltNo || ""),
      dateOfissue: newheader.indexOf(cleanedMappings.DateofIssue || ""),
      photoName: newheader.indexOf(cleanedMappings.PhotoNo || ""),
      signatureName: newheader.indexOf(cleanedMappings.SignatureName || ""),
      adharNo: newheader.indexOf(cleanedMappings.AdharnNo || ""),
      licenceNo: newheader.indexOf(cleanedMappings.LicenceNo || ""),
      idNo: newheader.indexOf(cleanedMappings.IDNo || ""),
      staffType: newheader.indexOf(cleanedMappings.StaffType || ""),
      jobStatus: newheader.indexOf(cleanedMappings.JobStatus || ""),
      panCardNo: newheader.indexOf(cleanedMappings.PANCardNo || ""),
      extraField1: newheader.indexOf(cleanedMappings.ExtraField1 || ""),
      extraField2: newheader.indexOf(cleanedMappings.ExtraField2 || ""),
    };

    const extraFields = {}; // Initialize extraFields object to hold the extra fields
    for (const [key, value] of Object.entries(extraMapping)) {
      const normalizedValue = value.trim().toLowerCase();

      columnIndex[key] = newheader.findIndex(
        (item) => item.trim().toLowerCase() === normalizedValue
      );

      if (columnIndex[key] !== -1) {
        extraFields[key] = value;
      } else {
        extraFields[key] = null;
        console.log(`Key '${key}' not found in newheader`);
      }
    }

    console.log("Final Mapped Extra Fields: ", extraFields);

    console.log(
      "Normalized newheader: ",
      newheader.map((item) => item.trim().toLowerCase())
    );
    console.log(
      "Normalized extraMapping values: ",
      Object.values(extraMapping).map((value) => value.trim().toLowerCase())
    );

    if (!columnIndex.name == -1) {
      return next(new errorHandler("Name is Required"));
    }

    if (columnIndex.dob === -1) {
      columnIndex.dob = newheader.indexOf("DOB");
    }
    if (columnIndex.contact === -1) {
      columnIndex.contact = newheader.indexOf("CONTACT NO");
    }

    // Map each row to student data object
    const cleanKey = (key) => key.replace(/\./g, "_"); // Only replace periods with underscores

    const staffData = await Promise.all(
      dataRows.map(async (row) => {
        const staff = {
          name: row[columnIndex.name],
          fatherName: row[columnIndex.fatherName],
          husbandName: row[columnIndex.husbandName],
          qualification: row[columnIndex.qualification],
          doj: row[columnIndex.doj],
          contact: row[columnIndex.contact],
          email: row[columnIndex.email],
          address: row[columnIndex.address],
          dob: row[columnIndex.dob],
          staffID: row[columnIndex.staffID],
          schoolName: row[columnIndex.schoolName],
          dispatchNo: row[columnIndex.dispatchNo],
          ihrmsNo: row[columnIndex.ihrmsNo],
          designation: row[columnIndex.designation],
          uid: row[columnIndex.uid],
          udiseCode: row[columnIndex.udiseCode],
          bloodGroup: row[columnIndex.bloodGroup],
          dateOfissue: row[columnIndex.dateOfissue],
          photoName: row[columnIndex.photoName], 
          signatureName: row[columnIndex.signatureName], 
          school: schoolID,
          user: req.id,

          staffType: row[columnIndex.staffType],
          adharNo: row[columnIndex.adharNo],
          beltNo: row[columnIndex.beltNo],
          licenceNo: row[columnIndex.licenceNo],
          idNo: row[columnIndex.idNo],
          jobStatus: row[columnIndex.jobStatus],
          panCardNo: row[columnIndex.panCardNo],
          extraField1: row[columnIndex.extraField1],
          extraField2: row[columnIndex.extraField2],
          photoNameUnuiq: await getNextSequenceValue("staffName"),
          signatureNameUnuiq: await getNextSequenceValue("staffSignature"),
          extraFieldsStaff: new Map(),
        };

        // Normalize the newheader for comparison
        const normalizedNewHeader = newheader.map((item) =>
          item.trim().toLowerCase()
        );

        // Iterate over extraFields
        // for (const [extraKey, mappedValue] of Object.entries(extraFields)) {
        //   // Normalize the mapped value
        //   const normalizedMappedValue = mappedValue.trim().toLowerCase();

        //   // Find the column index in the normalized newheader
        //   const columnIndexForExtraField = normalizedNewHeader.indexOf(
        //     normalizedMappedValue
        //   );

        //   console.log(
        //     `Checking column for ${extraKey}: columnIndex = ${columnIndexForExtraField}`
        //   );

        //   if (columnIndexForExtraField !== -1) {
        //     // If found, set the value in student.extraFields
        //     staff.extraFieldsStaff.set(extraKey, row[columnIndexForExtraField]);
        //   } else {
        //     // If not found, set a placeholder value
        //     console.log(
        //       `Column for ${extraKey} not found, setting default value`
        //     );
        //     staff.extraFieldsStaff.set(extraKey, "Field Not Found"); // Placeholder for missing fields
        //   }
        // }

        for (const [extraKey, mappedValue] of Object.entries(extraFields)) {
          // Normalize the mapped value
          const normalizedMappedValue = mappedValue.trim().toLowerCase();

          // Find the column index in the normalized newheader
          const columnIndexForExtraField = normalizedNewHeader.indexOf(
            normalizedMappedValue
          );

          console.log(
            `Checking column for ${extraKey}: columnIndex = ${columnIndexForExtraField}`
          );

          // Apply cleanKey to sanitize the extraKey (replace periods with underscores)
          const sanitizedKey = cleanKey(extraKey);

          if (columnIndexForExtraField !== -1) {
            // If found, set the value in staff.extraFieldsStaff
            staff.extraFieldsStaff.set(
              sanitizedKey,
              row[columnIndexForExtraField]
            );
          } else {
            // If not found, set a placeholder value
            console.log(
              `Column for ${extraKey} not found, setting default value`
            );
            staff.extraFieldsStaff.set(sanitizedKey, "Field Not Found"); // Placeholder for missing fields
          }
        }

        return staff;
      })
    );

    const existingStaff = await Staff.find({ school: schoolID });

    const normalizedExistingStaff = existingStaff.map((staff) => ({
      name: staff.name?.trim().toLowerCase(),
      role: staff.role?.trim().toLowerCase(),
      contact: staff.contact?.trim().toLowerCase(),
      email: staff.email?.trim().toLowerCase(),
    }));

    const nonDuplicateStaff = [];
    const duplicateEntries = [];

    for (const staff of staffData) {
      const isDuplicate = normalizedExistingStaff.some((existing) => {
        return (
          existing.name === staff.name?.toLowerCase() &&
          existing.role === staff.role?.toLowerCase() &&
          existing.contact === staff.contact?.toLowerCase() &&
          existing.email === staff.email?.toLowerCase()
        );
      });

      if (isDuplicate) {
        duplicateEntries.push(staff);
      } else {
        nonDuplicateStaff.push(staff);
      }
    }

    console.log(staffData);
    try {
      if (nonDuplicateStaff.length > 0) {
        const insertedStaff = await Staff.insertMany(nonDuplicateStaff);
        res.status(200).json({
          success: true,
          message: `${insertedStaff.length} staff members inserted successfully.`,
          duplicates: duplicateEntries,
        });
      } else {
        res.status(200).json({
          success: true,
          message:
            "No new staff members were inserted. All entries are duplicates.",
          duplicates: duplicateEntries,
        });
      }
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .send("An error occurred while processing the staff data.");
    }
  }
);

// const adminroute = require("./routes/adminRoutes.js")

// User Routes
app.use("/user", require("./routes/userRoutes.js"));

// Admin Routes
app.use("/admin", require("./routes/adminRoutes.js"));
app.use("/image", require("./routes/imageRoute.js"));

//error handling

const { generatedErrors } = require("./middlewares/error");
const getNextSequenceValue = require("./controllers/counter.js");

app.get("*", (req, res, next) => {
  next(new errorHandler(`request url not found ${req.url}`));
});
app.use(generatedErrors);

app.listen(process.env.PORT, () => {
  console.log(`server is runing on port ${process.env.PORT}`);
});
