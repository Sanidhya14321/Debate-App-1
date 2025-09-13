import express from 'express';
import { getAnalytics } from '../controllers/analyticsController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, getAnalytics);

export default router;
