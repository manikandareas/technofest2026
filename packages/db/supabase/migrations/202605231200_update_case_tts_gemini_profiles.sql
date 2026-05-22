-- Update case tts_profile to OpenRouter Gemini voices.
begin;

update public.cases
set case_data = jsonb_set(
  case_data,
  '{case_data,tts_profile}',
  '{"provider": "openrouter", "model": "google/gemini-3.1-flash-tts-preview", "voice": "Enceladus", "voice_style": "laki-laki muda, lemas, natural", "language": "id-ID", "speed": 0.98}'::jsonb,
  true
)
where id = 'internal-medicine-dengue-warning-signs';

update public.cases
set case_data = jsonb_set(
  case_data,
  '{case_data,tts_profile}',
  '{"provider": "openrouter", "model": "google/gemini-3.1-flash-tts-preview", "voice": "Kore", "voice_style": "perempuan dewasa, jelas, sedikit cemas", "language": "id-ID", "speed": 1}'::jsonb,
  true
)
where id = 'internal-medicine-diabetes-hyperglycemia';

update public.cases
set case_data = jsonb_set(
  case_data,
  '{case_data,tts_profile}',
  '{"provider": "openrouter", "model": "google/gemini-3.1-flash-tts-preview", "voice": "Gacrux", "voice_style": "laki-laki paruh baya, napas pendek ringan", "language": "id-ID", "speed": 0.94}'::jsonb,
  true
)
where id = 'internal-medicine-pneumonia';

update public.cases
set case_data = jsonb_set(
  case_data,
  '{case_data,tts_profile}',
  '{"provider": "openrouter", "model": "google/gemini-3.1-flash-tts-preview", "voice": "Achernar", "voice_style": "perempuan dewasa, lembut, cemas", "language": "id-ID", "speed": 0.98}'::jsonb,
  true
)
where id = 'obgyn-first-trimester-bleeding';

update public.cases
set case_data = jsonb_set(
  case_data,
  '{case_data,tts_profile}',
  '{"provider": "openrouter", "model": "google/gemini-3.1-flash-tts-preview", "voice": "Sulafat", "voice_style": "perempuan dewasa, nyeri, pelan", "language": "id-ID", "speed": 0.94}'::jsonb,
  true
)
where id = 'obgyn-preeclampsia-suspicion';

update public.cases
set case_data = jsonb_set(
  case_data,
  '{case_data,tts_profile}',
  '{"provider": "openrouter", "model": "google/gemini-3.1-flash-tts-preview", "voice": "Leda", "voice_style": "perempuan muda, pelan, malu", "language": "id-ID", "speed": 0.96}'::jsonb,
  true
)
where id = 'obgyn-vaginal-discharge';

update public.cases
set case_data = jsonb_set(
  case_data,
  '{case_data,tts_profile}',
  '{"provider": "openrouter", "model": "google/gemini-3.1-flash-tts-preview", "voice": "Fenrir", "voice_style": "suara ibu muda, cemas", "language": "id-ID", "speed": 1.02}'::jsonb,
  true
)
where id = 'pediatrics-febrile-seizure';

update public.cases
set case_data = jsonb_set(
  case_data,
  '{case_data,tts_profile}',
  '{"provider": "openrouter", "model": "google/gemini-3.1-flash-tts-preview", "voice": "Vindemiatrix", "voice_style": "suara ibu, lembut, khawatir", "language": "id-ID", "speed": 1}'::jsonb,
  true
)
where id = 'pediatrics-acute-diarrhea-dehydration';

update public.cases
set case_data = jsonb_set(
  case_data,
  '{case_data,tts_profile}',
  '{"provider": "openrouter", "model": "google/gemini-3.1-flash-tts-preview", "voice": "Laomedeia", "voice_style": "suara ibu, cemas, cepat", "language": "id-ID", "speed": 1.03}'::jsonb,
  true
)
where id = 'pediatrics-asthma-exacerbation';

update public.cases
set case_data = jsonb_set(
  case_data,
  '{case_data,tts_profile}',
  '{"provider": "openrouter", "model": "google/gemini-3.1-flash-tts-preview", "voice": "Orus", "voice_style": "laki-laki muda, menahan nyeri", "language": "id-ID", "speed": 0.96}'::jsonb,
  true
)
where id = 'general-surgery-appendicitis';

update public.cases
set case_data = jsonb_set(
  case_data,
  '{case_data,tts_profile}',
  '{"provider": "openrouter", "model": "google/gemini-3.1-flash-tts-preview", "voice": "Despina", "voice_style": "perempuan dewasa, menahan mual", "language": "id-ID", "speed": 0.98}'::jsonb,
  true
)
where id = 'general-surgery-acute-cholecystitis';

update public.cases
set case_data = jsonb_set(
  case_data,
  '{case_data,tts_profile}',
  '{"provider": "openrouter", "model": "google/gemini-3.1-flash-tts-preview", "voice": "Charon", "voice_style": "laki-laki dewasa, tenang", "language": "id-ID", "speed": 1}'::jsonb,
  true
)
where id = 'general-surgery-laceration';

update public.cases
set case_data = jsonb_set(
  case_data,
  '{case_data,tts_profile}',
  '{"provider": "openrouter", "model": "google/gemini-3.1-flash-tts-preview", "voice": "Schedar", "voice_style": "perempuan dewasa, tenang, sedikit cemas", "language": "id-ID", "speed": 0.98}'::jsonb,
  true
)
where id = 'anesthesiology-preoperative-asthma';

update public.cases
set case_data = jsonb_set(
  case_data,
  '{case_data,tts_profile}',
  '{"provider": "openrouter", "model": "google/gemini-3.1-flash-tts-preview", "voice": "Alnilam", "voice_style": "laki-laki dewasa, menahan nyeri", "language": "id-ID", "speed": 0.95}'::jsonb,
  true
)
where id = 'anesthesiology-postoperative-pain';

update public.cases
set case_data = jsonb_set(
  case_data,
  '{case_data,tts_profile}',
  '{"provider": "openrouter", "model": "google/gemini-3.1-flash-tts-preview", "voice": "Puck", "voice_style": "perempuan muda, gugup", "language": "id-ID", "speed": 1.02}'::jsonb,
  true
)
where id = 'anesthesiology-procedural-sedation-risk';

update public.cases
set case_data = jsonb_set(
  case_data,
  '{case_data,tts_profile}',
  '{"provider": "openrouter", "model": "google/gemini-3.1-flash-tts-preview", "voice": "Iapetus", "voice_style": "perempuan dewasa, jelas, sedikit risih", "language": "id-ID", "speed": 1}'::jsonb,
  true
)
where id = 'ophthalmology-conjunctivitis';

update public.cases
set case_data = jsonb_set(
  case_data,
  '{case_data,tts_profile}',
  '{"provider": "openrouter", "model": "google/gemini-3.1-flash-tts-preview", "voice": "Rasalgethi", "voice_style": "laki-laki tua, nyeri, tegang", "language": "id-ID", "speed": 0.93}'::jsonb,
  true
)
where id = 'ophthalmology-acute-angle-closure-suspicion';

update public.cases
set case_data = jsonb_set(
  case_data,
  '{case_data,tts_profile}',
  '{"provider": "openrouter", "model": "google/gemini-3.1-flash-tts-preview", "voice": "Achird", "voice_style": "laki-laki muda, risih, natural", "language": "id-ID", "speed": 0.98}'::jsonb,
  true
)
where id = 'ophthalmology-corneal-abrasion';

commit;
