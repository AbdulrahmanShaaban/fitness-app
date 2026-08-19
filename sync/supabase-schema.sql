-- Supabase mirror schema for the Trainer Notebook sync layer.
-- Run this in the Supabase SQL editor once per project.
-- The local SQLite database stays the source of truth; these tables are the
-- safety net. All timestamp columns are TEXT (ISO-8601) to mirror SQLite 1:1.
--
-- Setup: create a Supabase project, run this file, then put the project URL
-- and anon key into the app's .env (EXPO_PUBLIC_SUPABASE_URL /
-- EXPO_PUBLIC_SUPABASE_ANON_KEY) and log in on the sign-in screen.

create table if not exists public.clients (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  age integer,
  gender text,
  height_cm real,
  current_weight_kg real,
  phone text,
  start_date text,
  goal text,
  general_notes text,
  photo_uri text,
  is_deleted boolean not null default false,
  created_at text not null,
  updated_at text not null,
  synced_at text
);

create table if not exists public.sessions (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id text not null,
  date text not null,
  notes text,
  template_name text,
  is_deleted boolean not null default false,
  created_at text not null,
  updated_at text not null,
  synced_at text
);

create table if not exists public.exercises (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  muscle_group text,
  notes text,
  video_link text,
  is_custom boolean not null default false,
  is_deleted boolean not null default false,
  created_at text not null,
  updated_at text not null,
  synced_at text
);

create table if not exists public.session_exercises (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id text not null,
  exercise_id text not null,
  order_index integer not null default 0,
  is_deleted boolean not null default false,
  created_at text not null,
  updated_at text not null,
  synced_at text
);

create table if not exists public.sets (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  session_exercise_id text not null,
  set_number integer not null,
  weight real not null default 0,
  reps integer not null default 0,
  intensity text,
  notes text,
  is_deleted boolean not null default false,
  created_at text not null,
  updated_at text not null,
  synced_at text
);

create table if not exists public.assessments (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id text not null,
  type text not null,
  custom_type_name text,
  date text not null,
  general_notes text,
  is_deleted boolean not null default false,
  created_at text not null,
  updated_at text not null,
  synced_at text
);

create table if not exists public.assessment_tests (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  assessment_id text not null,
  test_name text not null,
  fields text not null,
  result text,
  notes text,
  is_deleted boolean not null default false,
  created_at text not null,
  updated_at text not null,
  synced_at text
);

create index if not exists sessions_client_date_idx on public.sessions (client_id, date);
create index if not exists session_exercises_session_idx on public.session_exercises (session_id, order_index);
create index if not exists sets_session_exercise_idx on public.sets (session_exercise_id, set_number);
create index if not exists assessments_client_date_idx on public.assessments (client_id, date);
create index if not exists assessment_tests_assessment_idx on public.assessment_tests (assessment_id);

-- RLS: every row is scoped to its owner; the app never bypasses RLS.
alter table public.clients enable row level security;
alter table public.sessions enable row level security;
alter table public.exercises enable row level security;
alter table public.session_exercises enable row level security;
alter table public.sets enable row level security;
alter table public.assessments enable row level security;
alter table public.assessment_tests enable row level security;

create policy "clients owner" on public.clients
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "sessions owner" on public.sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "exercises owner" on public.exercises
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "session_exercises owner" on public.session_exercises
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "sets owner" on public.sets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "assessments owner" on public.assessments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "assessment_tests owner" on public.assessment_tests
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);