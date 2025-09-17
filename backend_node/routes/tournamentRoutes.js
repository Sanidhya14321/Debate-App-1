// routes/tournamentRoutes.js
import express from "express";
import authMiddleware from "../middleware/auth.js";
import { adminAuth } from "../middleware/adminAuth.js";
import { validatePagination, validateDebateId } from "../middleware/validation.js";
import {
  getTournaments,
  getTournamentById,
  createTournament,
  joinTournament,
  getTournamentBracket,
  updateTournamentStatus,
  updateTournament,
  deleteTournament,
  forceStartTournament,
  getAdminTournamentStats,
  getTournamentResults
} from "../controllers/tournamentController.js";

const router = express.Router();

// Public routes
// Get all tournaments
router.get("/", validatePagination, getTournaments);

// Get tournament by ID
router.get("/:id", validateDebateId, getTournamentById);

// Get tournament bracket
router.get("/:id/bracket", validateDebateId, getTournamentBracket);

// Get tournament results
router.get("/:id/results", validateDebateId, getTournamentResults);

// User routes (require authentication)
// Join tournament
router.post("/:id/join", authMiddleware, validateDebateId, joinTournament);

// Admin routes (require admin authentication)
// Create tournament
router.post("/", adminAuth, createTournament);

// Update tournament
router.put("/:id", adminAuth, validateDebateId, updateTournament);

// Delete tournament
router.delete("/:id", adminAuth, validateDebateId, deleteTournament);

// Update tournament status
router.patch("/:id/status", adminAuth, validateDebateId, updateTournamentStatus);

// Force start tournament
router.post("/:id/start", adminAuth, validateDebateId, forceStartTournament);

// Get admin statistics
router.get("/admin/stats", adminAuth, getAdminTournamentStats);

export default router;
