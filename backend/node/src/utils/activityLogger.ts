import { prisma } from '@/lib/prisma.js';
import { logger } from '@/lib/logger.js';

export async function logActivity({
  userId,
  type,
  message,
  targetType,
  targetId,
}: {
  userId: number;
  type: string;
  message: string;
  targetType: 'Task' | 'Project';
  targetId?: number | null;
}) {
  try {
    await prisma.activity.create({
      data: {
        userId,
        type,
        message,
        targetType,
        targetId: targetId ?? null,
      },
    });
  } catch (err) {
    logger.error('[Activity Logger] Failed to write activity', err);
  }
}
