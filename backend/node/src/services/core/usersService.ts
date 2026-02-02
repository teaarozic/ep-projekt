import { prisma } from '@/lib/prisma.js';
import { AppError } from '@/utils/AppError.js';
import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  role: z.enum(['USER', 'ADMIN', 'SA']).optional(),
  status: z.enum(['Active', 'Inactive']).optional(),
});
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export async function getAllUsers(role: string) {
  if (role !== 'SA' && role !== 'ADMIN') {
    throw new AppError('Forbidden', 403);
  }

  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function updateUserRole(
  currentRole: string,
  id: number,
  newRole: string
) {
  if (currentRole !== 'SA') throw new AppError('Forbidden', 403);

  if (!['USER', 'ADMIN', 'SA'].includes(newRole)) {
    throw new AppError('Invalid role', 400);
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) throw new AppError('User not found', 404);

  if (existing.role === 'SA' && newRole !== 'SA') {
    const saCount = await prisma.user.count({ where: { role: 'SA' } });
    if (saCount <= 1) {
      throw new AppError('Cannot demote the last system admin', 400);
    }
  }

  return prisma.user.update({
    where: { id },
    data: { role: newRole as Role },
    select: { id: true, email: true, role: true },
  });
}

export async function createNewUser(
  currentRole: string,
  data: {
    name: string;
    email: string;
    password: string;
    role: 'USER' | 'ADMIN' | 'SA';
    status: 'Active' | 'Inactive';
  }
) {
  if (currentRole !== 'SA' && currentRole !== 'ADMIN')
    throw new AppError('Forbidden', 403);

  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (existing) throw new AppError('Email already exists', 400);

  const hashed = await bcrypt.hash(data.password, 10);

  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashed,
      role: data.role,
      status: data.status || 'Active',
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });
}

export async function updateUserStatus(
  currentRole: string,
  id: number,
  newStatus: string
) {
  if (!['SA', 'ADMIN'].includes(currentRole))
    throw new AppError('Forbidden', 403);

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) throw new AppError('User not found', 404);

  if (existing.role === 'SA' && currentRole !== 'SA') {
    throw new AppError('Only SA can modify SA users', 403);
  }

  return prisma.user.update({
    where: { id },
    data: { status: newStatus },
    select: { id: true, email: true, name: true, status: true },
  });
}

export async function updateUser(
  currentRole: string,
  id: number,
  data: UpdateUserInput
) {
  if (!['SA', 'ADMIN'].includes(currentRole))
    throw new AppError('Forbidden', 403);

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) throw new AppError('User not found', 404);

  if (existing.role === 'SA' && currentRole !== 'SA') {
    throw new AppError('Only SA can modify SA users', 403);
  }

  const parsed = updateUserSchema.parse(data);

  if (
    parsed.role &&
    parsed.role !== existing.role &&
    existing.role === 'SA' &&
    parsed.role !== 'SA'
  ) {
    const saCount = await prisma.user.count({ where: { role: 'SA' } });
    if (saCount <= 1) {
      throw new AppError('Cannot demote the last system admin', 400);
    }
  }

  return prisma.user.update({
    where: { id },
    data: {
      name: parsed.name ?? existing.name,
      role: (parsed.role as Role) ?? existing.role,
      status: parsed.status ?? existing.status,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });
}

export async function removeUser(
  currentRole: string,
  currentUserId: number,
  targetId: number
) {
  if (currentRole !== 'SA') throw new AppError('Forbidden', 403);
  if (currentUserId === targetId)
    throw new AppError('You cannot delete yourself', 400);

  const existing = await prisma.user.findUnique({ where: { id: targetId } });
  if (!existing) throw new AppError('User not found', 404);

  if (existing.role === 'SA') {
    const saCount = await prisma.user.count({ where: { role: 'SA' } });
    if (saCount <= 1)
      throw new AppError('Cannot delete the last Super Admin', 400);
  }

  await prisma.user.delete({ where: { id: targetId } });
  return true;
}

export async function getUserById(id: number) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });
}
