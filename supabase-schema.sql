-- ============================================================
-- Overload Fitness Tracker — Supabase Database Schema
-- ============================================================
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- This creates all tables, indexes, and Row Level Security policies.
-- ============================================================

-- 1. PROFILES TABLE
-- Stores user profile info (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text,
  created_at timestamptz default now()
);

-- 2. WORKOUT TEMPLATES TABLE
-- Stores workout day configurations with exercises as JSONB
create table if not exists public.workout_templates (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  position int default 0,
  exercises jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. WORKOUT LOGS TABLE
-- Stores individual workout session logs
create table if not exists public.workout_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  template_id uuid references public.workout_templates(id) on delete set null,
  exercise_id text not null,
  exercise_name text not null,
  day_name text not null,
  logged_at timestamptz default now(),
  sets jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- INDEXES
-- ============================================================
create index if not exists idx_workout_templates_user_id on public.workout_templates(user_id);
create index if not exists idx_workout_logs_user_id on public.workout_logs(user_id);
create index if not exists idx_workout_logs_exercise_id on public.workout_logs(exercise_id);
create index if not exists idx_workout_logs_logged_at on public.workout_logs(logged_at desc);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Users can only access their own data
-- ============================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.workout_templates enable row level security;
alter table public.workout_logs enable row level security;

-- PROFILES policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- WORKOUT TEMPLATES policies
create policy "Users can view own templates"
  on public.workout_templates for select
  using (auth.uid() = user_id);

create policy "Users can insert own templates"
  on public.workout_templates for insert
  with check (auth.uid() = user_id);

create policy "Users can update own templates"
  on public.workout_templates for update
  using (auth.uid() = user_id);

create policy "Users can delete own templates"
  on public.workout_templates for delete
  using (auth.uid() = user_id);

-- WORKOUT LOGS policies
create policy "Users can view own logs"
  on public.workout_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert own logs"
  on public.workout_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own logs"
  on public.workout_logs for update
  using (auth.uid() = user_id);

create policy "Users can delete own logs"
  on public.workout_logs for delete
  using (auth.uid() = user_id);

-- ============================================================
-- TRIGGER: Auto-create profile on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data->>'username');
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if it exists, then create
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- TRIGGER: Auto-update updated_at timestamps
-- ============================================================
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_workout_templates_updated_at on public.workout_templates;
create trigger update_workout_templates_updated_at
  before update on public.workout_templates
  for each row execute procedure public.update_updated_at();

drop trigger if exists update_workout_logs_updated_at on public.workout_logs;
create trigger update_workout_logs_updated_at
  before update on public.workout_logs
  for each row execute procedure public.update_updated_at();
