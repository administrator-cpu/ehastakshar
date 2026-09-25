import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { SignPdf } from '@signpdf/signpdf';
import { P12Signer } from '@signpdf/signer-p12';
import { plainAddPlaceholder } from '@signpdf/placeholder-plain';
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
    const pages = pdfDoc.getPages();
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
    const innerPadding = 2;
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
        signatureDims = embeddedSignatureImage.scaleToFit(targetImgWidth, 100);
      } catch (err) {
        logger.error({ err }, "Failed to embed signature image in PDF for digital signing");
      }
    }
    
    const imgHeight = embeddedSignatureImage ? signatureDims.height : 0;
    const imgWidth = embeddedSignatureImage ? signatureDims.width : 0;
    
    // We calculate height based on the text lines we want to add
    const textLines = [
      `Digitally signed by: ${details.recipientName}`,
      `Date: ${formattedDate} IST`,
      `Txn ID: ${details.transactionId}`,
    ];
    
    const textHeight = textLines.length * 12;
    const totalHeight = imgHeight + textHeight + (innerPadding * 3);
    
    const padding = 20;
    
    pages.forEach(page => {
      const { width } = page.getSize();
      const boxX = width - boxWidth - padding;
      const boxY = padding; // Bottom right corner
      
      // Draw the visual border box
      page.drawRectangle({
        x: boxX,
        y: boxY,
        width: boxWidth,
        height: totalHeight,
        borderColor: rgb(0.2, 0.2, 0.2),
        borderWidth: 1,
        color: rgb(0.98, 0.98, 0.98)
      });

      // Draw image if exists
      if (embeddedSignatureImage) {
        page.drawImage(embeddedSignatureImage, {
          x: boxX + (boxWidth - imgWidth) / 2,
          y: boxY + textHeight + (innerPadding * 2),
          width: imgWidth,
          height: imgHeight,
        });
      }

      // Draw the text lines
      let currentTextY = boxY + textHeight + innerPadding - 12;
      textLines.forEach((line, index) => {
        page.drawText(line, {
          x: boxX + innerPadding,
          y: currentTextY,
          size: 8,
          font: index === 0 ? boldFont : font,
          color: rgb(0, 0, 0),
        });
        currentTextY -= 12;
      });
    });

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
        
        // Spawn Worker to handle the risky @signpdf parsing
        const { Worker } = require('worker_threads');
        // Resolving the worker path. In compiled dist/, it's pdfWorker.js. In ts-node, it's pdfWorker.ts.
        const workerPath = path.join(__dirname, __filename.endsWith('.ts') ? 'pdfWorker.ts' : 'pdfWorker.js');
        
        let worker: any;
        if (workerPath.endsWith('.ts')) {
          // If running via tsx or ts-node during dev, we might need a workaround for worker_threads
          // But usually we just compile to .js first. For now, we'll try to run the .ts directly if tsx is active
          worker = new Worker(workerPath, {
            workerData: {
              pdfBuffer: Array.from(pdfBuffer),
              details,
              p12Buffer: Array.from(p12Buffer),
              passphrase: 'password'
            },
            execArgv: process.execArgv.includes('--loader') || process.execArgv.some(a => a.includes('tsx')) ? process.execArgv : []
          });
        } else {
          worker = new Worker(workerPath, {
            workerData: {
              pdfBuffer: Array.from(pdfBuffer),
              details,
              p12Buffer: Array.from(p12Buffer),
              passphrase: 'password'
            }
          });
        }

        const timeout = setTimeout(() => {
          worker.terminate();
          reject(new Error("PDF signing timed out. The uploaded PDF may be malformed or corrupted. Please flatten the PDF or print to PDF and try again."));
        }, 15000); // 15 seconds timeout

        worker.on('message', (message: any) => {
          clearTimeout(timeout);
          if (message.success) {
            resolve(Buffer.from(message.signedPdf));
          } else {
            reject(new Error(message.error || "Unknown worker error"));
          }
        });

        worker.on('error', (error: any) => {
          clearTimeout(timeout);
          reject(error);
        });

        worker.on('exit', (code: number) => {
          clearTimeout(timeout);
          if (code !== 0) {
            reject(new Error(`Worker stopped with exit code ${code}`));
          }
        });
      } catch (error) {
        logger.error({ err: error }, 'Cryptographic PDF sealing failed before worker');
        reject(error);
      }
    });
  }
}
