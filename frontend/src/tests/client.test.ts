import { describe, expect, it } from 'vitest';
import { buildApiUrl } from '../api/client';

describe('buildApiUrl', () => {
  it('appends query params and ignores empty values', () => {
    const url = buildApiUrl('/topics', {
      page: 2,
      search: 'security',
      skip: undefined,
      empty: '',
    });

    expect(url.pathname.endsWith('/topics')).toBe(true);
    expect(url.searchParams.get('page')).toBe('2');
    expect(url.searchParams.get('search')).toBe('security');
    expect(url.searchParams.has('skip')).toBe(false);
    expect(url.searchParams.has('empty')).toBe(false);
  });
});


