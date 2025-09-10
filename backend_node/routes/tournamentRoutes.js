// routes/tournamentRoutes.js
import express from "express";
import authMiddleware from "../middleware/auth.js";
import { validatePagination, validateDebateId } from "../middleware/validation.js";
import {
  getTournaments,
  getTournamentById,
  createTournament,
  joinTournament,
  getTournamentBracket,
  updateTournamentStatus,
  getTournamentResults
} from "../controllers/tournamentController.js";

const router = express.Router();

// Get all tournaments
router.get("/", validatePagination, getTournaments);

// Get tournament by ID
router.get("/:id", validateDebateId, getTournamentById);

// Create tournament (admin only for now)
router.post("/", authMiddleware, createTournament);

// Join tournament
router.post("/:id/join", authMiddleware, validateDebateId, joinTournament);

// Get tournament bracket
router.get("/:id/bracket", validateDebateId, getTournamentBracket);

// Update tournament status (admin only)
router.patch("/:id/status", authMiddleware, validateDebateId, updateTournamentStatus);

// Get tournament results
router.get("/:id/results", validateDebateId, getTournamentResults);

export default router;
