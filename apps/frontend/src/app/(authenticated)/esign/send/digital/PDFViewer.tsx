"use client";

import React from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { Trash2 } from 'lucide-react';

// Set up the PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export interface SignaturePosition {
  pageNumber: number;
  pctX: number;
  pctY: number;
}

interface PDFViewerProps {
  file: File | null;
  numPages: number;
  onDocumentLoadSuccess: (data: { numPages: number }) => void;
  signatureImage?: string | null;
  signaturePositions?: SignaturePosition[];
  onSignaturePositionsChange?: (positions: SignaturePosition[]) => void;
  watermarkText?: string;
  isDraggable?: boolean;
  activeSignerName?: string;
  onAddSignatureBox?: (pageNumber: number) => void;
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

const SignatureBox = ({
  initialPctX,
  initialPctY,
  signatureImage,
  activeSignerName,
  isDraggable = true,
  onUpdate,
  onRemove
}: {
  initialPctX: number,
  initialPctY: number,
  signatureImage?: string | null,
  activeSignerName?: string,
  isDraggable?: boolean,
  onUpdate?: (pctX: number, pctY: number) => void,
  onRemove?: () => void
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const posRef = React.useRef({ pctX: initialPctX, pctY: initialPctY });

  React.useEffect(() => {
    // Keep internal ref in sync if parent changes positions
    posRef.current = { pctX: initialPctX, pctY: initialPctY };
    if (containerRef.current) {
      containerRef.current.style.left = `${initialPctX * 100}%`;
      containerRef.current.style.top = `${initialPctY * 100}%`;
    }
  }, [initialPctX, initialPctY]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isDraggable || !onUpdate) return;
    if ((e.target as HTMLElement).closest('.delete-btn')) return;

    // Prevent default text selection behavior
    e.preventDefault();

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!containerRef.current?.parentElement) return;
      const parentRect = containerRef.current.parentElement.getBoundingClientRect();

      let newX = moveEvent.clientX - parentRect.left - (containerRef.current.offsetWidth / 2);
      let newY = moveEvent.clientY - parentRect.top - (containerRef.current.offsetHeight / 2);

      newX = Math.max(0, Math.min(newX, parentRect.width - containerRef.current.offsetWidth));
      newY = Math.max(0, Math.min(newY, parentRect.height - containerRef.current.offsetHeight));

      const newPctX = newX / parentRect.width;
      const newPctY = newY / parentRect.height;

      // Update DOM directly for smooth 60fps dragging without React re-renders
      posRef.current = { pctX: newPctX, pctY: newPctY };
      containerRef.current.style.left = `${newPctX * 100}%`;
      containerRef.current.style.top = `${newPctY * 100}%`;
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);

      // Commit the final position to parent state once dragging ends
      onUpdate(posRef.current.pctX, posRef.current.pctY);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      style={{
        position: 'absolute',
        left: `${initialPctX * 100}%`,
        top: `${initialPctY * 100}%`,
        width: 140,
        touchAction: 'none'
      }}
      className={`border-2 p-2 z-50 group transition-all select-none ${isDraggable ? 'border-dashed border-teal-500 hover:border-solid cursor-grab active:cursor-grabbing' : 'border-transparent cursor-default'}`}
    >
      {isDraggable && onRemove && (
        <button
          onClick={onRemove}
          className="delete-btn absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600 z-10 cursor-pointer"
        >
          <Trash2 size={14} />
        </button>
      )}
      
      {signatureImage ? (
        <img src={signatureImage} alt="Signature" className="w-full h-auto pointer-events-none select-none" draggable={false} />
      ) : (
        <div className="w-full h-14 bg-teal-50 border-2 border-teal-200 text-teal-800 flex items-center justify-center flex-col rounded-md shadow-sm pointer-events-none text-center p-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600">Sign Here</span>
          <span className="text-xs font-medium truncate w-full">{activeSignerName || 'Signer'}</span>
        </div>
      )}
    </div>
  );
};

export default function PDFViewer({ 
  file, 
  numPages, 
  onDocumentLoadSuccess, 
  signatureImage, 
  signaturePositions, 
  onSignaturePositionsChange, 
  watermarkText,
  isDraggable = true,
  activeSignerName,
  onAddSignatureBox
}: PDFViewerProps) {
  if (!file) return null;

  return (
    <div className="pdf-container w-full max-w-3xl flex flex-col items-center">
      <Document
        file={file}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={<PdfSkeleton />}
        className="flex flex-col items-center w-full"
      >
        {Array.from(new Array(numPages), (el, index) => {
          const pageNumber = index + 1;
          const pos = signaturePositions?.find(p => p.pageNumber === pageNumber);
          
          const showAddButton = isDraggable && activeSignerName && !pos && onAddSignatureBox;

          return (
            <div key={`page_${pageNumber}`} className="mb-10 shadow-2xl ring-1 ring-slate-900/5 overflow-hidden bg-white w-max mx-auto transition-all min-h-[848px] min-w-[600px] flex items-center justify-center relative">
              <Page
                pageNumber={pageNumber}
                renderTextLayer={true}
                renderAnnotationLayer={false}
                width={600}
                className="max-w-full relative pointer-events-none select-none"
                loading={<PdfSkeleton />}
              />
              
              {/* Add Signature Box Button (Placement Mode) */}
              {showAddButton && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity z-20 bg-slate-900/5">
                  <button 
                    onClick={() => onAddSignatureBox(pageNumber)}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium shadow-lg flex items-center transform transition-transform hover:scale-105"
                  >
                    + Add Signature for {activeSignerName} here
                  </button>
                </div>
              )}

              {/* Signature Overlay */}
              {pos && (
                <SignatureBox
                  initialPctX={pos.pctX}
                  initialPctY={pos.pctY}
                  signatureImage={signatureImage}
                  activeSignerName={activeSignerName}
                  isDraggable={isDraggable}
                  onUpdate={(pctX, pctY) => {
                    if (signaturePositions && onSignaturePositionsChange) {
                      const newPositions = signaturePositions.map(p =>
                        p.pageNumber === pageNumber ? { ...p, pctX, pctY } : p
                      );
                      onSignaturePositionsChange(newPositions);
                    }
                  }}
                  onRemove={() => {
                    if (signaturePositions && onSignaturePositionsChange) {
                      const newPositions = signaturePositions.filter(p => p.pageNumber !== pageNumber);
                      onSignaturePositionsChange(newPositions);
                    }
                  }}
                />
              )}

              {/* Watermark Preview Overlay */}
              {watermarkText && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 overflow-hidden select-none">
                  <div 
                    className="text-slate-900/10 font-bold text-center break-words"
                    style={{
                      fontSize: '80px',
                      transform: 'rotate(-45deg)',
                      textTransform: 'uppercase',
                      maxWidth: '120%',
                      lineHeight: '1.1'
                    }}
                  >
                    {watermarkText}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </Document>
    </div>
  );
}
