const STORAGE_KEY = 'overload_data';

const DEFAULT_DATA = {
  days: [
    {
      id: 'd1',
      name: 'Day A',
      exercises: [
        { id: 'e1', name: 'Bench Press' },
        { id: 'e2', name: 'Overhead Press' },
      ],
    },
    {
      id: 'd2',
      name: 'Day B',
      exercises: [
        { id: 'e3', name: 'Squat' },
        { id: 'e4', name: 'Romanian Deadlift' },
      ],
    },
  ],
  logs: [],
};

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_DATA, days: DEFAULT_DATA.days.map((d) => ({ ...d, exercises: [...d.exercises] })) };
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.days)) {
      console.warn('Corrupt localStorage data, resetting to defaults');
      return { ...DEFAULT_DATA, days: DEFAULT_DATA.days.map((d) => ({ ...d, exercises: [...d.exercises] })) };
    }
    if (!Array.isArray(parsed.logs)) parsed.logs = [];
    return parsed;
  } catch (err) {
    console.warn('Failed to load data from localStorage:', err);
    return { ...DEFAULT_DATA, days: DEFAULT_DATA.days.map((d) => ({ ...d, exercises: [...d.exercises] })) };
  }
}

export let data = loadData();

export function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save data:', err);
  }
}

export function replaceData(newData) {
  data = newData;
  save();
}

export function generateId(prefix) {
  return prefix + crypto.randomUUID();
}

// UI state
export const state = {
  currentDayId: null,
  currentExId: null,
  currentExName: null,
  currentDayName: null,
  addExDayId: null,
  historyFilter: 'ALL',
  editDayId: null,
  editExDayId: null,
  editExId: null,
  confirmCallback: null,
  currentUnit: 'kg',
  editingLogId: null,
  logReturnTab: 'workouts',
};
