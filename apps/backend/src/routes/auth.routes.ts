import express from "express";
const { Router } = express;
import { AuthController } from "../controllers/AuthController.js";

const router = Router();

router.post("/signup", AuthController.signup);
router.post("/verify-otp", AuthController.verifyOtp);
router.post("/resend-otp", AuthController.resendOtp);
router.post("/login", AuthController.login);
router.post("/logout", AuthController.logout);

export default router;
