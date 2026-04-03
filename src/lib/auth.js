import { supabase, isSupabaseConfigured } from './supabase.js';

let currentUser = null;
let authListeners = [];

export function getUser() {
  return currentUser;
}

export function isLoggedIn() {
  return currentUser !== null;
}

export function onAuthChange(callback) {
  authListeners.push(callback);
  return () => {
    authListeners = authListeners.filter((cb) => cb !== callback);
  };
}

function notifyListeners() {
  authListeners.forEach((cb) => cb(currentUser));
}

export async function signUp(email, password, username) {
  if (!isSupabaseConfigured()) throw new Error('Supabase not configured');
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username },
    },
  });
  if (error) throw error;
  return data;
}

export async function signIn(email, password) {
  if (!isSupabaseConfigured()) throw new Error('Supabase not configured');
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  currentUser = data.user;
  notifyListeners();
  return data;
}

export async function signInWithGoogle() {
  if (!isSupabaseConfigured()) throw new Error('Supabase not configured');
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  currentUser = null;
  notifyListeners();
}

export async function resetPassword(email) {
  if (!isSupabaseConfigured()) throw new Error('Supabase not configured');
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin,
  });
  if (error) throw error;
}

export async function initAuth() {
  if (!isSupabaseConfigured()) return;

  // Get current session
  const {
    data: { session },
  } = await supabase.auth.getSession();
  currentUser = session?.user ?? null;
  notifyListeners();

  // Listen for auth changes
  supabase.auth.onAuthStateChange((_event, session) => {
    currentUser = session?.user ?? null;
    notifyListeners();
  });
}
