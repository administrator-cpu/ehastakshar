import type { Request, Response, NextFunction } from "express";
import busboy from "busboy";
import { getStorageProvider } from "../services/storage.service.js";
import { logger } from "../utils/logger.js";
import crypto from "crypto";

export const signMultipartMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  if (req.method === "POST" && req.headers["content-type"]?.includes("multipart/form-data")) {
    const bb = busboy({ headers: req.headers });
    const storageProvider = getStorageProvider();
    
    req.body = {};
    let fileUploadPromise: Promise<void> | null = null;

    bb.on("file", (name, file, info) => {
      if (name === "photo") {
        const { filename, mimeType } = info;
        
        if (!mimeType.startsWith("image/")) {
          file.resume(); // Discard
          return res.status(400).json({ error: "Only image files are allowed for photo" });
        }

        const uniqueFilename = `photo_${crypto.randomBytes(8).toString("hex")}_${filename}`;

        fileUploadPromise = storageProvider.upload(uniqueFilename, mimeType, file).then((url) => {
          req.body.photoUrl = url;
        }).catch((err) => {
          logger.error({ err }, "Storage upload error for photo");
          req.unpipe(bb);
          res.status(500).json({ error: "Failed to upload photo to storage" });
        });
      } else if (name === "signatureFile") {
        const { filename, mimeType } = info;
        
        if (!mimeType.startsWith("image/")) {
          file.resume();
          return res.status(400).json({ error: "Only image files are allowed for signature" });
        }

        const uniqueFilename = `signature_${crypto.randomBytes(8).toString("hex")}_${filename}`;

        const signatureUploadPromise = storageProvider.upload(uniqueFilename, mimeType, file).then((url) => {
          req.body.signatureUrl = url;
        }).catch((err) => {
          logger.error({ err }, "Storage upload error for signature");
          req.unpipe(bb);
          res.status(500).json({ error: "Failed to upload signature to storage" });
        });

        if (fileUploadPromise) {
          fileUploadPromise = Promise.all([fileUploadPromise, signatureUploadPromise]).then(() => {});
        } else {
          fileUploadPromise = signatureUploadPromise;
        }
      } else {
        file.resume();
      }
    });

    bb.on("field", (name, val) => {
      req.body[name] = val;
    });

    bb.on("close", async () => {
      if (fileUploadPromise) {
        try {
          await fileUploadPromise;
        } catch (err) {
          return; // Error already handled
        }
      }
      next();
    });

    req.pipe(bb);
  } else {
    next();
  }
};
