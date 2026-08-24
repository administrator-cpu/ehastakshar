import * as argon2 from "argon2";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

// JWT Expiration for short-lived access
const JWT_EXPIRES_IN = "15m";

export class AuthService {
  /**
   * Hashes a password or OTP using Argon2.
   */
  static async hashString(plaintext: string): Promise<string> {
    return await argon2.hash(plaintext);
  }

  /**
   * Verifies an Argon2 hash against a plaintext string.
   */
  static async verifyHash(hash: string, plaintext: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, plaintext);
    } catch (err) {
      return false;
    }
  }

  /**
   * Generates a 6-character OTP.
   * Uses uppercase letters and numbers, explicitly excluding confusing characters:
   * 'I', '1', 'L', 'O', '0'.
   */
  static generateOtp(): string {
    const charset = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
    let otp = "";
    // crypto.randomBytes is secure against predictability
    const randomBytes = crypto.randomBytes(6);
    for (let i = 0; i < 6; i++) {
      const byte = randomBytes[i];
      if (byte === undefined) {
        throw new Error("Failed to generate OTP");
      }
      otp += charset.charAt(byte % charset.length);
    }
    return otp;
  }

  /**
   * Generates a JWT token for the user.
   */
  static generateToken(userId: string): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET environment variable is missing.");
    }
    return jwt.sign({ userId }, secret, { expiresIn: JWT_EXPIRES_IN });
  }

  /**
   * Sends the OTP via Resend.
   */
  static async sendOtpEmail(email: string, otp: string): Promise<void> {
    // In local development if dummy API key is used, log it to console to avoid crashing.
    if (process.env.RESEND_API_KEY === "re_dummy_resend_api_key_replace_me") {
      console.log(`[MOCK EMAIL] To: ${email} | OTP: ${otp}`);
      return;
    }

    try {
      await resend.emails.send({
        from: "Ehastakshar <onboarding@resend.dev>",
        to: email,
        subject: "Your Ehastakshar Verification Code",
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #0D9488;">Verify your email</h2>
            <p>Your verification code is:</p>
            <h1 style="letter-spacing: 4px; font-size: 32px; color: #111;">${otp}</h1>
            <p>This code expires in 10 minutes.</p>
          </div>
        `,
      });
    } catch (error) {
      console.error("Failed to send email via Resend:", error);
      throw new Error("Failed to send OTP email.");
    }
  }
}
