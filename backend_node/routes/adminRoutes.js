import express from 'express';
import { getDashboardStats } from '../controllers/adminController.js';
import { adminAuth, adminLogin } from '../middleware/adminAuth.js';

const router = express.Router();

// Admin login route
router.post('/login', adminLogin);

// Protected admin routes
router.get('/dashboard/stats', adminAuth, getDashboardStats);

export default router;
