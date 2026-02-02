import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(1, { message: 'Task title cannot be empty' }),

  projectId: z.coerce
    .number()
    .positive({ message: 'projectId must be a positive number' }),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1, 'Task title cannot be empty').optional(),
  done: z.boolean().optional(),
});
