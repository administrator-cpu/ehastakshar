import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { logger } from '../utils/logger.js';

export interface VisualSignatureDetails {
  transactionId: string;
  recipientName: string;
  signatureUrl?: string;
  ipAddress?: string;
  positions?: { pageNumber: number; pctX: number; pctY: number }[];
}

export class DigitalSignatureService {
  /**
   * Adds the visual signature elements using pdf-lib.
   */
  static async addVisualSignature(pdfBuffer: Buffer, details: VisualSignatureDetails): Promise<Buffer> {
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


}
