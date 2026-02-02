import { Router } from 'express';
import { authenticateToken } from '@/middleware/authMiddleware.js';
import { authorizeRoles } from '@/middleware/roleMiddleware.js';
import {
  getUsers,
  getUserById,
  changeRole,
  createUser,
  changeStatus,
  updateUser,
  deleteUser,
} from '@/controllers/core/usersController.js';

const router = Router();

router.get('/me', authenticateToken, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  res.status(200).json({ success: true, data: req.user });
});

router.get('/', authenticateToken, authorizeRoles('SA', 'ADMIN'), getUsers);
router.get(
  '/:id',
  authenticateToken,
  authorizeRoles('SA', 'ADMIN'),
  getUserById
);
router.post('/', authenticateToken, authorizeRoles('SA', 'ADMIN'), createUser);
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('SA', 'ADMIN'),
  updateUser
);
router.patch(
  '/:id/status',
  authenticateToken,
  authorizeRoles('SA', 'ADMIN'),
  changeStatus
);
router.put('/:id/role', authenticateToken, authorizeRoles('SA'), changeRole);
router.delete('/:id', authenticateToken, authorizeRoles('SA'), deleteUser);

export default router;
