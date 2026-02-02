import { clearAllAuthData } from '@/services/authService';

export const clearHistoryAndNavigate = (url: string): void => {
  if (window.history.length > 1) {
    window.history.go(-(window.history.length - 1));
  }

  setTimeout(() => {
    window.history.replaceState(null, '', url);
    window.location.href = url;
  }, 100);
};

export const clearAuthData = (): void => {
  clearAllAuthData();
};
