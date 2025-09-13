import express from 'express';
import { getDashboardStats } from '../controllers/adminController.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = express.Router();

router.get('/dashboard/stats', adminAuth, getDashboardStats);

export default router;
