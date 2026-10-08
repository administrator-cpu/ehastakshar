import type { Request, Response, NextFunction } from "express";
import busboy from "busboy";
import { getStorageProvider } from "../services/storage.service.js";
import { logger } from "../utils/logger.js";
import { Readable } from "stream";
import { WatermarkService } from "../services/WatermarkService.js";

export const multipartUploadMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  if (req.method === "POST" && req.headers["content-type"]?.includes("multipart/form-data")) {
    const bb = busboy({ headers: req.headers });
    const storageProvider = getStorageProvider();
    
    req.body = {};
    
    let fileBuffer: Buffer | null = null;
    let uploadFilename = "";
    let uploadMimeType = "";

    bb.on("file", (name, file, info) => {
      if (name === "file" || name === "document") {
        const { filename, mimeType } = info;
        
        if (mimeType !== "application/pdf") {
          file.resume();
          return res.status(400).json({ error: "Only PDF files are allowed" });
        }

        uploadFilename = filename;
        uploadMimeType = mimeType;
        
        const chunks: Buffer[] = [];
        file.on("data", (data) => chunks.push(data));
        file.on("end", () => {
          fileBuffer = Buffer.concat(chunks);
        });
      } else {
        file.resume();
      }
    });

    bb.on("field", (name, val) => {
      try {
        if (name === "recipients") {
          req.body[name] = JSON.parse(val);
        } else {
          req.body[name] = val;
        }
      } catch (e) {
        req.body[name] = val;
      }
    });

    bb.on("close", async () => {
      if (fileBuffer) {
        try {
          // Check if a watermark was requested in the fields
          if (req.body.watermark && typeof req.body.watermark === 'string') {
            fileBuffer = await WatermarkService.applyWatermark(fileBuffer, req.body.watermark);
          }
          
          if (req.body.password && typeof req.body.password === 'string') {
            const { QpdfHelper } = await import("../utils/qpdf.js");
            fileBuffer = await QpdfHelper.encryptPdf(fileBuffer, req.body.password);
          }

          // Upload to storage provider
          const stream = Readable.from(fileBuffer);
          const url = await storageProvider.upload(uploadFilename, uploadMimeType, stream);
          
          req.body.fileUrl = url;
          req.body.originalHash = "dummy-hash-to-be-replaced";
          next();
        } catch (err) {
          logger.error({ err }, "Storage upload or watermark error");
          res.status(500).json({ error: "Failed to process and upload file" });
        }
      } else {
        res.status(400).json({ error: "No document file was uploaded" });
      }
    });

    req.pipe(bb);
  } else {
    next();
  }
};
