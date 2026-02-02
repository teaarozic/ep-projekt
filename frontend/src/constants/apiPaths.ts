export const API_PATHS = {
  auth: {
    register: '/api/v1/auth/register',
    login: '/api/v1/auth/login',
    refresh: '/api/v1/auth/refresh',
  },

  core: {
    results: '/api/core/results',

    projects: {
      base: '/api/v1/projects',
      byId: (id: number | string) => `/api/v1/projects/${id}`,
      nextId: '/api/v1/projects/next-id',
    },

    tasks: {
      base: '/api/v1/tasks',
      byId: (id: number | string) => `/api/v1/tasks/${id}`,
      stats: '/api/v1/tasks/stats',
    },

    clients: {
      base: '/api/core/clients',
      byId: (id: number | string) => `/api/core/clients/${id}`,
      nextId: '/api/core/clients/next-id',
    },

    users: {
      base: '/api/core/users',
      me: '/api/core/users/me',
      byId: (id: number | string) => `/api/core/users/${id}`,
      status: (id: number | string) => `/api/core/users/${id}/status`,
    },

    dashboard: {
      recent: '/api/core/dashboard/recent-activities',
      myTasks: '/api/core/dashboard/my-tasks',
    },

    ai: {
      summarize: '/api/core/ai/summarize',
      sentiment: '/api/core/ai/sentiment',
      csv: '/api/core/ai/csv',
    },
  },
};
