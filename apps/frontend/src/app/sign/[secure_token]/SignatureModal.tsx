"use client";

import React, { useState, useRef, useCallback } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Type, PenTool, Upload, AlertCircle } from 'lucide-react';

interface SignatureModalProps {
  onCancel: () => void;
  onConfirm: (signatureText: string, signatureBlob: Blob) => void;
  isSigning: boolean;
  initialName?: string;
}

const FONTS = [
  { name: 'Dancing Script', family: "'Dancing Script', cursive" },
  { name: 'Pacifico', family: "'Pacifico', cursive" },
  { name: 'Caveat', family: "'Caveat', cursive" },
  { name: 'Great Vibes', family: "'Great Vibes', cursive" },
];

export default function SignatureModal({ onCancel, onConfirm, isSigning, initialName = "" }: SignatureModalProps) {
  const [mode, setMode] = useState<"type" | "draw" | "upload">("type");
  const [typedName, setTypedName] = useState(initialName);
  const [selectedFont, setSelectedFont] = useState(FONTS[0]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  
  const sigCanvas = useRef<SignatureCanvas>(null);

  const clearCanvas = () => {
    sigCanvas.current?.clear();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setUploadedPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const generateTypedSignature = async (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      canvas.width = 600;
      canvas.height = 200;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("Canvas ctx not found");

      // Draw text
      ctx.fillStyle = "transparent";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#000000";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      // Load font trick by rendering it to DOM first (handled by style tag below)
      ctx.font = `60px ${selectedFont.family.split(',')[0]}`;
      ctx.fillText(typedName, canvas.width / 2, canvas.height / 2);

      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject("Failed to create blob");
      }, "image/png");
    });
  };

  const generateDrawnSignature = async (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
        return reject("Canvas is empty");
      }
      // Get cropped canvas
      const canvas = sigCanvas.current.getTrimmedCanvas();
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject("Failed to create blob");
      }, "image/png");
    });
  };

  const handleConfirm = async () => {
    try {
      if (mode === "type") {
        if (!typedName.trim()) return;
        const blob = await generateTypedSignature();
        onConfirm(typedName, blob);
      } else if (mode === "draw") {
        const blob = await generateDrawnSignature();
        onConfirm("Drawn Signature", blob);
      } else if (mode === "upload") {
        if (!uploadedFile) return;
        onConfirm("Uploaded Signature", uploadedFile);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const isNextDisabled = () => {
    if (isSigning) return true;
    if (mode === "type") return !typedName.trim();
    if (mode === "draw") return false;
    if (mode === "upload") return !uploadedFile;
    return true;
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 md:p-8 animate-in zoom-in-95 duration-300 relative overflow-hidden flex flex-col">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600&family=Dancing+Script:wght@600&family=Great+Vibes&family=Pacifico&display=swap');
      `}</style>
      
      <h3 className="text-2xl font-bold text-slate-900 mb-6 text-center">Select Mode of Signature</h3>

      {/* TABS */}
      <div className="flex border-b border-slate-200 mb-6">
        <button
          onClick={() => setMode("type")}
          className={`flex-1 py-3 font-semibold flex items-center justify-center space-x-2 transition-all ${mode === 'type' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Type size={18} /> <span>Type</span>
        </button>
        <button
          onClick={() => setMode("draw")}
          className={`flex-1 py-3 font-semibold flex items-center justify-center space-x-2 transition-all ${mode === 'draw' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <PenTool size={18} /> <span>Draw</span>
        </button>
        <button
          onClick={() => setMode("upload")}
          className={`flex-1 py-3 font-semibold flex items-center justify-center space-x-2 transition-all ${mode === 'upload' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Upload size={18} /> <span>Upload</span>
        </button>
      </div>

      {/* CONTENT */}
      <div className="flex-1 min-h-[300px]">
        {mode === "type" && (
          <div className="space-y-6">
            <input
              type="text"
              placeholder="Your Name"
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-slate-900 font-medium"
            />
            {typedName.trim() && (
              <div>
                <p className="text-sm font-semibold text-slate-500 mb-3">Choose Signature</p>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                  {FONTS.map(font => (
                    <div
                      key={font.name}
                      onClick={() => setSelectedFont(font)}
                      className={`p-4 rounded-xl cursor-pointer transition-all flex items-center justify-center bg-slate-50 border ${selectedFont.name === font.name ? 'border-teal-500 ring-1 ring-teal-500' : 'border-transparent hover:border-slate-200'}`}
                    >
                      <span style={{ fontFamily: font.family }} className="text-3xl text-slate-900">
                        {typedName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {mode === "draw" && (
          <div className="space-y-4 flex flex-col items-center">
            <div className="w-full bg-slate-50 border border-slate-200 rounded-xl overflow-hidden touch-none relative">
              <SignatureCanvas 
                ref={sigCanvas}
                penColor="black"
                canvasProps={{ className: "w-full h-48" }} 
              />
            </div>
            <button onClick={clearCanvas} className="text-sm font-semibold text-slate-500 hover:text-slate-700 px-4 py-2 border border-slate-200 rounded-lg">
              Clear Canvas
            </button>
          </div>
        )}

        {mode === "upload" && (
          <div className="flex flex-col items-center justify-center h-full min-h-[250px] border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 relative p-6">
            <input 
              type="file" 
              accept="image/png, image/jpeg" 
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {uploadedPreview ? (
              <img src={uploadedPreview} alt="Preview" className="max-h-40 object-contain rounded-lg" />
            ) : (
              <div className="text-center pointer-events-none">
                <div className="bg-teal-600 text-white font-bold py-2 px-6 rounded-xl inline-block mb-2">
                  Upload Signature
                </div>
                <p className="text-slate-500 text-sm">or Drop png, jpg here</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="mt-8">
        <div className="flex items-center justify-center space-x-2 text-slate-500 text-sm mb-6">
          <AlertCircle size={16} />
          <span>I understand this is true representation of my signature.</span>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            disabled={isSigning}
            className="flex-1 cursor-pointer py-3.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isNextDisabled()}
            className="flex-[2] cursor-pointer bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-bold transition-all shadow-sm"
          >
            {isSigning ? "Signing..." : "Insert"}
          </button>
        </div>
      </div>
    </div>
  );
}
