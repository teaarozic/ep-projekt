import { prisma } from '@/lib/prisma.js';
import { AppError } from '@/utils/AppError.js';
import { Prisma } from '@prisma/client';

export async function getAllClients(userId: number, role: string) {
  const where = ['SA', 'ADMIN'].includes(role) ? {} : { userId };

  return prisma.client.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      company: true,
      phone: true,
      status: true,
      createdAt: true,
      user: { select: { email: true } },

      projects: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createClient(
  userId: number,
  data: {
    name: string;
    email: string;
    company?: string | null;
    phone?: string | null;
    status?: string;
  }
) {
  const { name, email, company, phone, status } = data;

  try {
    return await prisma.client.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        company: company ?? null,
        phone: phone ?? null,
        status: status ?? 'Active',
        user: { connect: { id: userId } },
      },
    });
  } catch (err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (
        err.code === 'P2002' &&
        (err.meta?.target as string[])?.includes('email')
      ) {
        throw new AppError('A client with this email already exists.', 400);
      }
    }

    throw new AppError('Failed to create client.', 500);
  }
}

export async function updateClient(
  actorUserId: number,
  role: 'USER' | 'ADMIN' | 'SA',
  id: number,
  data: {
    name?: string;
    email?: string;
    company?: string | null;
    phone?: string | null;
    status?: string;
  }
) {
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new AppError('Invalid client ID', 400);
  }

  const existing = await prisma.client.findUnique({
    where: { id },
    select: { id: true, userId: true },
  });

  if (!existing) throw new AppError('Client not found', 404);
  if (!['ADMIN', 'SA'].includes(role) && existing.userId !== actorUserId) {
    throw new AppError('Forbidden', 403);
  }

  const updateData: Record<string, string | null> = {};

  if (data.name !== undefined) updateData.name = data.name.trim();
  if (data.email !== undefined) updateData.email = data.email.trim();
  if (data.company !== undefined)
    updateData.company = data.company?.trim() ?? null;
  if (data.phone !== undefined) updateData.phone = data.phone?.trim() ?? null;
  if (data.status !== undefined) updateData.status = data.status;

  try {
    return await prisma.client.update({
      where: { id },
      data: updateData,
    });
  } catch (err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (
        err.code === 'P2002' &&
        (err.meta?.target as string[])?.includes('email')
      ) {
        throw new AppError('A client with this email already exists.', 400);
      }
    }
    throw err;
  }
}

export async function deleteClient(
  actorUserId: number,
  role: 'USER' | 'ADMIN' | 'SA',
  id: number
) {
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new AppError('Invalid client ID', 400);
  }

  const existing = await prisma.client.findUnique({
    where: { id },
    select: { id: true, userId: true },
  });

  if (!existing) throw new AppError('Client not found', 404);
  if (!['ADMIN', 'SA'].includes(role) && existing.userId !== actorUserId) {
    throw new AppError('Forbidden', 403);
  }

  try {
    await prisma.client.delete({ where: { id } });
  } catch (err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2025') {
        throw new AppError('Client not found or already deleted', 404);
      }
    }
    throw err;
  }
}
