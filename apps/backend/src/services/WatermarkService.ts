import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib";
import { logger } from "../utils/logger.js";

export class WatermarkService {
  /**
   * Applies a diagonal watermark to every page of the provided PDF buffer.
   */
  static async applyWatermark(pdfBuffer: Buffer, watermarkText: string): Promise<Buffer> {
    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const pages = pdfDoc.getPages();
      
      const fontSize = 80;
      const lineHeight = fontSize * 1.1;
      const text = watermarkText.toUpperCase();
      const words = text.split(' ');

      for (const page of pages) {
        const { width, height } = page.getSize();
        
        // 1. Line Wrapping (Max width is ~120% of page width, mimicking frontend)
        const maxTextWidth = width * 1.2;
        const lines: string[] = [];
        let currentLine = "";

        for (const word of words) {
          const testLine = currentLine.length === 0 ? word : `${currentLine} ${word}`;
          const testWidth = font.widthOfTextAtSize(testLine, fontSize);
          if (testWidth > maxTextWidth && currentLine.length > 0) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        if (currentLine) {
          lines.push(currentLine);
        }

        // 2. Center-Block Trigonometry
        const totalHeight = lines.length * lineHeight;
        const angle = 45 * (Math.PI / 180); // +45 degrees in radians
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (!line) continue;
          
          const lineWidth = font.widthOfTextAtSize(line, fontSize);
          
          // Unrotated coordinate relative to the absolute center of the text block
          const unrotatedX = -(lineWidth / 2);
          const unrotatedY = (totalHeight / 2) - (i * lineHeight) - (fontSize * 0.8);

          // Rotate the coordinate by +45 degrees
          const rotatedX = (unrotatedX * cosA) - (unrotatedY * sinA);
          const rotatedY = (unrotatedX * sinA) + (unrotatedY * cosA);

          // Translate to absolute center of the page
          const finalX = (width / 2) + rotatedX;
          const finalY = (height / 2) + rotatedY;

          page.drawText(line, {
            x: finalX,
            y: finalY,
            size: fontSize,
            font: font,
            color: rgb(0.06, 0.09, 0.16), // text-slate-900 approx
            opacity: 0.1, // 10% opacity
            rotate: degrees(45),
          });
        }
      }

      return Buffer.from(await pdfDoc.save());
    } catch (error) {
      logger.error({ err: error }, "Failed to apply watermark to PDF");
      throw error;
    }
  }
}

