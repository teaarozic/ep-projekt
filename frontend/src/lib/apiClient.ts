import { logger } from '@/utils/logger';
import { authService } from '@/services/authService';
import { getToken } from '@/utils/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL?.trim();

if (!API_URL) {
  logger.error('NEXT_PUBLIC_API_URL environment variable is not set.');
  throw new Error(
    'NEXT_PUBLIC_API_URL environment variable is not set. Please check your .env.local file.'
  );
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers({
    'Content-Type': 'application/json',
  });

  if (options.headers) {
    const providedHeaders = new Headers(options.headers);
    providedHeaders.forEach((value, key) => headers.set(key, value));
  }

  const storedToken = getToken('accessToken');
  if (storedToken) {
    headers.set('Authorization', `Bearer ${storedToken}`);
  }

  const url = `${API_URL}${path}`;
  logger.info('API CALL:', url, options.method || 'GET');

  let res: Response;

  try {
    res = await fetch(url, { ...options, headers });

    if (res.status === 401) {
      logger.warn('Access token expired, attempting refresh...');
      const refreshed = await authService.refresh?.();

      if (refreshed?.accessToken) {
        headers.set('Authorization', `Bearer ${refreshed.accessToken}`);
        res = await fetch(url, { ...options, headers });
      }
    }

    if (!res.ok) {
      let message = `HTTP ${res.status}`;

      try {
        const json = await res.json();
        if (json?.error) message = json.error;
        else if (json?.message) message = json.message;
      } catch {
        const text = await res.text();
        message = text || message;
      }

      logger.error('API ERROR:', message, '→', path);
      throw new Error(message);
    }

    if (res.status === 204) {
      return null as T;
    }

    const data = await res.json();

    if (data && typeof data === 'object' && 'data' in data) {
      return data.data;
    }

    return data;
  } catch (err) {
    logger.error('Fetch failed:', err);
    throw err;
  }
}

interface ApiClient {
  get: <T>(path: string, signal?: AbortSignal) => Promise<T>;
  post: <T>(path: string, body?: unknown) => Promise<T>;
  postForm: <T>(path: string, formData: FormData) => Promise<T>;
  put: <T>(path: string, body?: unknown) => Promise<T>;
  patch: <T>(path: string, body?: unknown) => Promise<T>;
  delete: <T>(path: string) => Promise<T>;
}

export const apiClient: ApiClient = {
  get: <T>(path: string, signal?: AbortSignal): Promise<T> =>
    apiFetch<T>(path, { method: 'GET', signal }),

  post: <T>(path: string, body?: unknown): Promise<T> =>
    apiFetch<T>(path, { method: 'POST', body: JSON.stringify(body) }),

  postForm: async <T>(path: string, formData: FormData): Promise<T> => {
    const url = `${API_URL}${path}`;

    const headers = new Headers();
    const storedToken = getToken('accessToken');
    if (storedToken) {
      headers.set('Authorization', `Bearer ${storedToken}`);
    }

    const res = await fetch(url, {
      method: 'POST',
      body: formData,
      headers,
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(txt || `HTTP ${res.status}`);
    }

    const data = await res.json();
    return data.data ?? data;
  },

  put: <T>(path: string, body?: unknown): Promise<T> =>
    apiFetch<T>(path, { method: 'PUT', body: JSON.stringify(body) }),

  patch: <T>(path: string, body?: unknown): Promise<T> =>
    apiFetch<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),

  delete: <T>(path: string): Promise<T> =>
    apiFetch<T>(path, { method: 'DELETE' }),
};
