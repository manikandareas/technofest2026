/** Static assets exported from Figma (Hackhaton UMKT 2026 — Case Brief). */
export const CASES_ASSETS = {
  iconBack: "/assets/specialists/figma/icon-back.png",
  iconStopwatch: "/assets/cases/figma/icon-stopwatch.png",
  iconLearning: "/assets/home/figma/icon-stars.png",
  avatars: {
    raka: "/assets/cases/figma/avatar-raka.png",
  },
} as const;

export type CaseAvatarId = keyof typeof CASES_ASSETS.avatars;

const PATIENT_AVATAR_BY_NAME: Record<string, CaseAvatarId> = {
  raka: "raka",
};

export function resolvePatientAvatar(patientName: string): string {
  const key = patientName.trim().split(/\s+/)[0]?.toLowerCase() ?? "";
  const avatarId = PATIENT_AVATAR_BY_NAME[key];
  if (avatarId) {
    return CASES_ASSETS.avatars[avatarId];
  }
  return CASES_ASSETS.avatars.raka;
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
