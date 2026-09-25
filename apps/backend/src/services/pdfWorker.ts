import { parentPort, workerData } from 'worker_threads';
import { plainAddPlaceholder } from '@signpdf/placeholder-plain';
import { P12Signer } from '@signpdf/signer-p12';
import { SignPdf } from '@signpdf/signpdf';

async function processPdf() {
  try {
    const { pdfBuffer, details, p12Buffer, passphrase } = workerData;
    
    // Add Placeholder
    const pdfWithPlaceholder = plainAddPlaceholder({
      pdfBuffer: Buffer.from(pdfBuffer),
      reason: 'Document e-Signature',
      contactInfo: details.ipAddress || '0.0.0.0',
      name: details.recipientName,
      location: 'India',
      signatureLength: 8192,
    });

    // Sign Document
    const signer = new P12Signer(Buffer.from(p12Buffer), { passphrase });
    const signpdf = new SignPdf();
    const signedPdf = await signpdf.sign(pdfWithPlaceholder, signer);

    if (parentPort) {
      parentPort.postMessage({ success: true, signedPdf });
    }
  } catch (error: any) {
    if (parentPort) {
      parentPort.postMessage({ success: false, error: error.message || String(error) });
    }
  }
}

processPdf();
