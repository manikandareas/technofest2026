alter table public.profiles
  add column if not exists is_anonymous boolean not null default false;

update public.profiles
set is_anonymous = false
where is_anonymous is null;

delete from public.case_results
where user_id is null;

delete from public.case_sessions
where user_id is null;

drop policy if exists "guest_sessions_owner_select" on public.guest_sessions;

drop function if exists public.claim_guest_demo_result(
  uuid,
  uuid,
  text,
  integer,
  integer,
  integer,
  boolean
);

drop index if exists idx_guest_sessions_claimed_by;
drop index if exists idx_case_sessions_guest_session_id;
drop index if exists idx_case_results_guest_session_id;

alter table public.case_results
  drop constraint if exists case_results_owner_check,
  drop constraint if exists case_results_guest_session_id_fkey,
  drop column if exists guest_session_id,
  drop column if exists is_claimed,
  drop column if exists claim_token_hash,
  drop column if exists claim_expires_at,
  drop column if exists claimed_at,
  alter column user_id set not null;

alter table public.case_sessions
  drop constraint if exists case_sessions_owner_check,
  drop constraint if exists case_sessions_guest_session_id_fkey,
  drop column if exists guest_session_id,
  alter column user_id set not null;

drop table if exists public.guest_sessions;

alter table public.cases
  drop column if exists is_demo;

drop policy if exists "leaderboard_public_select" on public.leaderboard_entries;
create policy "leaderboard_public_select" on public.leaderboard_entries
for select using (
  exists (
    select 1
    from public.profiles p
    where p.id = leaderboard_entries.user_id
      and p.is_anonymous = false
  )
);
