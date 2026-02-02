import { apiClient } from '@/lib/apiClient';
import { API_PATHS } from '@/constants/apiPaths';

export interface Client {
  id: number;
  name: string;
  email: string;
  company?: string | null;
  phone?: string | null;
  status: 'Active' | 'Inactive';
  createdAt: string;
  user?: { email: string };
  projects?: { id: number; name: string }[];
  _count?: { projects: number };
}

export const clientsService = {
  async getAll() {
    return apiClient.get<Client[]>(API_PATHS.core.clients.base);
  },

  async create(data: Partial<Client>) {
    return apiClient.post<Client>(API_PATHS.core.clients.base, data);
  },

  async update(id: number, data: Partial<Client>) {
    return apiClient.put<Client>(API_PATHS.core.clients.byId(id), data);
  },

  async remove(id: number) {
    await apiClient.delete(API_PATHS.core.clients.byId(id));
  },

  async getNextId(): Promise<number> {
    return apiClient.get<number>(API_PATHS.core.clients.nextId);
  },
};
