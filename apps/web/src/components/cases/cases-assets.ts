/** Static assets exported from Figma (Hackhaton UMKT 2026 - Case Brief). */
export const CASES_ASSETS = {
  iconBack: "/assets/specialists/figma/icon-back.png",
  iconStopwatch: "/assets/cases/figma/icon-stopwatch.png",
  iconLearning: "/assets/home/figma/icon-stars.png",
  avatarFallback: "/assets/patients/raka/avatar.png",
} as const;

type PatientAssetId =
  | "arka-caregiver"
  | "ayu"
  | "bima-caregiver"
  | "dewi"
  | "dimas"
  | "fajar"
  | "hasan"
  | "laras"
  | "maya"
  | "mika-caregiver"
  | "nadia"
  | "raka"
  | "ratna"
  | "rini"
  | "salsa"
  | "surya"
  | "tono"
  | "yusuf";

const PATIENT_ASSET_BY_NAME: Record<string, PatientAssetId> = {
  "ibu arka": "arka-caregiver",
  "ibu bima": "bima-caregiver",
  "ibu mika": "mika-caregiver",
  arka: "arka-caregiver",
  ayu: "ayu",
  bima: "bima-caregiver",
  dewi: "dewi",
  dimas: "dimas",
  fajar: "fajar",
  hasan: "hasan",
  laras: "laras",
  maya: "maya",
  mika: "mika-caregiver",
  nadia: "nadia",
  raka: "raka",
  ratna: "ratna",
  rini: "rini",
  salsa: "salsa",
  surya: "surya",
  tono: "tono",
  yusuf: "yusuf",
};

function normalizePatientName(patientName: string): string {
  return patientName
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function resolvePatientAssetId(patientName: string): PatientAssetId | null {
  const normalized = normalizePatientName(patientName);
  const exact = PATIENT_ASSET_BY_NAME[normalized];
  if (exact) {
    return exact;
  }

  const firstName = normalized.split(/\s+/)[0] ?? "";
  return PATIENT_ASSET_BY_NAME[firstName] ?? null;
}

export function resolvePatientAvatar(
  patientName: string,
  apiAvatarUrl?: string | null,
): string {
  if (apiAvatarUrl) {
    return apiAvatarUrl;
  }

  const assetId = resolvePatientAssetId(patientName);
  if (assetId) {
    return `/assets/patients/${assetId}/avatar.png`;
  }

  return CASES_ASSETS.avatarFallback;
}

export function resolvePatientConsultationAvatar(
  patientName: string,
  apiAvatarUrl?: string | null,
): string {
  if (apiAvatarUrl) {
    return apiAvatarUrl;
  }

  const assetId = resolvePatientAssetId(patientName);
  if (assetId) {
    return `/assets/patients/${assetId}/consultation-avatar.png`;
  }

  return CASES_ASSETS.avatarFallback;
}

export function formatCaseDisplayId(caseId: string): string {
  let hash = 0;
  for (let index = 0; index < caseId.length; index += 1) {
    hash = (hash * 31 + caseId.charCodeAt(index)) >>> 0;
  }
  return String(hash).padStart(11, "0").slice(0, 11);
}

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: "Mudah",
  medium: "Sedang",
  hard: "Sulit",
};

export function formatDifficultyLabel(difficulty: string): string {
  return DIFFICULTY_LABELS[difficulty.toLowerCase()] ?? difficulty;
}

export function formatDeadlineMinutes(minutes: number): string {
  return `${String(minutes).padStart(2, "0")}.00`;
}
