export function validateImportData(obj: unknown): boolean {
  if (!obj || typeof obj !== 'object') return false;
  const data = obj as Record<string, unknown>;

  if (!Array.isArray(data.days) || !Array.isArray(data.logs)) return false;

  for (const day of data.days) {
    if (!day || typeof day !== 'object') return false;
    const d = day as Record<string, unknown>;
    if (typeof d.id !== 'string' || typeof d.name !== 'string') return false;
    if (d.name.length > 100) return false;
    if (!Array.isArray(d.exercises)) return false;
    for (const ex of d.exercises) {
      if (!ex || typeof ex !== 'object') return false;
      const e = ex as Record<string, unknown>;
      if (typeof e.id !== 'string' || typeof e.name !== 'string') return false;
      if (e.name.length > 100) return false;
    }
  }

  for (const log of data.logs) {
    if (!log || typeof log !== 'object') return false;
    const l = log as Record<string, unknown>;
    if (typeof l.id !== 'string' || typeof l.exerciseId !== 'string') return false;
    if (typeof l.exerciseName !== 'string' || typeof l.dayName !== 'string') return false;
    if (typeof l.date !== 'number') return false;
    if (!Array.isArray(l.sets)) return false;
    for (const set of l.sets) {
      if (!set || typeof set !== 'object') return false;
      const s = set as Record<string, unknown>;
      if (typeof s.kg !== 'number' || typeof s.reps !== 'number') return false;
    }
  }

  return true;
}
