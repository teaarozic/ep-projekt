import { Router, RequestHandler } from 'express';
import { authenticateToken } from '@/middleware/authMiddleware.js';
import { authorizeRoles } from '@/middleware/roleMiddleware.js';
import {
  getProjects,
  addProject,
  editProject,
  removeProject,
  getProjectById,
  getNextProjectId,
} from '@/controllers/core/projectsController.js';

const router = Router();

router.get(
  '/next-id',
  authenticateToken as RequestHandler,
  authorizeRoles('ADMIN', 'SA') as RequestHandler,
  getNextProjectId as RequestHandler
);

router.get(
  '/',
  authenticateToken as RequestHandler,
  authorizeRoles('USER', 'ADMIN', 'SA') as RequestHandler,
  getProjects as RequestHandler
);

router.get(
  '/:id',
  authenticateToken as RequestHandler,
  authorizeRoles('USER', 'ADMIN', 'SA') as RequestHandler,
  getProjectById as RequestHandler
);

router.post(
  '/',
  authenticateToken as RequestHandler,
  authorizeRoles('ADMIN', 'SA') as RequestHandler,
  addProject as RequestHandler
);

router.put(
  '/:id',
  authenticateToken as RequestHandler,
  authorizeRoles('ADMIN', 'SA') as RequestHandler,
  editProject as RequestHandler
);

router.delete(
  '/:id',
  authenticateToken as RequestHandler,
  authorizeRoles('ADMIN', 'SA') as RequestHandler,
  removeProject as RequestHandler
);

export default router;
