import { Response, NextFunction } from 'express';
import { AuthRequest } from '@/middleware/authMiddleware.js';
import { AppError } from '@/utils/AppError.js';
import { z } from 'zod';
import { prisma } from '@/lib/prisma.js';
import { logActivity } from '@/utils/activityLogger.js';

const createProjectSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters long'),
  clientId: z.number().int().positive().optional(),
  country: z.string().optional(),
  contact: z.string().email('Invalid contact email').optional(),
  status: z.enum(['Active', 'Inactive']).optional(),
});

const updateProjectSchema = z.object({
  name: z.string().min(2).optional(),
  clientId: z.number().int().positive().optional(),
  country: z.string().optional(),
  contact: z.string().email('Invalid contact email').optional(),
  status: z.enum(['Active', 'Inactive']).optional(),
});

export const getProjects = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const { id, role } = req.user;

    let where = {};

    if (role === 'USER') {
      where = {
        OR: [
          { userId: id },
          { assignedUsers: { some: { id } } },
          { tasks: { some: { assigneeId: id } } },
        ],
      };
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        client: true,
        tasks: true,
        assignedUsers: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ success: true, data: projects });
  } catch (err) {
    next(err);
  }
};

export const getProjectById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const user = req.user;

    const projectId = Number(req.params.id);
    if (!Number.isSafeInteger(projectId) || projectId <= 0)
      throw new AppError('Invalid project ID', 400);

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        client: true,
        tasks: { select: { assigneeId: true } },
        assignedUsers: { select: { id: true } },
      },
    });

    if (!project) throw new AppError('Project not found', 404);

    if (user.role === 'USER') {
      const isOwner = project.userId === user.id;
      const isAssignedUser = project.assignedUsers.some(
        (assigned) => assigned.id === user.id
      );
      const isTaskAssignee = project.tasks.some(
        (task) => task.assigneeId === user.id
      );

      if (!isOwner && !isAssignedUser && !isTaskAssignee) {
        throw new AppError('Forbidden', 403);
      }
    }

    res.status(200).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};

export const addProject = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const { id: userId, role } = req.user;

    const parse = createProjectSchema.safeParse(req.body);
    if (!parse.success) {
      const firstError = parse.error.issues?.[0]?.message || 'Invalid input';
      throw new AppError(firstError, 400);
    }

    const { name, clientId, country, contact, status } = parse.data;

    if (role === 'USER' && clientId) {
      throw new AppError('You cannot assign a client to a project.', 403);
    }

    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        clientId: clientId ?? null,
        userId,
        country: country ?? null,
        contact: contact ?? null,
        status: status ?? 'Active',
      },
      include: { client: true },
    });

    await logActivity({
      userId: req.user!.id,
      type: 'PROJECT_CREATED',
      message: `created project '${project.name}'`,
      targetType: 'Project',
      targetId: project.id,
    });

    res.status(201).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};

export const editProject = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const { id: userId, role } = req.user;

    const projectId = Number(req.params.id);
    if (!Number.isSafeInteger(projectId) || projectId <= 0)
      throw new AppError('Invalid project ID', 400);

    const parse = updateProjectSchema.safeParse(req.body);
    if (!parse.success) {
      const firstError = parse.error.issues?.[0]?.message || 'Invalid input';
      throw new AppError(firstError, 400);
    }

    const { name, clientId, country, contact, status } = parse.data;

    const existing = await prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!existing) throw new AppError('Project not found', 404);

    if (role === 'USER' && existing.userId !== userId)
      throw new AppError('You can only edit your own projects.', 403);

    if (role === 'USER' && clientId !== undefined)
      throw new AppError('You cannot assign a client to a project.', 403);

    const updateData: Partial<{
      name: string;
      clientId: number | null;
      country: string | null;
      contact: string | null;
      status: string;
    }> = {};

    if (name !== undefined) {
      const trimmed = name.trim();
      if (!trimmed) throw new AppError('Project name cannot be empty', 400);
      updateData.name = trimmed;
    }

    if (clientId !== undefined) {
      if (!Number.isSafeInteger(clientId) || clientId <= 0)
        throw new AppError('Invalid client ID', 400);

      const client = await prisma.client.findUnique({
        where: { id: clientId },
        select: { id: true, userId: true },
      });

      if (!client) throw new AppError('Client does not exist', 400);
      if (role === 'USER' && client.userId !== userId)
        throw new AppError('Forbidden: client does not belong to you', 403);

      updateData.clientId = clientId;
    }

    if (country !== undefined) updateData.country = country ?? null;
    if (contact !== undefined) updateData.contact = contact ?? null;
    if (status !== undefined) updateData.status = status;

    const project = await prisma.project.update({
      where: { id: projectId },
      data: updateData,
      include: { client: true },
    });

    await logActivity({
      userId: req.user!.id,
      type: 'PROJECT_UPDATED',
      message: `updated project '${project.name}'`,
      targetType: 'Project',
      targetId: project.id,
    });

    res.status(200).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};

export const removeProject = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const { id: userId, role } = req.user;

    const projectId = Number(req.params.id);
    if (!Number.isSafeInteger(projectId) || projectId <= 0)
      throw new AppError('Invalid project ID', 400);

    const existing = await prisma.project.findUnique({
      where: { id: projectId },
      include: { tasks: true },
    });

    if (!existing) throw new AppError('Project not found', 404);

    if (role === 'USER' && existing.userId !== userId)
      throw new AppError('You can only delete your own projects.', 403);

    if (existing.tasks.length > 0)
      throw new AppError('Cannot delete project with existing tasks.', 400);

    await prisma.project.delete({ where: { id: projectId } });

    await logActivity({
      userId: req.user!.id,
      type: 'PROJECT_DELETED',
      message: `deleted project '${existing.name}'`,
      targetType: 'Project',
      targetId: existing.id,
    });

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

export const getNextProjectId = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const lastProject = await prisma.project.findFirst({
      orderBy: { id: 'desc' },
      select: { id: true },
    });

    const nextId = (lastProject?.id ?? 0) + 1;
    res.status(200).json({ success: true, nextId });
  } catch (err) {
    next(err);
  }
};
