import { apiClient } from '@/lib/apiClient';
import { API_PATHS } from '@/constants/apiPaths';
import { logger } from '@/utils/logger';

export interface Project {
  id: number;
  name: string;
  country?: string | null;
  status: 'Active' | 'Inactive';
  createdAt: string;
  clientId?: number | null;
  userId: number;
  client?: {
    id: number;
    name: string;
    email: string;
  } | null;
  tasks?: {
    id: number;
    title: string;
    done: boolean;
  }[];
}

export interface CreateProjectData {
  name: string;
  country?: string;
  status?: 'Active' | 'Inactive';
  clientId?: number | null;
}

export interface UpdateProjectData {
  name?: string;
  country?: string;
  status?: 'Active' | 'Inactive';
  clientId?: number | null;
}

export const projectsService = {
  async getAll(signal?: AbortSignal): Promise<Project[]> {
    try {
      return await apiClient.get<Project[]>(
        API_PATHS.core.projects.base,
        signal
      );
    } catch (error) {
      logger.error('Failed to fetch projects:', error);
      throw new Error('Unable to load projects. Please try again later.');
    }
  },

  async getById(id: number): Promise<Project> {
    try {
      return await apiClient.get<Project>(API_PATHS.core.projects.byId(id));
    } catch (error) {
      logger.error(`Failed to fetch project (id=${id}):`, error);
      throw new Error('Unable to fetch project details.');
    }
  },

  async create(data: CreateProjectData): Promise<Project> {
    try {
      return await apiClient.post<Project>(API_PATHS.core.projects.base, data);
    } catch (error) {
      logger.error('Failed to create project:', error);
      throw new Error(
        'Unable to create project. Please check your input and try again.'
      );
    }
  },

  async update(id: number, data: UpdateProjectData): Promise<Project> {
    try {
      return await apiClient.put<Project>(
        API_PATHS.core.projects.byId(id),
        data
      );
    } catch (error) {
      logger.error(`Failed to update project (id=${id}):`, error);
      throw new Error('Unable to update project. Please try again later.');
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await apiClient.delete(API_PATHS.core.projects.byId(id));
    } catch (error) {
      logger.error(`Failed to delete project (id=${id}):`, error);
      throw new Error('Unable to delete project. Please try again later.');
    }
  },

  async getNextId(): Promise<number> {
    try {
      const res = await apiClient.get<{ nextId: number }>(
        API_PATHS.core.projects.nextId
      );
      return res.nextId;
    } catch (error) {
      logger.error('Failed to fetch next project ID:', error);
      throw new Error('Unable to fetch next project ID.');
    }
  },
};
