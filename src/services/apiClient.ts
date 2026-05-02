/**
 * Thin HTTP client used by the rest of the app.
 *
 * The real backend doesn't exist yet, so this client is wired up to
 * be drop-in compatible with `fetch` while exposing a small surface
 * area for typed requests. When the backend is ready, the rest of
 * the app shouldn't need to change.
 */
import type { ApiError } from '@/types';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

export class HttpError extends Error implements ApiError {
  status: number;
  details?: Record<string, string>;

  constructor(status: number, message: string, details?: Record<string, string>) {
    super(message);
    this.status = status;
    this.name = 'HttpError';
    if (details) this.details = details;
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  /** Skip JSON parsing of body (e.g. for FormData uploads). */
  isFormData?: boolean;
}

/** Make a typed JSON request. */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, isFormData, headers, ...rest } = options;

  const finalHeaders = new Headers(headers);
  if (!isFormData && body !== undefined) {
    finalHeaders.set('Content-Type', 'application/json');
  }
  finalHeaders.set('Accept', 'application/json');

  // Inject auth token if present
  try {
    const session = localStorage.getItem('aidc.auth.session');
    if (session) {
      const parsed = JSON.parse(session) as { token?: string };
      if (parsed?.token) finalHeaders.set('Authorization', `Bearer ${parsed.token}`);
    }
  } catch {
    /* ignore */
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    body: isFormData ? (body as BodyInit) : body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let payload: { message?: string; details?: Record<string, string> } = {};
    try {
      payload = await response.json();
    } catch {
      /* ignore */
    }
    throw new HttpError(
      response.status,
      payload.message || response.statusText || 'Request failed',
      payload.details,
    );
  }

  // Empty body case
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PUT', body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
  baseUrl: BASE_URL,
};
