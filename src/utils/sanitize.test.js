import { describe, it, expect } from 'vitest';
import { escapeHTML, escapeAttr, validateImportData } from './sanitize.js';

describe('escapeHTML', () => {
  it('escapes ampersands', () => {
    expect(escapeHTML('a & b')).toBe('a &amp; b');
  });

  it('escapes angle brackets', () => {
    expect(escapeHTML('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  it('passes through quotes in text context', () => {
    // Quotes are safe in text nodes - only dangerous in attributes (use escapeAttr for those)
    expect(escapeHTML('"hello"')).toBe('"hello"');
  });

  it('handles empty string', () => {
    expect(escapeHTML('')).toBe('');
  });

  it('passes through safe strings', () => {
    expect(escapeHTML('Bench Press')).toBe('Bench Press');
  });

  it('escapes XSS payload - prevents tag injection', () => {
    const payload = '<img onerror="alert(1)" src=x>';
    const result = escapeHTML(payload);
    expect(result).not.toContain('<img');
    // The angle brackets are escaped so the tag can't be parsed as HTML
    expect(result).toContain('&lt;img');
    expect(result).toContain('&gt;');
  });
});

describe('escapeAttr', () => {
  it('escapes double quotes', () => {
    expect(escapeAttr('say "hello"')).toBe('say &quot;hello&quot;');
  });

  it('escapes single quotes', () => {
    expect(escapeAttr("it's")).toBe('it&#39;s');
  });

  it('escapes HTML entities', () => {
    expect(escapeAttr('<b>bold</b>')).toBe('&lt;b&gt;bold&lt;/b&gt;');
  });
});

describe('validateImportData', () => {
  it('accepts valid data', () => {
    const input = {
      days: [
        { id: 'd1', name: 'Day A', exercises: [{ id: 'e1', name: 'Bench' }] },
      ],
      logs: [
        {
          id: 'l1',
          exerciseId: 'e1',
          exerciseName: 'Bench',
          dayName: 'Day A',
          date: 1000,
          sets: [{ kg: 60, reps: 10, unit: 'kg' }],
        },
      ],
    };
    const result = validateImportData(input);
    expect(result.valid).toBe(true);
  });

  it('rejects null input', () => {
    expect(validateImportData(null).valid).toBe(false);
  });

  it('rejects missing days', () => {
    expect(validateImportData({ logs: [] }).valid).toBe(false);
  });

  it('rejects invalid day entries', () => {
    const result = validateImportData({ days: [{ id: 123, name: 'X', exercises: [] }] });
    expect(result.valid).toBe(false);
  });

  it('rejects day names that are too long', () => {
    const result = validateImportData({
      days: [{ id: 'd1', name: 'A'.repeat(51), exercises: [] }],
    });
    expect(result.valid).toBe(false);
  });

  it('rejects invalid exercise entries', () => {
    const result = validateImportData({
      days: [{ id: 'd1', name: 'Day', exercises: [{ id: 'e1' }] }],
    });
    expect(result.valid).toBe(false);
  });

  it('rejects non-numeric set data', () => {
    const result = validateImportData({
      days: [{ id: 'd1', name: 'Day', exercises: [] }],
      logs: [
        {
          id: 'l1',
          exerciseId: 'e1',
          exerciseName: 'X',
          dayName: 'Day',
          date: 1000,
          sets: [{ kg: 'heavy', reps: 10 }],
        },
      ],
    });
    expect(result.valid).toBe(false);
  });

  it('accepts data with no logs', () => {
    const result = validateImportData({
      days: [{ id: 'd1', name: 'Day', exercises: [] }],
    });
    expect(result.valid).toBe(true);
  });
});
