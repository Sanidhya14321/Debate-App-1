// routes/miscRoutes.js
import express from "express";
import { healthCheck, mlStatus } from "../controllers/debateController.js";

const router = express.Router();

router.get("/", healthCheck);       // GET /
router.get("/ml-status", mlStatus); // GET /ml-status

export default router;
