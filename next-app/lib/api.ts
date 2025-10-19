// Simple API client with base URL and auth header
export type ApiOptions = {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
};

const API_BASE_URL = (() => {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';
  return base.endsWith('/') ? base.slice(0, -1) : base;
})();

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem('admin_token');
  } catch {
    return null;
  }
}

export async function api(path: string, opts: ApiOptions = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  const token = getToken();
  const isForm = typeof FormData !== 'undefined' && opts.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isForm ? {} : { 'Content-Type': 'application/json' }),
    ...(opts.headers || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, {
    method: opts.method || 'GET',
    headers,
    body: opts.body
      ? isForm
        ? (opts.body as any)
        : typeof opts.body === 'string'
        ? opts.body
        : JSON.stringify(opts.body)
      : undefined,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const message = (data && (data.message || data.error)) || res.statusText || 'Request failed';
    throw new Error(message);
  }
  return data;
}

export const apiGet = <T = any>(path: string) => api(path) as Promise<T>;
export const apiPost = <T = any>(path: string, body?: any) => api(path, { method: 'POST', body }) as Promise<T>;
export const apiPut = <T = any>(path: string, body?: any) => api(path, { method: 'PUT', body }) as Promise<T>;
export const apiDelete = <T = any>(path: string) => api(path, { method: 'DELETE' }) as Promise<T>;

export async function apiGetWithHeaders<T = any>(path: string): Promise<{ data: T; headers: Headers }>{
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, {
    method: 'GET',
    headers,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const message = (data && (data.message || data.error)) || res.statusText || 'Request failed';
    throw new Error(message);
  }
  return { data, headers: res.headers } as { data: T; headers: Headers };
}
