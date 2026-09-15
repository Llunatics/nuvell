import { describe, it, expect } from 'vitest';
import { normalizeIsbn } from '@/crawler/normalizers/isbn-normalizer';

describe('ISBN Normalizer', () => {
  it('validates and cleans standard ISBN-13 with hyphens', () => {
    const res = normalizeIsbn('978-623-00-6101-1');
    expect(res.isValid).toBe(true);
    expect(res.clean).toBe('9786230061011');
    expect(res.isbn13).toBe('9786230061011');
  });

  it('validates and converts valid ISBN-10 to ISBN-13', () => {
    // 0-306-40615-2 is a valid ISBN-10
    const res = normalizeIsbn('0-306-40615-2');
    expect(res.isValid).toBe(true);
    expect(res.isbn10).toBe('0306406152');
    expect(res.isbn13).toBe('9780306406157');
  });

  it('rejects invalid ISBN checksums', () => {
    const res = normalizeIsbn('978-623-00-6101-9'); // bad check digit
    expect(res.isValid).toBe(false);
  });
});
