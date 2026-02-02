import { prisma } from '@/lib/prisma.js';
import { AuthRequest } from '@/middleware/authMiddleware.js';
import { Response, NextFunction } from 'express';
import { AppError } from '@/utils/AppError.js';

export async function getRecentActivities(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);

    const { id, role } = req.user;

    const where = role === 'USER' ? { userId: id } : {};

    const activities = await prisma.activity.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    const formatted = activities.map((a) => ({
      id: a.id,
      actor: a.user?.name || a.user?.email || 'Unknown',
      action: a.message,
      createdAt: a.createdAt,
      user: {
        name: a.user?.name,
        email: a.user?.email,
      },
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (err) {
    next(err);
  }
}
