import { Router } from 'express';
import {
  summarizeText,
  analyzeSentiment,
  analyzeCsv,
  getAiStats,
} from '@/controllers/core/aiController.js';
import { authenticateToken } from '@/middleware/authMiddleware.js';
import { upload } from '@/middleware/uploadMiddleware.js';

const router = Router();

router.post('/summarize/', authenticateToken, summarizeText);
router.post('/sentiment/', authenticateToken, analyzeSentiment);
router.post('/csv/', authenticateToken, upload.single('file'), analyzeCsv);
router.get('/stats', authenticateToken, getAiStats);

export default router;
