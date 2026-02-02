import { prisma } from '@/lib/prisma.js';
import { AppError } from '@/utils/AppError.js';

export async function getAllProjects(userId: number, role: string) {
  const whereClause = role === 'SA' ? {} : { userId };

  return prisma.project.findMany({
    where: whereClause,
    include: {
      client: true,
      tasks: true,
      user: { select: { email: true, role: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createProject(
  userId: number,
  clientId: number | null,
  name: string,
  country?: string,
  contact?: string,
  status?: string
) {
  if (!name?.trim()) throw new AppError('Project name is required', 400);

  if (clientId !== null) {
    if (!Number.isSafeInteger(clientId))
      throw new AppError('Invalid clientId', 400);

    const clientExists = await prisma.client.findUnique({
      where: { id: clientId },
    });
    if (!clientExists) throw new AppError('Client does not exist', 400);
  }

  return prisma.project.create({
    data: {
      name: name.trim(),
      userId,
      clientId: clientId ?? null,
      country: country ?? null,
      contact: contact ?? null,
      status: status ?? 'Active',
    },
    include: { client: true },
  });
}

export async function updateProject(
  userId: number,
  role: string,
  id: number,
  name?: string,
  clientId?: number,
  country?: string,
  contact?: string,
  status?: string
) {
  if (!Number.isSafeInteger(id)) throw new AppError('Invalid project ID', 400);

  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing) throw new AppError('Project not found', 404);

  if (role !== 'SA' && existing.userId !== userId) {
    throw new AppError('Forbidden', 403);
  }

  const data: Partial<{
    name: string;
    clientId: number | null;
    country: string | null;
    contact: string | null;
    status: string;
  }> = {};

  if (name !== undefined) {
    const trimmed = name.trim();
    if (!trimmed) throw new AppError('Project name cannot be empty', 400);
    data.name = trimmed;
  }

  if (clientId !== undefined) {
    if (!Number.isSafeInteger(clientId) || clientId <= 0)
      throw new AppError('Invalid clientId', 400);

    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: { id: true, userId: true },
    });

    if (!client) throw new AppError('Client does not exist', 400);
    if (role !== 'SA' && client.userId !== userId)
      throw new AppError('Forbidden', 403);

    data.clientId = clientId;
  }

  if (country !== undefined) data.country = country ?? null;
  if (contact !== undefined) data.contact = contact ?? null;
  if (status !== undefined) data.status = status;

  return prisma.project.update({
    where: { id },
    data,
    include: { client: true },
  });
}

export async function deleteProject(userId: number, role: string, id: number) {
  if (!Number.isSafeInteger(id)) throw new AppError('Invalid project ID', 400);

  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing) throw new AppError('Project not found', 404);

  if (role !== 'SA' && existing.userId !== userId)
    throw new AppError('Forbidden', 403);

  await prisma.project.delete({ where: { id } });
}
