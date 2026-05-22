/** Static assets exported from Figma (Hackhaton UMKT 2026 — Choose Specialist). */
export const SPECIALISTS_ASSETS = {
  iconChevronRight: "/assets/specialists/figma/icon-chevron-right.png",
  icons: {
    "internal-medicine": "/assets/specialists/figma/icon-internal-medicine.png",
    obgyn: "/assets/specialists/figma/icon-obgyn.png",
    pediatrics: "/assets/specialists/figma/icon-pediatrics.png",
    "general-surgery": "/assets/specialists/figma/icon-general-surgery.png",
    anesthesiology: "/assets/specialists/figma/icon-anesthesiology.png",
    ophthalmology: "/assets/specialists/figma/icon-ophthalmology.png",
  },
} as const;

export type SpecialistIconId = keyof typeof SPECIALISTS_ASSETS.icons;

export function resolveSpecialistIcon(specialistId: string): string {
  if (specialistId in SPECIALISTS_ASSETS.icons) {
    return SPECIALISTS_ASSETS.icons[specialistId as SpecialistIconId];
  }
  return SPECIALISTS_ASSETS.icons["internal-medicine"];
}
