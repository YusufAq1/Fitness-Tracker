import { supabase, isSupabaseConfigured } from './supabase.js';
import { getUser } from './auth.js';

// ─── WORKOUT TEMPLATES (Days) ─────────────────────────

export async function fetchTemplates() {
  if (!isSupabaseConfigured() || !getUser()) return null;
  const { data, error } = await supabase
    .from('workout_templates')
    .select('*')
    .order('position', { ascending: true });
  if (error) throw error;
  return data;
}

export async function upsertTemplate(template) {
  if (!isSupabaseConfigured() || !getUser()) return null;
  const { data, error } = await supabase
    .from('workout_templates')
    .upsert({
      id: template.id,
      user_id: getUser().id,
      name: template.name,
      position: template.position ?? 0,
      exercises: template.exercises,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteTemplate(templateId) {
  if (!isSupabaseConfigured() || !getUser()) return;
  const { error } = await supabase.from('workout_templates').delete().eq('id', templateId);
  if (error) throw error;
}

// ─── WORKOUT LOGS ─────────────────────────────────────

export async function fetchLogs() {
  if (!isSupabaseConfigured() || !getUser()) return null;
  const { data, error } = await supabase
    .from('workout_logs')
    .select('*')
    .order('logged_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function upsertLog(log) {
  if (!isSupabaseConfigured() || !getUser()) return null;
  const { data, error } = await supabase
    .from('workout_logs')
    .upsert({
      id: log.id,
      user_id: getUser().id,
      exercise_id: log.exerciseId,
      exercise_name: log.exerciseName,
      day_name: log.dayName,
      logged_at: new Date(log.date).toISOString(),
      sets: log.sets,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteLog(logId) {
  if (!isSupabaseConfigured() || !getUser()) return;
  const { error } = await supabase.from('workout_logs').delete().eq('id', logId);
  if (error) throw error;
}

// ─── BULK OPERATIONS (for migration) ──────────────────

export async function bulkInsertTemplates(templates) {
  if (!isSupabaseConfigured() || !getUser()) return null;
  const userId = getUser().id;
  const rows = templates.map((t, i) => ({
    user_id: userId,
    name: t.name,
    position: i,
    exercises: t.exercises,
  }));
  const { data, error } = await supabase.from('workout_templates').insert(rows).select();
  if (error) throw error;
  return data;
}

export async function bulkInsertLogs(logs, templateIdMap) {
  if (!isSupabaseConfigured() || !getUser()) return null;
  const userId = getUser().id;
  const rows = logs.map((log) => ({
    user_id: userId,
    template_id: templateIdMap[log.exerciseId] || null,
    exercise_id: log.exerciseId,
    exercise_name: log.exerciseName,
    day_name: log.dayName,
    logged_at: new Date(log.date).toISOString(),
    sets: log.sets,
  }));

  // Insert in batches of 100
  const results = [];
  for (let i = 0; i < rows.length; i += 100) {
    const batch = rows.slice(i, i + 100);
    const { data, error } = await supabase.from('workout_logs').insert(batch).select();
    if (error) throw error;
    results.push(...data);
  }
  return results;
}
