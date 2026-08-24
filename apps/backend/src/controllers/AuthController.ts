import type { Request, Response } from "express";
import { z } from "zod";
import { UserRepository } from "../repositories/UserRepository.js";
import { OtpRepository } from "../repositories/OtpRepository.js";
import { AuthService } from "../services/AuthService.js";

const signupSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  email: z.email("Invalid email address"),
  password: z
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

const resendOtpSchema = z.object({
  email: z.email(),
});

export class AuthController {
  static async signup(req: Request, res: Response): Promise<void> {
    try {
      const parsed = signupSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.format() });
        return;
      }
      const { firstName, lastName, email, password } = parsed.data;

      const existingUser = await UserRepository.findByEmail(email);
      if (existingUser) {
        res.status(409).json({ error: "Email already exists" });
        return;
      }

      const passwordHash = await AuthService.hashString(password);
      await UserRepository.create({
        firstName,
        lastName,
        email,
        passwordHash,
        isEmailVerified: false,
      });

      // Generate and send OTP
      const otp = AuthService.generateOtp();
      const otpHash = await AuthService.hashString(otp);
      
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes expiry

      await OtpRepository.upsert({
        email,
        otpHash,
        expiresAt,
        lastSentAt: now,
      });

      await AuthService.sendOtpEmail(email, otp);

      res.status(201).json({ message: "User created, OTP sent to email" });
    } catch (error) {
      console.error("Signup error:", error);
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
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000, // 15 mins
      });

      res.status(200).json({ message: "Email verified successfully" });
    } catch (error) {
      console.error("Verify OTP error:", error);
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
      console.error("Resend OTP error:", error);
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
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
      });

      res.status(200).json({ message: "Login successful" });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async logout(req: Request, res: Response): Promise<void> {
    try {
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
      res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
