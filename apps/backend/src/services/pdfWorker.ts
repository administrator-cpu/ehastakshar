import { plainAddPlaceholder } from '@signpdf/placeholder-plain';
import { P12Signer } from '@signpdf/signer-p12';
import { SignPdf } from '@signpdf/signpdf';

process.on('message', async (workerData: any) => {
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

    if (process.send) {
      process.send({ success: true, signedPdf: Array.from(signedPdf) });
    }
  } catch (error: any) {
    if (process.send) {
      process.send({ success: false, error: error.message || String(error) });
    }
  }
});
