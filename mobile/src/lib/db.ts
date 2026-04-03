import { supabase, isSupabaseConfigured } from './supabase';
import { getUser } from './auth';
import type { Day, Log } from '../types';

export async function fetchTemplates() {
  if (!isSupabaseConfigured() || !supabase || !getUser()) return null;
  const { data, error } = await supabase
    .from('workout_templates')
    .select('*')
    .order('position', { ascending: true });
  if (error) throw error;
  return data;
}

export async function upsertTemplate(template: { id: string; name: string; position?: number; exercises: Day['exercises'] }) {
  if (!isSupabaseConfigured() || !supabase || !getUser()) return null;
  const { data, error } = await supabase
    .from('workout_templates')
    .upsert({
      id: template.id,
      user_id: getUser()!.id,
      name: template.name,
      position: template.position ?? 0,
      exercises: template.exercises,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteTemplate(templateId: string) {
  if (!isSupabaseConfigured() || !supabase || !getUser()) return;
  const { error } = await supabase.from('workout_templates').delete().eq('id', templateId);
  if (error) throw error;
}

export async function fetchLogs() {
  if (!isSupabaseConfigured() || !supabase || !getUser()) return null;
  const { data, error } = await supabase
    .from('workout_logs')
    .select('*')
    .order('logged_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function upsertLog(log: Log) {
  if (!isSupabaseConfigured() || !supabase || !getUser()) return null;
  const { data, error } = await supabase
    .from('workout_logs')
    .upsert({
      id: log.id,
      user_id: getUser()!.id,
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

export async function deleteLog(logId: string) {
  if (!isSupabaseConfigured() || !supabase || !getUser()) return;
  const { error } = await supabase.from('workout_logs').delete().eq('id', logId);
  if (error) throw error;
}
