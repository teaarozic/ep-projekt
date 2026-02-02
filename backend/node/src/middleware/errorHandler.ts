import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { AppError } from '@/utils/AppError.js';
import { log } from '@/lib/logger.js';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  log.error(
    'Unhandled error:',
    err instanceof Error ? err.stack || err.message : err
  );

  if (err instanceof ZodError) {
    const details = err.issues.map((i) => i.message).join('; ');
    return res.status(400).json({
      success: false,
      message: details || 'Validation error',
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[])?.join(', ') || 'field';
      return res.status(400).json({
        success: false,
        message: `A record with this ${target} already exists.`,
      });
    }

    if (err.code === 'P2025') {
      return res
        .status(404)
        .json({ success: false, message: 'Record not found.' });
    }

    if (err.code === 'P2003') {
      return res.status(400).json({
        success: false,
        message: 'Foreign key constraint failed.',
      });
    }
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: 'Internal Server Error',
  });
}
