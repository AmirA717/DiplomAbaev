import { createApiError } from './errors';

interface ApiClientConfig {
  getAccessToken: () => string | null;
  onUnauthorized: () => void;
}

interface QueryValue {
  [key: string]: string | number | boolean | null | undefined;
}

interface RequestOptions<TBody> {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  query?: QueryValue;
  body?: TBody;
  signal?: AbortSignal;
  headers?: Record<string, string>;
}

const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000').replace(/\/$/, '');

let config: ApiClientConfig = {
  getAccessToken: () => null,
  onUnauthorized: () => undefined,
};

export function configureApiClient(nextConfig: Partial<ApiClientConfig>) {
  config = {
    ...config,
    ...nextConfig,
  };
}

export function buildApiUrl(path: string, query?: QueryValue) {
  const normalizedPath = path.startsWith('http')
    ? path
    : `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const url = new URL(normalizedPath);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return url;
}

function safeParseJson(raw: string): unknown {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return raw;
  }
}

export async function request<TResponse, TBody = unknown>(
  path: string,
  options: RequestOptions<TBody> = {},
): Promise<TResponse> {
  const { method = 'GET', query, body, signal, headers } = options;
  const token = config.getAccessToken();

  const response = await fetch(buildApiUrl(path, query), {
    method,
    signal,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const rawBody = await response.text();
  const parsed = rawBody ? safeParseJson(rawBody) : null;

  if (!response.ok) {
    if (response.status === 401) {
      config.onUnauthorized();
    }

    throw createApiError(parsed, response.status);
  }

  if (parsed === null) {
    return undefined as TResponse;
  }

  return parsed as TResponse;
}


