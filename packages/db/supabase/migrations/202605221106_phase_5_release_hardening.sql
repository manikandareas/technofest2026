create table if not exists public.rate_limit_events (
  id uuid primary key default gen_random_uuid(),
  scope text not null check (char_length(scope) > 0 and char_length(scope) <= 80),
  actor_type text not null check (actor_type in ('user', 'guest', 'session', 'system')),
  actor_hash text not null check (char_length(actor_hash) = 64),
  session_id uuid references public.case_sessions(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.rate_limit_events enable row level security;

create index if not exists idx_rate_limit_events_scope_actor_created
  on public.rate_limit_events(scope, actor_hash, created_at desc);

create index if not exists idx_rate_limit_events_session_id
  on public.rate_limit_events(session_id);

revoke all on table public.rate_limit_events from public;
revoke all on table public.rate_limit_events from anon;
revoke all on table public.rate_limit_events from authenticated;
grant select, insert, delete on table public.rate_limit_events to service_role;

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
set search_path = ''
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
  where public.case_results.session_id = p_session_id
    and public.case_results.user_id is null
    and public.case_results.is_claimed = false
    and public.case_results.claim_token_hash = p_token_hash
    and public.case_results.claim_expires_at > now()
  returning * into claimed_result;

  if claimed_result.id is null then
    raise exception 'guest result cannot be claimed';
  end if;

  update public.case_sessions
  set user_id = p_user_id
  where public.case_sessions.id = p_session_id;

  update public.guest_sessions
  set claimed_by = p_user_id,
      claimed_at = now()
  where public.guest_sessions.id = claimed_result.guest_session_id;

  return claimed_result;
end;
$$;

revoke all on function public.claim_guest_demo_result(uuid, uuid, text, integer, integer, integer, boolean) from public;
revoke execute on function public.claim_guest_demo_result(uuid, uuid, text, integer, integer, integer, boolean) from anon;
revoke execute on function public.claim_guest_demo_result(uuid, uuid, text, integer, integer, integer, boolean) from authenticated;
grant execute on function public.claim_guest_demo_result(uuid, uuid, text, integer, integer, integer, boolean) to service_role;
