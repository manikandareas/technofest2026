export const fallbackSpecialists = [
  {
    id: "internal-medicine",
    name: "Penyakit Dalam",
    description:
      "Latihan kasus keluhan dewasa seperti metabolik, infeksi, respirasi, dan gangguan organ dalam.",
    icon: "stethoscope",
    status: "available",
    case_count: 3,
  },
  {
    id: "obgyn",
    name: "OBGYN / Reproduksi Wanita",
    description:
      "Latihan kasus kehamilan, kesehatan reproduksi wanita, dan keluhan ginekologi dasar.",
    icon: "venus",
    status: "available",
    case_count: 3,
  },
  {
    id: "pediatrics",
    name: "Kesehatan Anak",
    description:
      "Latihan kasus anak dengan fokus demam, dehidrasi, infeksi saluran napas, dan edukasi orang tua.",
    icon: "baby",
    status: "available",
    case_count: 3,
  },
  {
    id: "general-surgery",
    name: "Bedah Umum",
    description:
      "Latihan kasus nyeri perut akut, luka, dan kondisi bedah dasar yang membutuhkan triase cepat.",
    icon: "scissors",
    status: "available",
    case_count: 3,
  },
  {
    id: "anesthesiology",
    name: "Anestesi",
    description:
      "Latihan kasus praoperatif, sedasi, manajemen nyeri, dan keselamatan anestesi dasar.",
    icon: "syringe",
    status: "available",
    case_count: 3,
  },
  {
    id: "ophthalmology",
    name: "Kesehatan Mata",
    description:
      "Latihan kasus mata merah, penurunan penglihatan, trauma ringan, dan skrining gejala bahaya.",
    icon: "eye",
    status: "available",
    case_count: 3,
  },
];

export const fallbackCases = [
  {
    id: "internal-medicine-dengue-warning-signs",
    specialist_id: "internal-medicine",
    specialist_name: "Penyakit Dalam",
    patient_name: "Raka",
    patient_age: 23,
    patient_gender: "male",
    chief_complaint: "Demam tinggi sejak 3 hari.",
    triage_note: "Pasien tampak lemah, perlu skrining tanda bahaya dengue.",
    difficulty: "easy",
    condition_badge: "Infeksi akut",
    estimated_duration_minutes: 5,
    learning_objectives: [
      "Gali pola demam dan tanda bahaya.",
      "Nilai status hidrasi dan perdarahan.",
      "Pilih pemeriksaan awal yang relevan.",
    ],
  },
  {
    id: "budi-palpitasi",
    specialist_id: "cardiology",
    specialist_name: "Cardiology",
    patient_name: "Budi",
    patient_age: 42,
    patient_gender: "Laki-laki",
    chief_complaint: "Jantung berdebar setelah minum kopi dan begadang.",
    triage_note: "Hemodinamik stabil, fokus pada red flag, irama, dan konsumsi stimulan.",
    difficulty: "medium",
    condition_badge: "Palpitasi",
    estimated_duration_minutes: 10,
    learning_objectives: [
      "Pisahkan palpitasi benign dari tanda bahaya.",
      "Tanyakan konsumsi stimulan dan pola tidur.",
      "Pilih pemeriksaan awal untuk keluhan berdebar.",
    ],
  },
  {
    id: "siti-sesak",
    specialist_id: "cardiology",
    specialist_name: "Cardiology",
    patient_name: "Siti",
    patient_age: 67,
    patient_gender: "Perempuan",
    chief_complaint: "Sesak saat aktivitas disertai bengkak tungkai.",
    triage_note: "Butuh asesmen gagal jantung, kapasitas fungsional, dan tanda kongesti.",
    difficulty: "hard",
    condition_badge: "Dyspnea",
    estimated_duration_minutes: 12,
    learning_objectives: [
      "Nilai derajat sesak dan gejala kongesti.",
      "Gali komorbid yang memperburuk gagal jantung.",
      "Tentukan prioritas pemeriksaan fisik kardiopulmoner.",
    ],
  },
];
