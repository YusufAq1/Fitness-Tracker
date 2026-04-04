import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Day, Exercise, Log } from '../types';
import 'react-native-get-random-values';

const DEFAULT_DAYS: Day[] = [
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
];

interface StoreState {
  days: Day[];
  logs: Log[];
  currentUnit: 'kg' | 'lbs';

  // Day actions
  addDay: (name: string) => Day;
  updateDay: (dayId: string, name: string) => void;
  deleteDay: (dayId: string) => void;

  // Exercise actions
  addExercise: (dayId: string, name: string) => Exercise | null;
  updateExercise: (dayId: string, exerciseId: string, name: string) => void;
  deleteExercise: (dayId: string, exerciseId: string) => void;

  // Log actions
  addLog: (log: Log) => void;
  updateLog: (logId: string, sets: Log['sets']) => void;
  deleteLog: (logId: string) => void;

  // Bulk
  replaceData: (data: { days: Day[]; logs: Log[] }) => void;
  setUnit: (unit: 'kg' | 'lbs') => void;

  // Helpers
  generateId: (prefix: string) => string;
  getDay: (dayId: string) => Day | undefined;
  resetToDefaults: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      days: DEFAULT_DAYS,
      logs: [],
      currentUnit: 'kg',

      addDay: (name) => {
        const newDay: Day = {
          id: 'd-' + crypto.randomUUID(),
          name,
          exercises: [],
        };
        set((s) => ({ days: [...s.days, newDay] }));
        return newDay;
      },

      updateDay: (dayId, name) => {
        set((s) => ({
          days: s.days.map((d) => (d.id === dayId ? { ...d, name } : d)),
        }));
      },

      deleteDay: (dayId) => {
        set((s) => ({ days: s.days.filter((d) => d.id !== dayId) }));
      },

      addExercise: (dayId, name) => {
        const newEx: Exercise = {
          id: 'e-' + crypto.randomUUID(),
          name,
        };
        set((s) => ({
          days: s.days.map((d) =>
            d.id === dayId ? { ...d, exercises: [...d.exercises, newEx] } : d,
          ),
        }));
        return newEx;
      },

      updateExercise: (dayId, exerciseId, name) => {
        set((s) => ({
          days: s.days.map((d) =>
            d.id === dayId
              ? {
                  ...d,
                  exercises: d.exercises.map((e) =>
                    e.id === exerciseId ? { ...e, name } : e,
                  ),
                }
              : d,
          ),
        }));
      },

      deleteExercise: (dayId, exerciseId) => {
        set((s) => ({
          days: s.days.map((d) =>
            d.id === dayId
              ? { ...d, exercises: d.exercises.filter((e) => e.id !== exerciseId) }
              : d,
          ),
        }));
      },

      addLog: (log) => {
        set((s) => ({ logs: [...s.logs, log] }));
      },

      updateLog: (logId, sets) => {
        set((s) => ({
          logs: s.logs.map((l) => (l.id === logId ? { ...l, sets } : l)),
        }));
      },

      deleteLog: (logId) => {
        set((s) => ({ logs: s.logs.filter((l) => l.id !== logId) }));
      },

      replaceData: (data) => {
        set({ days: data.days, logs: data.logs });
      },

      setUnit: (unit) => {
        set({ currentUnit: unit });
      },

      generateId: (prefix) => prefix + crypto.randomUUID(),

      getDay: (dayId) => get().days.find((d) => d.id === dayId),

      resetToDefaults: () => {
        set({ days: DEFAULT_DAYS, logs: [], currentUnit: 'kg' });
      },
    }),
    {
      name: 'overload_data', // Legacy key — do not rename, would lose existing user data
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        days: state.days,
        logs: state.logs,
        currentUnit: state.currentUnit,
      }),
    },
  ),
);
