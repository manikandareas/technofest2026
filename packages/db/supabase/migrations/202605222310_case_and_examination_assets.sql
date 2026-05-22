alter table public.cases
  add column if not exists patient_avatar_url text,
  add column if not exists case_thumbnail_url text,
  add column if not exists consultation_avatar_url text;

alter table public.examination_events
  add column if not exists asset jsonb;
