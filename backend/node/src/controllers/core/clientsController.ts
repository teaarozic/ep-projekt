import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '@/middleware/authMiddleware.js';
import {
  getAllClients,
  createClient,
  updateClient,
  deleteClient,
} from '@/services/core/clientsService.js';
import { AppError } from '@/utils/AppError.js';
import { prisma } from '@/lib/prisma.js';
import { z } from 'zod';

const clientSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  email: z.string().email('Invalid email').trim(),
  company: z.string().trim().optional().nullable(),
  phone: z.string().trim().optional().nullable(),
  status: z.enum(['Active', 'Inactive']).default('Active'),
});

export const getClients = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const clients = await getAllClients(req.user.id, req.user.role);
    res.status(200).json({ success: true, data: clients });
  } catch (err) {
    next(err);
  }
};

export const addClient = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);

    const userId = req.user.id;
    const parsed = clientSchema.parse(req.body);

    const data = {
      name: parsed.name.trim(),
      email: parsed.email.trim(),
      company: parsed.company?.trim() ?? null,
      phone: parsed.phone?.trim() ?? null,
      status: parsed.status ?? 'Active',
    };

    const client = await createClient(userId, data);
    res.status(201).json({ success: true, data: client });
  } catch (err: unknown) {
    next(err);
  }
};

export const editClient = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);

    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id <= 0)
      throw new AppError('Invalid ID', 400);

    const parsed = clientSchema.partial().parse(req.body);

    const data = {
      ...(parsed.name !== undefined && { name: parsed.name.trim() }),
      ...(parsed.email !== undefined && { email: parsed.email.trim() }),
      ...(parsed.company !== undefined && {
        company: parsed.company?.trim() ?? null,
      }),
      ...(parsed.phone !== undefined && {
        phone: parsed.phone?.trim() ?? null,
      }),
      ...(parsed.status !== undefined && { status: parsed.status }),
    };

    const client = await updateClient(req.user.id, req.user.role, id, data);
    res.status(200).json({ success: true, data: client });
  } catch (err) {
    next(err);
  }
};

export const removeClient = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);

    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id <= 0)
      throw new AppError('Invalid ID', 400);

    await deleteClient(req.user.id, req.user.role, id);
    res
      .status(200)
      .json({ success: true, message: 'Client deleted successfully' });
  } catch (err) {
    next(err);
  }
};

export const getNextClientId = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const lastClient = await prisma.client.findFirst({
      orderBy: { id: 'desc' },
      select: { id: true },
    });
    const nextId = lastClient ? lastClient.id + 1 : 1;
    res.json({ success: true, data: nextId });
  } catch (err) {
    next(err);
  }
};
