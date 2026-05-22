# Final Technical Design Document — PixelAid

## 1. Executive Summary

PixelAid adalah aplikasi **responsive PWA** berbasis **Next.js** untuk simulasi edukatif dokter koas dalam format 2D pixel-art medical simulation game. Produk berjalan sebagai web app yang responsif di desktop, tablet, dan mobile, serta dapat di-install sebagai PWA untuk pengalaman seperti aplikasi mobile.

Fitur inti adalah **real-time continuous voice consultation** antara user dan pasien NPC menggunakan **LiveKit**. Backend dan AI agent menggunakan **Python**, sedangkan database, autentikasi, storage, dan fitur realtime non-audio menggunakan **Supabase**.

Dokumen ini adalah technical specification final berdasarkan PRD dan keputusan brainstorming/grill.

---

## 2. Locked Technical Stack

### Frontend

```text
Next.js
React
TypeScript
Tailwind CSS
PWA support
Responsive layout for mobile, tablet, desktop
```

### Realtime Voice

```text
LiveKit
LiveKit Web SDK
LiveKit Agents Python
WebRTC audio session
Continuous conversation mode
```

### Backend

```text
Python
FastAPI
Pydantic
Uvicorn/Gunicorn
Redis optional for session/cache/rate limit
```

### Database / Auth / BaaS

```text
Supabase Auth
Supabase Postgres
Supabase Storage
Supabase Realtime
Row Level Security
```

### AI / Voice Providers

```text
LLM: OpenAI or equivalent text model
STT: provider integrated via LiveKit Agents, e.g. OpenAI/Deepgram
TTS: ElevenLabs or equivalent streaming TTS
```

### Deployment Target

```text
Frontend: Vercel / Netlify / Cloudflare Pages
Backend: Railway / Render / Fly.io / Cloud Run
LiveKit: LiveKit Cloud or self-hosted
Database/Auth: Supabase
Redis: Upstash / Railway Redis, optional
```

---

## 3. Product Platform Decision

PixelAid menggunakan **responsive PWA**, bukan mobile-only fixed frame.

Artinya:

```text
Mobile: app/game-like experience
Tablet: layout lebih lega, panel bisa lebih fleksibel
Desktop: landing page, dashboard, dan gameplay layout responsif
Installed PWA: terasa seperti aplikasi mobile/game
```

Produk tetap mobile-first secara gameplay, tetapi tidak membatasi diri hanya pada mobile screen.

---

## 4. Entry Flow — Smart Entry

Keputusan final: **Smart Entry**.

### Behavior

```text
Browser biasa + user baru:
→ Landing Page

Browser biasa + user sudah login:
→ App Homepage / Dashboard

Installed PWA:
→ Splash singkat
→ App Homepage jika sudah login
→ Auth jika belum login

User klik Try Demo:
→ Demo Case tanpa login

User klik shared case link:
→ Case Brief / Demo Preview
```

### Route Strategy

```text
/                       Public landing page
/sign-in                Auth page
/register               Register page
/app                    App entry router
/app/splash             PWA splash screen
/app/onboarding         First-time user onboarding
/app/home               Main app homepage
/app/specialists        Choose specialist
/app/specialists/[id]   Specialist detail / case list
/app/cases/[id]/brief   Case brief
/app/sessions/[id]      Consultation room
/app/sessions/[id]/result Case result
/history                User history
/leaderboard            Global leaderboard
/profile                User profile
```

### PWA Detection

Frontend can detect installed PWA mode:

```ts
const isStandalone =
  window.matchMedia('(display-mode: standalone)').matches ||
  (window.navigator as any).standalone === true;
```

---

## 5. Guest Demo Mode

Keputusan final: **Guest can play 1 demo case**.

### Behavior

```text
Landing Page
→ Try Demo
→ Case Brief Demo
→ Consultation Room Demo
→ Case Result
→ CTA login/register untuk menyimpan progress
```

### Rules

```text
Guest hanya bisa memainkan 1 demo case
Guest demo menggunakan Case 1: Maya / Cardiology
Guest result temporary sebelum login
Guest dapat menyimpan result setelah login
Guest result dapat masuk history, XP, dan leaderboard setelah diklaim
Guest voice session memiliki durasi terbatas
Guest result hanya bisa diklaim sekali
```

### Abuse Prevention

```text
Rate limit demo voice session
One active demo session per browser/session
Claim token with expiration
Claim token single-use
Store guest session fingerprint lightly without collecting sensitive data
```

---

## 6. Onboarding Placement

Keputusan final: **Onboarding setelah login / app first entry + inline tutorial untuk guest**.

### Flow

```text
User baru dari web:
Landing Page → Try Demo → Case Brief Demo → inline tutorial → Consultation Room Demo

User register/login pertama kali:
Auth → Onboarding 3–4 slides → Homepage

Returning user:
Session check → Homepage

Installed PWA first open:
Splash → Auth/Login → Onboarding → Homepage

Installed PWA returning user:
Splash singkat → Homepage
```

### Onboarding Slides

```text
Slide 1: Kamu adalah dokter koas virtual
Slide 2: Tanya pasien menggunakan fitur Talk
Slide 3: Gunakan Examine dan Medical Record
Slide 4: Akhiri konsultasi, jawab quiz, dapat feedback
```

### Guest Inline Tutorial

```text
Tooltip 1: Tekan Talk untuk mulai berbicara dengan pasien
Tooltip 2: Buka Examine untuk memilih pemeriksaan
Tooltip 3: Buka Medical Record untuk melihat riwayat penting
Tooltip 4: Tekan End Consultation jika informasi sudah cukup
```

---

## 7. MVP Specialist Scope

Keputusan final: **MVP hanya 1 specialist playable: Cardiology**.

### Choose Specialist UI

```text
Cardiology → Available / Playable
General Medicine → Coming Soon
Neurology → Coming Soon
Pediatrics → Coming Soon
Dentistry → Coming Soon
Neurosurgery → Locked / Coming Soon
```

Rasional:

```text
Fokus pada kualitas satu experience lengkap
Case cardiology sudah cocok untuk flow PRD
Medical reasoning jelas: chest pain, ECG, troponin, red flag, allergy awareness
```

---

## 8. MVP Cardiology Cases

Keputusan final: **3 Cardiology cases**.

### Case 1 — Easy / Guest Demo

```text
Patient: Maya
Age: 27
Complaint: nyeri dada, sesak napas, pusing
Focus: anamnesis dasar, alergi, ECG, troponin
Target diagnosis: Acute Coronary Syndrome suspicion
Guest available: yes
```

### Case 2 — Medium

```text
Patient: Budi
Age: 45
Complaint: berdebar-debar dan lemas
Focus: onset, trigger, riwayat obat/kafein, vital signs, ECG
Target diagnosis: arrhythmia / atrial fibrillation suspicion
Guest available: no
```

### Case 3 — Medium/Hard

```text
Patient: Siti
Age: 62
Complaint: sesak saat aktivitas dan kaki bengkak
Focus: hipertensi, orthopnea, edema, pemeriksaan fisik, chest X-ray, BNP
Target diagnosis: heart failure suspicion
Guest available: no
```

---

## 9. Case Unlock System

Keputusan final: **All 3 Cardiology cases are available for logged-in users**.

### Behavior

```text
Guest user:
→ hanya bisa memainkan Case 1: Maya

Logged-in user:
→ bisa langsung memainkan Case 1, Case 2, Case 3

Case list:
→ tetap diberi label difficulty dan recommended order
```

### Case Card Labels

```text
Case 1: Easy / Recommended / Demo Available
Case 2: Medium / New
Case 3: Medium-Hard / Challenge
```

---

## 10. Case Brief Information Level

Keputusan final: **Moderate Brief**.

Case Brief memberi konteks awal, tetapi tidak membocorkan informasi kunci.

### Content

```text
Patient Info:
- Avatar pixel pasien
- Nama
- Umur
- Gender

Chief Complaint:
- Keluhan utama

Triage Note:
- 1 kalimat konteks awal

Case Metadata:
- Specialist
- Difficulty
- Condition badge
- Deadline

CTA:
- Start Consultation
```

### Hidden from Case Brief

```text
Alergi detail
Riwayat penyakit lengkap
Obat yang sedang dikonsumsi
Lokasi/radiasi nyeri
Gejala penyerta detail
Hasil pemeriksaan
Diagnosis hint
```

Informasi tersebut ditemukan melalui:

```text
Talk / anamnesis
Medical Record Panel
Examine Panel
```

---

## 11. Medical Record Panel

Keputusan final: **Medical Record optional, but affects scoring**.

### Behavior

```text
User boleh membuka Medical Record kapan saja
User tidak wajib membuka Medical Record
Sistem mencatat apakah Medical Record dibuka
Medical Record Awareness masuk ke scoring
Jika user melewatkan info penting, score dapat turun
```

### MVP Content

```text
Nama pasien
Umur
Gender
Keluhan utama
Riwayat penyakit singkat
Alergi
Obat yang sedang dikonsumsi jika ada
Catatan triase awal
```

### Example — Maya

```text
Nama: Maya
Umur: 27 tahun
Gender: Perempuan
Keluhan utama: nyeri dada, sesak napas, pusing
Riwayat: asma ringan
Alergi: Penicillin
Obat: tidak ada obat rutin
Catatan: pasien tampak cemas saat triase
```

---

## 12. Talk Mode / Voice Interaction

Keputusan final: **Tap once to start continuous conversation**.

### Core Behavior

```text
User tap tombol Talk sekali
→ user join voice consultation mode
→ microphone aktif
→ conversation berjalan natural
→ user bisa bertanya tanpa tap ulang
→ pasien NPC menjawab dengan voice + chat bubble
→ user bisa interrupt / barge-in
→ user bisa mute / stop conversation mode
```

### LiveKit Flow

```text
Frontend joins LiveKit room
→ LiveKit Agent joins as patient NPC
→ User audio streamed via WebRTC
→ STT transcribes user speech
→ Agent processes transcript
→ LLM generates patient response
→ TTS generates patient voice
→ Audio streamed back to user
→ Text response displayed in chat bubble
```

### Required Voice States

```text
Idle: Tap to Talk
Connecting: Menyiapkan ruang konsultasi...
Listening: Mendengarkan...
User Speaking: Kamu sedang berbicara
Patient Thinking: Pasien sedang merespons...
Patient Speaking: Pasien sedang menjawab
Muted: Mic dimatikan
Disconnected: Koneksi terputus
```

### Failure Handling

```text
Mic permission denied → show enable mic instruction
LiveKit disconnected → reconnect button
STT unclear → “Aku belum menangkap suara kamu, coba ulangi.”
TTS failed → show text bubble only
Agent timeout → retry/reconnect
```

---

## 13. Consultation Timer

Keputusan final: **Timer habis memberi warning + pilihan lanjut dengan penalti atau masuk Quiz**.

### Behavior

```text
Timer berjalan selama consultation
Saat sisa 60 detik → warning ringan
Saat 0 detik → consultation pause
User diberi pilihan:
1. Lanjut ekstra waktu dengan penalti
2. Masuk Quiz Diagnosis sekarang
```

### MVP Rule

```text
Maximum extension: 1x
Extension duration: 60 seconds
Penalty: Time Score reduced
```

### Modal Copy

```text
Waktu konsultasi habis.

Kamu bisa lanjut 60 detik dengan penalti Time Score,
atau masuk ke Quiz Diagnosis sekarang.
```

---

## 14. End Consultation Confirmation

Keputusan final: **General confirmation only, no clue/checklist**.

### Behavior

```text
User tap End Consultation
→ tampil general confirmation
→ user pilih:
   - Kembali ke konsultasi
   - Lanjut ke Quiz
```

### Modal Copy

```text
Akhiri konsultasi?

Pastikan kamu sudah menggali informasi yang cukup,
melakukan pemeriksaan yang relevan, dan membaca data pasien bila diperlukan.

Setelah lanjut ke Quiz Diagnosis, kamu tidak bisa kembali ke ruang konsultasi.
```

Tidak ada warning seperti “kamu belum menanyakan onset/alergi” karena itu memberi clue.

---

## 15. Quiz Diagnosis Format

Keputusan final: **Multiple Choice Clinical Reasoning Quiz**.

Quiz bersifat:

```text
Dynamic-by-case
Static-controlled from case config
Not generated freely by AI at runtime
```

### Quiz Structure

```text
Q1. Diagnosis paling mungkin
Q2. Supporting evidence / alasan utama
Q3. Next best step / langkah berikutnya
```

### Score Weight

```text
Diagnosis: 40% of Quiz Score
Supporting Evidence: 30% of Quiz Score
Next Best Step: 30% of Quiz Score
```

### Example Config

```json
{
  "quiz": [
    {
      "type": "single_choice",
      "category": "diagnosis",
      "question": "Apa diagnosis paling mungkin pada pasien ini?",
      "options": [
        "Asthma Exacerbation",
        "Panic Attack",
        "GERD",
        "Acute Coronary Syndrome"
      ],
      "answer": "Acute Coronary Syndrome",
      "score_weight": 40
    },
    {
      "type": "single_choice",
      "category": "supporting_evidence",
      "question": "Informasi mana yang paling mendukung pilihan tersebut?",
      "options": [
        "Nyeri dada disertai sesak dan temuan pemeriksaan jantung",
        "Pasien tampak cemas",
        "Riwayat asma ringan tanpa gejala lain",
        "Keluhan pusing saja"
      ],
      "answer": "Nyeri dada disertai sesak dan temuan pemeriksaan jantung",
      "score_weight": 30
    },
    {
      "type": "single_choice",
      "category": "next_best_step",
      "question": "Langkah berikutnya yang paling tepat adalah?",
      "options": [
        "Evaluasi segera dengan pemeriksaan jantung yang relevan dan monitor kondisi pasien",
        "Memberikan antibiotik Penicillin",
        "Menyimpulkan sebagai panik tanpa pemeriksaan",
        "Mengakhiri konsultasi tanpa tindak lanjut"
      ],
      "answer": "Evaluasi segera dengan pemeriksaan jantung yang relevan dan monitor kondisi pasien",
      "score_weight": 30
    }
  ]
}
```

---

## 16. Examine Panel Behavior

Keputusan final: **Pemeriksaan punya delay waktu**.

### Behavior

```text
User buka Examine Panel
→ pilih pemeriksaan
→ status “Menunggu hasil...”
→ consultation timer tetap berjalan
→ hasil muncul setelah delay tertentu
→ pemeriksaan dicatat untuk scoring
```

### MVP Delay Rules

```text
Check vitals: instant
Physical exam: 5 seconds
ECG: 10 seconds
Chest X-Ray: 20 seconds
CBC: 20 seconds
Troponin: 30 seconds
BNP: 30 seconds
```

---

## 17. Examination Availability

Keputusan final: **Semua kategori tersedia, detail test curated per case**.

### Categories

```text
Vital Signs
Physical Exam
Cardiac Tests
Lab Tests
Imaging
```

### Example — Case Maya

```text
Vital Signs:
- Check vitals

Physical Exam:
- Cardiopulmonary exam

Cardiac Tests:
- ECG

Lab Tests:
- Troponin I
- CBC

Imaging:
- Chest X-Ray
```

### Examination Metadata

```json
{
  "key": "ecg",
  "label": "ECG",
  "category": "cardiac_tests",
  "delay_seconds": 10,
  "relevance": "high",
  "score_delta": 15,
  "result": "Terdapat perubahan ST-T yang mencurigakan iskemia."
}
```

---

## 18. Patient NPC Response Source

Keputusan final: **Hybrid: static case facts + LLM naturalizer, but not over-deterministic**.

### Principle

```text
Sumber fakta tetap terkontrol.
Gaya jawaban tetap natural, bervariasi, dan manusiawi.
```

### Flow

```text
User speaks
→ STT transcript
→ Agent detects intent/topic
→ System retrieves relevant facts from case_data
→ LLM naturalizes response as patient
→ Validator checks response safety
→ TTS generates voice
→ Client plays audio and shows chat bubble
```

### Source of Truth

```text
case_data.allowed_patient_facts
```

### What LLM Can Do

```text
Paraphrase facts
Use natural patient language
Add light emotion/personality
Combine 1–2 relevant facts when appropriate
Say “saya kurang tahu” if data is unavailable
Maintain patient persona
```

### What LLM Cannot Do

```text
Add new clinical symptoms
Mention examination results that have not been performed
Give diagnosis
Speak like a doctor
Change severity
Create new medical history
Give real medical advice
```

### Example

Fact:

```json
{
  "onset": "sejak tadi pagi"
}
```

User asks:

```text
“Sejak kapan nyeri dadanya?”
```

Patient response:

```text
“Mulainya tadi pagi, Dok. Awalnya saya kira cuma masuk angin, tapi makin lama makin nggak nyaman.”
```

---

## 19. Patient Personality and TTS

Keputusan final: **Persona ringan per pasien + unique TTS voice per patient**.

### Patient Persona Example

```json
{
  "patient_persona": {
    "name": "Maya",
    "tone": "cemas tapi kooperatif",
    "speech_length": "pendek sampai sedang",
    "health_literacy": "awam",
    "emotion": "khawatir karena nyeri dada",
    "language_style": "Bahasa Indonesia sehari-hari",
    "cooperativeness": "tinggi"
  },
  "tts_profile": {
    "provider": "elevenlabs",
    "voice_id": "maya_voice_id",
    "voice_style": "young_female_anxious_soft",
    "stability": 0.55,
    "similarity_boost": 0.75,
    "speed": 1.0
  }
}
```

### MVP Persona Map

```text
Maya, 27 tahun:
- persona: cemas, kooperatif, bicara agak cepat
- TTS: suara perempuan muda, lembut, sedikit anxious

Budi, 45 tahun:
- persona: praktis, agak bingung, menjawab pendek
- TTS: suara laki-laki dewasa, medium-low, natural

Siti, 62 tahun:
- persona: pelan, mudah lelah, sopan
- TTS: suara perempuan lebih tua, tempo lebih lambat
```

---

## 20. Scoring System

Keputusan final: **Adjusted MVP scoring**.

### Total Score

```text
Total Score = 100 points
```

### Breakdown

```text
Quiz / Clinical Decision: 35%
Interview Quality: 25%
Examination Decision: 20%
Medical Record Awareness: 10%
Time Efficiency: 5%
Safety Bonus/Penalty: 5%
```

### Quiz Breakdown

From 35 points:

```text
Diagnosis: 14 points
Supporting Evidence: 10.5 points
Next Best Step: 10.5 points
```

### Interview Quality

Scored from detected key topics/questions:

```text
Onset
Location/characteristic
Associated symptoms
Red flags
Relevant history
Medication/allergy inquiry
```

### Examination Decision

```text
Relevant exam selected → positive score
Critical exam selected → larger positive score
Irrelevant exam selected → penalty
Too many irrelevant exams → efficiency penalty
```

### Medical Record Awareness

```text
Opened medical record → awareness signal
Used/asked about allergy/history → stronger signal
Ignored important record info → penalty
```

### Time Efficiency

```text
Finished within time → full time score
Used extension → reduced time score
Multiple extension not allowed in MVP
```

### Safety

```text
Safety-critical awareness → bonus/retain full eligibility
Missed safety-critical item → penalty
Dangerous decision → stronger penalty and star gate
```

---

## 21. Stars Rating

Keputusan final: **Stars berdasarkan Total Score + Safety Gate**.

### Base Stars

```text
0–39 score: 1 star
40–69 score: 2 stars
70–100 score: 3 stars
```

### Safety Gate

```text
If safety-critical item missed:
→ maximum 2 stars

If dangerous decision made:
→ maximum 1 star

If safety requirements are met:
→ eligible for 3 stars
```

### UX Rule

Do not show technical star-gate reason as a separate section. Explain it inside structured feedback.

---

## 22. Case Result Feedback

Keputusan final: **Structured feedback**.

### Result Screen Content

```text
Stars
Total Score
XP gained
Score breakdown
Structured feedback
Retry button
Back to Home
View History Detail
```

### Feedback Format

```text
1. Yang sudah baik
2. Yang terlewat
3. Catatan safety
4. Saran berikutnya
```

### Feedback Generation

AI can generate final wording, but only from structured scoring data.

Scoring engine decides:

```text
Diagnosis correctness
Evidence correctness
Next step correctness
Asked/missed key interview topics
Selected/missed examinations
Medical record opened or not
Safety misses
Time performance
```

AI only turns the structured result into natural Indonesian feedback.

---

## 23. History Detail

Keputusan final: **History stores result detail + action summary**.

### History List

```text
Tanggal main
Nama pasien / case
Specialist
Difficulty
Total Score
Stars
XP gained
Status: Completed / Retried
```

### History Detail

```text
Case summary
Score breakdown
Stars
Quiz answers
Selected examinations
Medical Record opened: yes/no
Feedback terstruktur
Missed key categories
Retry button
```

### Not shown in MVP History UI

```text
Full transcript konsultasi
Full timeline per detik
Audio recording
Raw AI logs
```

---

## 24. Conversation Transcript Storage

Keputusan final: **Store text transcript, not audio**.

### Stored

```text
User transcript from STT
Patient text response
Timestamp
Role: user / patient / system
Source: voice_stt / llm_naturalized / system_event
Detected intent if available
Matched fact keys if available
Grounded fact keys for patient response
```

### Not Stored

```text
Raw user audio
Raw patient audio
```

### UX Disclosure

Before consultation starts:

```text
Percakapan dapat disimpan dalam bentuk teks untuk evaluasi pembelajaran. Audio tidak disimpan.
```

---

## 25. Leaderboard Scope

Keputusan final: **Global leaderboard semua case**.

### Leaderboard Rule

```text
Leaderboard utama = global XP / user ranking
Case score tetap disimpan per case for detail/internal analytics
Guest tidak masuk leaderboard sebelum login
Guest demo result dapat masuk leaderboard setelah diklaim lewat login
```

### MVP Ranking

```text
Primary: Total XP
Tie-breaker 1: Average best score
Tie-breaker 2: Total completed cases
Tie-breaker 3: Latest activity
```

### Display Fields

```text
Rank
Avatar
Username
Level
Total XP
Average best score
Completed cases
```

---

## 26. XP System

Keputusan final: **XP based on score and difficulty**.

### Formula

```text
XP = base XP case × score multiplier × difficulty multiplier
```

### Difficulty Multiplier

```text
Easy: ×1.0
Medium: ×1.25
Hard: ×1.5
```

### Example

```text
Case Maya
Difficulty: Easy
Base XP: 100
Score: 82
Difficulty multiplier: 1.0

XP gained = 100 × 0.82 × 1.0 = 82 XP
```

---

## 27. Retry Behavior

Keputusan final: **First clear full XP, retry gets small XP, best score can update**.

### Behavior

```text
First completion:
→ full XP based on score and difficulty

Retry:
→ small XP reward
→ best score updates if higher
→ attempt history saved
```

### MVP Retry XP

```text
Retry XP = 20% of calculated XP
```

---

## 28. Demo Case Conversion

Keputusan final: **Guest demo result can be saved after login**.

### Flow

```text
Guest completes demo case
→ sees result
→ clicks “Simpan progress”
→ login/register
→ result demo masuk history
→ XP disimpan
→ score bisa masuk leaderboard
```

### Technical Requirement

```text
Create guest_session
Create demo_result with claim_token
After login, exchange claim_token
Attach result to user_id
Invalidate claim_token
```

---

## 29. Database Schema Draft

### profiles

```sql
create table profiles (
  id uuid primary key references auth.users(id),
  username text unique,
  display_name text,
  avatar_url text,
  level int default 1,
  xp int default 0,
  onboarding_completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### specialists

```sql
create table specialists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  icon_url text,
  status text check (status in ('available', 'locked', 'coming_soon')) default 'coming_soon',
  sort_order int default 0,
  created_at timestamptz default now()
);
```

### cases

```sql
create table cases (
  id uuid primary key default gen_random_uuid(),
  specialist_id uuid references specialists(id),
  slug text unique not null,
  title text not null,
  patient_name text not null,
  patient_age int,
  patient_gender text,
  chief_complaint text,
  triage_note text,
  condition_badge text,
  difficulty text check (difficulty in ('easy', 'medium', 'hard')),
  base_xp int default 100,
  estimated_duration_seconds int default 300,
  is_demo boolean default false,
  is_published boolean default false,
  case_data jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### case_sessions

```sql
create table case_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  guest_session_id text,
  case_id uuid references cases(id),
  status text check (status in ('brief', 'in_consultation', 'quiz', 'completed', 'abandoned')),
  started_at timestamptz default now(),
  ended_at timestamptz,
  remaining_seconds int,
  used_extension boolean default false,
  livekit_room_name text,
  session_state jsonb default '{}'::jsonb
);
```

### conversation_messages

```sql
create table conversation_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references case_sessions(id) on delete cascade,
  role text check (role in ('user', 'patient', 'system')),
  content text not null,
  source text,
  detected_intent text,
  matched_fact_key text,
  grounded_fact_keys text[],
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);
```

### examination_events

```sql
create table examination_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references case_sessions(id) on delete cascade,
  exam_key text not null,
  exam_label text,
  category text,
  delay_seconds int,
  result_text text,
  relevance text,
  score_delta numeric,
  selected_at timestamptz default now(),
  resulted_at timestamptz
);
```

### quiz_submissions

```sql
create table quiz_submissions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references case_sessions(id) on delete cascade,
  answers jsonb not null,
  score numeric,
  submitted_at timestamptz default now()
);
```

### case_results

```sql
create table case_results (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references case_sessions(id),
  user_id uuid references auth.users(id),
  guest_session_id text,
  case_id uuid references cases(id),
  total_score numeric,
  stars int,
  quiz_score numeric,
  interview_score numeric,
  examination_score numeric,
  medical_record_score numeric,
  time_score numeric,
  safety_score numeric,
  xp_gained int,
  is_retry boolean default false,
  is_claimed boolean default false,
  claim_token text,
  feedback jsonb,
  created_at timestamptz default now()
);
```

### user_case_stats

```sql
create table user_case_stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  case_id uuid references cases(id),
  best_score numeric default 0,
  best_stars int default 0,
  attempts int default 0,
  first_completed_at timestamptz,
  last_completed_at timestamptz,
  unique(user_id, case_id)
);
```

### leaderboard_entries

```sql
create table leaderboard_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  total_xp int default 0,
  average_best_score numeric default 0,
  completed_cases int default 0,
  latest_activity_at timestamptz,
  updated_at timestamptz default now(),
  unique(user_id)
);
```

---

## 30. API Contract Draft

### Public / Marketing

```http
GET /api/public/cases/demo
GET /api/public/specialists
```

### Authenticated App

```http
GET /api/me
PATCH /api/me/profile
POST /api/me/onboarding-complete

GET /api/specialists
GET /api/specialists/{specialist_id}/cases
GET /api/cases/{case_id}

POST /api/case-sessions
GET /api/case-sessions/{session_id}
POST /api/case-sessions/{session_id}/medical-record/opened
POST /api/case-sessions/{session_id}/examinations
POST /api/case-sessions/{session_id}/timer/extend
POST /api/case-sessions/{session_id}/end-consultation
POST /api/case-sessions/{session_id}/quiz-submit

GET /api/case-results/{result_id}
GET /api/history
GET /api/history/{result_id}
GET /api/leaderboard
```

### LiveKit

```http
POST /api/livekit/token
```

Response:

```json
{
  "room_name": "case-session-{session_id}",
  "token": "livekit-jwt",
  "agent_status": "ready"
}
```

### Guest Demo

```http
POST /api/demo/session
POST /api/demo/{session_id}/claim
```

---

## 31. LiveKit Agent Architecture

### Agent Responsibilities

```text
Join case session room
Receive user audio/STT transcript
Maintain patient persona
Retrieve case facts
Generate grounded patient response
Run response validation
Send TTS audio back to room
Emit transcript events to backend
Emit patient response events to backend
Handle interruption/barge-in
Handle timeout/reconnect
```

### Agent Context

```json
{
  "session_id": "uuid",
  "case_id": "uuid",
  "patient_persona": {},
  "tts_profile": {},
  "allowed_patient_facts": {},
  "hidden_case": {},
  "examinations_completed": [],
  "conversation_summary": "",
  "safety_rules": []
}
```

### Response Validation

Before TTS:

```text
Check no diagnosis stated by patient
Check no unperformed exam result mentioned
Check no new clinical symptom added
Check no contradiction with case facts
Check answer length
Check patient-like tone
```

If validation fails:

```text
Regenerate once
If still fails, use safe fallback response
```

---

## 32. PWA Requirements

```text
Installable manifest
Service worker for static asset cache
Offline fallback page
Responsive layout for mobile/tablet/desktop
Microphone permission handling
PWA standalone mode detection
Safe fallback if mic permission denied
App shell caching for core screens
```

---

## 33. Security, Privacy, and Safety

### Medical Safety

```text
Product is educational simulation only
Not a real diagnosis tool
AI patient can only answer from case facts
AI cannot provide medical advice
Feedback is learning-oriented
```

### Data Privacy

```text
Store text transcript only
Do not store raw audio in MVP
Disclose transcript storage before consultation
Use RLS for user-owned data
Never expose other users’ history/transcript
Leaderboard only exposes public display fields
```

### Cost Safety

```text
Guest voice duration limit
Rate limit demo sessions
Session timeout
LiveKit room cleanup
Provider usage logging
Per-session cost monitoring
```

---

## 34. MVP Development Phases

### Phase 1 — Core App Shell

```text
Next.js responsive layout
Landing page
Auth with Supabase
Smart entry routing
Homepage
Choose Specialist
Select Case
Case Brief
Basic profile and onboarding
```

### Phase 2 — Gameplay Without Voice

```text
Consultation Room UI
Message Panel
Medical Record Panel
Examine Panel with delay
End Consultation confirmation
Quiz Diagnosis
Scoring engine
Case Result
History detail
```

### Phase 3 — LiveKit Voice Agent

```text
LiveKit room creation
LiveKit token API
Python LiveKit Agent
Continuous conversation
STT → LLM → TTS pipeline
Transcript storage
Barge-in handling
TTS voice per patient
```

### Phase 4 — Gamification

```text
XP calculation
Retry behavior
Global leaderboard
Guest result claim after login
Stars + safety gate
Structured AI feedback
```

### Phase 5 — Polish and QA

```text
Case content QA
AI response guardrail testing
Voice latency testing
Responsive UI polish
PWA install behavior
Rate limiting and cost monitoring
```

---

## 35. Final Locked Decisions Summary

```text
Frontend: Next.js responsive PWA
Realtime Voice: LiveKit
Backend/API: Python FastAPI
AI Agents: Python LiveKit Agents
Database/Auth/Storage: Supabase
Entry Flow: Smart Entry
Guest Mode: 1 demo case
Onboarding: after login/app first entry + inline guest tutorial
MVP Specialist: Cardiology only
MVP Cases: 3 Cardiology cases
Case Unlock: all available for logged-in users
Case Brief: Moderate Brief
Medical Record: optional but scored
Talk Mode: tap once → continuous conversation
Timer: warning + extension penalty
End Consultation: general confirmation, no clue
Quiz: Diagnosis + Supporting Evidence + Next Best Step
Examine: curated per case with delay
NPC Response: static facts + LLM naturalizer, not over-deterministic
Patient Persona: light persona + unique TTS voice per patient
Scoring: Quiz 35, Interview 25, Exam 20, Record 10, Time 5, Safety 5
Stars: total score + safety gate
Feedback: structured AI-written from deterministic scoring data
History: result detail + action summary
Transcript: store text only, no audio
Leaderboard: global leaderboard
XP: based on score and difficulty
Retry: small XP, best score update
Demo Conversion: guest result can be saved after login
```

