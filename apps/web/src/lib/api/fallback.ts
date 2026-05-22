import data from "../../../../../docs/data.json";

type DataSpecialist = {
  id: string;
  name?: string;
  display_name?: string;
  description: string;
  icon?: string;
  status: string;
};

type DataCase = {
  id: string;
  specialist_id: string;
  title: string;
  patient: {
    name: string;
    age: number;
    gender: string;
  };
  difficulty: string;
  availability?: {
    is_published?: boolean;
  };
  chief_complaint: string;
  triage_note: string;
  condition_badge: string;
  estimated_duration_seconds: number;
  patient_avatar_url?: string;
  case_thumbnail_url?: string;
  consultation_avatar_url?: string;
  case_data?: {
    learning_focus?: string[];
  };
};

const fallbackData = data as {
  specialists: DataSpecialist[];
  cases: DataCase[];
};

const publishedCases = fallbackData.cases.filter(
  (item) => item.availability?.is_published !== false,
);

export const fallbackSpecialists = fallbackData.specialists.map((specialist) => ({
  id: specialist.id,
  name: specialist.display_name ?? specialist.name ?? specialist.id,
  description: specialist.description,
  icon: specialist.icon ?? "stethoscope",
  status: specialist.status,
  case_count: publishedCases.filter((item) => item.specialist_id === specialist.id).length,
}));

export const fallbackCases = publishedCases.map((item) => ({
  id: item.id,
  specialist_id: item.specialist_id,
  specialist_name:
    fallbackSpecialists.find((specialist) => specialist.id === item.specialist_id)?.name ??
    "Specialist",
  patient_name: item.patient.name,
  patient_age: item.patient.age,
  patient_gender: item.patient.gender,
  chief_complaint: item.chief_complaint,
  triage_note: item.triage_note,
  difficulty: item.difficulty,
  condition_badge: item.condition_badge,
  estimated_duration_minutes: Math.ceil(item.estimated_duration_seconds / 60),
  patient_avatar_url: item.patient_avatar_url ?? null,
  case_thumbnail_url: item.case_thumbnail_url ?? null,
  consultation_avatar_url: item.consultation_avatar_url ?? null,
  learning_objectives: item.case_data?.learning_focus ?? [],
}));
