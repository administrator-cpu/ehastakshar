import express from "express";
const { Router } = express;
import { ESignController } from "../controllers/ESignController.js";
import { DashboardController } from "../controllers/DashboardController.js";
import { multipartUploadMiddleware } from "../middlewares/multipart.middleware.js";
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
router.post("/otp/send", ESignController.sendOtp);
router.post("/otp/verify", ESignController.verifyOtp);
router.post("/sign", ESignController.signDocument);

export default router;
