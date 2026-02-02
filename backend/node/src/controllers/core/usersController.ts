import { Response, NextFunction } from 'express';
import { AuthRequest } from '@/middleware/authMiddleware.js';
import { AppError } from '@/utils/AppError.js';
import { z } from 'zod';
import {
  getAllUsers,
  updateUserRole,
  createNewUser,
  updateUserStatus,
  updateUser as updateUserService,
  removeUser,
} from '@/services/core/usersService.js';
import { getUserById as getUserByIdService } from '@/services/core/usersService.js';

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  role: z.enum(['USER', 'ADMIN', 'SA']).optional(),
  status: z.enum(['Active', 'Inactive']).optional(),
});
type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const getUsers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const users = await getAllUsers(req.user.role);
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);

    const { id } = z
      .object({ id: z.coerce.number().int().positive() })
      .parse(req.params);

    const user = await getUserByIdService(id);

    if (!user) throw new AppError('User not found', 404);

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const changeRole = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const { id } = z
      .object({ id: z.coerce.number().int().positive() })
      .parse(req.params);

    const { role } = z
      .strictObject({ role: z.enum(['USER', 'ADMIN', 'SA']) })
      .parse(req.body);

    if (req.user.id === id) {
      throw new AppError('You cannot change your own role', 400);
    }

    const user = await updateUserRole(req.user.role, id, role);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const createUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);

    const body = z
      .object({
        name: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(6),
        role: z.enum(['USER', 'ADMIN', 'SA']).default('USER'),
        status: z.enum(['Active', 'Inactive']).default('Active'),
      })
      .parse(req.body);

    const newUser = await createNewUser(req.user.role, body);
    res.status(201).json({ success: true, data: newUser });
  } catch (err) {
    next(err);
  }
};

export const changeStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);

    const { id } = z
      .object({ id: z.coerce.number().int().positive() })
      .parse(req.params);
    const { status } = z
      .object({ status: z.enum(['Active', 'Inactive']) })
      .parse(req.body);

    const updated = await updateUserStatus(req.user.role, id, status);
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);

    const { id } = z
      .object({ id: z.coerce.number().int().positive() })
      .parse(req.params);

    const body: UpdateUserInput = updateUserSchema.parse(req.body);

    const updated = await updateUserService(req.user!.role, id, body);

    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);

    const { id } = z
      .object({ id: z.coerce.number().int().positive() })
      .parse(req.params);
    await removeUser(req.user.role, req.user.id, id);

    res
      .status(200)
      .json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
};
