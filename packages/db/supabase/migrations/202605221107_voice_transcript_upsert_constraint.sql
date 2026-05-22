drop index if exists public.idx_conversation_messages_session_external;

alter table public.conversation_messages
  drop constraint if exists conversation_messages_session_external_key;

alter table public.conversation_messages
  add constraint conversation_messages_session_external_key
  unique (session_id, external_id);
