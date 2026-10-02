import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { UserRepository } from "../repositories/UserRepository.js";

export interface AuthRequest extends Request {
  userId?: string;
}

export function verifyToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Access denied. No token provided." });
    return;
  }

  try {
    const secret = env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is missing");
    }

    const decoded = jwt.verify(token, secret) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(400).json({ error: "Invalid or expired token." });
    return;
  }
}

export async function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  // First ensure the token is verified and we have a userId
  if (!req.userId) {
    res.status(401).json({ error: "Access denied. User not authenticated." });
    return;
  }

  try {
    const user = await UserRepository.findById(req.userId);
    if (!user || user.role !== "ADMIN") {
      res.status(403).json({ error: "Access denied. Requires administrator privileges." });
      return;
    }
    next();
  } catch (error) {
    res.status(500).json({ error: "Internal server error during authorization." });
    return;
  }
}
