import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '@/utils/AppError.js';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: 'USER' | 'ADMIN' | 'SA';
    name?: string | null;
  };
}

export const authenticateToken = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return next(new AppError('Unauthorized', 401));
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return next(new AppError('Server misconfiguration', 500));
  }

  try {
    const decoded = jwt.verify(token, secret) as {
      id: number;
      email: string;
      role: 'USER' | 'ADMIN' | 'SA';
      name?: string;
    };
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name ?? null,
    };

    next();
  } catch {
    next(new AppError('Invalid or expired token', 401));
  }
};
