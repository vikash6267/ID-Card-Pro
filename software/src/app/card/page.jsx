"use client";

import { useState } from "react";
import CardEditor from "./components/card-editor";
import CardGenerator from "./components/card-generator";
import { Button } from "./components/ui/button";

export default function Page() {
  const [template, setTemplate] = useState(null);
  const [excelData, setExcelData] = useState(null);
  const [photos, setPhotos] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [applyMask, setApplyMask] = useState(false);
  const [maskSrc, setMaskSrc] = useState(null);

  const handleGenerate = () => {
    if (template && excelData) {
      setIsGenerating(true);
    }
  };
  return (
    <div className="min-h-screen w-full bg-gray-100 text-gray-900 flex flex-col">
      {/* Dark Header */}
      <header className="w-full px-5 py-2 bg-gray-900 border-b border-gray-800 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="p-1.5 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-md">
            <img
              src="/logo.png"
              alt="CardPro Studio Logo"
              className="w-10 h-10 object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-300">
            CardPro Studio
          </h1>
        
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
                onPhotosChange={setPhotos}
                applyMask={applyMask}
                maskSrc={maskSrc}
                onMaskChange={setMaskSrc}
                onToggleMask={() => setApplyMask((prev) => !prev)}
              />

              <div className="text-center mt-8">
                <Button
                  onClick={handleGenerate}
                  className="px-6 py-3 text-lg"
                  disabled={!template || !excelData}
                >
                  Generate Cards
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="mb-6 text-center">
                <Button
                  onClick={() => setIsGenerating(false)}
                  variant="outline"
                  className="px-6 py-2"
                >
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

      {/* Dark Footer */}
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
  );
}