import { API_URL } from './config';
import { getToken } from './tokenStore';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

let onUnauthorized: (() => void) | null = null;

// The auth provider registers this so an expired token signs the student out everywhere.
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

type Options = { method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'; body?: unknown; auth?: boolean };

export async function api<T>(path: string, { method = 'GET', body, auth = true }: Options = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = await getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      // The backend also sets a web cookie; the app relies on the Bearer header only.
      credentials: 'omit',
    });
  } catch {
    throw new ApiError(0, 'Internet connection check karo aur dobara try karo.');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && auth) onUnauthorized?.();
    // Validation failures come back as { error, details: [{ field, message }] }
    const message =
      data?.message || data?.details?.[0]?.message || data?.error || 'Kuch gadbad ho gayi. Thodi der baad try karo.';
    throw new ApiError(res.status, message);
  }
  return data as T;
}
