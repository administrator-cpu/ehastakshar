import express from "express";
const { Router } = express;
import { AuthController } from "../controllers/AuthController.js";

import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/forgot-password", AuthController.forgotPassword);
router.post("/verify-reset-otp", AuthController.verifyResetOtp);
router.post("/reset-password", AuthController.resetPassword);
router.post("/verify-otp", AuthController.verifyOtp);
router.post("/resend-otp", AuthController.resendOtp);
router.post("/login", AuthController.login);
router.post("/logout", AuthController.logout);
router.post("/change-temp-password", verifyToken, AuthController.changeTempPassword);

export default router;
