create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  onboarding_completed boolean not null default false,
  xp integer not null default 0 check (xp >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.specialists (
  id text primary key,
  name text not null,
  description text not null,
  icon text not null default 'stethoscope',
  status text not null default 'coming_soon' check (status in ('available', 'coming_soon')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cases (
  id text primary key,
  specialist_id text not null references public.specialists(id) on delete restrict,
  patient_name text not null,
  patient_age integer not null check (patient_age > 0),
  patient_gender text not null,
  chief_complaint text not null,
  triage_note text not null,
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  condition_badge text not null,
  estimated_duration_minutes integer not null check (estimated_duration_minutes > 0),
  is_demo boolean not null default false,
  status text not null default 'draft' check (status in ('published', 'draft')),
  case_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.case_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  case_id text not null references public.cases(id) on delete restrict,
  status text not null default 'active' check (status in ('active', 'completed', 'abandoned')),
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.conversation_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.case_sessions(id) on delete cascade,
  role text not null check (role in ('user', 'patient', 'system')),
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.examination_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.case_sessions(id) on delete cascade,
  examination_type text not null,
  result jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.quiz_submissions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.case_sessions(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  submitted_at timestamptz not null default now()
);

create table if not exists public.case_results (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references public.case_sessions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  case_id text not null references public.cases(id) on delete restrict,
  score integer not null check (score >= 0 and score <= 100),
  xp_awarded integer not null default 0 check (xp_awarded >= 0),
  stars integer not null default 0 check (stars >= 0 and stars <= 3),
  feedback jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.user_case_stats (
  user_id uuid not null references public.profiles(id) on delete cascade,
  case_id text not null references public.cases(id) on delete cascade,
  attempts integer not null default 0 check (attempts >= 0),
  best_score integer check (best_score >= 0 and best_score <= 100),
  last_attempt_at timestamptz,
  primary key (user_id, case_id)
);

create table if not exists public.leaderboard_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  display_name text not null,
  score integer not null default 0 check (score >= 0),
  rank integer,
  period text not null default 'all_time',
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists specialists_set_updated_at on public.specialists;
create trigger specialists_set_updated_at
before update on public.specialists
for each row execute function public.set_updated_at();

drop trigger if exists cases_set_updated_at on public.cases;
create trigger cases_set_updated_at
before update on public.cases
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.specialists enable row level security;
alter table public.cases enable row level security;
alter table public.case_sessions enable row level security;
alter table public.conversation_messages enable row level security;
alter table public.examination_events enable row level security;
alter table public.quiz_submissions enable row level security;
alter table public.case_results enable row level security;
alter table public.user_case_stats enable row level security;
alter table public.leaderboard_entries enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "public_specialists_select_available" on public.specialists;
create policy "public_specialists_select_available" on public.specialists for select using (status = 'available');

drop policy if exists "public_cases_select_safe" on public.cases;
create policy "public_cases_select_safe" on public.cases for select using (status = 'published');

drop policy if exists "sessions_owner_all" on public.case_sessions;
create policy "sessions_owner_all" on public.case_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "messages_owner_select" on public.conversation_messages;
create policy "messages_owner_select" on public.conversation_messages for select using (
  exists (select 1 from public.case_sessions s where s.id = session_id and s.user_id = auth.uid())
);

drop policy if exists "exams_owner_select" on public.examination_events;
create policy "exams_owner_select" on public.examination_events for select using (
  exists (select 1 from public.case_sessions s where s.id = session_id and s.user_id = auth.uid())
);

drop policy if exists "quizzes_owner_select" on public.quiz_submissions;
create policy "quizzes_owner_select" on public.quiz_submissions for select using (
  exists (select 1 from public.case_sessions s where s.id = session_id and s.user_id = auth.uid())
);

drop policy if exists "results_owner_select" on public.case_results;
create policy "results_owner_select" on public.case_results for select using (auth.uid() = user_id);

drop policy if exists "stats_owner_select" on public.user_case_stats;
create policy "stats_owner_select" on public.user_case_stats for select using (auth.uid() = user_id);

drop policy if exists "leaderboard_public_select" on public.leaderboard_entries;
create policy "leaderboard_public_select" on public.leaderboard_entries for select using (true);

insert into public.specialists (id, name, description, icon, status, sort_order)
values
  ('cardiology', 'Cardiology', 'Latihan konsultasi keluhan jantung dan pembuluh darah.', 'heart-pulse', 'available', 10),
  ('pulmonology', 'Pulmonology', 'Kasus respirasi akan dibuka setelah fondasi voice siap.', 'lungs', 'coming_soon', 20),
  ('neurology', 'Neurology', 'Kasus neurologi disiapkan untuk fase konten berikutnya.', 'brain', 'coming_soon', 30),
  ('pediatrics', 'Pediatrics', 'Simulasi anak menyusul setelah mode dasar stabil.', 'baby', 'coming_soon', 40)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  status = excluded.status,
  sort_order = excluded.sort_order;

insert into public.cases (
  id,
  specialist_id,
  patient_name,
  patient_age,
  patient_gender,
  chief_complaint,
  triage_note,
  difficulty,
  condition_badge,
  estimated_duration_minutes,
  is_demo,
  status,
  case_data
)
values
  (
    'demo',
    'cardiology',
    'Maya',
    54,
    'Perempuan',
    'Nyeri dada kiri sejak 2 jam sebelum datang.',
    'Stabil, tampak cemas, perlu gali karakter nyeri dan faktor risiko.',
    'easy',
    'Chest pain',
    8,
    true,
    'published',
    '{"hidden_diagnosis":"angina pektoris stabil","allowed_facts":["nyeri membaik saat istirahat","riwayat hipertensi"],"quiz_answers":{"primary":"angina"}}'::jsonb
  ),
  (
    'budi-palpitasi',
    'cardiology',
    'Budi',
    42,
    'Laki-laki',
    'Jantung berdebar setelah minum kopi dan begadang.',
    'Hemodinamik stabil, fokus pada red flag, irama, dan konsumsi stimulan.',
    'medium',
    'Palpitasi',
    10,
    false,
    'published',
    '{"hidden_diagnosis":"palpitasi terkait stimulan","allowed_facts":["tidak sinkop","kafein tinggi"],"quiz_answers":{"primary":"palpitasi benign"}}'::jsonb
  ),
  (
    'siti-sesak',
    'cardiology',
    'Siti',
    67,
    'Perempuan',
    'Sesak saat aktivitas disertai bengkak tungkai.',
    'Butuh asesmen gagal jantung, kapasitas fungsional, dan tanda kongesti.',
    'hard',
    'Dyspnea',
    12,
    false,
    'published',
    '{"hidden_diagnosis":"gagal jantung kongestif","allowed_facts":["ortopnea","edema pretibial"],"quiz_answers":{"primary":"heart failure"}}'::jsonb
  )
on conflict (id) do update set
  specialist_id = excluded.specialist_id,
  patient_name = excluded.patient_name,
  patient_age = excluded.patient_age,
  patient_gender = excluded.patient_gender,
  chief_complaint = excluded.chief_complaint,
  triage_note = excluded.triage_note,
  difficulty = excluded.difficulty,
  condition_badge = excluded.condition_badge,
  estimated_duration_minutes = excluded.estimated_duration_minutes,
  is_demo = excluded.is_demo,
  status = excluded.status,
  case_data = excluded.case_data;
