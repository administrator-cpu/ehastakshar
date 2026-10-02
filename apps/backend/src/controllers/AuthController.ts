import type { Request, Response } from "express";
import { z } from "zod";
import { UserRepository } from "../repositories/UserRepository.js";
import { OtpRepository } from "../repositories/OtpRepository.js";
import { logger } from "../utils/logger.js";
import { AuthService } from "../services/AuthService.js";
import { env } from "../config/env.js";

const isProduction = env.NODE_ENV === "production";
const getCookieOptions = () => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax" as const,
  domain: isProduction ? (env.COOKIE_DOMAIN || ".ehastakshar.in") : undefined,
  path: "/",
});

const forgotPasswordSchema = z.object({
  email: z.email("Invalid email address"),
});

const verifyResetOtpSchema = z.object({
  email: z.email("Invalid email address"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

const resetPasswordSchema = z.object({
  email: z.email("Invalid email address"),
  otp: z.string().length(6, "OTP must be 6 digits"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

const verifyOtpSchema = z.object({
  email: z.email(),
  otp: z.string().length(6),
});

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

const changeTempPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

const resendOtpSchema = z.object({
  email: z.email(),
});

export class AuthController {
  static async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const parsed = forgotPasswordSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.format() });
        return;
      }
      const { email } = parsed.data;

      const user = await UserRepository.findByEmail(email);
      // To prevent email enumeration, we will pretend it succeeds even if user doesn't exist.
      
      const existingOtp = await OtpRepository.findByEmail(email);
      const now = new Date();

      if (existingOtp) {
        const elapsedSeconds = Math.floor((now.getTime() - existingOtp.lastSentAt.getTime()) / 1000);
        const RESEND_COOLDOWN_SECONDS = 60; // 1 minute cooldown

        if (elapsedSeconds < RESEND_COOLDOWN_SECONDS) {
          const retryAfter = RESEND_COOLDOWN_SECONDS - elapsedSeconds;
          res.status(429).json({
            error: "Please wait before requesting another password reset OTP",
            retryAfter,
          });
          return;
        }
      }

      // Only actually generate and send if the user exists
      if (user) {
        const otp = AuthService.generateOtp();
        const otpHash = await AuthService.hashString(otp);
        const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes expiry

        await OtpRepository.upsert({
          email,
          otpHash,
          expiresAt,
          lastSentAt: now,
        });

        await AuthService.sendOtpEmail(email, otp);
      }

      res.status(200).json({ message: "If an account exists, a password reset OTP has been sent." });
    } catch (error) {
      logger.error({ err: error, path: req.originalUrl }, "Forgot password error");
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async verifyResetOtp(req: Request, res: Response): Promise<void> {
    try {
      const parsed = verifyResetOtpSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.format() });
        return;
      }
      const { email, otp } = parsed.data;

      const otpRequest = await OtpRepository.findByEmail(email);
      if (!otpRequest) {
        res.status(400).json({ error: "No OTP request found for this email" });
        return;
      }

      if (new Date() > otpRequest.expiresAt) {
        res.status(400).json({ error: "OTP has expired" });
        return;
      }

      const isValid = await AuthService.verifyHash(otpRequest.otpHash, otp);
      if (!isValid) {
        res.status(400).json({ error: "Invalid OTP" });
        return;
      }

      res.status(200).json({ message: "OTP verified successfully" });
    } catch (error) {
      logger.error({ err: error, path: req.originalUrl }, "Verify reset OTP error");
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const parsed = resetPasswordSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.format() });
        return;
      }
      const { email, otp, newPassword } = parsed.data;

      const user = await UserRepository.findByEmail(email);
      if (!user) {
        res.status(400).json({ error: "Invalid request" });
        return;
      }

      const otpRequest = await OtpRepository.findByEmail(email);
      if (!otpRequest) {
        res.status(400).json({ error: "No OTP request found for this email" });
        return;
      }

      if (new Date() > otpRequest.expiresAt) {
        res.status(400).json({ error: "OTP has expired" });
        return;
      }

      const isValid = await AuthService.verifyHash(otpRequest.otpHash, otp);
      if (!isValid) {
        res.status(400).json({ error: "Invalid OTP" });
        return;
      }

      // Hash new password and update user
      const passwordHash = await AuthService.hashString(newPassword);
      await UserRepository.updatePassword(user.id, passwordHash);

      // Verify email implicitly if it wasn't already
      if (!user.isEmailVerified) {
        await UserRepository.markEmailAsVerified(email);
      }

      // Delete the OTP to prevent reuse
      await OtpRepository.deleteByEmail(email);

      res.status(200).json({ message: "Password has been successfully reset" });
    } catch (error) {
      logger.error({ err: error, path: req.originalUrl }, "Reset password error");
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async verifyOtp(req: Request, res: Response): Promise<void> {
    try {
      const parsed = verifyOtpSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.format() });
        return;
      }
      const { email, otp } = parsed.data;

      const otpRequest = await OtpRepository.findByEmail(email);
      if (!otpRequest) {
        res.status(400).json({ error: "No OTP request found for this email" });
        return;
      }

      if (new Date() > otpRequest.expiresAt) {
        res.status(400).json({ error: "OTP has expired" });
        return;
      }

      const isValid = await AuthService.verifyHash(otpRequest.otpHash, otp);
      if (!isValid) {
        res.status(400).json({ error: "Invalid OTP" });
        return;
      }

      await UserRepository.markEmailAsVerified(email);
      await OtpRepository.deleteByEmail(email);

      const user = await UserRepository.findByEmail(email);
      if (!user) {
        res.status(500).json({ error: "User not found after verification" });
        return;
      }

      const token = AuthService.generateToken(user.id);

      res.cookie("token", token, {
        ...getCookieOptions(),
        maxAge: 15 * 60 * 1000, // 15 mins
      });

      res.status(200).json({ message: "Email verified successfully" });
    } catch (error) {
      logger.error({ err: error, path: req.originalUrl }, "Verify OTP error");
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async resendOtp(req: Request, res: Response): Promise<void> {
    try {
      const parsed = resendOtpSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.format() });
        return;
      }
      const { email } = parsed.data;

      const user = await UserRepository.findByEmail(email);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      if (user.isEmailVerified) {
        res.status(400).json({ error: "Email is already verified" });
        return;
      }

      const existingOtp = await OtpRepository.findByEmail(email);
      const now = new Date();

      if (existingOtp) {
        // Calculate seconds elapsed since last sent
        const elapsedSeconds = Math.floor((now.getTime() - existingOtp.lastSentAt.getTime()) / 1000);
        const RESEND_COOLDOWN_SECONDS = 120; // 2 minutes

        if (elapsedSeconds < RESEND_COOLDOWN_SECONDS) {
          const retryAfter = RESEND_COOLDOWN_SECONDS - elapsedSeconds;
          res.status(429).json({
            error: "Please wait before requesting another OTP",
            retryAfter, // Server-side truth relative TTL!
          });
          return;
        }
      }

      const otp = AuthService.generateOtp();
      const otpHash = await AuthService.hashString(otp);
      const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes

      await OtpRepository.upsert({
        email,
        otpHash,
        expiresAt,
        lastSentAt: now,
      });

      await AuthService.sendOtpEmail(email, otp);

      res.status(200).json({ message: "OTP resent successfully", retryAfter: 120 });
    } catch (error) {
      logger.error({ err: error, path: req.originalUrl }, "Resend OTP error");
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.format() });
        return;
      }
      const { email, password } = parsed.data;

      const user = await UserRepository.findByEmail(email);
      if (!user) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      const isValidPassword = await AuthService.verifyHash(user.passwordHash, password);
      if (!isValidPassword) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      if (!user.isEmailVerified) {
        res.status(403).json({ error: "Please verify your email before logging in" });
        return;
      }

      const token = AuthService.generateToken(user.id);

      res.cookie("token", token, {
        ...getCookieOptions(),
        maxAge: 15 * 60 * 1000, // 15 mins
      });

      res.status(200).json({ 
        message: "Login successful", 
        mustChangePassword: user.mustChangePassword 
      });
    } catch (error) {
      logger.error({ err: error, path: req.originalUrl }, "Login error");
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async logout(req: Request, res: Response): Promise<void> {
    try {
      res.clearCookie("token", getCookieOptions());
      res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      logger.error({ err: error, path: req.originalUrl }, "Logout error");
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async changeTempPassword(req: Request, res: Response): Promise<void> {
    try {
      const parsed = changeTempPasswordSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.format() });
        return;
      }
      
      const userId = (req as any).userId;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const { newPassword } = parsed.data;

      const user = await UserRepository.findById(userId);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const passwordHash = await AuthService.hashString(newPassword);
      await UserRepository.updatePasswordAndClearFlag(userId, passwordHash);

      res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      logger.error({ err: error, path: req.originalUrl }, "Change temp password error");
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
