import { prisma } from '@/lib/prisma.js';
import { AuthRequest } from '@/middleware/authMiddleware.js';
import { Response, NextFunction } from 'express';

export async function getMyTasks(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const tasks = await prisma.task.findMany({
      where: { assigneeId: userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        title: true,
        status: true,
        project: {
          select: { id: true, name: true },
        },
      },
    });

    res.status(200).json(tasks);
  } catch (err) {
    next(err);
  }
}
