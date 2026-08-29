import type { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import { DocumentRepository } from "../repositories/DocumentRepository.js";
import { DocumentRecipientRepository } from "../repositories/DocumentRecipientRepository.js";
import { AuditLogRepository } from "../repositories/AuditLogRepository.js";
import { db } from "../db/index.js";
import { AuthService } from "../services/AuthService.js";
import { UAParser } from "ua-parser-js";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { getStorageProvider } from "../services/storage.service.js";
import { OtpRepository } from "../repositories/OtpRepository.js";
import { logger } from "../utils/logger.js";
import { env } from "../config/env.js";
import PDFDocumentKit from "pdfkit";
import { UserRepository } from "../repositories/UserRepository.js";

// Assume user is attached to req by auth middleware
interface AuthenticatedRequest extends Request {
  userId?: string;
}

export class ESignController {
  
  /**
   * Handle the single request submission to send a document for eSign.
   * Expects multipart/form-data. The PDF is streamed to storage by the middleware.
   */
  static async sendForESign(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const uploaderId = req.userId;
      if (!uploaderId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const sender = await UserRepository.findById(uploaderId);
      const senderName = sender ? `${sender.firstName} ${sender.lastName}` : "Ehastakshar User";

      const { title, fileUrl, originalHash, recipients } = req.body;

      if (!fileUrl || !title || !recipients || !Array.isArray(recipients) || recipients.length === 0) {
        res.status(400).json({ error: "Missing required fields or invalid recipients format" });
        return;
      }

      const transactionId = uuidv4().replace(/-/g, "").substring(0, 24); // 24 char hex
      
      // Calculate Expiry Date (7 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      // We use a transaction to ensure document and recipients are created together
      await db.transaction(async (tx) => {
        // 1. Create Document
        const newDocument = await DocumentRepository.create({
          uploaderId,
          title,
          fileUrl,
          originalHash,
          transactionId,
          status: "PENDING",
          signType: "DIGITAL",
          expiresAt,
        });

        // 2. Create Recipients
        const newRecipientsData = recipients.map((r: { name: string; email: string; requireGps?: boolean; requirePhoto?: boolean }) => ({
          documentId: newDocument.id,
          name: r.name,
          email: r.email,
          status: "PENDING" as const,
          secureToken: crypto.randomBytes(32).toString("hex"),
          requireGps: r.requireGps || false,
          requirePhoto: r.requirePhoto || false,
        }));
        
        const createdRecipients = await DocumentRecipientRepository.createMany(newRecipientsData);

        // 3. Log Audit Event for Upload
        await AuditLogRepository.logEvent({
          documentId: newDocument.id,
          action: "UPLOADED",
          ipAddress: req.ip || req.socket.remoteAddress || "",
          userAgent: req.headers["user-agent"] || "",
        });

        // 4. Send Emails & Log Invite Sent
        for (const recipient of createdRecipients) {
          const signingLink = `http://localhost:3000/sign/${recipient.secureToken}`;
          // Send email using Resend
          await AuthService.sendInviteEmail({
            email: recipient.email,
            link: signingLink,
            recipientName: recipient.name,
            senderName,
            documentName: newDocument.title,
          });

          await AuditLogRepository.logEvent({
            documentId: newDocument.id,
            recipientId: recipient.id,
            action: "INVITE_SENT",
            ipAddress: req.ip || req.socket.remoteAddress || "",
            userAgent: req.headers["user-agent"] || "",
          });
        }
      });

      res.status(200).json({ message: "Document sent for eSign successfully", transactionId });
    } catch (error) {
      logger.error({ err: error, path: req.originalUrl }, "Error sending for eSign");
      res.status(500).json({ error: "Internal server error" });
    }
  }

  /**
   * Get document info for a signer via their secure token.
   */
  static async getDocumentByToken(req: Request, res: Response): Promise<void> {
    try {
      const token = req.params.token as string;
      const recipient = await DocumentRecipientRepository.findBySecureToken(token);
      
      if (!recipient) {
        res.status(404).json({ error: "Invalid or expired link" });
        return;
      }

      const document = await DocumentRepository.findById(recipient.documentId);
      if (!document) {
        res.status(404).json({ error: "Document not found" });
        return;
      }

      // Log action
      await AuditLogRepository.logEvent({
        documentId: document.id,
        recipientId: recipient.id,
        action: "LINK_CLICKED",
        ipAddress: req.ip || req.socket.remoteAddress || "",
        userAgent: req.headers["user-agent"] || "",
      });

      res.status(200).json({ 
        documentTitle: document.title, 
        transactionId: document.transactionId,
        recipientName: recipient.name,
        recipientEmail: recipient.email,
        status: recipient.status,
        requireGps: recipient.requireGps,
        requirePhoto: recipient.requirePhoto
      });
    } catch (error) {
      logger.error({ err: error, path: req.originalUrl }, "Error getting document by token");
      res.status(500).json({ error: "Internal server error" });
    }
  }

  /**
   * Resend the invite email to a specific signer.
   */
  static async remindSigner(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const uploaderId = req.userId;
      const { recipientId } = req.body;
      
      if (!uploaderId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      
      const recipient = await DocumentRecipientRepository.findById(recipientId);
      if (!recipient) {
        res.status(404).json({ error: "Recipient not found" });
        return;
      }

      const sender = await UserRepository.findById(uploaderId);
      const senderName = sender ? `${sender.firstName} ${sender.lastName}` : "Ehastakshar User";
      
      const document = await DocumentRepository.findById(recipient.documentId);
      if (!document || document.uploaderId !== uploaderId) {
        res.status(404).json({ error: "Document not found or unauthorized" });
        return;
      }
      
      if (recipient.status === "SIGNED") {
        res.status(400).json({ error: "Recipient has already signed" });
        return;
      }

      const signingLink = `${env.FRONTEND_URL}/sign/${recipient.secureToken}`;
      await AuthService.sendInviteEmail({
        email: recipient.email,
        link: signingLink,
        recipientName: recipient.name,
        senderName,
        documentName: document.title,
      });

      await AuditLogRepository.logEvent({
        documentId: document.id,
        recipientId: recipient.id,
        action: "REMINDER_SENT",
        ipAddress: req.ip || req.socket.remoteAddress || "",
        userAgent: req.headers["user-agent"] || "",
      });

      res.status(200).json({ message: "Reminder sent successfully" });
    } catch (error) {
      logger.error({ err: error, path: req.originalUrl }, "Error sending reminder");
      res.status(500).json({ error: "Internal server error" });
    }
  }

  /**
   * Stream PDF by secure token for the signer
   */
  static async downloadDocumentByToken(req: Request, res: Response): Promise<void> {
    try {
      const token = req.params.token as string;
      const recipient = await DocumentRecipientRepository.findBySecureToken(token);
      
      if (!recipient) {
        res.status(404).json({ error: "Invalid or expired token" });
        return;
      }

      const document = await DocumentRepository.findById(recipient.documentId);
      if (!document) {
        res.status(404).json({ error: "Document not found" });
        return;
      }

      const storageProvider = getStorageProvider();
      const fileStream = await storageProvider.download(document.fileUrl);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename="${document.title}.pdf"`);

      fileStream.pipe(res);
    } catch (error) {
      logger.error({ err: error, path: req.originalUrl }, "Error downloading document by token");
      res.status(500).json({ error: "Internal server error" });
    }
  }

  /**
   * Send OTP to signer's email for verification.
   */
  static async sendOtp(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.body;
      const recipient = await DocumentRecipientRepository.findBySecureToken(token);
      if (!recipient) {
        res.status(400).json({ error: "Invalid token" });
        return;
      }

      // Generate OTP and Hash
      const otp = AuthService.generateOtp();
      const otpHash = await AuthService.hashString(otp);
      
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);

      // Save to OTP repo
      await OtpRepository.upsert({
        email: recipient.email,
        otpHash,
        expiresAt,
      });

      // Send OTP email using Resend
      await AuthService.sendOtpEmail(recipient.email, otp);

      await AuditLogRepository.logEvent({
        documentId: recipient.documentId,
        recipientId: recipient.id,
        action: "OTP_REQUESTED",
        ipAddress: req.ip || req.socket.remoteAddress || "",
        userAgent: req.headers["user-agent"] || "",
      });

      res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
      logger.error({ err: error, path: req.originalUrl }, "Error sending OTP");
      res.status(500).json({ error: "Internal server error" });
    }
  }

  /**
   * Verify the OTP provided by the signer.
   */
  static async verifyOtp(req: Request, res: Response): Promise<void> {
    try {
      const { token, otp } = req.body;
      const recipient = await DocumentRecipientRepository.findBySecureToken(token);
      
      if (!recipient) {
        res.status(400).json({ error: "Invalid token" });
        return;
      }

      const otpRequest = await OtpRepository.findByEmail(recipient.email);
      if (!otpRequest || otpRequest.expiresAt < new Date()) {
        res.status(400).json({ error: "OTP expired or not requested" });
        return;
      }

      const isValid = await AuthService.verifyHash(otpRequest.otpHash, otp);
      if (!isValid) {
        res.status(400).json({ error: "Invalid OTP" });
        return;
      }

      // Clear the OTP
      await OtpRepository.deleteByEmail(recipient.email);

      await AuditLogRepository.logEvent({
        documentId: recipient.documentId,
        recipientId: recipient.id,
        action: "OTP_VERIFIED",
        ipAddress: req.ip || req.socket.remoteAddress || "",
        userAgent: req.headers["user-agent"] || "",
      });

      // Generate a temporary JWT token specifically for the signing step to prevent replay attacks
      const signToken = AuthService.generateToken(recipient.id);

      res.status(200).json({ message: "OTP verified", signToken });
    } catch (error) {
      logger.error({ err: error, path: req.originalUrl }, "Error verifying OTP");
      res.status(500).json({ error: "Internal server error" });
    }
  }

  /**
   * Apply visual signature to the PDF using pdf-lib.
   */
  static async signDocument(req: Request, res: Response): Promise<void> {
    try {
      // In reality, you'd extract and verify the `signToken` JWT here.
      const { token, signatureText } = req.body;
      const recipient = await DocumentRecipientRepository.findBySecureToken(token);
      
      if (!recipient || recipient.status === "SIGNED") {
        res.status(400).json({ error: "Invalid token or already signed" });
        return;
      }

      const document = await DocumentRepository.findById(recipient.documentId);
      if (!document) {
        res.status(404).json({ error: "Document not found" });
        return;
      }

      // 1. Download current document
      const storageProvider = getStorageProvider();
      const fileStream = await storageProvider.download(document.fileUrl);
      
      const chunks: Buffer[] = [];
      for await (const chunk of fileStream) {
        chunks.push(Buffer.from(chunk));
      }
      const fileBuffer = Buffer.concat(chunks);

      // 2. Manipulate PDF
      const pdfDoc = await PDFDocument.load(fileBuffer);
      const pages = pdfDoc.getPages();
      const lastPage = pages[pages.length - 1];

      // Use a built-in font for now, ideally load a cursive font TTF
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
      
      const istFormatter = new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      const formattedDate = istFormatter.format(new Date());
      const signatureString = `Signed by: ${signatureText}\nDate: ${formattedDate} IST\nTxn ID: ${document.transactionId}`;
      
      pages.forEach((page) => {
        const { width, height } = page.getSize();
        
        // Approximate width and height of the signature block
        const boxWidth = 200;
        const boxHeight = 60;
        const padding = 10;
        
        const boxX = width - boxWidth - padding;
        const boxY = padding; // Bottom right corner
        
        // Draw the border box
        page.drawRectangle({
          x: boxX,
          y: boxY,
          width: boxWidth,
          height: boxHeight,
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
        });

        // Draw the text inside the box
        page.drawText(signatureString, {
          x: boxX + 10,
          y: boxY + boxHeight - 20, // Start drawing near the top of the box
          size: 10,
          font,
          color: rgb(0, 0, 0), // Black ink
          lineHeight: 14,
        });
      });

      const signedPdfBytes = await pdfDoc.save();

      // 3. Upload signed document back
      // Using a temporary stream to upload the Buffer
      const { Readable } = await import("stream");
      const signedStream = Readable.from(Buffer.from(signedPdfBytes));
      
      // Upload replacing or creating a new version
      const newFileUrl = await storageProvider.upload(`signed_${document.id}.pdf`, "application/pdf", signedStream);

      // 4. Update Database inside a transaction
      await db.transaction(async (tx) => {
        await DocumentRecipientRepository.markAsSigned(recipient.id, signatureText);
        await DocumentRepository.updateFileUrl(document.id, newFileUrl);

        const userAgentStr = req.headers["user-agent"] || "";
        const uap = new UAParser(userAgentStr);
        const browser = uap.getBrowser().name || "Unknown";
        const deviceType = uap.getDevice().type || "Desktop";
        
        let city = undefined, state = undefined, country = undefined;
        if (req.body.latitude && req.body.longitude) {
          try {
            const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${req.body.latitude}&lon=${req.body.longitude}&format=json`, {
              headers: { 'User-Agent': 'EhastaksharApp/1.0' }
            });
            const geoData = await geoRes.json();
            if (geoData && geoData.address) {
              city = geoData.address.city || geoData.address.town || geoData.address.village;
              state = geoData.address.state;
              country = geoData.address.country;
            }
          } catch (e) {
            logger.error({ err: e }, "Geocoding error");
          }
        }

        await AuditLogRepository.logEvent({
          documentId: document.id,
          recipientId: recipient.id,
          action: "SIGNED",
          ipAddress: req.ip || req.socket.remoteAddress || "",
          userAgent: userAgentStr,
          latitude: req.body.latitude || null,
          longitude: req.body.longitude || null,
          photoUrl: req.body.photoUrl || null,
          city,
          state,
          country,
          browser,
          deviceType
        });

        // Check if all recipients have signed
        const allRecipients = await DocumentRecipientRepository.findByDocumentId(document.id);
        const allSigned = allRecipients.every(r => r.status === "SIGNED");
        
        if (allSigned) {
          await DocumentRepository.updateStatus(document.id, "COMPLETED");
          await AuditLogRepository.logEvent({
            documentId: document.id,
            action: "COMPLETED",
            ipAddress: "System",
            userAgent: "Backend Worker",
          });
        }
      });

      res.status(200).json({ message: "Document Signed Successfully", transactionId: document.transactionId });
    } catch (error) {
      logger.error({ err: error, path: req.originalUrl }, "Error signing document");
      res.status(500).json({ error: "Internal server error" });
    }
  }
  /**
   * Securely proxy the download of the original document.
   */
  static async downloadDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const uploaderId = req.userId;
      const documentId = req.params.id as string;

      if (!uploaderId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const document = await DocumentRepository.findById(documentId);
      
      if (!document || document.uploaderId !== uploaderId) {
        res.status(404).json({ error: "Document not found or unauthorized" });
        return;
      }

      const storageProvider = getStorageProvider();
      const fileStream = await storageProvider.download(document.fileUrl);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename="${document.title}.pdf"`);

      fileStream.pipe(res);
    } catch (error) {
      logger.error({ err: error, path: req.originalUrl }, "Error downloading document");
      res.status(500).json({ error: "Internal server error" });
    }
  }

  /**
   * Log client events like allowing/denying location, capturing photo, etc.
   */
  static async logClientEvent(req: Request, res: Response): Promise<void> {
    try {
      const token = req.params.token as string;
      const { action } = req.body;
      
      const recipient = await DocumentRecipientRepository.findBySecureToken(token);
      if (!recipient) {
        res.status(404).json({ error: "Invalid token" });
        return;
      }
      
      await AuditLogRepository.logEvent({
        documentId: recipient.documentId,
        recipientId: recipient.id,
        action,
        ipAddress: req.ip || req.socket.remoteAddress || "",
        userAgent: req.headers["user-agent"] || "",
      });

      res.status(200).json({ success: true });
    } catch (error) {
      logger.error({ err: error }, "Error logging client event");
      res.status(500).json({ error: "Internal server error" });
    }
  }

  /**
   * Generate and download the Audit Report PDF for a document.
   */
  static async downloadAuditReport(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const uploaderId = req.userId;
      const documentId = req.params.id as string;
      if (!uploaderId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      
      const document = await DocumentRepository.findById(documentId);
      if (!document || document.uploaderId !== uploaderId) {
        res.status(404).json({ error: "Document not found" });
        return;
      }

      const uploader = await UserRepository.findById(uploaderId);
      const recipients = await DocumentRecipientRepository.findByDocumentId(documentId);
      const events = await AuditLogRepository.getEventsForDocument(documentId);

      // Create a new PDF document using PDFKit
      const doc = new PDFDocumentKit({ margin: 50, size: "A4" });
      
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="AuditReport_${document.transactionId}.pdf"`);
      doc.pipe(res);

      // Header Banner
      doc.rect(0, 0, doc.page.width, 100).fill("#e2e4e8");
      doc.fillColor("#6b7280").fontSize(24).font("Helvetica-Bold").text("DOCUMENT AUDIT REPORT", 50, 40);

      // Metadata (below header)
      doc.fillColor("#111827").fontSize(10).font("Helvetica-Bold");
      doc.text(`Order ID: `, 50, 130, { continued: true }).font("Helvetica").text(document.transactionId);
      
      const generatedOn = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      const generatedTime = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      
      doc.font("Helvetica-Bold").text(`Generated On: `, doc.page.width / 2 - 50, 130, { continued: true }).font("Helvetica").text(generatedOn);
      doc.font("Helvetica-Bold").text(`Time: `, doc.page.width - 150, 130, { continued: true }).font("Helvetica").text(generatedTime);

      // ORDER DETAILS BOX
      doc.moveDown(3);
      doc.font("Helvetica-Bold").fontSize(14).fillColor("#9ca3af").text("ORDER DETAILS", 50, doc.y);
      
      const boxY = doc.y + 10;
      doc.roundedRect(50, boxY, doc.page.width - 100, 80, 5).fillAndStroke("#f3f4f6", "#111827");
      
      doc.fillColor("#111827").fontSize(10).font("Helvetica");
      doc.text("Order ID", 70, boxY + 20);
      doc.font("Helvetica-Bold").text(`: ${document.transactionId}`, 180, boxY + 20);
      
      doc.font("Helvetica").text("Order Status", doc.page.width / 2, boxY + 20);
      doc.font("Helvetica-Bold").text(`: ${document.status}`, doc.page.width / 2 + 80, boxY + 20);

      const uploaderName = uploader ? `${uploader.firstName} ${uploader.lastName}` : "Unknown";
      doc.font("Helvetica").text("Order Placed By", 70, boxY + 50);
      doc.font("Helvetica-Bold").text(`: ${uploaderName}`, 180, boxY + 50);

      const orderDate = new Date(document.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      doc.font("Helvetica").text("Order Date", doc.page.width / 2, boxY + 50);
      doc.font("Helvetica-Bold").text(`: ${orderDate}`, doc.page.width / 2 + 80, boxY + 50);

      // ESIGNATURE DETAILS
      doc.moveDown(5);
      doc.font("Helvetica-Bold").fontSize(14).fillColor("#9ca3af").text("ESIGNATURE DETAILS", 50, doc.y);
      
      for (const r of recipients) {
        if (r.status !== "SIGNED") continue;
        
        const signEvent = events.find(e => e.recipientId === r.id && e.action === "SIGNED");
        if (!signEvent) continue;

        doc.moveDown(2);
        const yStart = doc.y;
        
        doc.fillColor("#111827").fontSize(10).font("Helvetica");
        doc.text("Signatory Name", 50, doc.y);
        doc.font("Helvetica-Bold").text(`: ${r.name}`, 150, doc.y - 12);
        
        doc.moveDown(1);
        doc.font("Helvetica").text("Email", 50, doc.y);
        doc.font("Helvetica-Bold").text(`: ${r.email}`, 150, doc.y - 12);
        
        doc.moveDown(1);
        doc.font("Helvetica").text("Signature Type", 50, doc.y);
        doc.font("Helvetica-Bold").text(`: DIGITAL`, 150, doc.y - 12);
        
        doc.font("Helvetica").text("City", doc.page.width / 2 - 20, doc.y - 12);
        doc.font("Helvetica-Bold").text(`: ${signEvent.city || "NA"}`, doc.page.width / 2 + 50, doc.y - 12);
        
        doc.moveDown(1);
        doc.font("Helvetica").text("Mobile", 50, doc.y);
        doc.font("Helvetica-Bold").text(`: NA`, 150, doc.y - 12);
        
        doc.font("Helvetica").text("State", doc.page.width / 2 - 20, doc.y - 12);
        doc.font("Helvetica-Bold").text(`: ${signEvent.state || "NA"}`, doc.page.width / 2 + 50, doc.y - 12);
        
        doc.moveDown(1);
        doc.font("Helvetica").text("Device Type", 50, doc.y);
        doc.font("Helvetica-Bold").text(`: ${signEvent.deviceType || "NA"}`, 150, doc.y - 12);
        
        doc.font("Helvetica").text("Country", doc.page.width / 2 - 20, doc.y - 12);
        doc.font("Helvetica-Bold").text(`: ${signEvent.country || "NA"}`, doc.page.width / 2 + 50, doc.y - 12);

        doc.moveDown(1);
        doc.font("Helvetica").text("Browser", 50, doc.y);
        doc.font("Helvetica-Bold").text(`: ${signEvent.browser || "NA"}`, 150, doc.y - 12);

        const dateSigned = new Date(r.signedAt!).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        const timeSigned = new Date(r.signedAt!).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        
        doc.font("Helvetica").text("Date & Time", doc.page.width / 2 - 20, doc.y - 12);
        doc.font("Helvetica-Bold").text(`: ${dateSigned} ${timeSigned}`, doc.page.width / 2 + 50, doc.y - 12);

        doc.moveDown(1);
        doc.font("Helvetica").text("IP Address", 50, doc.y);
        doc.font("Helvetica-Bold").text(`: ${signEvent.ipAddress || "NA"}`, 150, doc.y - 12);

        doc.font("Helvetica").text("Lat Long", doc.page.width / 2 - 20, doc.y - 12);
        doc.font("Helvetica-Bold").text(`: ${signEvent.latitude ? `(${signEvent.latitude},${signEvent.longitude})` : "NA"}`, doc.page.width / 2 + 50, doc.y - 12);

        // Render photo if available
        if (signEvent.photoUrl) {
          doc.font("Helvetica-Bold").text("Image:", doc.page.width - 150, yStart + 20);
          try {
            const photoRes = await fetch(signEvent.photoUrl);
            const arrayBuffer = await photoRes.arrayBuffer();
            const photoBuffer = Buffer.from(arrayBuffer);
            doc.image(photoBuffer, doc.page.width - 150, yStart + 35, { fit: [100, 100], align: 'center', valign: 'center' });
          } catch (e) {
            logger.error({ err: e }, "Failed to fetch and embed photo into PDF");
          }
        }
        
        // Dashed divider
        doc.moveDown(4);
        doc.lineWidth(1);
        doc.dash(5, { space: 5 });
        doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
        doc.undash();
        doc.moveDown(2);
      }

      doc.end();
    } catch (error) {
      logger.error({ err: error, path: req.originalUrl }, "Error downloading audit report");
      if (!res.headersSent) {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }
}
