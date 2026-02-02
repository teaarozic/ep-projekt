import { apiClient } from '@/lib/apiClient';
import { API_PATHS } from '@/constants/apiPaths';
import { logger } from '@/utils/logger';

export interface User {
  id: number;
  name: string | null;
  email: string;
  role: 'USER' | 'ADMIN' | 'SA';
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: 'USER' | 'ADMIN' | 'SA';
  status: 'Active' | 'Inactive';
}

export interface UpdateUserData {
  name?: string;
  role?: 'USER' | 'ADMIN' | 'SA';
  status?: 'Active' | 'Inactive';
}

export const usersService = {
  async getAll(): Promise<User[]> {
    try {
      return await apiClient.get<User[]>(API_PATHS.core.users.base);
    } catch (error) {
      logger.error('Failed to fetch users:', error);
      throw new Error('Unable to load users. Please try again later.');
    }
  },

  async getMe(): Promise<User> {
    try {
      return await apiClient.get<User>(API_PATHS.core.users.me);
    } catch (error) {
      logger.error('Failed to fetch current user:', error);
      throw new Error('Unable to load user data.');
    }
  },

  async getById(id: number): Promise<User> {
    try {
      return await apiClient.get<User>(API_PATHS.core.users.byId(id));
    } catch (error) {
      logger.error(`Failed to fetch user (id=${id}):`, error);
      throw new Error('Unable to fetch user details.');
    }
  },

  async create(data: CreateUserData): Promise<User> {
    try {
      return await apiClient.post<User>(API_PATHS.core.users.base, data);
    } catch (error) {
      logger.error('Failed to create user:', error);
      throw new Error('Unable to create user. Please try again later.');
    }
  },

  async updateStatus(id: number, status: 'Active' | 'Inactive'): Promise<User> {
    try {
      return await apiClient.patch<User>(API_PATHS.core.users.status(id), {
        status,
      });
    } catch (error) {
      logger.error(`Failed to update user status (id=${id}):`, error);
      throw new Error('Unable to update user status.');
    }
  },

  async update(id: number, data: UpdateUserData): Promise<User> {
    try {
      return await apiClient.put<User>(API_PATHS.core.users.byId(id), data);
    } catch (error) {
      logger.error(`Failed to update user (id=${id}):`, error);
      throw new Error('Unable to update user.');
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await apiClient.delete(API_PATHS.core.users.byId(id));
    } catch (error) {
      logger.error(`Failed to delete user (id=${id}):`, error);
      throw new Error('Unable to delete user.');
    }
  },
};
