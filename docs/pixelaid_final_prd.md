# Final PRD — PixelAid

## 1. Product Overview

**PixelAid** adalah game simulasi medis edukatif berbasis **responsive Progressive Web App (PWA)** dengan visual **2D pixel art**. Aplikasi ini menempatkan user sebagai dokter yang menangani pasien virtual melalui proses konsultasi, anamnesis berbasis voice real-time, pemeriksaan, review rekam medis, quiz clinical reasoning, dan evaluasi performa.

PixelAid bukan alat diagnosis medis nyata. Produk ini adalah media pembelajaran interaktif untuk membantu user memahami alur berpikir klinis secara ringan, visual, aman, dan engaging.

---

## 2. Product Status

| Item | Detail |
|---|---|
| Product Name | PixelAid |
| Product Type | Responsive PWA / Web-based 2D Pixel Medical Simulation Game |
| Platform | Web, Mobile Browser, Tablet, Desktop, Installable PWA |
| Core Experience | Real-time voice consultation with virtual patient NPC |
| Language | Bahasa Indonesia |
| Theme | Health & Wellness, EduTech, Medical Simulation, Game-based Learning |
| AI Role | Patient response naturalization, feedback wording, voice interaction support |
| Medical Safety | Simulasi edukatif, bukan alat diagnosis medis nyata |

---

## 3. Product Vision

Membuat pengalaman belajar clinical reasoning yang lebih interaktif dan menyenangkan melalui simulasi pasien virtual berbasis game, sehingga user dapat berlatih bertanya, memeriksa, mengambil keputusan, dan menerima feedback pembelajaran secara langsung.

---

## 4. Problem Statement

Mahasiswa kedokteran dan pelajar yang tertarik dunia medis sering kali belajar clinical reasoning dari teks, kuliah, atau latihan kasus yang pasif. Mereka membutuhkan media latihan yang:

- Interaktif dan terasa seperti konsultasi nyata.
- Aman untuk mencoba dan salah.
- Memberikan feedback langsung.
- Ringan digunakan tanpa setup rumit.
- Tidak menggantikan pembelajaran medis formal, tetapi menjadi pendukung latihan mandiri.

---

## 5. Target Users

### 5.1 Primary Users

**Mahasiswa kedokteran**

Kebutuhan:

- Latihan anamnesis.
- Latihan menentukan pemeriksaan relevan.
- Latihan clinical reasoning dasar.
- Feedback terhadap keputusan yang diambil.

### 5.2 Secondary Users

**Siswa atau mahasiswa umum yang tertarik dunia medis**

Kebutuhan:

- Memahami gambaran proses konsultasi medis secara ringan.
- Belajar melalui visual dan interaksi game.

### 5.3 Tertiary Users

**Instruktur, dosen, atau pengembang konten edukatif**

Kebutuhan jangka panjang:

- Melihat performa user.
- Membuat atau mengelola kasus.
- Menggunakan simulasi sebagai latihan tambahan.

---

## 6. Value Proposition

PixelAid membantu user merasakan pengalaman menjadi dokter melalui simulasi pasien virtual yang interaktif, responsif, dan berbasis voice real-time. User dapat bertanya kepada pasien, membuka rekam medis, memilih pemeriksaan, menjawab quiz diagnosis, dan menerima feedback performa dengan cara yang lebih engaging dibanding latihan kasus berbasis teks biasa.

---

## 7. Product Principles

1. **Educational first, not diagnostic.**  
   PixelAid adalah simulasi pembelajaran, bukan alat diagnosis medis nyata.

2. **Real-time but safe.**  
   Interaksi pasien dibuat natural melalui voice, tetapi respons tetap dibatasi oleh data kasus.

3. **Game-like but clinically meaningful.**  
   Elemen XP, bintang, leaderboard, dan timer digunakan untuk motivasi, bukan menggantikan akurasi edukatif.

4. **Responsive and accessible.**  
   Produk dapat digunakan di mobile, tablet, desktop, dan sebagai installable PWA.

5. **Feedback-driven learning.**  
   Setiap sesi harus menghasilkan insight pembelajaran yang jelas.

---

## 8. Platform and Experience Strategy

PixelAid menggunakan **responsive PWA**.

Artinya:

- Di **mobile**, experience terasa seperti mobile game/app.
- Di **tablet**, layout lebih lega dan panel dapat tampil lebih nyaman.
- Di **desktop**, tersedia landing page, dashboard, dan gameplay layout yang responsif.
- Di **installed PWA**, experience terasa seperti aplikasi dengan app-like flow.

Produk tidak menggunakan fixed mobile frame. Semua screen utama harus responsive, tetapi tetap mempertahankan nuansa game pixel art.

---

## 9. Product Flow Overview

### 9.1 Public Web Flow

```text
Landing Page
→ Try Demo / Sign In
→ Demo Case atau Auth
→ App Homepage
```

### 9.2 Installed PWA / App Flow

```text
Splash Screen
→ Auth / Session Check
→ Onboarding jika first-time user
→ Homepage
→ Choose Specialist
→ Select Case
→ Case Brief
→ Consultation Room
→ Quiz Diagnosis
→ Case Result
```

### 9.3 Guest Demo Flow

```text
Landing Page
→ Try Demo
→ Case Brief Demo
→ Inline Tutorial
→ Consultation Room Demo
→ Quiz Diagnosis
→ Case Result
→ Login/Register untuk simpan progress
```

---

## 10. Smart Entry Behavior

PixelAid menggunakan **Smart Entry**.

| Kondisi User | Entry Behavior |
|---|---|
| Browser biasa + user baru | Landing Page |
| Browser biasa + sudah login | App Homepage / Dashboard |
| Installed PWA + sudah login | Splash singkat → Homepage |
| Installed PWA + belum login | Splash singkat → Auth |
| User klik Try Demo | Masuk Demo Case tanpa login |
| User klik shared case link | Masuk Case Brief / Demo Preview |

---

## 11. Core MVP Scope

### 11.1 Specialist Scope

MVP hanya membuka satu specialist playable:

```text
Cardiology
```

Specialist lain tetap ditampilkan sebagai locked atau coming soon:

```text
General Medicine — Coming Soon
Neurology — Coming Soon
Pediatrics — Coming Soon
Dentistry — Coming Soon
Neurosurgery — Coming Soon
```

### 11.2 MVP Case Count

MVP memiliki **3 Cardiology cases**.

| Case | Difficulty | Availability | Focus |
|---|---|---|---|
| Maya | Easy | Guest + Logged-in | Chest pain, allergy awareness, ECG, troponin |
| Budi | Medium | Logged-in only | Palpitasi, trigger, vital signs, ECG |
| Siti | Medium/Hard | Logged-in only | Sesak aktivitas, edema, heart failure suspicion |

### 11.3 Case Unlock

Semua 3 Cardiology cases langsung tersedia untuk logged-in user. Tidak ada unlock system pada MVP.

---

## 12. Feature Requirements

## 12.1 Landing Page

### Purpose

Menjelaskan value PixelAid kepada user baru dan menjadi pintu masuk utama untuk web experience.

### Main Components

- Hero section.
- Penjelasan singkat produk.
- Preview visual/storyboard.
- CTA: Try Demo.
- CTA: Sign In / Register.
- Penjelasan fitur utama: Talk, Examine, Medical Record, Quiz, Feedback.
- Disclaimer edukatif.

### Key Behavior

- User baru di browser biasa melihat Landing Page terlebih dahulu.
- User dapat mencoba demo tanpa login.
- User dapat login/register untuk menyimpan progress.

---

## 12.2 Splash Screen

### Purpose

Memberi app-like entry experience pada installed PWA.

### Main Components

- Logo PixelAid.
- Background klinik/rumah sakit pixel art.
- Loading singkat.
- Disclaimer singkat: simulasi edukatif, bukan diagnosis medis.

### Key Behavior

- Ditampilkan terutama pada installed PWA/app flow.
- Tidak menjadi blocker panjang.
- Setelah splash, sistem melakukan session check.

---

## 12.3 Auth Page

### Purpose

Mengizinkan user menyimpan progress, XP, history, dan leaderboard.

### Main Components

- Sign in with Google.
- Email/password login.
- Register.
- Forgot password.
- CTA Try Demo jika user belum ingin login.

### Key Behavior

- Guest bisa mencoba demo tanpa login.
- Setelah demo selesai, user bisa login untuk menyimpan result.

---

## 12.4 Onboarding

### Purpose

Memberi penjelasan singkat tentang cara bermain kepada user yang pertama kali masuk app.

### Placement

- Muncul setelah user login/register pertama kali.
- Tidak menghalangi guest demo.
- Guest demo hanya menggunakan inline tutorial.

### Slides

1. Kamu adalah dokter virtual.
2. Tanya pasien menggunakan fitur Talk.
3. Gunakan Examine dan Medical Record.
4. Akhiri konsultasi, jawab quiz, dan dapat feedback.

---

## 12.5 Homepage / Dashboard

### Purpose

Menjadi pusat navigasi user setelah login.

### Main Components

- Avatar user.
- Nama / username.
- Level dan XP progress.
- Start / Continue Case.
- Recent cases.
- History shortcut.
- Leaderboard shortcut.
- Profile shortcut.

### Key Behavior

- User dapat melanjutkan case terakhir jika belum selesai.
- User dapat mulai case baru melalui Choose Specialist.
- User melihat progress dan ranking global.

---

## 12.6 Choose Specialist

### Purpose

Memilih bidang spesialis kasus.

### Main Components

- Card specialist.
- Icon pixel art.
- Nama specialist.
- Deskripsi pendek.
- Status: Available, Locked, Coming Soon.

### MVP Behavior

- Cardiology available.
- Specialist lain coming soon/locked.

---

## 12.7 Select Case

### Purpose

Menampilkan daftar pasien/kasus berdasarkan specialist yang dipilih.

### Main Components

- Avatar pasien.
- Nama pasien.
- Umur.
- Keluhan singkat.
- Difficulty.
- Condition badge.
- Demo badge jika tersedia.
- Completion status.
- Best score jika sudah pernah selesai.

### MVP Behavior

- Guest hanya melihat atau dapat memainkan Case Maya.
- Logged-in user dapat memainkan Maya, Budi, dan Siti.

---

## 12.8 Case Brief

### Purpose

Memberi konteks awal sebelum masuk Consultation Room tanpa membocorkan informasi penting.

### Information Level

Case Brief menggunakan **Moderate Brief**.

### Main Components

- Avatar pasien.
- Nama.
- Umur.
- Gender.
- Keluhan utama.
- Triage note singkat.
- Specialist.
- Difficulty.
- Condition badge.
- Deadline.
- Start Consultation button.

### Hidden Information

Informasi berikut tidak ditampilkan langsung:

- Alergi detail.
- Riwayat penyakit lengkap.
- Obat yang sedang dikonsumsi.
- Lokasi/radiasi nyeri.
- Gejala penyerta detail.
- Hasil pemeriksaan.
- Diagnosis hint.

Informasi tersebut ditemukan melalui Talk, Medical Record, dan Examine.

---

## 12.9 Consultation Room

### Purpose

Menjadi halaman gameplay utama tempat user berinteraksi dengan pasien NPC.

### Main Components

- Ruang konsultasi pixel art.
- Pasien NPC.
- Chat bubble pasien.
- Countdown timer.
- Talk button.
- Message button.
- Examine button.
- Medical Record button.
- Pause button.
- End Consultation button.

### Voice Interaction

User menekan Talk sekali, lalu conversation berjalan secara continuous real-time.

```text
Tap Talk once
→ microphone active
→ user speaks naturally
→ patient responds with voice and chat bubble
→ user can continue without tapping repeatedly
```

### Voice States

- Idle.
- Connecting.
- Listening.
- User speaking.
- Patient thinking.
- Patient speaking.
- Muted.
- Disconnected.

### Failure Handling

- Mic permission denied → show instruction.
- LiveKit disconnected → reconnect.
- STT unclear → ask user to repeat.
- TTS failed → show text bubble only.
- Agent timeout → retry/reconnect.

---

## 12.10 Message Panel

### Purpose

Menampilkan riwayat percakapan user dan pasien.

### Main Components

- Chat transcript dalam bentuk teks.
- User messages.
- Patient responses.
- Timestamp ringan.

### Behavior

- Dibuka dari Consultation Room.
- Tidak menjadi halaman terpisah.
- Membantu user membaca ulang informasi penting.

---

## 12.11 Medical Record Panel

### Purpose

Memberi akses ke data pasien yang relevan selama konsultasi.

### Behavior

- Optional.
- Tidak wajib dibuka.
- Membuka panel memengaruhi scoring Medical Record Awareness.
- Jika user melewatkan informasi safety penting, score dapat turun.

### Main Components

- Nama pasien.
- Umur.
- Gender.
- Keluhan utama.
- Riwayat penyakit singkat.
- Alergi.
- Obat yang sedang dikonsumsi jika ada.
- Catatan triase awal.

---

## 12.12 Examine Panel

### Purpose

Memungkinkan user memilih pemeriksaan yang relevan.

### Behavior

- Pemeriksaan dikelompokkan berdasarkan kategori.
- Test dikurasi per case.
- Pemeriksaan memiliki delay waktu.
- Timer konsultasi tetap berjalan saat menunggu hasil.
- Pemeriksaan relevan menambah score.
- Pemeriksaan tidak relevan memberi penalty.

### Categories

- Vital Signs.
- Physical Exam.
- Cardiac Tests.
- Lab Tests.
- Imaging.

### Delay Rules MVP

| Examination | Delay |
|---|---:|
| Check vitals | Instant |
| Physical exam | 5 seconds |
| ECG | 10 seconds |
| Chest X-Ray | 20 seconds |
| CBC | 20 seconds |
| Troponin | 30 seconds |
| BNP | 30 seconds |

---

## 12.13 Timer and Deadline

### Purpose

Memberi pressure ringan agar user melakukan konsultasi dengan efisien.

### Behavior

- Timer berjalan selama konsultasi.
- Saat sisa 60 detik, tampil warning ringan.
- Saat waktu habis, consultation pause.
- User dapat memilih:
  - Lanjut 60 detik dengan penalti.
  - Masuk Quiz Diagnosis.

### MVP Rule

- Maksimal 1 kali extension.
- Extension duration: 60 detik.
- Extension mengurangi Time Score.

---

## 12.14 End Consultation

### Purpose

Mengakhiri konsultasi dan masuk ke Quiz Diagnosis.

### Behavior

User menekan End Consultation, lalu muncul general confirmation.

Tidak ada checklist/clue informasi yang kurang.

### Modal Copy

```text
Akhiri konsultasi?

Pastikan kamu sudah menggali informasi yang cukup,
melakukan pemeriksaan yang relevan, dan membaca data pasien bila diperlukan.

Setelah lanjut ke Quiz Diagnosis, kamu tidak bisa kembali ke ruang konsultasi.
```

---

## 12.15 Quiz Diagnosis

### Purpose

Menilai clinical reasoning user setelah konsultasi.

### Format

Quiz bersifat **case-driven** dan disimpan dalam case config.

AI tidak membuat quiz bebas saat runtime.

### MVP Quiz Structure

1. Diagnosis paling mungkin.
2. Supporting evidence / alasan utama.
3. Next best step / langkah berikutnya.

### Question Type

- Multiple choice.
- Deterministic scoring.
- Dynamic by case.
- Static-controlled from database.

---

## 12.16 Case Result

### Purpose

Menampilkan hasil performa user setelah satu case selesai.

### Main Components

- Stars.
- Total Score.
- XP gained.
- Score breakdown.
- Structured feedback.
- Retry button.
- Back to Home.
- View History Detail.

### Feedback Format

1. Yang sudah baik.
2. Yang terlewat.
3. Catatan safety.
4. Saran berikutnya.

### Feedback Generation

Feedback boleh ditulis oleh AI, tetapi hanya berdasarkan data scoring deterministic. AI tidak menentukan skor.

---

## 12.17 History

### Purpose

Memungkinkan user melihat performa case yang sudah diselesaikan.

### History List

- Tanggal main.
- Nama case/pasien.
- Specialist.
- Difficulty.
- Score.
- Stars.
- XP gained.
- Status: completed/retried.

### History Detail

- Case summary.
- Score breakdown.
- Quiz answers.
- Selected examinations.
- Medical Record opened: yes/no.
- Structured feedback.
- Missed key categories.
- Retry button.

### MVP Limitation

Full transcript tidak ditampilkan di History UI MVP, tetapi text transcript dapat disimpan untuk scoring/debugging.

---

## 12.18 Leaderboard

### Purpose

Memberi motivasi dan gamification melalui ranking global.

### Scope

MVP menggunakan **Global Leaderboard**.

### Ranking Basis

Primary:

```text
Total XP
```

Tie-breaker:

1. Average best score.
2. Total completed cases.
3. Latest activity.

### Display Fields

- Rank.
- Avatar.
- Username.
- Level.
- Total XP.
- Average best score.
- Completed cases.

### Guest Rule

Guest tidak masuk leaderboard sebelum login. Jika guest menyimpan demo result setelah login, result dapat masuk leaderboard.

---

## 13. NPC Patient Behavior

### Response Model

NPC pasien menggunakan pendekatan:

```text
Static case facts + LLM naturalizer
```

Artinya:

- Fakta pasien berasal dari case data.
- LLM membuat jawaban terdengar natural.
- LLM tidak boleh membuat fakta klinis baru.
- Respons tidak dibuat terlalu deterministik agar pasien terasa manusiawi.

### Allowed Behavior

LLM boleh:

- Memparafrase fakta.
- Menjawab dengan bahasa pasien yang natural.
- Memberi emosi ringan sesuai persona.
- Menggabungkan 1–2 fakta relevan.
- Menjawab “tidak tahu” jika data tidak tersedia.

### Prohibited Behavior

LLM tidak boleh:

- Memberi diagnosis.
- Menambahkan gejala baru.
- Menyebut hasil pemeriksaan yang belum dilakukan.
- Berbicara seperti dokter.
- Memberi saran medis nyata.
- Mengubah severity atau riwayat pasien.

---

## 14. Patient Persona and TTS

Setiap pasien memiliki persona ringan dan suara TTS berbeda.

### Case Persona Examples

| Patient | Persona | TTS Direction |
|---|---|---|
| Maya | Cemas, kooperatif, bicara agak cepat | Perempuan muda, lembut, sedikit anxious |
| Budi | Praktis, agak bingung, menjawab pendek | Laki-laki dewasa, natural, medium-low |
| Siti | Pelan, mudah lelah, sopan | Perempuan lebih tua, tempo lebih lambat |

Tujuannya adalah membuat pasien terasa berbeda tanpa membuat scope persona terlalu kompleks.

---

## 15. Scoring System

### Total Score

```text
Total Score = 100 points
```

### Score Breakdown

| Component | Weight |
|---|---:|
| Quiz / Clinical Decision | 35% |
| Interview Quality | 25% |
| Examination Decision | 20% |
| Medical Record Awareness | 10% |
| Time Efficiency | 5% |
| Safety Bonus/Penalty | 5% |

### Quiz Breakdown

Quiz Score terdiri dari:

| Quiz Component | Weight within Quiz |
|---|---:|
| Diagnosis | 40% |
| Supporting Evidence | 30% |
| Next Best Step | 30% |

---

## 16. Stars System

Stars dihitung dari total score dengan safety gate.

### Base Stars

| Score | Stars |
|---:|---:|
| 0–39 | 1 star |
| 40–69 | 2 stars |
| 70–100 | 3 stars |

### Safety Gate

- Jika safety-critical item terlewat, maksimum 2 stars.
- Jika user memilih keputusan berbahaya, maksimum 1 star.
- Jika safety aman, user eligible untuk 3 stars.

Alasan terkait safety gate tidak ditampilkan sebagai section teknis terpisah, tetapi masuk ke structured feedback.

---

## 17. XP System

XP dihitung berdasarkan score dan difficulty.

### Formula

```text
XP = base XP case × score multiplier × difficulty multiplier
```

### Difficulty Multiplier

| Difficulty | Multiplier |
|---|---:|
| Easy | 1.0 |
| Medium | 1.25 |
| Hard | 1.5 |

### Example

```text
Case Maya
Base XP: 100
Score: 82
Difficulty: Easy ×1.0
XP gained = 100 × 0.82 × 1.0 = 82 XP
```

---

## 18. Retry Behavior

### Rule

- First clear mendapatkan full XP.
- Retry mendapatkan small XP.
- Retry tetap dapat meng-update best score jika lebih tinggi.
- Semua attempt disimpan di history.

### MVP Retry XP

```text
Retry XP = 20% of calculated XP
```

---

## 19. Guest Demo Conversion

Guest dapat menyimpan hasil demo setelah login/register.

### Flow

```text
Guest completes demo case
→ sees result
→ clicks “Simpan progress”
→ login/register
→ demo result masuk history
→ XP disimpan
→ score dapat masuk leaderboard
```

### Rules

- Claim result hanya bisa sekali.
- Claim token memiliki expiry.
- Setelah claim, result terhubung ke user account.

---

## 20. Transcript and Privacy

### Transcript Storage

PixelAid menyimpan:

- Text transcript user dari STT.
- Text response pasien.
- Timestamp.
- Role.
- Detected intent jika tersedia.
- Grounded fact keys jika tersedia.

PixelAid tidak menyimpan raw audio pada MVP.

### Disclosure

Sebelum konsultasi dimulai, user diberi informasi:

```text
Percakapan dapat disimpan dalam bentuk teks untuk evaluasi pembelajaran. Audio tidak disimpan.
```

---

## 21. AI Safety Rules

1. AI tidak boleh mengklaim diagnosis medis nyata.
2. AI hanya menjawab berdasarkan data case.
3. AI tidak boleh membuat fakta medis baru.
4. AI tidak boleh memberi instruksi medis nyata kepada user.
5. Patient NPC harus menjawab sebagai pasien, bukan dokter.
6. Feedback akhir ditulis sebagai evaluasi pembelajaran.
7. Jika AI gagal atau tidak yakin, gunakan fallback response.

---

## 22. MVP Content Requirements

### Case Maya — Easy / Demo

Required content:

- Patient profile.
- Chief complaint.
- Triage note.
- Medical record.
- Allowed patient facts.
- Persona.
- TTS profile.
- Examination options.
- Quiz config.
- Scoring checklist.
- Feedback templates.

### Case Budi — Medium

Required content:

- Palpitation-focused case data.
- ECG/vitals-related examination options.
- Quiz and scoring rubric.

### Case Siti — Medium/Hard

Required content:

- Heart failure suspicion case data.
- Physical exam, chest X-ray, BNP-related examination options.
- Quiz and scoring rubric.

---

## 23. Success Metrics

### Product Metrics

- Landing page → Try Demo conversion.
- Try Demo → completed demo rate.
- Demo completion → register/login conversion.
- Case completion rate.
- Retry rate.
- Average score improvement across retries.
- Number of completed cases per user.

### Learning Metrics

- Diagnosis correctness rate.
- Supporting evidence correctness rate.
- Next best step correctness rate.
- Key interview topic coverage.
- Relevant examination selection rate.
- Medical Record usage rate.
- Safety miss rate.

### Technical Metrics

- Voice connection success rate.
- Average latency from user speech to patient response.
- STT failure rate.
- TTS failure rate.
- LiveKit disconnect rate.
- Average cost per session.

---

## 24. MVP Non-Goals

MVP tidak mencakup:

- Semua specialist playable.
- Native mobile app.
- Capacitor wrapper.
- Instructor dashboard.
- Custom case builder.
- Full transcript UI in history.
- Audio recording storage.
- Free-text diagnosis grading.
- Multiplayer.
- Offline gameplay penuh.

---

## 25. Future Enhancements

- More specialists.
- More cases per specialist.
- Instructor dashboard.
- Custom case builder.
- Case history with full timeline.
- Detailed transcript review.
- Class/group leaderboard.
- Multi-language mode.
- Advanced patient emotion/personality system.
- Native wrapper via Capacitor if app store distribution is needed.
- Android native app if voice/game performance requires deeper native control.

---

## 26. Final Product Decisions Summary

```text
Platform: Responsive PWA
Frontend: Next.js
Realtime Voice: LiveKit
Backend/Agent: Python
Database/Auth: Supabase
Entry Flow: Smart Entry
Guest Mode: 1 demo case
Onboarding: after login + inline guest tutorial
MVP Specialist: Cardiology only
MVP Cases: 3 Cardiology cases
Case Unlock: all available for logged-in users
Case Brief: Moderate Brief
Medical Record: optional but scored
Talk Mode: continuous after one tap
Timer: warning + one extension with penalty
End Consultation: general confirmation only
Quiz: Diagnosis + Supporting Evidence + Next Best Step
Examine: curated per case with delay
NPC Response: fact-grounded + LLM naturalizer
Patient Persona: light persona + unique TTS voice
Scoring: 35/25/20/10/5/5
Stars: total score + safety gate
Feedback: structured feedback
History: result detail + action summary
Transcript: text only, no audio
Leaderboard: global leaderboard
XP: score × difficulty
Retry: small XP + best score update
Demo Result: can be saved after login
```
