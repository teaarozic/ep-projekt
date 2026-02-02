import { Router } from 'express';
import {
  listResults,
  saveResult,
} from '@/controllers/core/resultsController.js';
import { authenticateToken } from '@/middleware/authMiddleware.js';

const router = Router();

router.get('/', authenticateToken, listResults);
router.post('/', authenticateToken, saveResult);

export default router;
