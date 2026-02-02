import { apiClient } from '@/lib/apiClient';
import { API_PATHS } from '@/constants/apiPaths';

export interface Activity {
  id: number;
  actor: string;
  action: string;
  createdAt: string;
}

export interface Task {
  id: number;
  title: string;
  status: string;
  project?: {
    id: number;
    name: string;
  } | null;
}

export const dashboardService = {
  async getRecentActivities(): Promise<Activity[]> {
    return apiClient.get<Activity[]>(API_PATHS.core.dashboard.recent);
  },

  async getMyTasks(): Promise<Task[]> {
    return apiClient.get<Task[]>(API_PATHS.core.dashboard.myTasks);
  },
};
