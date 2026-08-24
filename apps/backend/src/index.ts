import express, { type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import { verifyToken } from "./middlewares/auth.middleware.js";

dotenv.config();

const app = express();

// Global Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Authentication Routes
app.use("/api/auth", authRoutes);

// Protected Dummy Route
app.get("/api/user/me", verifyToken, (req: Request, res: Response) => {
  res.json({ message: "You have accessed a protected route!", userId: (req as any).userId });
});

// Health Check Route
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Backend server is running.',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
