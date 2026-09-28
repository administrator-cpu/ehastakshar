import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { fork } from 'child_process';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface VisualSignatureDetails {
  transactionId: string;
  recipientName: string;
  signatureUrl?: string;
  ipAddress?: string;
  positions?: { pageNumber: number; pctX: number; pctY: number }[];
}

export class DigitalSignatureService {
  /**
   * Adds the visual signature elements using pdf-lib and allocates a placeholder
   * for the PKCS#7 cryptographic signature using @signpdf/utils.
   */
  static async addSignaturePlaceholder(pdfBuffer: Buffer, details: VisualSignatureDetails): Promise<Buffer> {
    // 1. First, manipulate the PDF visually using pdf-lib
    // We ignore encryption to allow modifying PDFs that have owner passwords or prior signatures.
    const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
    let pages;
    try {
      pages = pdfDoc.getPages();
    } catch (err: any) {
      if (err.message && err.message.includes('PDFDict')) {
        throw new Error("The uploaded PDF has a corrupted or unsupported internal structure. Please open the PDF, select 'Print to PDF' or 'Save As', and try uploading the new flattened file.");
      }
      throw err;
    }
    if (pages.length === 0) throw new Error("No pages found in PDF");

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    const istFormatter = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false
    });
    const formattedDate = istFormatter.format(new Date());
    
    let embeddedSignatureImage: any = null;
    let signatureDims = { width: 0, height: 0 };
    
    const boxWidth = 140;
    const innerPadding = 1;
    const targetImgWidth = boxWidth - (innerPadding * 2);
    
    if (details.signatureUrl) {
      try {
        const imageRes = await fetch(details.signatureUrl);
        const imageArrayBuffer = await imageRes.arrayBuffer();
        const firstByte = new Uint8Array(imageArrayBuffer)[0];
        if (firstByte === 0x89) {
          embeddedSignatureImage = await pdfDoc.embedPng(imageArrayBuffer);
        } else {
          embeddedSignatureImage = await pdfDoc.embedJpg(imageArrayBuffer);
        }
        signatureDims = embeddedSignatureImage.scaleToFit(targetImgWidth, 20);
      } catch (err) {
        logger.error({ err }, "Failed to embed signature image in PDF for digital signing");
      }
    }
    
    const imgHeight = embeddedSignatureImage ? signatureDims.height : 0;
    const imgWidth = embeddedSignatureImage ? signatureDims.width : 0;
    
    // We calculate height based on the text lines we want to add
    const textLines = [
      `Date: ${formattedDate} IST`
    ];
    
    const textHeight = textLines.length * 12;
    const totalHeight = imgHeight + textHeight + (innerPadding * 3);
    
    const padding = 20;

    const drawSignatureOnPage = (page: any, x: number, y: number) => {
      // Draw image if exists
      if (embeddedSignatureImage) {
        page.drawImage(embeddedSignatureImage, {
          x: x + (boxWidth - imgWidth) / 2,
          y: y + textHeight + (innerPadding * 2),
          width: imgWidth,
          height: imgHeight,
        });
      }

      // Draw the text lines
      let currentTextY = y + textHeight + innerPadding - 12;
      textLines.forEach((line) => {
        page.drawText(line, {
          x: x + innerPadding,
          y: currentTextY,
          size: 8,
          font: font,
          color: rgb(0, 0, 0),
        });
        currentTextY -= 12;
      });
    };
    
    if (details.positions && details.positions.length > 0) {
      details.positions.forEach(pos => {
        if (pos.pageNumber >= 1 && pos.pageNumber <= pages.length) {
          const page = pages[pos.pageNumber - 1];
          if (!page) return;
          const { width, height } = page.getSize();
          
          const boxX = pos.pctX * width;
          // Calculate Y starting from bottom-left origin: 
          // pctY is distance from top. (1 - pctY) is distance from bottom.
          // boxY should be the bottom edge of the box.
          const boxY = height - (pos.pctY * height) - totalHeight;
          
          drawSignatureOnPage(page, boxX, boxY);
        }
      });
    } else if (!details.positions) {
      // Fallback: draw on bottom-right of every page if positions is undefined
      pages.forEach(page => {
        const { width } = page.getSize();
        const boxX = width - boxWidth - padding;
        const boxY = padding; // Bottom right corner
        drawSignatureOnPage(page, boxX, boxY);
      });
    }
    // If details.positions is [], we intentionally draw NO visual signature.

    // Save the PDF visually
    const visuallyModifiedPdfBytes = await pdfDoc.save({ useObjectStreams: false });
    const initialBuffer = Buffer.from(visuallyModifiedPdfBytes);
    
    return initialBuffer;
  }

  /**
   * Spawns a worker thread to safely add the PKCS#7 placeholder and seal the document.
   * This prevents malformed PDFs from causing infinite loops in the main event loop.
   */
  static async sealDocument(pdfBuffer: Buffer, details: VisualSignatureDetails): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const p12Path = path.join(__dirname, '../assets/dev-cert.p12');
        
        if (!fs.existsSync(p12Path)) {
          throw new Error('Development certificate (dev-cert.p12) not found in assets folder.');
        }
        
        const p12Buffer = fs.readFileSync(p12Path);
        
        // Spawn child process to handle the risky @signpdf parsing safely
        const workerPath = path.join(__dirname, __filename.endsWith('.ts') ? 'pdfWorker.ts' : 'pdfWorker.js');
        
        let child: any;
        if (workerPath.endsWith('.ts')) {
          // If running via tsx or ts-node during dev, pass execArgv
          const execArgv = process.execArgv.includes('--loader') || process.execArgv.some(a => a.includes('tsx')) ? process.execArgv : [];
          child = fork(workerPath, [], { execArgv });
        } else {
          child = fork(workerPath);
        }

        // Send the data via IPC
        child.send({
          pdfBuffer: Array.from(pdfBuffer),
          details,
          p12Buffer: Array.from(p12Buffer),
          passphrase: 'password'
        });

        const timeout = setTimeout(() => {
          child.kill('SIGKILL'); // Hard kill the child process if it hangs
          reject(new Error("PDF signing timed out. The uploaded PDF may be malformed or corrupted. Please flatten the PDF or print to PDF and try again."));
        }, 15000); // 15 seconds timeout

        child.on('message', (message: any) => {
          clearTimeout(timeout);
          if (message.success) {
            resolve(Buffer.from(message.signedPdf));
          } else {
            reject(new Error(message.error || "Unknown worker error"));
          }
        });

        child.on('error', (error: any) => {
          clearTimeout(timeout);
          reject(error);
        });

        child.on('exit', (code: number, signal: string) => {
          clearTimeout(timeout);
          if (code !== 0 && signal !== 'SIGKILL') {
            reject(new Error(`Worker stopped with exit code ${code} and signal ${signal}`));
          }
        });
      } catch (error) {
        logger.error({ err: error }, 'Cryptographic PDF sealing failed before worker');
        reject(error);
      }
    });
  }
}
