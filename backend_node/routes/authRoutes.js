// routes/authRoutes.js
import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import { validateRegister, validateLogin } from "../middleware/validation.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// Apply auth rate limiter to all auth routes
router.use(authLimiter);

router.post("/register", validateRegister, registerUser);
router.post("/login", validateLogin, loginUser);

export default router;
