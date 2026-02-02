import { prisma } from '@/lib/prisma.js';
import { AppError } from '@/utils/AppError.js';
import type { Prisma } from '@prisma/client';

export async function getAllTasks(
  userId: number,
  role: string,
  page = 1,
  limit = 50
) {
  const skip = (page - 1) * limit;

  const whereClause =
    role === 'SA' ? {} : { OR: [{ userId }, { assigneeId: userId }] };

  return prisma.task.findMany({
    where: whereClause,
    include: {
      project: { include: { client: true } },
      user: true,
      assignee: true,
      client: true,
    },
    take: limit,
    skip,
    orderBy: { createdAt: 'desc' },
  });
}

export async function createTask(
  userId: number,
  role: string,
  data: Prisma.TaskCreateInput
) {
  const projectId = data.project.connect?.id;
  if (!projectId) throw new AppError('Project ID is required', 400);

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { client: true },
  });
  if (!project) throw new AppError('Project not found', 404);

  if (role !== 'SA' && project.userId !== userId)
    throw new AppError('Forbidden: cannot add task to this project', 403);

  return prisma.task.create({
    data,
    include: {
      project: { include: { client: true } },
      user: true,
      assignee: true,
      client: true,
    },
  });
}

export async function updateTask(
  userId: number,
  role: string,
  id: number,
  data: Prisma.TaskUpdateInput
) {
  const task = await prisma.task.findUnique({
    where: { id },
    include: { project: true },
  });
  if (!task) throw new AppError('Task not found', 404);

  if (role !== 'SA' && task.userId !== userId)
    throw new AppError('Forbidden', 403);

  return prisma.task.update({
    where: { id },
    data,
    include: {
      project: { include: { client: true } },
      user: true,
      assignee: true,
      client: true,
    },
  });
}

export async function deleteTask(userId: number, role: string, id: number) {
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) throw new AppError('Task not found', 404);

  if (role !== 'SA' && task.userId !== userId)
    throw new AppError('Forbidden', 403);

  await prisma.task.delete({ where: { id } });
}
