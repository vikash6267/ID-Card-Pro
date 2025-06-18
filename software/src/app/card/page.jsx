"use client";

import { useEffect, useState } from "react";
import CardEditor from "./components/card-editor";
import CardGenerator from "./components/card-generator";
import { Button } from "./components/ui/button";
import axios from "../../../axiosconfig";

export default function Page() {
  const [template, setTemplate] = useState(null)
  const [excelData, setExcelData] = useState({ headers: [], rows: [] })
  const [photos, setPhotos] = useState({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [applyMask, setApplyMask] = useState(false)
  const [maskSrc, setMaskSrc] = useState(null)
  const [isDataLoaded, setIsDataLoaded] = useState(true)

  const schoolId = "6781fa21f03a8b8ff5bf7620"

  // Fetch Template from /user/schoolD
  useEffect(() => {
    const fetchSchoolData = async () => {
      try {
        const res = await axios.get("/user/schoolD")
        console.log("School Data:", res.data.cardTemplate)
        setTemplate(res.data.cardTemplate)
      } catch (error) {
        console.error("Error fetching school data:", error)
      }
    }

    fetchSchoolData()
  }, [])

useEffect(() => {
  const fetchStudents = async () => {
    try {
      const res = await axios.get("/user/students", {
        params: { schoolId },
      });

      const studentList = res.data;

      const formattedExcelData = studentList.map((student) => {
        const extraFields = student.extraFields || {};
        const extraFlattened = {};
        for (const [key, value] of Object.entries(extraFields)) {
          extraFlattened[key] = value;
        }

        return {
          Name: student.name || "",
          Class: student.class || "",
          Section: student.section || "",
          Course: student.course || "",
              ...extraFlattened,
        };
      });

      // 🔥 Convert to header-rows format
      const headers = Object.keys(formattedExcelData[0] || {});
      const rows = formattedExcelData.map((row) =>
        headers.map((header) => row[header] || "")
      );

   const now = new Date();
const formattedDate = now.toISOString().split("T")[0]; // 2025-06-18
const fileName = `StudentData_${formattedDate}.xlsx`;

const newExcelData = {
   headers,
  rows,
};

setExcelData(newExcelData);

      // 📸 Photo logic same
      const photosMap = {};
      studentList.forEach((student) => {
        const key = student.photoNameUnuiq;
        const url = student.avatar?.url;
        if (key && url) {
          photosMap[key] = url;
        }
      });

      setPhotos(photosMap);
    } catch (error) {
      console.error("❌ Error fetching student data:", error);
    }
  };

  fetchStudents();
}, []);

  // Save Template, Excel Data & Photos
  const handleSaveTemplate = async () => {
    try {
      const res = await axios.post("/users/save-template", {
        template,
        schoolId,
      })

      console.log("Template saved successfully:", res.data)
      alert("Template saved successfully!")
    } catch (error) {
      console.error("Error saving template:", error)
      alert("Failed to save template.")
    }
  }

  // Automatically save when template is ready (but not on every data change)
  useEffect(() => {
    if (template && isDataLoaded) {
      handleSaveTemplate()
    }
  }, [template, isDataLoaded])

  const handleGenerate = () => {
    if (template && excelData && Object.keys(photos).length > 0) {
      setIsGenerating(true)
    } else {
      alert("Please wait for data to load completely")
    }
  }

  // ✅ Add loading state
  if (!isDataLoaded) {
    return (
      <div className="min-h-screen w-full bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading student data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-gray-100 text-gray-900 flex flex-col">
      {/* Header */}
      <header className="w-full px-5 py-2 bg-gray-900 border-b border-gray-800 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="p-1.5 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-md">
            <img src="/logo.png" alt="CardPro Studio Logo" className="w-10 h-10 object-contain" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-300">
            CardPro Studio
          </h1>
        </div>

        {/* ✅ Add data status indicator */}
        <div className="flex items-center gap-4 text-white">
          <div className="text-sm">
            <span className="text-gray-300">Students:</span> {excelData.rows.length}
          </div>
          <div className="text-sm">
            <span className="text-gray-300">Photos:</span> {Object.keys(photos).length}
          </div>
        </div>
      </header>

      {/* Main Panel */}
      <main className="flex-grow flex justify-center items-center px-0 py-0">
        <div className="w-auto max-w-[1500px] bg-white text-black rounded-m shadow-1xl p-2 min-h-[10vh] overflow-auto">
          {!isGenerating ? (
            <>
              <CardEditor
                onTemplateChange={setTemplate}
                onExcelDataChange={setExcelData}
                excelData2={excelData} // ✅ Pass the loaded Excel data
                onPhotosChange={setPhotos}
                photos2={photos} // ✅ Pass the loaded photos
                applyMask={applyMask}
                maskSrc={maskSrc}
                onMaskChange={setMaskSrc}
                onToggleMask={() => setApplyMask((prev) => !prev)}
              />

              <div className="text-center mt-8">
                <Button
                  onClick={handleGenerate}
                  className="px-6 py-3 text-lg"
                  disabled={!template || !excelData.rows.length || !Object.keys(photos).length}
                >
                  Generate Cards ({excelData.rows.length} students)
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="mb-6 text-center">
                <Button onClick={() => setIsGenerating(false)} variant="outline" className="px-6 py-2">
                  ← Back to Editor
                </Button>
              </div>

              <CardGenerator
                template={template}
                excelData={excelData}
                photos={photos}
                applyMask={applyMask}
                maskSrc={maskSrc}
              />
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-sm text-gray-400 border-t border-gray-800 bg-gray-900">
        <div className="container mx-auto px-4">
          <p>
            © {new Date().getFullYear()} CardPro Studio. All rights reserved. |{" "}
            <a href="#" className="hover:text-blue-400 transition-colors">
              Terms of Service
            </a>{" "}
            |{" "}
            <a href="#" className="hover:text-blue-400 transition-colors">
              Privacy Policy
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
