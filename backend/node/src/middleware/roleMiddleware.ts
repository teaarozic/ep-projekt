import { NextFunction, Response } from 'express';
import { AuthRequest } from '@/middleware/authMiddleware.js';
import { AppError } from '@/utils/AppError.js';

export function authorizeRoles(...allowedRoles: ('USER' | 'ADMIN' | 'SA')[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return next(new AppError('Unauthorized', 401));
    }

    if (!allowedRoles.includes(userRole)) {
      return next(new AppError('Forbidden: insufficient permissions', 403));
    }

    next();
  };
}
