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

const PdfSkeleton = () => (
  <div className="w-full max-w-[600px] h-[848px] bg-white shadow-xl mx-auto flex flex-col border border-slate-200 animate-in fade-in duration-500 p-8">
    <div className="animate-pulse space-y-6 mt-8 w-full">
      <div className="h-5 bg-slate-100 rounded-md w-3/4 mb-3"></div>
      <div className="h-3 bg-slate-100 rounded-md w-full mb-3"></div>
      <div className="h-3 bg-slate-100 rounded-md w-full mb-3"></div>
      <div className="h-3 bg-slate-100 rounded-md w-5/6 mb-3"></div>
      <div className="h-3 bg-slate-100 rounded-md w-full mb-3 mt-10"></div>
      <div className="h-3 bg-slate-100 rounded-md w-2/3 mb-3"></div>
      <div className="h-24 bg-slate-100 rounded-md w-full mt-16"></div>
    </div>
  </div>
);

export default function PDFViewer({ file, numPages, onDocumentLoadSuccess }: PDFViewerProps) {
  if (!file) return null;

  return (
    <div className="pdf-container w-full max-w-3xl flex flex-col items-center">
      <Document
        file={file}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={<PdfSkeleton />}
        className="flex flex-col items-center w-full"
      >
        {Array.from(new Array(numPages), (el, index) => (
          <div key={`page_${index + 1}`} className="mb-10 shadow-2xl ring-1 ring-slate-900/5 overflow-hidden bg-white w-max mx-auto transition-all min-h-[848px] min-w-[600px] flex items-center justify-center">
            <Page
              pageNumber={index + 1}
              renderTextLayer={true}
              renderAnnotationLayer={false}
              width={600}
              className="max-w-full"
              loading={<PdfSkeleton />}
            />
          </div>
        ))}
      </Document>
    </div>
  );
}
