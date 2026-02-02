import { Router } from 'express';
import { getMyTasks } from '@/controllers/core/myTasksController.js';
import { authenticateToken } from '@/middleware/authMiddleware.js';

const router = Router();

router.get('/my-tasks', authenticateToken, getMyTasks);

export default router;
