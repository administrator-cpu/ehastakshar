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

const DraggableSignatureBox = ({
  initialPctX,
  initialPctY,
  signatureImage,
  onUpdate,
  onRemove
}: {
  initialPctX: number,
  initialPctY: number,
  signatureImage: string,
  onUpdate: (pctX: number, pctY: number) => void,
  onRemove: () => void
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
      className="bg-white/90 border-2 border-dashed border-teal-500 shadow-xl p-2 z-50 group hover:border-solid transition-all select-none cursor-grab active:cursor-grabbing"
    >
      <button
        onClick={onRemove}
        className="delete-btn absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600 z-10"
      >
        <Trash2 size={14} />
      </button>
      <div className="text-[10px] font-bold text-teal-700 mb-1 border-b border-teal-200 pb-1 text-center select-none pointer-events-none">Your Signature</div>
      <img src={signatureImage} alt="Signature" className="w-full h-auto pointer-events-none select-none" draggable={false} />
    </div>
  );
};

export default function PDFViewer({ file, numPages, onDocumentLoadSuccess, signatureImage, signaturePositions, onSignaturePositionsChange }: PDFViewerProps) {
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

              {/* Signature Overlay */}
              {signatureImage && pos && onSignaturePositionsChange && (
                <DraggableSignatureBox
                  initialPctX={pos.pctX}
                  initialPctY={pos.pctY}
                  signatureImage={signatureImage}
                  onUpdate={(pctX, pctY) => {
                    if (signaturePositions) {
                      const newPositions = signaturePositions.map(p =>
                        p.pageNumber === pageNumber ? { ...p, pctX, pctY } : p
                      );
                      onSignaturePositionsChange(newPositions);
                    }
                  }}
                  onRemove={() => {
                    if (signaturePositions) {
                      const newPositions = signaturePositions.filter(p => p.pageNumber !== pageNumber);
                      onSignaturePositionsChange(newPositions);
                    }
                  }}
                />
              )}
            </div>
          );
        })}
      </Document>
    </div>
  );
}
