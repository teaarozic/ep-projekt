import { z } from 'zod';

export const taskSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters' }),
  done: z.boolean().optional(),
  projectId: z.number().optional(),
});

export type TaskFormData = z.infer<typeof taskSchema>;
