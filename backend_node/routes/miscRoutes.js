// routes/miscRoutes.js
import express from "express";
import { healthCheck } from "../controllers/debateController.js";
import { detailedHealthCheck, readinessCheck, livenessCheck } from "../middleware/healthCheck.js";

const router = express.Router();

router.get("/", healthCheck);                    // GET / - Simple health check
router.get("/health", detailedHealthCheck);     // GET /health - Detailed health check  
router.get("/ready", readinessCheck);           // GET /ready - Readiness probe
router.get("/live", livenessCheck);             // GET /live - Liveness probe

export default router;
