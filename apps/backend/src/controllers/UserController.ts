import type { Request, Response } from "express";
import { UserRepository } from "../repositories/UserRepository.js";
import { logger } from "../utils/logger.js";

export class UserController {
  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const user = await UserRepository.findById(userId);

      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      // Explicitly omit sensitive information like passwordHash
      const { passwordHash, ...safeUserProfile } = user;

      res.status(200).json({ profile: safeUserProfile });
    } catch (error) {
      logger.error({ err: error, path: req.originalUrl }, "Error fetching user profile");
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
