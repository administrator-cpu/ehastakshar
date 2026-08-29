import express from "express";
const { Router } = express;
import { ESignController } from "../controllers/ESignController.js";
import { DashboardController } from "../controllers/DashboardController.js";
import { multipartUploadMiddleware } from "../middlewares/multipart.middleware.js";
import { signMultipartMiddleware } from "../middlewares/signMultipart.middleware.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

// Sender routes (requires auth)
router.post("/send", verifyToken, multipartUploadMiddleware, ESignController.sendForESign);
router.post("/document/remind", verifyToken, ESignController.remindSigner);
router.get("/dashboard", verifyToken, DashboardController.getStats);
router.get("/document/details/:id", verifyToken, DashboardController.getDocumentDetails);
router.get("/document/download/:id", verifyToken, ESignController.downloadDocument);

// Signer routes (public, secured by token/OTP)
router.get("/document/:token", ESignController.getDocumentByToken);
router.get("/document/:token/download", ESignController.downloadDocumentByToken);
router.post("/document/:token/log", ESignController.logClientEvent);
router.post("/otp/send", ESignController.sendOtp);
router.post("/otp/verify", ESignController.verifyOtp);
router.post("/sign", signMultipartMiddleware, ESignController.signDocument);
router.get("/document/:id/audit-report", ESignController.downloadAuditReport);

export default router;
