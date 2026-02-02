import { jwtDecode } from 'jwt-decode';

export type Role = 'USER' | 'ADMIN' | 'SA';

export const getToken = (key: string): string | undefined => {
  if (typeof window === 'undefined') return undefined;

  return localStorage.getItem(key) ?? sessionStorage.getItem(key) ?? undefined;
};

export const setToken = (key: string, value: string): void => {
  localStorage.setItem(key, value);
};

export const removeToken = (key: string): void => {
  localStorage.removeItem(key);
  sessionStorage.removeItem(key);
};

export const getAccessToken = (): string | undefined => {
  return getToken('accessToken');
};

export const getRole = (): Role | null => {
  const token = getAccessToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode<{ role?: Role }>(token);
    return decoded.role ?? null;
  } catch {
    return null;
  }
};

export const clearTokens = (): void => {
  removeToken('accessToken');
  removeToken('refreshToken');
};
