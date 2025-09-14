// routes/debateRoutes.js
import express from "express";
import authMiddleware from "../middleware/auth.js";
import {
  validateCreateDebate,
  validateAddArgument,
  validateJoinPrivateDebate,
  validateDebateId,
  validatePagination
} from "../middleware/validation.js";
import {
  debateCreationLimiter,
  argumentLimiter
} from "../middleware/rateLimiter.js";
import {
  createPrivateDebate,
  joinPrivateDebate,
  createDebate,
  joinDebate,
  getDebateStatus,
  getOpenDebates,
  addArgument,
  getArguments,
  finalizeDebate,
  requestFinalization,
  getResults
} from "../controllers/debateController.js";

const router = express.Router();

// Private debate
router.post("/private", authMiddleware, debateCreationLimiter, validateCreateDebate, createPrivateDebate);
router.post("/join-private", authMiddleware, validateJoinPrivateDebate, joinPrivateDebate);

// Create public debate
router.post("/", authMiddleware, debateCreationLimiter, validateCreateDebate, createDebate);

// Join open debate
router.post("/:id/join", authMiddleware, validateDebateId, joinDebate);

// Get status
router.get("/:id/status", validateDebateId, getDebateStatus);

// Open debates
router.get("/open", validatePagination, getOpenDebates);

// Arguments
router.post("/:id/arguments", authMiddleware, argumentLimiter, validateAddArgument, addArgument);
router.get("/:id/arguments", validateDebateId, getArguments);

// Finalize & results (using AI analysis)
router.post("/:id/request-finalization", authMiddleware, argumentLimiter, validateDebateId, requestFinalization);
router.post("/:id/finalize", authMiddleware, argumentLimiter, validateDebateId, finalizeDebate);
router.get("/:id/results", validateDebateId, getResults);

export default router;
