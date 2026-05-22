create table if not exists public.guest_sessions (
  id text primary key,
  created_at timestamptz not null default now(),
  claimed_by uuid references public.profiles(id) on delete set null,
  claimed_at timestamptz
);

alter table public.case_sessions
  alter column user_id drop not null,
  drop constraint if exists case_sessions_status_check,
  add column if not exists guest_session_id text references public.guest_sessions(id) on delete set null,
  add column if not exists remaining_seconds integer not null default 480 check (remaining_seconds >= 0),
  add column if not exists used_extension boolean not null default false,
  add column if not exists session_state jsonb not null default '{}'::jsonb,
  add column if not exists ended_at timestamptz,
  add column if not exists result_id uuid;

alter table public.case_sessions
  add constraint case_sessions_owner_check check (user_id is not null or guest_session_id is not null);

alter table public.case_sessions
  add constraint case_sessions_status_check
  check (status in ('brief', 'in_consultation', 'quiz', 'completed', 'abandoned'));

alter table public.case_sessions
  alter column status set default 'brief';

alter table public.examination_events
  add column if not exists examination_id text,
  add column if not exists label text,
  add column if not exists category text,
  add column if not exists delay_seconds integer not null default 0,
  add column if not exists score_key text,
  add column if not exists requested_at timestamptz not null default now(),
  add column if not exists resulted_at timestamptz not null default now();

update public.examination_events
set examination_id = coalesce(examination_id, examination_type),
    label = coalesce(label, examination_type),
    category = coalesce(category, examination_type)
where examination_id is null or label is null or category is null;

alter table public.examination_events
  alter column examination_id set not null,
  alter column label set not null,
  alter column category set not null;

alter table public.conversation_messages
  add column if not exists metadata jsonb not null default '{}'::jsonb;

alter table public.quiz_submissions
  add column if not exists score_breakdown jsonb not null default '{}'::jsonb;

alter table public.case_results
  alter column user_id drop not null,
  add column if not exists guest_session_id text references public.guest_sessions(id) on delete set null,
  add column if not exists score_breakdown jsonb not null default '{}'::jsonb,
  add column if not exists answers jsonb not null default '{}'::jsonb,
  add column if not exists attempt_number integer not null default 1,
  add column if not exists best_score integer not null default 0;

alter table public.case_results
  add constraint case_results_owner_check check (user_id is not null or guest_session_id is not null);

alter table public.guest_sessions enable row level security;

create index if not exists idx_cases_specialist_id on public.cases(specialist_id);
create index if not exists idx_case_sessions_user_id on public.case_sessions(user_id);
create index if not exists idx_case_sessions_guest_session_id on public.case_sessions(guest_session_id);
create index if not exists idx_case_sessions_case_id on public.case_sessions(case_id);
create index if not exists idx_conversation_messages_session_id on public.conversation_messages(session_id);
create index if not exists idx_examination_events_session_id on public.examination_events(session_id);
create unique index if not exists idx_examination_events_session_exam on public.examination_events(session_id, examination_id);
create index if not exists idx_quiz_submissions_session_id on public.quiz_submissions(session_id);
create index if not exists idx_case_results_user_id on public.case_results(user_id);
create index if not exists idx_case_results_guest_session_id on public.case_results(guest_session_id);
create index if not exists idx_case_results_case_id on public.case_results(case_id);
create index if not exists idx_user_case_stats_case_id on public.user_case_stats(case_id);
create index if not exists idx_leaderboard_entries_user_id on public.leaderboard_entries(user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
for select using ((select auth.uid()) = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
for update using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

drop policy if exists "sessions_owner_all" on public.case_sessions;
create policy "sessions_owner_all" on public.case_sessions
for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "messages_owner_select" on public.conversation_messages;
create policy "messages_owner_select" on public.conversation_messages for select using (
  exists (
    select 1 from public.case_sessions s
    where s.id = session_id and s.user_id = (select auth.uid())
  )
);

drop policy if exists "exams_owner_select" on public.examination_events;
create policy "exams_owner_select" on public.examination_events for select using (
  exists (
    select 1 from public.case_sessions s
    where s.id = session_id and s.user_id = (select auth.uid())
  )
);

drop policy if exists "quizzes_owner_select" on public.quiz_submissions;
create policy "quizzes_owner_select" on public.quiz_submissions for select using (
  exists (
    select 1 from public.case_sessions s
    where s.id = session_id and s.user_id = (select auth.uid())
  )
);

drop policy if exists "results_owner_select" on public.case_results;
create policy "results_owner_select" on public.case_results
for select using ((select auth.uid()) = user_id);

drop policy if exists "stats_owner_select" on public.user_case_stats;
create policy "stats_owner_select" on public.user_case_stats
for select using ((select auth.uid()) = user_id);
