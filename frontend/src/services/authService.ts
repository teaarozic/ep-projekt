import { apiClient } from '@/lib/apiClient';
import { API_PATHS } from '@/constants/apiPaths';
import { logger } from '@/utils/logger';
import { getToken, setToken, removeToken } from '@/utils/auth';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEYS = ['user', 'userEmail'];

export function clearAllAuthData(): void {
  [...USER_KEYS, ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY].forEach((key) => {
    removeToken(key);
  });
  logger.info('Auth data cleared');
}

export const authService = {
  async login(data: { email: string; password: string }) {
    try {
      const tokens = await apiClient.post<{
        accessToken: string;
        refreshToken: string;
      }>(API_PATHS.auth.login, data);

      if (!tokens?.accessToken || !tokens?.refreshToken) {
        throw new Error('Invalid token response from server.');
      }

      setToken(ACCESS_TOKEN_KEY, tokens.accessToken);
      setToken(REFRESH_TOKEN_KEY, tokens.refreshToken);

      logger.info('User successfully logged in');
      return tokens;
    } catch (error) {
      logger.error('Login failed:', error);
      throw new Error('Unable to login. Please check your credentials.');
    }
  },

  async register(data: { email: string; password: string }) {
    try {
      return await apiClient.post<{ id: number; email: string }>(
        API_PATHS.auth.register,
        data
      );
    } catch (error) {
      logger.error('User registration failed:', error);
      throw new Error('Unable to register. Please try again.');
    }
  },

  async refresh() {
    const refreshToken = getToken(REFRESH_TOKEN_KEY);
    if (!refreshToken) return null;

    try {
      const tokens = await apiClient.post<{
        accessToken: string;
        refreshToken: string;
      }>(API_PATHS.auth.refresh, { refreshToken });

      setToken(ACCESS_TOKEN_KEY, tokens.accessToken);
      setToken(REFRESH_TOKEN_KEY, tokens.refreshToken);

      logger.info('Access token refreshed');
      return tokens;
    } catch {
      logger.warn('Token refresh failed, clearing session.');
      clearAllAuthData();
      return null;
    }
  },

  logout() {
    clearAllAuthData();
    logger.info('User logged out');
  },
};
