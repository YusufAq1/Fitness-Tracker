import { data, replaceData } from '../state/store.js';
import { isLoggedIn } from './auth.js';
import { fetchTemplates, fetchLogs, upsertTemplate, upsertLog, deleteTemplate, deleteLog } from './db.js';
import { showToast } from '../ui/toast.js';

let syncing = false;

export async function pullFromCloud() {
  if (!isLoggedIn() || syncing) return;
  syncing = true;

  try {
    const [cloudTemplates, cloudLogs] = await Promise.all([fetchTemplates(), fetchLogs()]);

    if (!cloudTemplates || !cloudLogs) {
      syncing = false;
      return;
    }

    if (cloudTemplates.length > 0 || cloudLogs.length > 0) {
      const days = cloudTemplates.map((t) => ({
        id: t.id,
        name: t.name,
        exercises: t.exercises || [],
      }));

      const logs = cloudLogs.map((l) => ({
        id: l.id,
        exerciseId: l.exercise_id,
        exerciseName: l.exercise_name,
        dayName: l.day_name,
        date: new Date(l.logged_at).getTime(),
        sets: l.sets || [],
      }));

      replaceData({ days, logs });
    }
  } catch (err) {
    console.error('Failed to pull from cloud:', err);
  } finally {
    syncing = false;
  }
}

export async function fullSync() {
  if (!isLoggedIn() || syncing) return;
  await pullFromCloud();
  await pushAllToCloud();
}

export async function pushTemplate(day) {
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

export async function pushLog(log) {
  if (!isLoggedIn()) return;
  try {
    await upsertLog(log);
  } catch (err) {
    console.error('Failed to sync log:', err);
  }
}

export async function removeTemplate(templateId) {
  if (!isLoggedIn()) return;
  try {
    await deleteTemplate(templateId);
  } catch (err) {
    console.error('Failed to delete template from cloud:', err);
  }
}

export async function removeLog(logId) {
  if (!isLoggedIn()) return;
  try {
    await deleteLog(logId);
  } catch (err) {
    console.error('Failed to delete log from cloud:', err);
  }
}

export async function pushAllToCloud() {
  if (!isLoggedIn()) return;
  syncing = true;

  try {
    for (let i = 0; i < data.days.length; i++) {
      const day = data.days[i];
      await upsertTemplate({
        id: day.id,
        name: day.name,
        position: i,
        exercises: day.exercises,
      });
    }

    for (const log of data.logs) {
      await upsertLog(log);
    }

    showToast('DATA SYNCED TO CLOUD \u2713');
  } catch (err) {
    console.error('Failed to push to cloud:', err);
    showToast('SYNC FAILED');
  } finally {
    syncing = false;
  }
}
