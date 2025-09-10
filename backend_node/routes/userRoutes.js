// routes/userRoutes.js
import express from "express";
import authMiddleware from "../middleware/auth.js";
import { getProfile } from "../controllers/userController.js";

const router = express.Router();

router.get("/", authMiddleware, getProfile);

export default router;
