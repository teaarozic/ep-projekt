import { Response, NextFunction } from 'express';
import { AuthRequest } from '@/middleware/authMiddleware.js';
import { AppError } from '@/utils/AppError.js';
import { prisma } from '@/lib/prisma.js';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { logActivity } from '@/utils/activityLogger.js';

const taskSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  projectId: z.number().int().positive(),
  clientId: z.number().int().positive().optional(),
  assigneeId: z.number().int().positive().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  estimatedHours: z.number().int().optional(),
  timeSpentHours: z.number().int().optional(),
  progress: z.number().int().min(0).max(100).optional(),
  status: z.string().optional(),
});

const updateTaskSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional(),
  done: z.boolean().optional(),
  status: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  estimatedHours: z.number().int().optional(),
  timeSpentHours: z.number().int().optional(),
  progress: z.number().int().min(0).max(100).optional(),
  assigneeId: z
    .union([z.number().int().positive(), z.literal(0), z.null()])
    .optional()
    .transform((val) => (val === 0 ? null : val)),
  clientId: z
    .union([z.number().int().positive(), z.literal(0), z.null()])
    .optional()
    .transform((val) => (val === 0 ? null : val)),
});

async function ensureProjectAccess(
  projectId: number,
  userId: number,
  role: string
) {
  if (role === 'SA' || role === 'ADMIN') return;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      assignedUsers: { select: { id: true } },
      tasks: { select: { id: true, assigneeId: true } },
    },
  });

  if (!project) throw new AppError('Project not found', 404);

  if (project.userId === userId) return;

  if (project.assignedUsers.some((u) => u.id === userId)) return;

  if (project.tasks.some((t) => t.assigneeId === userId)) return;

  throw new AppError('You do not have access to this project.', 403);
}

export const getTasks = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const { role, id } = req.user;

    const where: Prisma.TaskWhereInput =
      role === 'USER'
        ? {
            OR: [
              { assigneeId: id },
              { userId: id },
              { project: { assignedUsers: { some: { id } } } },
            ],
          }
        : {};

    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: { include: { client: true } },
        user: true,
        assignee: true,
        client: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ success: true, data: tasks });
  } catch (err) {
    next(err);
  }
};

export const createTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);

    const parse = taskSchema.safeParse(req.body);
    if (!parse.success) {
      const firstError = parse.error.issues?.[0]?.message || 'Invalid input';
      throw new AppError(firstError, 400);
    }

    const {
      title,
      description,
      projectId,
      clientId,
      assigneeId,
      startDate,
      endDate,
      estimatedHours,
      timeSpentHours,
      progress,
      status,
    } = parse.data;

    const { role, id } = req.user;
    await ensureProjectAccess(projectId, id, role);

    let data: Prisma.TaskCreateInput = {
      title,
      description: description ?? null,
      status: status ?? 'NEW',
      progress: progress ?? 0,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      estimatedHours: estimatedHours ?? null,
      timeSpentHours: timeSpentHours ?? null,
      user: { connect: { id } },
      project: { connect: { id: projectId } },
    };

    if (clientId) data.client = { connect: { id: clientId } };
    if (assigneeId) data.assignee = { connect: { id: assigneeId } };

    const task = await prisma.task.create({ data });

    await logActivity({
      userId: req.user!.id,
      type: 'TASK_CREATED',
      message: `created task '${task.title}'`,
      targetType: 'Task',
      targetId: task.id,
    });

    res.status(201).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

export const updateTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const { role, id } = req.user;
    const idNum = Number(req.params.id);

    if (!idNum || isNaN(idNum) || idNum <= 0)
      throw new AppError('Invalid task ID', 400);

    const parsed = updateTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      const first = parsed.error.issues?.[0]?.message ?? 'Invalid input';
      throw new AppError(first, 400);
    }

    const existing = await prisma.task.findUnique({
      where: { id: idNum },
      include: { project: true },
    });
    if (!existing) throw new AppError('Task not found', 404);

    await ensureProjectAccess(existing.projectId, id, role);

    if (role === 'USER' && existing.assigneeId !== id) {
      throw new AppError('You can only edit your own tasks.', 403);
    }

    const updateData: Prisma.TaskUpdateInput = {};
    const {
      title,
      done,
      description,
      status,
      startDate,
      endDate,
      estimatedHours,
      timeSpentHours,
      progress,
      assigneeId,
      clientId,
    } = parsed.data;

    if (title !== undefined) updateData.title = title;
    if (done !== undefined) updateData.done = done;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = new Date(endDate);
    if (estimatedHours !== undefined)
      updateData.estimatedHours = estimatedHours;
    if (timeSpentHours !== undefined)
      updateData.timeSpentHours = timeSpentHours;
    if (progress !== undefined) updateData.progress = progress;

    if (assigneeId !== undefined) {
      updateData.assignee =
        assigneeId === null
          ? { disconnect: true }
          : { connect: { id: assigneeId } };
    }
    if (clientId !== undefined) {
      updateData.client =
        clientId === null
          ? { disconnect: true }
          : { connect: { id: clientId } };
    }

    const task = await prisma.task.update({
      where: { id: idNum },
      data: updateData,
    });

    await logActivity({
      userId: req.user!.id,
      type: 'TASK_UPDATED',
      message: `updated task '${task.title}' to status ${status}`,
      targetType: 'Task',
      targetId: task.id,
    });
    res.status(200).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

export const deleteTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const { role, id } = req.user;
    const idNum = Number(req.params.id);

    if (!Number.isSafeInteger(idNum) || idNum <= 0)
      throw new AppError('Invalid task ID', 400);

    const existing = await prisma.task.findUnique({
      where: { id: idNum },
      include: { project: true },
    });
    if (!existing) throw new AppError('Task not found', 404);

    await ensureProjectAccess(existing.projectId, id, role);

    if (role === 'USER' && existing.assigneeId !== id) {
      throw new AppError('You can only delete your own tasks.', 403);
    }

    await prisma.task.delete({ where: { id: idNum } });

    await logActivity({
      userId: req.user!.id,
      type: 'TASK_DELETED',
      message: `deleted task '${existing.title}'`,
      targetType: 'Task',
      targetId: existing.id,
    });

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};
