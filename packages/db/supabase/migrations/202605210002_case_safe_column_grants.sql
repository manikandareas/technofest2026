revoke all on table public.profiles from anon, authenticated;
revoke all on table public.specialists from anon, authenticated;
revoke all on table public.cases from anon, authenticated;
revoke all on table public.case_sessions from anon, authenticated;
revoke all on table public.conversation_messages from anon, authenticated;
revoke all on table public.examination_events from anon, authenticated;
revoke all on table public.quiz_submissions from anon, authenticated;
revoke all on table public.case_results from anon, authenticated;
revoke all on table public.user_case_stats from anon, authenticated;
revoke all on table public.leaderboard_entries from anon, authenticated;

grant select on table public.specialists to anon, authenticated;
grant select (
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
  created_at,
  updated_at
) on table public.cases to anon, authenticated;

grant select, update on table public.profiles to authenticated;
grant select, insert, update on table public.case_sessions to authenticated;
grant select, insert on table public.conversation_messages to authenticated;
grant select, insert on table public.examination_events to authenticated;
grant select, insert on table public.quiz_submissions to authenticated;
grant select on table public.case_results to authenticated;
grant select on table public.user_case_stats to authenticated;
grant select on table public.leaderboard_entries to anon, authenticated;
