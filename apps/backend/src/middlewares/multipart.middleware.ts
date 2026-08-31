import type { Request, Response, NextFunction } from "express";
import busboy from "busboy";
import { getStorageProvider } from "../services/storage.service.js";
import { logger } from "../utils/logger.js";

export const multipartUploadMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  if (req.method === "POST" && req.headers["content-type"]?.includes("multipart/form-data")) {
    const bb = busboy({ headers: req.headers });
    const storageProvider = getStorageProvider();
    
    // We will attach parsed data to req.body so the controller can use it
    req.body = {};
    let fileUploadPromise: Promise<void> | null = null;

    bb.on("file", (name, file, info) => {
      if (name === "file" || name === "document") {
        const { filename, mimeType } = info;
        
        if (mimeType !== "application/pdf") {
          file.resume(); // Discard the stream
          return res.status(400).json({ error: "Only PDF files are allowed" });
        }

        // Stream the file directly to the storage provider
        fileUploadPromise = storageProvider.upload(filename, mimeType, file).then((url) => {
          req.body.fileUrl = url;
          // In a real scenario, you'd also hash the stream on the fly here to get originalHash.
          // For now, we'll set a dummy hash.
          req.body.originalHash = "dummy-hash-to-be-replaced"; 
        }).catch((err) => {
          logger.error({ err }, "Storage upload error");
          req.unpipe(bb); // stop parsing
          res.status(500).json({ error: "Failed to upload file to storage" });
        });
      } else {
        file.resume();
      }
    });

    bb.on("field", (name, val) => {
      try {
        // We expect recipients to be sent as a stringified JSON array
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
      if (fileUploadPromise) {
        try {
          await fileUploadPromise;
          next();
        } catch (err) {
          // Error already handled in the catch block of the promise
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
