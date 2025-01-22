const express = require("express");
const mongoose = require("mongoose");
const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");
const Student = require("../models/studentModel"); // Import your student model
const ejs = require("ejs");

const router = express.Router();
const fetch = require("node-fetch");
const sharp = require("sharp");

// Ensure output directory exists
const outputDir = path.join(__dirname, "output");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}


router.get("/generate-pdf/:schoolId", async (req, res) => {
  try {
    const { schoolId } = req.params;

    // Fetch students by school ID
    const students = await Student.find({ school: schoolId });

    if (!students.length) {
      return res.status(404).send("No students found for the given school ID.");
    }

    // Optimizing images asynchronously
    const optimizedStudents = await Promise.all(
      students.map(async (student) => {
        const avatarUrl =
          student.avatar?.url ||
          "https://plus.unsplash.com/premium_photo-1699534403319-978d740f9297?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

        try {
          const imageBuffer = await fetchImageAndOptimize(avatarUrl); // Preprocess image fetching and optimizing in a helper function
          const imageName = `optimized_${student._id}.jpg`;
          const imagePath = path.join(outputDir, imageName);
          fs.writeFileSync(imagePath, imageBuffer);

          return {
            ...student.toObject(),
            avatarUrl: `data:image/jpeg;base64,${imageBuffer.toString("base64")}`,
            localPath: imagePath,
          };
        } catch (error) {
          console.error(`Error optimizing image for student ${student._id}:`, error);
          return { ...student.toObject(), avatarUrl };
        }
      })
    );

    // Split data into pages (10 students per page)
    const pages = [];
    for (let i = 0; i < optimizedStudents.length; i += 10) {
      pages.push(optimizedStudents.slice(i, i + 10));
    }

    // Render EJS to HTML
    const html = await ejs.renderFile(
      path.join(__dirname, "../template/student.ejs"),
      { pages }
    );

    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });
    await browser.close();

    // Save PDF temporarily
    const pdfPath = path.join(outputDir, `ID_Cards_${schoolId}.pdf`);
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
              console.error(`Error deleting image for student ${student._id}:`, err);
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
