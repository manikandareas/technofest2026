# PixelAid

**PixelAid** adalah simulasi medis edukatif berbasis game dengan visual **2D pixel art**. Pengguna berperan sebagai dokter virtual yang menangani pasien NPC melalui konsultasi suara real-time, pemeriksaan klinis, review rekam medis, quiz clinical reasoning, dan evaluasi performa.

Proyek ini dikembangkan untuk **Hackathon UMKT 2026** (TechnoFest 2026).

> **Disclaimer:** PixelAid hanya simulasi pembelajaran. Bukan alat diagnosis medis nyata dan tidak menggantikan pembelajaran medis formal.

## Tautan

| | |
|---|---|
| **Live demo** | [https://pixelaid.aqshara.com](https://pixelaid.aqshara.com) |
| **Desain Figma** | [Hackhaton UMKT 2026](https://www.figma.com/design/IaoofR5Tgm0mCPVy8RZcy1/Hackhaton-UMKT-2026?node-id=0-1&t=vZIUKVpQXGvg4Lq5-1) |

## Ringkasan

PixelAid membantu mahasiswa kedokteran dan pelajar yang tertarik dunia medis berlatih **anamnesis**, **pemeriksaan**, dan **clinical reasoning** dalam lingkungan yang aman untuk mencoba dan salah. Setiap sesi kasus memberikan feedback langsung berupa skor, XP, bintang, dan tips perbaikan.

Pengalaman inti: ngobrol dengan pasien pakai suara (seperti di klinik), pilih pemeriksaan yang relevan, buka rekam medis saat diperlukan, lalu jawab quiz diagnosis di akhir konsultasi.

### Fitur utama

- **Talk** — Konsultasi suara real-time dengan pasien virtual via LiveKit (push-to-talk)
- **Examine** — Pilih pemeriksaan fisik dan penunjang yang relevan; timer konsultasi tetap berjalan
- **Rekam medis** — Akses data pasien saat dibutuhkan tanpa spoiler di awal
- **Quiz** — Tebak diagnosis setelah konsultasi; dapat skor dan feedback pembelajaran
- **Progress & leaderboard** — XP, bintang, riwayat sesi, dan peringkat (untuk pengguna terdaftar)
- **Demo tanpa akun** — Coba satu kasus demo langsung dari landing page
- **PWA** — Responsif di mobile, tablet, dan desktop; dapat di-install sebagai aplikasi

### Spesialis & kasus

Saat ini tersedia **6 spesialis** dengan **18 kasus klinis** (3 kasus per spesialis):

| Spesialis | Contoh topik |
|---|---|
| Penyakit Dalam | Demam dengue, diabetes hiperglikemia, pneumonia |
| OBGYN / Reproduksi Wanita | Perdarahan trimester pertama, preeklampsia, keputihan |
| Kesehatan Anak | Kejang demam, diare dehidrasi, asma eksaserbasi |
| Bedah Umum | Appendisitis, kolesistitis akut, luka |
| Anestesi | Praoperatif asma, nyeri pascaoperasi, risiko sedasi |
| Kesehatan Mata | Konjungtivitis, glaukoma akut, abrasi kornea |

Kasus demo publik: **Anestesi — Evaluasi praoperatif asma** (tanpa login).

## Alur pengguna

```text
Landing Page
  → Coba demo (guest) / Daftar & login
  → Pilih spesialis → Pilih kasus → Case brief
  → Ruang konsultasi (Talk + Examine + Rekam medis)
  → Quiz diagnosis → Hasil & feedback
```

Pengguna yang meng-install PWA akan melihat splash screen singkat sebelum masuk ke homepage. Pengguna baru yang login pertama kali melewati onboarding singkat.

## Tech stack

| Layer | Teknologi |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS, PWA (Serwist) |
| Backend API | Python, FastAPI, Pydantic |
| Voice agent | LiveKit Agents (Python), WebRTC, Deepgram STT, Gemini/OpenRouter TTS |
| Database & auth | Supabase (Postgres, Auth, Storage, Realtime, RLS) |
| Kontrak API | OpenAPI → TypeScript client (`packages/contracts`) |
| Runtime & tooling | Bun (monorepo JS), uv (Python) |
| Deployment | Docker Compose (web, api, voice-agent) via Dokploy |

## Struktur monorepo

```txt
technofest2026/
├── apps/
│   ├── web/              Next.js App Router — PWA, landing, gameplay UI
│   ├── api/              FastAPI — sesi kasus, voice token, feedback, health
│   └── voice-agent/      LiveKit Agents worker — pasien virtual berbasis suara
├── packages/
│   ├── db/               Supabase CLI, migrasi, seed, tipe database
│   ├── contracts/        OpenAPI schema & typed fetch client
│   └── shared-py/        Skema Python bersama
├── docs/                 PRD, technical design, data kasus (data.json)
└── docker-compose.production.yml
```

## Pengembangan lokal

### Prasyarat

- [Bun](https://bun.sh) (runtime & package manager JS)
- [uv](https://docs.astral.sh/uv/) (Python dependency manager)
- Akun & env vars: Supabase, LiveKit, OpenAI, Deepgram, Google/OpenRouter (TTS)

### Bootstrap

```bash
bun install
cd apps/api && uv sync
cd ../../apps/voice-agent && uv sync
bun run contracts:generate
```

Salin dan isi variabel lingkungan sesuai kebutuhan (lihat `.env.production.example` sebagai referensi).

### Menjalankan layanan

```bash
# Frontend (port 3000)
bun run dev:web

# Backend API (port 8000)
bun run dev:api

# Voice agent (LiveKit worker)
bun run dev:voice
```

### Perintah berguna

```bash
bun run lint              # ESLint (web) + Ruff (Python)
bun run typecheck         # TypeScript + Pyright
bun run test              # Pytest (api + voice-agent)
bun run contracts:generate  # Export OpenAPI & generate TS types
bun run db:status         # Status Supabase lokal/remot
bun run db:migrations     # Daftar migrasi
bun run db:seed:build     # Build seed SQL dari docs/data.json
```

## Deployment

Production di-deploy sebagai tiga layanan Docker (`web`, `api`, `voice-agent`) dengan Traefik/Dokploy sebagai reverse proxy. Konfigurasi env production mengacu pada `.env.production.example`.

**URL production:** [https://pixelaid.aqshara.com](https://pixelaid.aqshara.com)

## Dokumentasi tambahan

- `docs/pixelaid_final_prd.md` — Product requirements
- `docs/pixelaid_technical_design_doc.md` — Arsitektur & keputusan teknis
- `docs/data.json` — Konten kasus, pasien, dan pemeriksaan
- `apps/voice-agent/README.md` — Konfigurasi voice agent & latency profile

## Lisensi

Proyek privat — TechnoFest 2026 / Hackathon UMKT 2026.
