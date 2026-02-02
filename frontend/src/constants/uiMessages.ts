export const MESSAGES = {
  auth: {
    loginSuccess: 'Login successful! Redirecting...',
    loginFailed: 'Invalid email or password.',
    registerSuccess: 'Registration successful! Redirecting to login...',
    logoutSuccess: 'You have been logged out.',
  },
  projects: {
    selectProject: 'Please select a project before creating a task.',
    createSuccess: (name: string) => `Project "${name}" created successfully.`,
    updateSuccess: (name: string) => `Project renamed to "${name}".`,
    deleteSuccess: 'Project deleted successfully.',
    deleteConfirm: 'Are you sure you want to delete this project?',
    loadError: 'Failed to load projects.',
    noProjectsFound: 'No projects found.',
  },
  tasks: {
    selectProject: 'Please select a project before creating a task.',
    createSuccess: (title: string) => `Task "${title}" added to project.`,
    updateSuccess: (title: string) => `Task renamed to "${title}".`,
    deleteSuccess: 'Task deleted successfully.',
    deleteConfirm: 'Are you sure you want to delete this task?',
    toggleDone: (title: string, done: boolean) =>
      `Task "${title}" marked as ${done ? 'done' : 'pending'}.`,
    noTasksFound: 'No tasks found.',
  },
  users: {
    createSuccess: (name: string) => `User "${name}" created successfully.`,
    updateSuccess: (name: string) => `User "${name}" updated successfully.`,
    deleteSuccess: 'User deleted successfully.',
    deleteConfirm: 'Are you sure you want to delete this user?',
    loadError: 'Failed to load users.',
    noUsersFound: 'No users found.',
  },
  clients: {
    createSuccess: (name: string) => `Client "${name}" created successfully.`,
    updateSuccess: (name: string) => `Client "${name}" updated successfully.`,
    deleteSuccess: 'Client deleted successfully.',
    deleteConfirm: 'Are you sure you want to delete this client?',
    loadError: 'Failed to load clients.',
    noClientsFound: 'No clients found.',
  },

  common: {
    unknownError: 'Unknown error occurred. Please try again.',
    loadingData: 'Loading data...',
    noDataFound: 'No data found.',
  },
} as const;
