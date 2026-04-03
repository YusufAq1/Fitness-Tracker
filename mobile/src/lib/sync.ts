import { isLoggedIn } from './auth';
import { fetchTemplates, fetchLogs, upsertTemplate, upsertLog, deleteTemplate, deleteLog } from './db';
import { useStore } from '../store/useStore';
import type { Day, Log } from '../types';

let syncing = false;

export async function pullFromCloud(): Promise<boolean> {
  if (!isLoggedIn() || syncing) return false;
  syncing = true;

  try {
    const [cloudTemplates, cloudLogs] = await Promise.all([fetchTemplates(), fetchLogs()]);

    if (!cloudTemplates || !cloudLogs) {
      syncing = false;
      return false;
    }

    if (cloudTemplates.length > 0 || cloudLogs.length > 0) {
      const days: Day[] = cloudTemplates.map((t: Record<string, unknown>) => ({
        id: t.id as string,
        name: t.name as string,
        exercises: (t.exercises as Day['exercises']) || [],
      }));

      const logs: Log[] = cloudLogs.map((l: Record<string, unknown>) => ({
        id: l.id as string,
        exerciseId: l.exercise_id as string,
        exerciseName: l.exercise_name as string,
        dayName: l.day_name as string,
        date: new Date(l.logged_at as string).getTime(),
        sets: (l.sets as Log['sets']) || [],
      }));

      useStore.getState().replaceData({ days, logs });
    }
    return true;
  } catch (err) {
    console.error('Failed to pull from cloud:', err);
    return false;
  } finally {
    syncing = false;
  }
}

export async function pushTemplate(day: Day) {
  if (!isLoggedIn()) return;
  try {
    await upsertTemplate({
      id: day.id,
      name: day.name,
      exercises: day.exercises,
    });
  } catch (err) {
    console.error('Failed to sync template:', err);
  }
}

export async function pushLog(log: Log) {
  if (!isLoggedIn()) return;
  try {
    await upsertLog(log);
  } catch (err) {
    console.error('Failed to sync log:', err);
  }
}

export async function removeTemplate(templateId: string) {
  if (!isLoggedIn()) return;
  try {
    await deleteTemplate(templateId);
  } catch (err) {
    console.error('Failed to delete template from cloud:', err);
  }
}

export async function removeLog(logId: string) {
  if (!isLoggedIn()) return;
  try {
    await deleteLog(logId);
  } catch (err) {
    console.error('Failed to delete log from cloud:', err);
  }
}

export async function pushAllToCloud(): Promise<boolean> {
  if (!isLoggedIn()) return false;
  syncing = true;

  try {
    const { days, logs } = useStore.getState();

    for (let i = 0; i < days.length; i++) {
      const day = days[i];
      await upsertTemplate({
        id: day.id,
        name: day.name,
        position: i,
        exercises: day.exercises,
      });
    }

    for (const log of logs) {
      await upsertLog(log);
    }
    return true;
  } catch (err) {
    console.error('Failed to push to cloud:', err);
    return false;
  } finally {
    syncing = false;
  }
}

export async function fullSync(): Promise<boolean> {
  if (!isLoggedIn() || syncing) return false;
  const pushed = await pushAllToCloud();
  if (!pushed) return false;
  return pullFromCloud();
}
