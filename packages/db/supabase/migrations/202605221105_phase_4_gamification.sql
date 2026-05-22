alter table public.cases
  add column if not exists base_xp integer not null default 100 check (base_xp > 0);

alter table public.case_results
  add column if not exists is_retry boolean not null default false,
  add column if not exists is_claimed boolean not null default false,
  add column if not exists claim_token_hash text,
  add column if not exists claim_expires_at timestamptz,
  add column if not exists claimed_at timestamptz;

alter table public.user_case_stats
  add column if not exists best_stars integer not null default 0 check (best_stars >= 0 and best_stars <= 3),
  add column if not exists first_completed_at timestamptz,
  add column if not exists last_completed_at timestamptz;

alter table public.leaderboard_entries
  add column if not exists total_xp integer not null default 0 check (total_xp >= 0),
  add column if not exists completed_cases integer not null default 0 check (completed_cases >= 0),
  add column if not exists average_best_score numeric(5, 2) not null default 0 check (average_best_score >= 0 and average_best_score <= 100),
  add column if not exists latest_activity_at timestamptz;

update public.leaderboard_entries
set total_xp = greatest(total_xp, score)
where total_xp = 0 and score > 0;

create unique index if not exists idx_leaderboard_entries_user_period
  on public.leaderboard_entries(user_id, period);

create index if not exists idx_guest_sessions_claimed_by
  on public.guest_sessions(claimed_by);

drop policy if exists "guest_sessions_owner_select" on public.guest_sessions;
create policy "guest_sessions_owner_select" on public.guest_sessions
for select using ((select auth.uid()) = claimed_by);

drop policy if exists "leaderboard_public_select" on public.leaderboard_entries;
create policy "leaderboard_public_select" on public.leaderboard_entries
for select using (true);

create or replace function public.claim_guest_demo_result(
  p_session_id uuid,
  p_user_id uuid,
  p_token_hash text,
  p_xp_awarded integer,
  p_attempt_number integer,
  p_best_score integer,
  p_is_retry boolean
)
returns public.case_results
language plpgsql
security definer
set search_path = public
as $$
declare
  claimed_result public.case_results;
begin
  update public.case_results
  set user_id = p_user_id,
      xp_awarded = p_xp_awarded,
      attempt_number = p_attempt_number,
      best_score = p_best_score,
      is_retry = p_is_retry,
      is_claimed = true,
      claimed_at = now()
  where session_id = p_session_id
    and user_id is null
    and is_claimed = false
    and claim_token_hash = p_token_hash
    and claim_expires_at > now()
  returning * into claimed_result;

  if claimed_result.id is null then
    raise exception 'guest result cannot be claimed';
  end if;

  update public.case_sessions
  set user_id = p_user_id
  where id = p_session_id;

  update public.guest_sessions
  set claimed_by = p_user_id,
      claimed_at = now()
  where id = claimed_result.guest_session_id;

  return claimed_result;
end;
$$;

revoke all on function public.claim_guest_demo_result(uuid, uuid, text, integer, integer, integer, boolean) from public;
grant execute on function public.claim_guest_demo_result(uuid, uuid, text, integer, integer, integer, boolean) to service_role;
