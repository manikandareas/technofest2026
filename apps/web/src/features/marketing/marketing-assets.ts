import { CASES_ASSETS } from "@/components/cases/cases-assets";
import { HOME_ASSETS } from "@/components/home/home-assets";

/** Shared static assets for marketing sections. */
export const MARKETING_ASSETS = {
  demoPatientAvatar: "/assets/patients/maya/avatar.png",
  demoConsultationAvatar: "/assets/patients/maya/consultation-avatar.png",
  demoCaseThumbnail: "/assets/cases/anesthesiology-preoperative-asthma/thumbnail.png",
  doctorCharacter: HOME_ASSETS.doctorCharacter,
  iconStars: HOME_ASSETS.iconStars,
  iconTrophy: HOME_ASSETS.iconTrophy,
  iconStopwatch: CASES_ASSETS.iconStopwatch,
  sceneBgMobile: "/assets/home/figma/scene-bg-mobile.png",
  specialists: {
    internalMedicine: "/assets/specialists/figma/icon-internal-medicine.png",
    obgyn: "/assets/specialists/figma/icon-obgyn.png",
    pediatrics: "/assets/specialists/figma/icon-pediatrics.png",
    generalSurgery: "/assets/specialists/figma/icon-general-surgery.png",
    anesthesiology: "/assets/specialists/figma/icon-anesthesiology.png",
    ophthalmology: "/assets/specialists/figma/icon-ophthalmology.png",
  },
} as const;

export const DEMO_CASE = {
  patientName: "Maya",
  patientAge: 41,
  specialist: "Anestesi",
  chiefComplaint: "Pasien akan operasi elektif dan punya riwayat asma.",
  triageNote: "Pasien stabil, datang untuk penilaian pra-anestesi.",
  difficulty: "Sedang",
} as const;

export const SPECIALIST_GRID = [
  {
    name: "Penyakit Dalam",
    status: "Tersedia",
    detail: "3 kasus",
    icon: MARKETING_ASSETS.specialists.internalMedicine,
    available: true,
  },
  {
    name: "OBGYN",
    status: "Tersedia",
    detail: "3 kasus",
    icon: MARKETING_ASSETS.specialists.obgyn,
    available: true,
  },
  {
    name: "Kesehatan Anak",
    status: "Tersedia",
    detail: "3 kasus",
    icon: MARKETING_ASSETS.specialists.pediatrics,
    available: true,
  },
  {
    name: "Bedah Umum",
    status: "Tersedia",
    detail: "3 kasus",
    icon: MARKETING_ASSETS.specialists.generalSurgery,
    available: true,
  },
  {
    name: "Anestesi",
    status: "Tersedia",
    detail: "Demo Maya",
    icon: MARKETING_ASSETS.specialists.anesthesiology,
    available: true,
  },
  {
    name: "Kesehatan Mata",
    status: "Tersedia",
    detail: "3 kasus",
    icon: MARKETING_ASSETS.specialists.ophthalmology,
    available: true,
  },
] as const;
