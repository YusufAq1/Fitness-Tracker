import type { Log, PersonalRecord } from '../types';

export function getPersonalRecords(logs: Log[]): Record<string, PersonalRecord> {
  const prs: Record<string, PersonalRecord> = {};
  const sorted = [...logs].sort((a, b) => a.date - b.date);

  sorted.forEach((log) => {
    if (!log.sets.length) return;
    const maxWeight = Math.max(...log.sets.map((s) => s.kg));
    const bestSet = log.sets.reduce((best, s) =>
      s.kg > best.kg || (s.kg === best.kg && s.reps > best.reps) ? s : best,
    );

    if (!prs[log.exerciseId] || maxWeight > prs[log.exerciseId].weight) {
      prs[log.exerciseId] = {
        exerciseName: log.exerciseName,
        weight: maxWeight,
        reps: bestSet.reps,
        unit: bestSet.unit || 'kg',
        date: log.date,
        logId: log.id,
      };
    }
  });

  return prs;
}

export function isPersonalRecord(log: Log, prs: Record<string, PersonalRecord>): boolean {
  const pr = prs[log.exerciseId];
  return !!pr && pr.logId === log.id;
}
