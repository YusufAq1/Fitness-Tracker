import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage before importing store
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = value; }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

// Mock crypto.randomUUID
Object.defineProperty(globalThis, 'crypto', {
  value: { randomUUID: vi.fn(() => 'test-uuid-1234') },
});

describe('store', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.resetModules();
  });

  it('loads default data when localStorage is empty', async () => {
    const { data } = await import('./store.js');
    expect(data.days).toHaveLength(2);
    expect(data.days[0].name).toBe('Day A');
    expect(data.logs).toEqual([]);
  });

  it('loads data from localStorage when available', async () => {
    const stored = {
      days: [{ id: 'd1', name: 'Custom Day', exercises: [] }],
      logs: [{ id: 'l1', exerciseId: 'e1', exerciseName: 'Squat', dayName: 'Custom Day', date: 1000, sets: [] }],
    };
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(stored));
    const { data } = await import('./store.js');
    expect(data.days[0].name).toBe('Custom Day');
    expect(data.logs).toHaveLength(1);
  });

  it('falls back to defaults on corrupt JSON', async () => {
    localStorageMock.getItem.mockReturnValueOnce('not valid json{{{');
    const { data } = await import('./store.js');
    expect(data.days).toHaveLength(2);
    expect(data.days[0].name).toBe('Day A');
  });

  it('falls back to defaults when days is missing', async () => {
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify({ logs: [] }));
    const { data } = await import('./store.js');
    expect(data.days).toHaveLength(2);
  });

  it('save() persists data to localStorage', async () => {
    const { data, save } = await import('./store.js');
    data.days.push({ id: 'd99', name: 'New Day', exercises: [] });
    save();
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'overload_data',
      expect.stringContaining('New Day'),
    );
  });

  it('generateId creates prefixed UUID', async () => {
    const { generateId } = await import('./store.js');
    const id = generateId('d-');
    expect(id).toBe('d-test-uuid-1234');
  });

  it('replaceData swaps data and saves', async () => {
    const { replaceData, data } = await import('./store.js');
    const newData = { days: [{ id: 'x', name: 'Replaced', exercises: [] }], logs: [] };
    replaceData(newData);
    // The module-level `data` export is a let binding, so we re-import
    const freshModule = await import('./store.js');
    expect(freshModule.data.days[0].name).toBe('Replaced');
  });
});
