"use client";

import React from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up the PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface PDFViewerProps {
  file: File | null;
  numPages: number;
  onDocumentLoadSuccess: (data: { numPages: number }) => void;
}

export default function PDFViewer({ file, numPages, onDocumentLoadSuccess }: PDFViewerProps) {
  if (!file) return null;

  return (
    <div className="pdf-container w-full max-w-3xl flex flex-col items-center">
      <Document 
        file={file} 
        onLoadSuccess={onDocumentLoadSuccess}
        loading={<div className="p-8 text-slate-500 font-medium">Loading document...</div>}
        className="flex flex-col items-center w-full"
      >
        {Array.from(new Array(numPages), (el, index) => (
          <div key={`page_${index + 1}`} className="mb-6 shadow-md rounded-sm overflow-hidden bg-white w-full flex justify-center">
            <Page 
              pageNumber={index + 1} 
              renderTextLayer={true}
              renderAnnotationLayer={false}
              width={600}
              className="max-w-full"
            />
          </div>
        ))}
      </Document>
    </div>
  );
}
