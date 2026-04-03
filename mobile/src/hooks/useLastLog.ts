import { useStore } from '../store/useStore';
import type { Log } from '../types';

export function useLastLog(exerciseId: string): Log | null {
  const logs = useStore((s) => s.logs);
  const filtered = logs
    .filter((l) => l.exerciseId === exerciseId)
    .sort((a, b) => b.date - a.date);
  return filtered[0] ?? null;
}
