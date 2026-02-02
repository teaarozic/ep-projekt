import { Router } from 'express';
import { authenticateToken } from '@/middleware/authMiddleware.js';
import { authorizeRoles } from '@/middleware/roleMiddleware.js';
import {
  getClients,
  getNextClientId,
  addClient,
  editClient,
  removeClient,
} from '@/controllers/core/clientsController.js';

const router = Router();

router.get('/', authenticateToken, authorizeRoles('ADMIN', 'SA'), getClients);
router.post('/', authenticateToken, authorizeRoles('ADMIN', 'SA'), addClient);
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('ADMIN', 'SA'),
  editClient
);
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('ADMIN', 'SA'),
  removeClient
);
router.get(
  '/next-id',
  authenticateToken,
  authorizeRoles('ADMIN', 'SA'),
  getNextClientId
);

export default router;
