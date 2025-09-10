// routes/achievementRoutes.js
import express from "express";
import authMiddleware from "../middleware/auth.js";
import { validatePagination } from "../middleware/validation.js";
import {
  getUserAchievements,
  getAllAchievements,
  checkAndAwardAchievements,
  getAchievementLeaderboard
} from "../controllers/achievementController.js";

const router = express.Router();

// Get user's achievements
router.get("/user/:userId", getUserAchievements);

// Get all available achievements
router.get("/", validatePagination, getAllAchievements);

// Check and award achievements (internal use)
router.post("/check", authMiddleware, checkAndAwardAchievements);

// Get achievement leaderboard
router.get("/leaderboard", validatePagination, getAchievementLeaderboard);

export default router;
