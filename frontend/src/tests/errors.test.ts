import { describe, expect, it } from 'vitest';
import { createApiError, normalizeApiError } from '../api/errors';

describe('createApiError', () => {
  it('extracts message from plain string payload', () => {
    const error = createApiError('Unauthorized', 401);

    expect(error.message).toBe('Unauthorized');
    expect(error.status).toBe(401);
  });

  it('extracts message from backend array message', () => {
    const error = createApiError({ message: ['email invalid', 'password short'] }, 400);

    expect(error.message).toBe('email invalid, password short');
    expect(error.status).toBe(400);
  });

  it('normalizes unknown values to fallback error', () => {
    const error = normalizeApiError(12345);

    expect(error.message).toBe('Произошла неизвестная ошибка');
    expect(error.status).toBe(0);
  });
});


