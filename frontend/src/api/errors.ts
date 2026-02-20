function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function extractMessage(payload: unknown, fallback: string) {
  if (typeof payload === 'string' && payload.trim().length > 0) {
    return payload;
  }

  if (isRecord(payload)) {
    const message = payload.message;

    if (typeof message === 'string' && message.trim().length > 0) {
      return message;
    }

    if (Array.isArray(message)) {
      const normalized = message.filter((item): item is string => typeof item === 'string');
      if (normalized.length > 0) {
        return normalized.join(', ');
      }
    }
  }

  return fallback;
}

export class ApiClientError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.details = details;
  }
}

export function createApiError(payload: unknown, status: number) {
  return new ApiClientError(extractMessage(payload, 'Не удалось выполнить запрос'), status, payload);
}

export function normalizeApiError(error: unknown) {
  if (error instanceof ApiClientError) {
    return error;
  }

  if (error instanceof Error) {
    return new ApiClientError(error.message, 0, error);
  }

  if (typeof error === 'string') {
    return new ApiClientError(error, 0, error);
  }

  return new ApiClientError('Произошла неизвестная ошибка', 0, error);
}


