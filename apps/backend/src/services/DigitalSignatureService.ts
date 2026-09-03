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
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pages = pdfDoc.getPages();
    const lastPage = pages[pages.length - 1];
    if (!lastPage) throw new Error("No pages found in PDF");

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
        signatureDims = embeddedSignatureImage.scaleToFit(140, 40);
      } catch (err) {
        logger.error({ err }, "Failed to embed signature image in PDF for digital signing");
      }
    }
    
    const { width } = lastPage.getSize();
    const boxWidth = 200;
    const innerPadding = 10;
    const imgHeight = embeddedSignatureImage ? signatureDims.height : 0;
    const imgWidth = embeddedSignatureImage ? signatureDims.width : 0;
    
    // We calculate height based on the text lines we want to add
    const textLines = [
      `Digitally signed by: ${details.recipientName}`,
      `Date: ${formattedDate} IST`,
      `Reason: Document e-Signature`,
      `Txn ID: ${details.transactionId}`,
    ];
    
    const textHeight = textLines.length * 12;
    const totalHeight = imgHeight + textHeight + (innerPadding * 3);
    
    const padding = 20;
    const boxX = width - boxWidth - padding;
    const boxY = padding; // Bottom right corner
    
    // Draw the visual border box
    lastPage.drawRectangle({
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
      lastPage.drawImage(embeddedSignatureImage, {
        x: boxX + (boxWidth - imgWidth) / 2,
        y: boxY + textHeight + (innerPadding * 2),
        width: imgWidth,
        height: imgHeight,
      });
    }

    // Draw the text lines
    let currentTextY = boxY + textHeight + innerPadding - 12;
    textLines.forEach((line, index) => {
      lastPage.drawText(line, {
        x: boxX + innerPadding,
        y: currentTextY,
        size: 8,
        font: index === 0 ? boldFont : font,
        color: rgb(0, 0, 0),
      });
      currentTextY -= 12;
    });

    // Save the PDF visually
    const visuallyModifiedPdfBytes = await pdfDoc.save();
    const initialBuffer = Buffer.from(visuallyModifiedPdfBytes);

    // 2. Add the cryptographic placeholder using @signpdf/utils
    // This adds the /ByteRange dictionary and allocates 8192 bytes for the PKCS#7 signature
    const pdfWithPlaceholder = plainAddPlaceholder({
      pdfBuffer: initialBuffer as Buffer<ArrayBuffer>,
      reason: 'Document e-Signature',
      contactInfo: details.ipAddress || '0.0.0.0',
      name: details.recipientName,
      location: 'India',
      signatureLength: 8192,
    });

    return Buffer.from(pdfWithPlaceholder);
  }

  /**
   * Reads the P12 certificate and applies a cryptographic PKCS#7 signature
   * to the allocated placeholder in the PDF.
   */
  static async sealDocument(pdfWithPlaceholderBuffer: Buffer): Promise<Buffer> {
    try {
      const p12Path = path.join(__dirname, '../assets/dev-cert.p12');
      
      if (!fs.existsSync(p12Path)) {
        throw new Error('Development certificate (dev-cert.p12) not found in assets folder.');
      }
      
      const p12Buffer = fs.readFileSync(p12Path);
      
      // Sign the PDF
      const signer = new P12Signer(p12Buffer, { passphrase: 'password' });
      const signpdf = new SignPdf();
      
      const signedPdf = await signpdf.sign(pdfWithPlaceholderBuffer, signer);
      
      return signedPdf;
    } catch (error) {
      logger.error({ err: error }, 'Cryptographic PDF sealing failed');
      throw error;
    }
  }
}
