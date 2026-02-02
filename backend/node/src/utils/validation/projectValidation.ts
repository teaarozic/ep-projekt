import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Project name cannot be empty' })
    .max(50, { message: 'Project name must be at most 50 characters long' }),
});

export const updateProjectSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Project name cannot be empty' })
    .max(50, { message: 'Project name must be at most 50 characters long' })
    .optional(),
});
