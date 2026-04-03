import { supabase, isSupabaseConfigured } from './supabase';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import type { User } from '@supabase/supabase-js';

let currentUser: User | null = null;
let authListeners: ((user: User | null) => void)[] = [];

export function getUser() {
  return currentUser;
}

export function isLoggedIn() {
  return currentUser !== null;
}

export function onAuthChange(callback: (user: User | null) => void) {
  authListeners.push(callback);
  return () => {
    authListeners = authListeners.filter((cb) => cb !== callback);
  };
}

function notifyListeners() {
  authListeners.forEach((cb) => cb(currentUser));
}

export async function signUp(email: string, password: string, username: string) {
  if (!isSupabaseConfigured() || !supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  if (!isSupabaseConfigured() || !supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  currentUser = data.user;
  notifyListeners();
  return data;
}

export async function signInWithGoogle() {
  if (!isSupabaseConfigured() || !supabase) throw new Error('Supabase not configured');

  const redirectUrl = Linking.createURL('/');

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: redirectUrl },
  });
  if (error) throw error;
  if (data.url) {
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
    if (result.type === 'success' && result.url) {
      // Extract tokens from the URL and set the session
      const url = new URL(result.url);
      const params = new URLSearchParams(url.hash.substring(1));
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      if (accessToken && refreshToken) {
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (sessionError) throw sessionError;
        currentUser = sessionData.user;
        notifyListeners();
      }
    }
  }
}

export async function signOut() {
  if (!isSupabaseConfigured() || !supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  currentUser = null;
  notifyListeners();
}

export async function resetPassword(email: string) {
  if (!isSupabaseConfigured() || !supabase) throw new Error('Supabase not configured');
  const redirectUrl = Linking.createURL('/');
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl,
  });
  if (error) throw error;
}

export async function initAuth() {
  if (!isSupabaseConfigured() || !supabase) return;

  const {
    data: { session },
  } = await supabase.auth.getSession();
  currentUser = session?.user ?? null;
  notifyListeners();

  supabase.auth.onAuthStateChange((_event, session) => {
    currentUser = session?.user ?? null;
    notifyListeners();
  });
}
