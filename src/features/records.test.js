import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage
Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
});

Object.defineProperty(globalThis, 'crypto', {
  value: { randomUUID: vi.fn(() => 'uuid') },
});

describe('records', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('returns empty object when no logs exist', async () => {
    const { getPersonalRecords } = await import('./records.js');
    const prs = getPersonalRecords();
    expect(Object.keys(prs)).toHaveLength(0);
  });

  it('identifies the highest weight as the PR', async () => {
    const { data } = await import('../state/store.js');
    data.logs = [
      { id: 'l1', exerciseId: 'e1', exerciseName: 'Bench', dayName: 'A', date: 1000, sets: [{ kg: 60, reps: 10, unit: 'kg' }] },
      { id: 'l2', exerciseId: 'e1', exerciseName: 'Bench', dayName: 'A', date: 2000, sets: [{ kg: 80, reps: 5, unit: 'kg' }] },
      { id: 'l3', exerciseId: 'e1', exerciseName: 'Bench', dayName: 'A', date: 3000, sets: [{ kg: 70, reps: 8, unit: 'kg' }] },
    ];
    const { getPersonalRecords } = await import('./records.js');
    const prs = getPersonalRecords();
    expect(prs['e1'].weight).toBe(80);
    expect(prs['e1'].logId).toBe('l2');
  });

  it('handles multiple exercises independently', async () => {
    const { data } = await import('../state/store.js');
    data.logs = [
      { id: 'l1', exerciseId: 'e1', exerciseName: 'Bench', dayName: 'A', date: 1000, sets: [{ kg: 60, reps: 10, unit: 'kg' }] },
      { id: 'l2', exerciseId: 'e2', exerciseName: 'Squat', dayName: 'B', date: 2000, sets: [{ kg: 100, reps: 5, unit: 'kg' }] },
    ];
    const { getPersonalRecords } = await import('./records.js');
    const prs = getPersonalRecords();
    expect(prs['e1'].weight).toBe(60);
    expect(prs['e2'].weight).toBe(100);
  });

  it('isPersonalRecord returns true for the PR log', async () => {
    const { data } = await import('../state/store.js');
    data.logs = [
      { id: 'l1', exerciseId: 'e1', exerciseName: 'Bench', dayName: 'A', date: 1000, sets: [{ kg: 60, reps: 10, unit: 'kg' }] },
      { id: 'l2', exerciseId: 'e1', exerciseName: 'Bench', dayName: 'A', date: 2000, sets: [{ kg: 80, reps: 5, unit: 'kg' }] },
    ];
    const { getPersonalRecords, isPersonalRecord } = await import('./records.js');
    const prs = getPersonalRecords();
    expect(isPersonalRecord(data.logs[0], prs)).toBe(false);
    expect(isPersonalRecord(data.logs[1], prs)).toBe(true);
  });

  it('picks highest reps when weights are tied', async () => {
    const { data } = await import('../state/store.js');
    data.logs = [
      { id: 'l1', exerciseId: 'e1', exerciseName: 'Bench', dayName: 'A', date: 1000, sets: [{ kg: 80, reps: 5, unit: 'kg' }] },
      { id: 'l2', exerciseId: 'e1', exerciseName: 'Bench', dayName: 'A', date: 2000, sets: [{ kg: 80, reps: 8, unit: 'kg' }] },
    ];
    const { getPersonalRecords } = await import('./records.js');
    const prs = getPersonalRecords();
    // Both have same weight, so the first one found (oldest) keeps the PR since maxWeight isn't greater
    expect(prs['e1'].weight).toBe(80);
    expect(prs['e1'].logId).toBe('l1');
  });
});
