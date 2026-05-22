alter table public.case_sessions
  add column if not exists livekit_room_name text,
  add column if not exists voice_started_at timestamptz,
  add column if not exists voice_ended_at timestamptz;

alter table public.conversation_messages
  add column if not exists external_id text;

create unique index if not exists idx_conversation_messages_session_external
  on public.conversation_messages(session_id, external_id)
  where external_id is not null;

create table if not exists public.voice_session_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.case_sessions(id) on delete cascade,
  event_type text not null,
  severity text not null default 'info' check (severity in ('info', 'warning', 'error')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.voice_session_events enable row level security;

create index if not exists idx_case_sessions_livekit_room_name
  on public.case_sessions(livekit_room_name);
create index if not exists idx_voice_session_events_session_id
  on public.voice_session_events(session_id);
create index if not exists idx_voice_session_events_type_created
  on public.voice_session_events(event_type, created_at desc);

drop policy if exists "voice_events_owner_select" on public.voice_session_events;
create policy "voice_events_owner_select" on public.voice_session_events
for select using (
  exists (
    select 1 from public.case_sessions s
    where s.id = session_id and s.user_id = (select auth.uid())
  )
);
