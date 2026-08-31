import rateLimit from "express-rate-limit";

// Rate Limiting for OTPs
// Set to 20 requests per 15 minutes to allow for testing and normal usage
// while still preventing heavy brute force attacks.
export const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, 
  message: { error: "Too many requests from this IP, please try again after 15 minutes" },
  standardHeaders: true,
  legacyHeaders: false,
});
