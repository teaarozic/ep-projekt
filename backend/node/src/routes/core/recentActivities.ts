import { getRecentActivities } from '@/controllers/core/activityController.js';
import { authenticateToken } from '@/middleware/authMiddleware.js';
import { Router } from 'express';

const router = Router();

router.get('/recent-activities', authenticateToken, getRecentActivities);

export default router;
