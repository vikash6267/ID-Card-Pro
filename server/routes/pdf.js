const express = require("express");
const mongoose = require("mongoose");
const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");
const Student = require("../models/studentModel"); // Import your student model
const ejs = require("ejs");
const nodemailer = require("nodemailer");

const router = express.Router();
const fetch = require("node-fetch");
const sharp = require("sharp");

// Ensure output directory exists
const outputDir = path.join(__dirname, "output");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function sendEmail(pdfBuffer, recipientEmail, filename) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_EMAIL_ADDRESS, // Set in .env
      pass: process.env.MAIL_PASSWORD, // Set in .env
    },
  });

  const mailOptions = {
    from: process.env.MAIL_USER,
    to: recipientEmail,
    subject: "ID Card Pro",
    text: "Here You Records",
    attachments: [
      {
        filename: filename,
        content: pdfBuffer,
      },
    ],
  };

  await transporter.sendMail(mailOptions);
}

router.get("/generate-pdf/:schoolId/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const { schoolId } = req.params;
    const status = req.query.status; // Status from query parameters
    const studentClass = req.query.class; // Search term from query parameters
    const section = req.query.section; // Search term from query parameters
    const course = req.query.course; // Search term from query parameters

    let queryObj = { school: schoolId };

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


    // Fetch students by school ID
    const students = await Student.find(queryObj);

    if (!students.length) {
      return res.status(404).send("No students found for the given school ID.");
    }

// Optimize student images (already done in your code)
const optimizedStudents = await Promise.all(
  students.map(async (student) => {
    let avatarUrl =
      student.avatar?.url || "https://cardpro.co.in/login.jpg";

    avatarUrl =
      avatarUrl ===
      "https://plus.unsplash.com/premium_photo-1699534403319-978d740f9297?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ? "https://cardpro.co.in/login.jpg"
        : avatarUrl;

    try {
      const imageBuffer = await fetchImageAndOptimize(avatarUrl); // Preprocess image fetching and optimizing in a helper function
      const imageName = `optimized_${student._id}.jpg`;
      const imagePath = path.join(outputDir, imageName);
      fs.writeFileSync(imagePath, imageBuffer);

      return {
        ...student.toObject(),
        avatarUrl: `data:image/jpeg;base64,${imageBuffer.toString("base64")}`,
        localPath: imagePath,
        class :student.class,
        section :student.section,
        extraFields: student.extraFields ? Object.fromEntries(student.extraFields) : {}, // Convert Map to object
      };
    } catch (error) {
      console.error(
        `Error optimizing image for student ${student._id}:`,
        error
      );
      return { 
        ...student.toObject(), 
        avatarUrl, 
        extraFields: student.extraFields ? Object.fromEntries(student.extraFields) : {} 
      };
    }
  })
);


// Group students by class
const groupedByClass = optimizedStudents.reduce((acc, student) => {
  const className = student.class || "No Class Assigned"; // Default for students without a class
  if (!acc[className]) {
    acc[className] = [];
  }
  acc[className].push(student);
  return acc;
}, {});




   
    const pages = [];
for (let i = 0; i < optimizedStudents.length; i += 10) {
  pages.push(optimizedStudents.slice(i, i + 10));
}
  
   

 // Render EJS to HTML with grouped data
const html = await ejs.renderFile(
  path.join(__dirname, "../template/student.ejs"),
  { groupedByClass  } // Pass grouped data to the template
);

    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0",timeout: 60000 });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });
    await browser.close();

    // await sendEmail(pdfBuffer, "vikasmaheshwari6267@gmail.com", "Vikash.pdf");
    // await sendEmail(pdfBuffer, email, "ID-Card.pdf");

    // Save PDF temporarily
    const pdfPath = path.join(outputDir, `ID_Cards.pdf`);
    fs.writeFileSync(pdfPath, pdfBuffer);

    // Send PDF as download and clean up
    res.download(pdfPath, (err) => {
      if (err) {
        console.error("Error sending file:", err);
      }

      // Clean up: delete the PDF
      fs.unlink(pdfPath, (err) => {
        if (err) {
          console.error("Error deleting PDF:", err);
        }
      });

      // Clean up: delete the optimized images
      optimizedStudents.forEach((student) => {
        if (student.localPath) {
          fs.unlink(student.localPath, (err) => {
            if (err) {
              console.error(
                `Error deleting image for student ${student._id}:`,
                err
              );
            }
          });
        }
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// Helper function for image fetching and optimization
async function fetchImageAndOptimize(url) {
  if(url === "https://cardpro.co.in/login.jpg"){

  return url;
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const imageBuffer = Buffer.from(arrayBuffer);

  // Optimize image with sharp
  const optimizedImage = await sharp(imageBuffer)
    .resize(200, 200) // Resize to 200x200 pixels
    .jpeg({ quality: 80 }) // Compress to 80% quality
    .toBuffer();

  return optimizedImage;
}

module.exports = router;
