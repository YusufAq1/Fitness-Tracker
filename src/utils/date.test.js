import { describe, it, expect } from 'vitest';
import { formatDate } from './date.js';

describe('formatDate', () => {
  it('formats a timestamp correctly', () => {
    // 1 Jan 2024
    const result = formatDate(new Date(2024, 0, 1).getTime());
    expect(result).toContain('Jan');
    expect(result).toContain('2024');
    expect(result).toContain('1');
  });

  it('formats a date string', () => {
    const result = formatDate('2024-06-15T12:00:00Z');
    expect(result).toContain('Jun');
    expect(result).toContain('2024');
  });
});
