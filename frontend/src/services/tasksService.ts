import { apiClient } from '@/lib/apiClient';
import { API_PATHS } from '@/constants/apiPaths';
import { logger } from '@/utils/logger';

export interface Task {
  id: number;
  title: string;
  description?: string | null;
  done: boolean;
  status: string;
  progress?: number | null;
  createdAt: string;
  startDate?: string | null;
  endDate?: string | null;
  estimatedHours?: number | null;
  timeSpentHours?: number | null;
  projectId: number;

  project?: {
    name: string;
    client?: { name: string };
  };

  client?: { id: number; name: string };
  assignee?: { id: number; email: string };
}

export interface CreateTaskData {
  title: string;
  projectId: number;
  clientId?: number;
  assigneeId?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  estimatedHours?: number;
  done?: boolean;
}

export interface UpdateTaskData {
  title?: string;
  projectId?: number;
  clientId?: number;
  assigneeId?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  estimatedHours?: number;
  done?: boolean;
}

export const tasksService = {
  async getAll(signal?: AbortSignal): Promise<Task[]> {
    try {
      return await apiClient.get<Task[]>(API_PATHS.core.tasks.base, signal);
    } catch (error) {
      logger.error('Failed to fetch tasks:', error);
      throw new Error('Unable to load tasks. Please try again later.');
    }
  },

  async create(data: CreateTaskData): Promise<Task> {
    try {
      return await apiClient.post<Task>(API_PATHS.core.tasks.base, data);
    } catch (error) {
      logger.error('Failed to create task:', error);
      throw new Error(
        'Unable to create task. Please check your input and try again.'
      );
    }
  },

  async update(id: number | string, data: UpdateTaskData): Promise<Task> {
    try {
      const numId = Number(id);
      if (!numId || isNaN(numId) || numId <= 0) {
        throw new Error('Invalid task ID');
      }

      return await apiClient.put<Task>(API_PATHS.core.tasks.byId(numId), data);
    } catch (error) {
      logger.error(`Failed to update task (id=${id}):`, error);
      throw new Error('Unable to update task. Please try again later.');
    }
  },

  async delete(id: number): Promise<void> {
    try {
      if (!id || isNaN(id) || id <= 0) {
        throw new Error('Invalid task ID');
      }

      await apiClient.delete(API_PATHS.core.tasks.byId(id));
    } catch (error) {
      logger.error(`Failed to delete task (id=${id}):`, error);
      throw new Error('Unable to delete task. Please try again later.');
    }
  },

  async getStats(): Promise<{
    total: number;
    active: number;
    completed: number;
  }> {
    try {
      return await apiClient.get(API_PATHS.core.tasks.stats);
    } catch (error) {
      logger.error('Failed to load task stats:', error);
      throw new Error('Unable to load task statistics.');
    }
  },
};
