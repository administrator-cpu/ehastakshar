import { Router } from "express";
import { AdminController } from "../controllers/AdminController.js";
import { verifyToken, requireAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

// Protect all admin routes
router.use(verifyToken, requireAdmin as any);

router.get("/customers", AdminController.getCustomers);
router.post("/customers", AdminController.addCustomer);

export default router;
