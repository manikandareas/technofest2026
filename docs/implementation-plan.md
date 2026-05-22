# PixelAid Implementation Plan

## 1. Purpose

Dokumen ini adalah rencana eksekusi untuk membangun PixelAid dari PRD dan Technical Design yang sudah ada:

- `docs/pixelaid_final_prd.md`
- `docs/pixelaid_technical_design_doc.md`

Targetnya adalah membuat jalur implementasi yang bisa langsung dipakai oleh engineer untuk membangun MVP tanpa membuka ulang keputusan product utama.

## 2. Locked Architecture

PixelAid memakai satu monorepo, tetapi runtime dipisah sesuai beban kerja:

```txt
apps/web             Next.js App Router, TypeScript, Tailwind, PWA, Bun
apps/api             Python FastAPI HTTP backend
apps/voice-agent     Python LiveKit Agents worker
packages/db          Supabase SQL migrations, seed data, generated DB types
packages/contracts   OpenAPI output and generated TypeScript API client
packages/shared-py   shared Python schemas, scoring, case rules, repositories
docs/                PRD, technical design, implementation plan
```

Keputusan runtime:

- Frontend memakai Next.js + Bun karena produk adalah responsive PWA dengan dashboard, gameplay UI, dan LiveKit client.
- HTTP backend memakai Python FastAPI karena API contract, scoring, Supabase integration, dan OpenAPI generation perlu stabil dan mudah dites.
- Voice agent memakai Python LiveKit Agents karena fitur paling berisiko adalah konsultasi voice real-time.
- `packages/shared-py` menyimpan domain logic yang dipakai API dan voice agent agar case rules, scoring, safety rules, dan schema tidak bercabang.

## 3. Service Boundaries

### `apps/web`

Tanggung jawab:

- Landing page, smart entry, splash, auth UI, onboarding, dashboard.
- Choose specialist, select case, case brief.
- Consultation room, message panel, medical record panel, examine panel.
- LiveKit Web SDK client, microphone permission, reconnect/error states.
- Diagnosis quiz, result screen, history, leaderboard, profile progress.
- Guest demo flow and claim CTA after login/register.

Tidak bertanggung jawab:

- Scoring final.
- Quiz validation.
- LiveKit server token signing.
- Patient response generation.
- Direct writes to private game tables outside approved API/Supabase client patterns.

### `apps/api`

Tanggung jawab:

- Supabase auth bridge and authenticated user context.
- Profile, onboarding, specialist, case, and public demo APIs.
- Case session lifecycle and state transitions.
- Medical record opened event.
- Examination selection, delay metadata, and result availability.
- Timer extension and end-consultation transition.
- Quiz submission, deterministic scoring, result persistence.
- XP, stars, retry, history, leaderboard, and guest claim.
- LiveKit room naming, token issuing, session authorization.
- Agent context endpoint and transcript write endpoint.
- OpenAPI output for generated TypeScript client.

Tidak bertanggung jawab:

- Running long-lived WebRTC voice rooms.
- Direct TTS/STT streaming.
- Free-form medical grading outside deterministic scoring data.

### `apps/voice-agent`

Tanggung jawab:

- Join LiveKit rooms as patient NPC worker.
- Run STT -> intent/fact retrieval -> LLM naturalizer -> validation -> TTS.
- Keep patient persona and per-patient TTS profile.
- Enforce no-diagnosis, no-new-facts, and no-unperformed-exam-result rules.
- Emit transcript and patient response events to `apps/api`.
- Handle timeout, reconnect, interruption/barge-in, provider fallback, and graceful shutdown.

Tidak bertanggung jawab:

- Persisting database rows directly when an API endpoint exists.
- Calculating final score or XP.
- Exposing public HTTP app APIs.

### `packages/shared-py`

Tanggung jawab:

- Pydantic domain schemas shared by API and agent.
- Case config schema and validation.
- Deterministic scoring functions.
- XP, retry, stars, and safety gate logic.
- Patient fact selection and response validation helpers.
- Repository interfaces where sharing avoids duplicated behavior.

## 4. External Services

### Supabase

Digunakan untuk:

- Auth.
- Postgres.
- Row Level Security.
- Migrations and seed data.
- Optional lightweight asset storage.
- Optional realtime for non-audio UI updates.

MVP policy:

- Store text transcript only.
- Do not store raw audio.
- Use RLS for user-owned sessions, results, and history.
- Public content tables can expose published specialists and cases.

### LiveKit Cloud

Digunakan untuk:

- WebRTC room connection.
- Client audio transport.
- Agent worker room join.
- Session-level voice telemetry.

MVP policy:

- Room name is derived from authorized case session ID.
- API signs tokens only for authorized session participants.
- Guest demo rooms have stricter duration and rate limits.

### OpenAI

Digunakan untuk:

- Patient response naturalization from grounded case facts.
- Structured feedback wording from deterministic scoring data.
- Optional STT fallback if the primary STT provider fails.

MVP policy:

- OpenAI must not decide the final score.
- OpenAI must not invent symptoms, diagnoses, exam results, or medical advice.
- Prompt output is validated before TTS.

### Deepgram

Default realtime STT provider for LiveKit Agents, including Indonesian speech support.

### ElevenLabs

Default TTS provider with per-patient voice mapping.

Fallback:

- If TTS fails, show text response and keep the consultation usable.
- If voice stack fails, the frontend offers text fallback where available.

## 5. Public API Surface

The HTTP API keeps the technical design shape and is implemented through FastAPI:

```http
GET    /api/me
PATCH  /api/me/profile
POST   /api/me/onboarding-complete

GET    /api/public/cases/demo
GET    /api/public/specialists
GET    /api/specialists
GET    /api/specialists/{specialist_id}/cases
GET    /api/cases/{case_id}

POST   /api/case-sessions
GET    /api/case-sessions/{session_id}
POST   /api/case-sessions/{session_id}/medical-record/opened
POST   /api/case-sessions/{session_id}/examinations
POST   /api/case-sessions/{session_id}/timer/extend
POST   /api/case-sessions/{session_id}/end-consultation
POST   /api/case-sessions/{session_id}/quiz-submit

GET    /api/case-results/{result_id}
GET    /api/history
GET    /api/history/{result_id}
GET    /api/leaderboard

POST   /api/livekit/token
GET    /api/livekit/sessions/{session_id}/agent-context
POST   /api/livekit/sessions/{session_id}/transcript
POST   /api/livekit/sessions/{session_id}/events

POST   /api/demo/session
POST   /api/demo/{session_id}/claim
```

Contract rule:

- FastAPI OpenAPI is the source of truth.
- Generated OpenAPI JSON is committed under `packages/contracts`.
- Generated TypeScript client is committed under `packages/contracts` and used by `apps/web`.

## 6. Data Implementation Scope

Phase 1 migrations should create the baseline tables from the technical design:

- `profiles`
- `specialists`
- `cases`
- `case_sessions`
- `conversation_messages`
- `examination_events`
- `quiz_submissions`
- `case_results`
- `user_case_stats`
- `leaderboard_entries`

Additional operational tables can be added only when needed:

- `guest_sessions` for claim token, expiration, and anti-abuse metadata.
- `voice_session_events` for LiveKit/provider telemetry.
- `rate_limit_events` if the selected deployment stack does not provide this externally.

Seed data:

- 1 available specialist: Cardiology.
- Coming-soon specialists: General Medicine, Neurology, Pediatrics, Dentistry, Neurosurgery.
- 3 published Cardiology cases: Maya, Budi, Siti.
- Maya is the only guest demo case.

RLS expectations:

- Public users can read published public content.
- Authenticated users can read and mutate their own profile/session/result rows.
- Guests can only access demo session data through signed claim/session tokens, not broad table reads.
- Leaderboard exposes only public display fields.

## 7. Implementation Phases

### Phase 1 - Foundation, Auth, Content Shell

Goal:

Build the runnable monorepo foundation and the non-game content shell.

Backend deliverables:

- Scaffold `apps/api` with FastAPI, Pydantic, health checks, settings, and test setup.
- Add Supabase service integration and auth middleware.
- Add migrations and seed data for profiles, specialists, cases, and base session tables.
- Add public demo case endpoints.
- Add authenticated profile and onboarding endpoints.
- Generate OpenAPI JSON into `packages/contracts`.

Frontend deliverables:

- Scaffold `apps/web` with Next.js App Router, TypeScript, Tailwind, Bun, and PWA baseline.
- Build responsive app shell and pixel-art visual direction.
- Implement smart entry routing.
- Implement landing, auth screens, onboarding, dashboard, specialist list, case list, and case brief.
- Wire frontend API client from `packages/contracts`.

Exit criteria:

- A new user can open landing, try demo entry, or sign in.
- A logged-in user can see dashboard, Cardiology, and 3 cases.
- Case brief hides diagnosis and hidden clinical data.
- API tests pass for health, public content, auth profile, and onboarding.

### Phase 2 - Non-Voice Gameplay Loop

Goal:

Ship a complete consultation loop without realtime voice dependency.

Backend deliverables:

- Case session create/get lifecycle.
- Session state transitions: `brief`, `in_consultation`, `quiz`, `completed`, `abandoned`.
- Medical record opened event.
- Examination event creation with delay metadata and result readiness.
- Timer extension with one-extension MVP rule.
- End-consultation endpoint.
- Quiz submit endpoint with deterministic scoring.
- Result persistence, history list/detail, and retry bookkeeping.

Frontend deliverables:

- Consultation room text-mode.
- Message panel with system and patient text states.
- Medical record panel.
- Examine panel with pending/result states.
- Timer and one-extension UI.
- End-consultation confirmation modal with no clue leakage.
- Diagnosis quiz.
- Result screen with stars, score breakdown, feedback placeholder, and retry.
- History list/detail.

Exit criteria:

- A logged-in user can complete Maya, Budi, and Siti without voice.
- A guest can complete Maya demo without login.
- Scoring, stars, XP placeholder, and history detail persist correctly.
- Invalid state transitions return clear API errors.

### Phase 3 - Realtime Voice Consultation

Goal:

Replace text-mode patient interaction with LiveKit voice consultation while preserving text fallback.

Backend deliverables:

- LiveKit token endpoint.
- Room naming and session authorization.
- Agent context endpoint with case facts, persona, TTS profile, completed examinations, and safety rules.
- Transcript write endpoint.
- Voice event logging endpoint.
- Guest voice duration and rate limits.

Voice agent deliverables:

- Scaffold `apps/voice-agent` with LiveKit Agents Python.
- Join authorized rooms as patient NPC.
- Integrate default STT provider.
- Implement grounded case fact selection.
- Integrate OpenAI response naturalizer.
- Validate response before TTS.
- Integrate ElevenLabs TTS.
- Emit text transcript and metadata to API.
- Implement safe fallback response and text-only fallback.
- Handle reconnect, timeout, interruption, and graceful shutdown.

Frontend deliverables:

- LiveKit Web SDK integration.
- Tap-once continuous talk mode.
- Voice states: idle, connecting, listening, patient_thinking, patient_speaking, reconnecting, error.
- Microphone permission handling.
- Reconnect and fallback UI.
- Transcript disclosure before consultation starts.
- Visible text transcript bubbles for stored messages.

Exit criteria:

- User can speak to Maya through LiveKit and hear a grounded patient response.
- Patient cannot mention diagnosis, invented facts, or unperformed exam results.
- Transcript text is stored.
- Raw audio is not stored.
- Text fallback keeps the session completable if voice fails.

### Phase 4 - Gamification and Conversion

Goal:

Complete the learning loop with motivation, progress, leaderboard, and guest conversion.

Backend deliverables:

- XP calculation from base XP, score multiplier, and difficulty multiplier.
- Retry rule: first clear full XP, retry 20% XP, best score can update.
- Stars safety gate.
- User case stats.
- Global leaderboard entries.
- Guest result claim after login/register.
- AI-written structured feedback from deterministic scoring data.

Frontend deliverables:

- XP and level display.
- Stars polish and safety-aware feedback wording.
- Retry CTA.
- Leaderboard.
- Guest result claim CTA and claimed result state.
- Profile progress summary.

Exit criteria:

- First completion awards full XP.
- Retry awards reduced XP and can update best score.
- Guest result can be claimed once after login.
- Claimed guest result appears in history and leaderboard.
- AI feedback never contradicts deterministic scoring data.

### Phase 5 - QA, Safety, and Release Hardening

Goal:

Make the MVP reliable enough for public demo and judging.

Backend and agent deliverables:

- RLS audit.
- Rate limits and cost guards.
- AI guardrail tests.
- Voice latency, STT failure, TTS failure, disconnect, and cost metrics.
- Graceful worker shutdown.
- Provider timeout and fallback tests.

Frontend deliverables:

- Responsive QA for mobile, tablet, and desktop.
- PWA install behavior.
- Accessibility pass.
- Empty, loading, and error states.
- Final pixel-art UI QA.
- Public demo flow polish.

Exit criteria:

- Landing -> demo -> complete case -> result -> signup/login claim works end to end.
- Authenticated case completion and leaderboard work end to end.
- Mobile, tablet, desktop, and installed PWA entry flows are verified.
- Safety and privacy promises are reflected in UI and implementation.

## 8. Test Plan

### Python unit tests

Cover:

- Scoring breakdown.
- Quiz validation.
- XP calculation.
- Retry behavior.
- Stars safety gate.
- Case unlock rules.
- Patient response validation.
- Case config validation.

### FastAPI integration tests

Cover:

- Authenticated profile and onboarding.
- Public specialists and demo case.
- Case session lifecycle.
- Medical record opened event.
- Examination delay/result flow.
- Timer extension.
- End consultation.
- Quiz submit.
- Results and history.
- Leaderboard.
- Guest demo and claim.
- Invalid state transitions.
- LiveKit token authorization.
- Agent transcript writes.

### Supabase migration and RLS tests

Cover:

- User-owned sessions and results.
- Public published content.
- Guest demo access constraints.
- Leaderboard public fields.
- Transcript privacy.

### Voice-agent smoke tests

Cover:

- Worker joins LiveKit room.
- STT transcript is accepted.
- Grounded patient response is generated.
- Response validation blocks unsafe output.
- TTS generation succeeds.
- Text fallback is emitted on provider failure.
- Disconnect and timeout behavior.

### Playwright E2E

Cover:

- Landing -> Try Demo -> complete Maya -> result -> login/register claim.
- Authenticated login -> choose Cardiology -> complete case -> result.
- Retry case.
- Leaderboard visibility.
- Mobile, tablet, desktop responsive flows.
- PWA install/splash behavior where browser support allows.

## 9. Environment Variables

Expected frontend variables:

```txt
NEXT_PUBLIC_API_BASE_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_LIVEKIT_URL
```

Expected API variables:

```txt
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
LIVEKIT_URL
LIVEKIT_API_KEY
LIVEKIT_API_SECRET
OPENAI_API_KEY
DEEPGRAM_API_KEY
ELEVENLABS_API_KEY
REDIS_URL
```

Expected voice-agent variables:

```txt
API_BASE_URL
VOICE_AGENT_API_TOKEN
LIVEKIT_URL
LIVEKIT_API_KEY
LIVEKIT_API_SECRET
OPENAI_API_KEY
DEEPGRAM_API_KEY
ELEVENLABS_API_KEY
```

Rule:

- Public browser variables must never include service-role keys, LiveKit API secret, provider secrets, or agent tokens.

## 10. Local Development Commands

The exact commands can be finalized during scaffolding, but the target developer experience is:

```txt
bun install
bun run dev:web
bun run contracts:generate

cd apps/api
uv sync
uv run fastapi dev src/pixelaid_api/main.py
uv run pytest

cd apps/voice-agent
uv sync
uv run python -m pixelaid_voice_agent.worker
uv run pytest
```

Repository-level commands should eventually wrap these:

```txt
bun run lint
bun run typecheck
bun run test
bun run build
```

## 11. Deployment Plan

Recommended MVP deployment:

- `apps/web`: Vercel or equivalent frontend platform.
- `apps/api`: Railway, Render, Fly.io, or Cloud Run.
- `apps/voice-agent`: separate worker service on Railway, Render, Fly.io, or Cloud Run.
- Supabase: managed project for auth, database, RLS, and migrations.
- LiveKit Cloud: managed WebRTC rooms.
- Redis: optional managed Redis for session/cache/rate-limit support.

Deployment rules:

- API and voice agent deploy independently.
- Voice agent failure must not break login, dashboard, case brief, result, history, or leaderboard.
- API deploy should run migrations through an explicit migration job, not from every app boot.
- Web deploy must use generated contracts from the same API version.

## 12. MVP Non-Goals

Do not build these in the MVP:

- Native mobile app.
- Capacitor wrapper.
- Instructor dashboard.
- Custom case builder.
- All specialists playable.
- Full transcript review UI in history.
- Raw audio storage.
- Free-text diagnosis grading.
- Multiplayer.
- Full offline gameplay.

## 13. Main Risks and Mitigations

### Voice latency

Risk:

- STT + LLM + TTS can feel slow for realtime consultation.

Mitigation:

- Start voice work in Phase 3 before gamification polish.
- Track speech-to-response latency.
- Keep patient responses short.
- Provide text fallback.

### AI fact drift

Risk:

- Patient NPC may invent symptoms or reveal diagnosis.

Mitigation:

- Retrieve from `case_data.allowed_patient_facts`.
- Validate response before TTS.
- Regenerate once, then use safe fallback.
- Add guardrail tests for every MVP case.

### Scope expansion

Risk:

- Medical simulation can expand into admin tools, case builders, or advanced analytics too early.

Mitigation:

- Keep MVP to Cardiology, 3 cases, 1 guest demo.
- Keep quiz static-controlled by case config.
- Keep instructor and custom content tools as future enhancements.

### Privacy mismatch

Risk:

- Voice implementation accidentally stores or exposes raw audio.

Mitigation:

- Store text transcript only.
- Add code and deployment checks for storage paths.
- Disclose transcript storage before consultation.
- Audit RLS before release.

## 14. Definition of Done for MVP

MVP is done when:

- Guest can complete Maya demo and claim the result after login/register.
- Logged-in user can complete all 3 Cardiology cases.
- Consultation works with voice and text fallback.
- Scoring, stars, XP, retry, history, and leaderboard work from persisted data.
- Patient NPC responses are grounded in case facts and pass safety rules.
- No raw audio is stored.
- Responsive PWA entry works on mobile, tablet, desktop, and installed mode.
- Automated tests cover core scoring, API lifecycle, RLS assumptions, voice smoke behavior, and main E2E flows.
