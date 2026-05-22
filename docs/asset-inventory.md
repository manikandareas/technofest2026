# PixelAid Asset Inventory

Dokumen ini menurunkan kebutuhan aset dari:

- `docs/pixelaid_final_prd.md`
- `docs/pixelaid_technical_design_doc.md`
- `docs/implementation-plan.md`
- `docs/data.json`

Catatan scope: PRD dan implementation plan awal menyebut MVP Cardiology dengan 3 kasus, tetapi `docs/data.json` saat ini sudah berisi 6 spesialis available dan 18 kasus. Inventory ini mengikuti `docs/data.json` sebagai sumber konten paling lengkap, dengan prioritas produksi tetap bisa dimulai dari kasus demo/awal.

## 0. Production Todo Checklist

Gunakan checklist ini untuk tracking produksi. Detail kebutuhan, catatan style, dan struktur folder tetap ada di section referensi setelah checklist.

### P0 - Must Have

#### Brand And PWA

- [ ] PixelAid logo mark.
- [ ] PixelAid wordmark.
- [ ] App icon 192x192.
- [ ] App icon 512x512.
- [ ] Maskable app icon 512x512.
- [ ] Favicon.

#### Core Scenes

- [ ] Landing hero storyboard/preview scene.
- [ ] Splash background clinic/hospital.
- [ ] Consultation room base scene.
- [ ] Consultation room mobile crop.
- [ ] Consultation room desktop crop.

#### Gameplay Controls

- [ ] Pixel button state set.
- [ ] Talk button state: idle.
- [ ] Talk button state: connecting.
- [ ] Talk button state: listening.
- [ ] Talk button state: user speaking.
- [ ] Talk button state: patient thinking.
- [ ] Talk button state: patient speaking.
- [ ] Talk button state: muted.
- [ ] Talk button state: disconnected.
- [ ] Message button icon.
- [ ] Examine button icon.
- [ ] Medical Record button icon.
- [ ] End consultation button icon.
- [ ] Timer widget normal state.
- [ ] Timer widget warning state.
- [ ] Timer widget expired state.
- [ ] Patient chat bubble variants.
- [ ] User chat bubble variants.
- [ ] Badge set: difficulty, condition, demo, completed, locked, coming soon.
- [ ] Modal frame set.

#### Specialist Assets

- [ ] Penyakit Dalam specialist icon and card illustration.
- [ ] Anestesi specialist icon and card illustration.

#### Patient Assets

- [ ] Raka card avatar.
- [ ] Raka brief/avatar bust.
- [ ] Raka consultation NPC idle sprite.
- [ ] Raka consultation NPC talking state.
- [ ] Maya card avatar.
- [ ] Maya brief/avatar bust.
- [ ] Maya consultation NPC idle sprite.
- [ ] Maya consultation NPC talking state.
- [ ] Generic patient avatar fallback.

#### Examination Core Assets

- [ ] Vital Signs category icon.
- [ ] Physical Exam category icon.
- [ ] Cardiac Tests category icon.
- [ ] Lab Tests category icon.
- [ ] Imaging category icon.
- [ ] Vitals result card template.
- [ ] Physical exam note card template.
- [ ] Lab result sheet template.
- [ ] Imaging viewer template.
- [ ] Delayed examination waiting/result animation.
- [ ] Chest X-Ray: right lower infiltrate image.
- [ ] Chest X-Ray: no consolidation image.

#### Quiz, Result, Progress

- [ ] Quiz option default state.
- [ ] Quiz option selected state.
- [ ] Quiz option correct state.
- [ ] Quiz option wrong state.
- [ ] Quiz option disabled state.
- [ ] Clinical reasoning quiz icon.
- [ ] Score meter.
- [ ] Star rating sprites: 0 stars.
- [ ] Star rating sprites: 1 star.
- [ ] Star rating sprites: 2 stars.
- [ ] Star rating sprites: 3 stars.
- [ ] XP badge.

#### Onboarding

- [ ] Slide 1 illustration: doctor/player avatar and patient scene.
- [ ] Slide 2 illustration: Talk/mic interaction.
- [ ] Slide 3 illustration: Examine and Medical Record panels.
- [ ] Slide 4 illustration: Quiz/result feedback.

### P1 - Complete Current Case Data

#### Brand And Polish

- [ ] Splash logo animation frames.
- [ ] Loading indicator pixel animation.
- [ ] Educational disclaimer badge/illustration.

#### Additional Backgrounds

- [ ] Dashboard background band.
- [ ] Specialist selection background.
- [ ] Case brief background.
- [ ] Medical record panel background.
- [ ] Examine panel background.
- [ ] Quiz screen background.
- [ ] Result screen background.

#### Additional Controls

- [ ] Pause button icon.
- [ ] System event bubble variants.
- [ ] Toast/alert icons: success, warning, error, info, offline.
- [ ] Progress bar frames.
- [ ] Tab/menu sprites.

#### Specialist Assets

- [ ] OBGYN / Reproduksi Wanita specialist icon and card illustration.
- [ ] Kesehatan Anak specialist icon and card illustration.
- [ ] Bedah Umum specialist icon and card illustration.
- [ ] Kesehatan Mata specialist icon and card illustration.
- [ ] Available specialist card state.
- [ ] Coming soon specialist card state.
- [ ] Locked specialist card state.
- [ ] Hover/selected/focus specialist card states.
- [ ] Empty specialist/case state.

#### Patient Card Avatars

- [ ] Dewi card avatar.
- [ ] Hasan card avatar.
- [ ] Nadia card avatar.
- [ ] Ayu card avatar.
- [ ] Laras card avatar.
- [ ] Ibu Arka card avatar.
- [ ] Ibu Mika card avatar.
- [ ] Ibu Bima card avatar.
- [ ] Fajar card avatar.
- [ ] Ratna card avatar.
- [ ] Yusuf card avatar.
- [ ] Tono card avatar.
- [ ] Salsa card avatar.
- [ ] Rini card avatar.
- [ ] Surya card avatar.
- [ ] Dimas card avatar.

#### Patient Brief Avatars / Busts

- [ ] Dewi brief/avatar bust.
- [ ] Hasan brief/avatar bust.
- [ ] Nadia brief/avatar bust.
- [ ] Ayu brief/avatar bust.
- [ ] Laras brief/avatar bust.
- [ ] Ibu Arka brief/avatar bust.
- [ ] Ibu Mika brief/avatar bust.
- [ ] Ibu Bima brief/avatar bust.
- [ ] Fajar brief/avatar bust.
- [ ] Ratna brief/avatar bust.
- [ ] Yusuf brief/avatar bust.
- [ ] Tono brief/avatar bust.
- [ ] Salsa brief/avatar bust.
- [ ] Rini brief/avatar bust.
- [ ] Surya brief/avatar bust.
- [ ] Dimas brief/avatar bust.

#### Patient NPC Sprites

- [ ] Dewi NPC idle and talking states.
- [ ] Hasan NPC idle and talking states.
- [ ] Nadia NPC idle and talking states.
- [ ] Ayu NPC idle and talking states.
- [ ] Laras NPC idle and talking states.
- [ ] Ibu Arka NPC idle and talking states.
- [ ] Ibu Mika NPC idle and talking states.
- [ ] Ibu Bima NPC idle and talking states.
- [ ] Fajar NPC idle and talking states.
- [ ] Ratna NPC idle and talking states.
- [ ] Yusuf NPC idle and talking states.
- [ ] Tono NPC idle and talking states.
- [ ] Salsa NPC idle and talking states.
- [ ] Rini NPC idle and talking states.
- [ ] Surya NPC idle and talking states.
- [ ] Dimas NPC idle and talking states.

#### Imaging Assets

- [ ] USG obstetri awal image.
- [ ] USG abdomen image.
- [ ] USG hepatobilier image.
- [ ] X-Ray jaringan lunak image.

#### Lab And Test Assets

- [ ] Darah lengkap / CBC result asset.
- [ ] NS1 antigen dengue result asset.
- [ ] Gula darah sewaktu result asset.
- [ ] Urinalisis result asset.
- [ ] HbA1c result asset.
- [ ] Beta-hCG result asset.
- [ ] Protein urin result asset.
- [ ] Trombosit, fungsi hati, fungsi ginjal result asset.
- [ ] pH sekret vagina result asset.
- [ ] Wet mount sederhana result asset.
- [ ] Pemeriksaan feses sederhana result asset.
- [ ] Darah lengkap dan fungsi hati result asset.
- [ ] Peak expiratory flow / peak flow result asset.
- [ ] Tes kehamilan result asset.
- [ ] Fluorescein staining result asset.
- [ ] Tekanan intraokular result asset.

#### Physical Exam Visuals

- [ ] Pemeriksaan fisik umum visual.
- [ ] Pemeriksaan paru visual.
- [ ] Pemeriksaan abdomen visual.
- [ ] Pemeriksaan abdomen kanan atas visual.
- [ ] Pemeriksaan neurologis singkat visual.
- [ ] Pemeriksaan THT sederhana visual.
- [ ] Pemeriksaan status hidrasi visual.
- [ ] Berat badan visual.
- [ ] Pemeriksaan genital sesuai consent visual.
- [ ] Pemeriksaan luka visual.
- [ ] Pemeriksaan neurovaskular distal visual.
- [ ] Evaluasi jalan napas visual.
- [ ] Skala nyeri visual.
- [ ] Penilaian sedasi visual.
- [ ] Cek luka singkat visual.
- [ ] Pemeriksaan visus visual.
- [ ] Pemeriksaan mata luar visual.
- [ ] Pemeriksaan pupil dan kornea visual.
- [ ] Konfirmasi status puasa visual.

#### Medical Record

- [ ] Medical record panel shell.
- [ ] Patient identity row icon set.
- [ ] Triage note icon.
- [ ] History icon.
- [ ] Allergy icon.
- [ ] Medication icon.
- [ ] Safety warning styling.
- [ ] Empty/unknown field state.

#### Result And Leaderboard

- [ ] Level badge set.
- [ ] Feedback icon: diagnosis.
- [ ] Feedback icon: interview.
- [ ] Feedback icon: examination.
- [ ] Feedback icon: safety/time.
- [ ] Retry case icon.
- [ ] History item icon.
- [ ] Leaderboard trophy.
- [ ] Rank medal: gold.
- [ ] Rank medal: silver.
- [ ] Rank medal: bronze.
- [ ] Guest claim CTA illustration.

#### Voice State Assets

- [ ] Mic idle icon.
- [ ] Mic listening animation.
- [ ] Patient thinking animation.
- [ ] Patient speaking animation.
- [ ] Muted icon.
- [ ] Disconnected icon.
- [ ] Reconnect icon.
- [ ] Waveform/equalizer animation.

#### Tutorial Tooltips

- [ ] Talk tooltip.
- [ ] Examine tooltip.
- [ ] Medical Record tooltip.
- [ ] End Consultation tooltip.
- [ ] Timer warning tooltip.

#### Player/User Assets

- [ ] Default user avatar.
- [ ] Doctor/player avatar variants.
- [ ] Profile progress icon.
- [ ] Empty history illustration.

### P2 - Polish

- [ ] Per-patient distressed expression frames.
- [ ] Per-patient recovered/neutral result expression frames.
- [ ] UI sound: tap.
- [ ] UI sound: success.
- [ ] UI sound: warning.
- [ ] UI sound: quiz correct.
- [ ] UI sound: quiz wrong.
- [ ] Additional level badges.
- [ ] Leaderboard background.
- [ ] Offline screen background.
- [ ] Empty states for every list/panel.

## 1. Brand And PWA

| Asset | Qty | Priority | Notes |
|---|---:|---|---|
| PixelAid logo mark | 1 | P0 | Pixel-art medical/game mark. Dipakai splash, header, auth, manifest. |
| PixelAid wordmark | 1 | P0 | Horizontal lockup untuk landing dan desktop header. |
| App icon 192x192 | 1 | P0 | PWA manifest icon. |
| App icon 512x512 | 1 | P0 | PWA manifest icon. |
| Maskable app icon 512x512 | 1 | P0 | Safe-area friendly. |
| Favicon | 1 | P0 | Browser tab. |
| Splash logo animation frames | 3-6 frames | P1 | Optional idle pulse/loading. |
| Loading indicator pixel animation | 1 set | P1 | Used on splash, case/session loading. |
| Educational disclaimer badge/illustration | 1 | P1 | For splash and landing disclaimer. |

## 2. Core Backgrounds And Scenes

| Asset | Qty | Priority | Notes |
|---|---:|---|---|
| Landing hero storyboard/preview scene | 1 | P0 | Shows consultation gameplay, not abstract marketing art. |
| Splash background clinic/hospital | 1 | P0 | Pixel-art clinic/hospital background. |
| Dashboard background band | 1 | P1 | Subtle pixel clinic/workspace background. |
| Specialist selection background | 1 | P1 | Medical campus/hospital corridor style. |
| Case brief background | 1 | P1 | Patient intake/triage mood. |
| Consultation room base scene | 1 | P0 | Main gameplay room with patient position, doctor/user side, UI-safe area. |
| Consultation room mobile crop | 1 | P0 | Same scene composed for mobile. |
| Consultation room desktop crop | 1 | P0 | Wider room composition. |
| Medical record panel background | 1 | P1 | Clipboard/chart texture, readable. |
| Examine panel background | 1 | P1 | Lab/order sheet style. |
| Quiz screen background | 1 | P1 | Calm clinical review room. |
| Result screen background | 1 | P1 | Feedback/progress setting. |
| Leaderboard background | 1 | P2 | Trophy/notice-board motif. |
| Offline screen background | 1 | P2 | Friendly offline clinic state. |

## 3. UI And Gameplay Controls

| Asset | Qty | Priority | Notes |
|---|---:|---|---|
| Pixel button states | 1 component set | P0 | Primary, secondary, outline, disabled, danger. |
| Talk button icon states | 8 states | P0 | Idle, connecting, listening, user speaking, patient thinking, patient speaking, muted, disconnected. |
| Message button icon | 1 | P0 | Opens transcript panel. |
| Examine button icon | 1 | P0 | Opens examination panel. |
| Medical Record button icon | 1 | P0 | Opens chart panel. |
| Pause button icon | 1 | P1 | Consultation pause. |
| End consultation button icon | 1 | P0 | Moves to quiz confirmation. |
| Timer widget frames | 3 states | P0 | Normal, warning under 60s, expired. |
| Chat bubble patient | 1 set | P0 | Short/medium/long variants. |
| Chat bubble user | 1 set | P0 | Short/medium/long variants. |
| System event bubble | 1 set | P1 | For exam/result/session state messages. |
| Toast/alert icons | 5 | P1 | Success, warning, error, info, offline. |
| Badge set | 1 set | P0 | Difficulty, condition, demo, completed, locked, coming soon. |
| Progress bar frames | 1 set | P1 | XP, loading, result progress. |
| Modal frame | 1 set | P0 | End consultation, timer expired, auth claim. |
| Tab/menu sprites | 1 set | P1 | Panels and navigation. |

## 4. Specialist Assets

`docs/data.json` defines 6 available specialists.

| Specialist | Icon Key | Assets Needed | Priority |
|---|---|---|---|
| Penyakit Dalam | `stethoscope` | Pixel icon, card illustration, locked/available state | P0 |
| OBGYN / Reproduksi Wanita | `venus` | Pixel icon, card illustration, privacy-sensitive clinical motif | P1 |
| Kesehatan Anak | `baby` | Pixel icon, card illustration, child-friendly motif | P1 |
| Bedah Umum | `scissors` | Pixel icon, card illustration, surgical tool motif | P1 |
| Anestesi | `syringe` | Pixel icon, card illustration, monitor/sedation motif | P1 |
| Kesehatan Mata | `eye` | Pixel icon, card illustration, eye-clinic motif | P1 |

Additional specialist UI assets:

- Available card state.
- Coming soon card state.
- Locked card state.
- Hover/selected/focus states.
- Empty state if no cases are available.

## 5. Patient Avatars And NPC Sprites

Each case needs at minimum one portrait/avatar for cards and brief screens. Consultation can reuse a larger bust/NPC sprite if budget allows.

| Case | Patient/NPC | Age/Gender | Visual Direction | Voice Style | Priority |
|---|---|---:|---|---|---|
| Demam Tinggi dan Nyeri Badan | Raka | 24 male | Young adult, weak/feverish, cooperative | young male, weak, natural | P0 |
| Sering Haus dan Berat Badan Turun | Dewi | 39 female | Adult woman, anxious, tired | adult female, clear, slightly anxious | P1 |
| Batuk Demam dan Sesak Ringan | Hasan | 58 male | Older man, mild dyspnea/fatigue | middle-aged male, short breath | P1 |
| Perdarahan Kehamilan Muda | Nadia | 29 female | Pregnant patient, worried, gentle | adult female, soft, anxious | P1 |
| Hamil Tua dengan Sakit Kepala | Ayu | 34 female | Late pregnancy, headache/pain | adult female, painful, slow | P1 |
| Keputihan Gatal dan Berbau | Laras | 26 female | Embarrassed/discomfort, privacy-sensitive | young female, shy | P1 |
| Kejang Saat Demam | Ibu Arka | caregiver for 3 male child | Worried mother/caregiver, child context | young mother, anxious | P1 |
| Diare dan Tanda Dehidrasi | Ibu Mika | caregiver for 2 female child | Gentle worried mother/caregiver | mother voice, soft worried | P1 |
| Mengi Setelah Bermain | Ibu Bima | caregiver for 8 male child | Anxious caregiver, asthma context | mother voice, anxious fast | P1 |
| Nyeri Perut Kanan Bawah | Fajar | 21 male | Young man holding lower-right abdomen | young male, holding pain | P1 |
| Nyeri Perut Kanan Atas Setelah Makan | Ratna | 46 female | Adult woman with nausea/RUQ pain | adult female, nauseated | P1 |
| Luka Robek di Lengan | Yusuf | 32 male | Adult man with bandaged/covered arm wound | adult male, calm | P1 |
| Evaluasi Praoperasi dengan Riwayat Asma | Maya | 41 female | Pre-op patient, calm but worried | adult female, calm anxious | P0 |
| Nyeri Pascaoperasi | Tono | 55 male | Post-op patient in pain | adult male, holding pain | P1 |
| Sedasi untuk Tindakan Singkat | Salsa | 19 female | Young patient, nervous | young female, nervous | P1 |
| Mata Merah dan Belekan | Rini | 30 female | Red/irritated eye, mild discomfort | adult female, clear, irritated | P1 |
| Mata Nyeri Mendadak dan Pandangan Kabur | Surya | 63 male | Older man, eye pain, tense | older male, tense pain | P1 |
| Mata Terasa Mengganjal Setelah Tergores | Dimas | 27 male | Young man, watery irritated eye | young male, irritated natural | P1 |

Recommended per patient:

- `avatar_card`: square 1:1 portrait.
- `avatar_brief`: larger bust/headshot.
- `npc_idle`: consultation room idle sprite.
- `npc_talking`: mouth/talk loop or 2-4 frame expression swap.
- `npc_distressed`: optional expression for pain/anxiety.
- `npc_recovered/neutral`: optional result/feedback state.

## 6. Examination Result Assets

The examine panel needs icons for every category and result visuals for imaging/selected tests. Not every test needs a realistic image on day one, but every test should have at least an icon and result card template.

### 6.1 Category Icons

| Category | Asset | Priority |
|---|---|---|
| Vital Signs | Monitor/vitals icon | P0 |
| Physical Exam | Doctor hand/stethoscope icon | P0 |
| Cardiac Tests | ECG waveform icon | P0 |
| Lab Tests | Test tube/lab sheet icon | P0 |
| Imaging | X-ray/scan icon | P0 |

### 6.2 Reusable Result Card Templates

| Template | Use Cases | Priority |
|---|---|---|
| Vitals card | BP, HR, RR, SpO2, temperature | P0 |
| Physical exam note card | Abdomen, lung, wound, eye, neuro, airway | P0 |
| Lab result sheet | CBC, glucose, urinalysis, HbA1c, NS1, beta-hCG, protein urine, pregnancy test | P0 |
| Imaging viewer | X-ray/USG images | P0 |
| ECG/cardiac test strip | ECG/peak flow/cardiac test outputs | P1 |
| Waiting/result loading animation | Delayed examinations | P0 |

### 6.3 Imaging Assets

| Examination | Cases | Asset Needed | Priority |
|---|---|---|---|
| Chest X-Ray | Pneumonia; pediatric asthma | 2 chest X-ray images: right lower infiltrate, no consolidation | P0 |
| USG obstetri awal | First-trimester bleeding | Obstetric ultrasound image showing intrauterine gestational sac | P1 |
| USG abdomen | Appendicitis | Abdomen ultrasound image suggesting appendiceal inflammation | P1 |
| USG hepatobilier | Acute cholecystitis | Gallbladder ultrasound image with stones/wall thickening | P1 |
| X-Ray jaringan lunak | Laceration | Soft-tissue X-ray with no large radiopaque foreign body | P1 |

### 6.4 Lab And Test Assets

Create icon/result-card variants for:

- Darah lengkap / CBC.
- NS1 antigen dengue.
- Gula darah sewaktu.
- Urinalisis.
- HbA1c.
- Beta-hCG.
- Protein urin.
- Trombosit, fungsi hati, fungsi ginjal.
- pH sekret vagina.
- Wet mount sederhana.
- Gula darah anak.
- Pemeriksaan feses sederhana.
- Darah lengkap dan fungsi hati.
- Peak expiratory flow / peak flow.
- Tes kehamilan.
- Fluorescein staining.
- Tekanan intraokular.

### 6.5 Physical Exam Visuals

Create small illustrative thumbnails or icons for:

- Pemeriksaan fisik umum.
- Pemeriksaan paru.
- Pemeriksaan abdomen.
- Pemeriksaan abdomen kanan atas.
- Pemeriksaan neurologis singkat.
- Pemeriksaan THT sederhana.
- Pemeriksaan status hidrasi.
- Berat badan.
- Pemeriksaan genital sesuai consent.
- Pemeriksaan luka.
- Pemeriksaan neurovaskular distal.
- Evaluasi jalan napas.
- Skala nyeri.
- Penilaian sedasi.
- Cek luka singkat.
- Pemeriksaan visus.
- Pemeriksaan mata luar.
- Pemeriksaan pupil dan kornea.
- Konfirmasi status puasa.

## 7. Medical Record Assets

| Asset | Qty | Priority | Notes |
|---|---:|---|---|
| Medical record panel shell | 1 | P0 | Clipboard/chart pixel UI. |
| Patient identity row icon set | 4 | P0 | Name, age, gender, complaint. |
| Triage note icon | 1 | P0 | Vitals/triage. |
| History icon | 1 | P0 | Medical history. |
| Allergy icon | 1 | P0 | Allergy warning. |
| Medication icon | 1 | P0 | Current medications. |
| Safety warning styling | 1 set | P1 | Used when safety info matters. |
| Empty/unknown field state | 1 set | P1 | Unknown allergy/medication. |

## 8. Quiz, Result, Progress, And Leaderboard

| Asset | Qty | Priority | Notes |
|---|---:|---|---|
| Quiz option card states | 1 set | P0 | Default, selected, correct, wrong, disabled. |
| Clinical reasoning quiz icon | 1 | P0 | Used on quiz intro/result. |
| Score meter | 1 set | P0 | 0-100 visual. |
| Star rating sprites | 4 states | P0 | 0, 1, 2, 3 stars. |
| XP badge | 1 | P0 | Result and dashboard. |
| Level badge set | 3-5 | P1 | Early levels. |
| Feedback icons | 4 | P1 | Diagnosis, interview, exam, safety/time. |
| Retry case icon | 1 | P1 | Result CTA. |
| History item icon | 1 | P1 | Completed case row. |
| Leaderboard trophy | 1 | P1 | Global leaderboard. |
| Rank medals | 3 | P1 | Gold, silver, bronze. |
| Guest claim CTA illustration | 1 | P1 | After demo completion. |

## 9. Voice And Audio Assets

The docs specify per-patient TTS profiles. These are runtime voices, but product assets still need audio-state feedback.

| Asset | Qty | Priority | Notes |
|---|---:|---|---|
| Mic idle icon | 1 | P0 | Talk button idle. |
| Mic listening animation | 1 set | P0 | User speech active. |
| Patient thinking animation | 1 set | P0 | Processing response. |
| Patient speaking animation | 1 set | P0 | TTS playback active. |
| Muted icon | 1 | P0 | User muted. |
| Disconnected icon | 1 | P0 | LiveKit disconnected. |
| Reconnect icon | 1 | P0 | Retry connection. |
| Waveform/equalizer animation | 1 set | P1 | Optional for voice state richness. |
| Short UI sounds | 4-6 | P2 | Tap, success, warning, quiz correct/wrong; keep optional and accessible. |

Patient TTS mappings from `docs/data.json`:

- `alloy`: Raka.
- `nova`: Dewi, Ayu, Ibu Arka, Ibu Bima, Maya, Rini, Ratna.
- `onyx`: Hasan, Tono, Surya.
- `shimmer`: Nadia, Laras, Ibu Mika, Salsa.
- `echo`: Fajar, Yusuf, Dimas.

## 10. Onboarding And Tutorial Assets

| Slide | Asset Needed | Priority |
|---|---|---|
| Kamu adalah dokter koas virtual | Doctor/player avatar + patient scene | P0 |
| Tanya pasien menggunakan Talk | Talk/mic interaction illustration | P0 |
| Gunakan Examine dan Medical Record | Two-panel UI illustration | P0 |
| Akhiri konsultasi, jawab quiz, dapat feedback | Quiz/result illustration | P0 |

Inline tutorial tooltips:

- Talk tooltip.
- Examine tooltip.
- Medical Record tooltip.
- End Consultation tooltip.
- Timer warning tooltip.

## 11. Player/User Assets

| Asset | Qty | Priority | Notes |
|---|---:|---|---|
| Default user avatar | 1 | P0 | Dashboard/profile fallback. |
| Doctor/player avatar variants | 3-6 | P1 | Optional customization. |
| Profile progress icon | 1 | P1 | XP/level area. |
| Empty history illustration | 1 | P1 | First-time dashboard/history. |

## 12. Asset Priority Plan

### P0 - First Production Batch

- Logo, app icons, favicon.
- Splash background.
- Main consultation room base scene and responsive crops.
- UI controls for Talk, Message, Examine, Medical Record, End Consultation, Timer.
- Specialist icon/card for Penyakit Dalam and Anestesi if prioritizing current demo data, or Cardiology if reverting to old MVP.
- Patient avatars for Raka and Maya at minimum.
- Generic patient avatar fallback for all unproduced patients.
- Vitals, physical exam, lab result, imaging viewer templates.
- Chest X-ray assets.
- Quiz option states, result score meter, star sprites, XP badge.
- Onboarding 4-slide illustrations.

### P1 - Complete Current `docs/data.json`

- All 18 patient avatars and NPC bust sprites.
- All 6 specialist cards/icons.
- USG and X-ray image assets.
- Physical exam thumbnails.
- Medical record panel shell and icons.
- Leaderboard medals/trophy.
- Patient voice state animations.

### P2 - Polish

- Per-patient expression frames.
- UI sound effects.
- More level badges.
- Offline/background variants.
- Animated splash/loading details.
- Empty states for every list/panel.

## 13. Suggested File Structure

```txt
apps/web/public/assets/
  brand/
    logo-mark.svg
    logo-wordmark.svg
    icon-192.png
    icon-512.png
    icon-maskable-512.png
    favicon.ico
  backgrounds/
    splash-clinic.png
    landing-storyboard.png
    consultation-room-mobile.png
    consultation-room-desktop.png
    dashboard-band.png
    quiz-room.png
    result-room.png
  specialists/
    internal-medicine.png
    obgyn.png
    pediatrics.png
    general-surgery.png
    anesthesiology.png
    ophthalmology.png
  patients/
    raka/avatar.png
    dewi/avatar.png
    hasan/avatar.png
    nadia/avatar.png
    ayu/avatar.png
    laras/avatar.png
    arka-caregiver/avatar.png
    mika-caregiver/avatar.png
    bima-caregiver/avatar.png
    fajar/avatar.png
    ratna/avatar.png
    yusuf/avatar.png
    maya/avatar.png
    tono/avatar.png
    salsa/avatar.png
    rini/avatar.png
    surya/avatar.png
    dimas/avatar.png
  examinations/
    categories/
    imaging/
    labs/
    physical-exam/
    vitals/
  ui/
    controls/
    badges/
    modals/
    chat/
    quiz/
    result/
    leaderboard/
  onboarding/
```

## 14. Production Notes

- Use one coherent 2D pixel-art style across avatars, backgrounds, and UI.
- Keep medical visuals educational and non-graphic, especially genital exam, wounds, pregnancy, and pediatric cases.
- Imaging assets should be simplified but clinically recognizable, not photorealistic if the app style remains pixel-art.
- Every patient needs a neutral expression first; pain/anxiety variants are secondary.
- Every examination can initially render through templates; only imaging-heavy tests need dedicated visual images.
- Asset filenames should use the case/patient IDs from `docs/data.json` so API data can map to assets deterministically.
