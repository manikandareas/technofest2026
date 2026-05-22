import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

type SpecialistInput = {
  id: string;
  name?: string;
  display_name?: string;
  description: string;
  icon?: string;
  status: "available" | "coming_soon";
  sort_order?: number;
};

type CaseInput = {
  id: string;
  slug?: string;
  specialist_id: string;
  title: string;
  patient: {
    name: string;
    age: number;
    gender: string;
  };
  difficulty: "easy" | "medium" | "hard";
  availability: {
    is_published?: boolean;
    [key: string]: unknown;
  };
  chief_complaint: string;
  triage_note: string;
  condition_badge: string;
  base_xp: number;
  estimated_duration_seconds: number;
  case_data: Record<string, unknown>;
};

type DataInput = {
  specialists: SpecialistInput[];
  cases: CaseInput[];
};

const rootDir = resolve(import.meta.dir, "../../..");
const dataPath = resolve(rootDir, "docs/data.json");
const outPath = resolve(rootDir, "packages/db/seed.sql");

function sqlString(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}

function sqlJson(value: unknown): string {
  return `${sqlString(JSON.stringify(value))}::jsonb`;
}

function assertString(value: unknown, label: string): asserts value is string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${label} must be a non-empty string`);
  }
}

function assertNumber(value: unknown, label: string): asserts value is number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${label} must be a finite number`);
  }
}

function validate(data: DataInput): void {
  if (!Array.isArray(data.specialists) || !Array.isArray(data.cases)) {
    throw new Error("docs/data.json must contain specialists[] and cases[]");
  }

  const specialistIds = new Set<string>();
  for (const specialist of data.specialists) {
    assertString(specialist.id, "specialist.id");
    assertString(specialist.description, `${specialist.id}.description`);
    assertString(specialist.status, `${specialist.id}.status`);
    if (specialist.status !== "available" && specialist.status !== "coming_soon") {
      throw new Error(`${specialist.id}.status must be available or coming_soon`);
    }
    if (specialistIds.has(specialist.id)) {
      throw new Error(`duplicate specialist id: ${specialist.id}`);
    }
    specialistIds.add(specialist.id);
  }

  const caseIds = new Set<string>();
  for (const item of data.cases) {
    assertString(item.id, "case.id");
    assertString(item.specialist_id, `${item.id}.specialist_id`);
    assertString(item.title, `${item.id}.title`);
    assertString(item.patient?.name, `${item.id}.patient.name`);
    assertNumber(item.patient?.age, `${item.id}.patient.age`);
    assertString(item.patient?.gender, `${item.id}.patient.gender`);
    assertString(item.difficulty, `${item.id}.difficulty`);
    assertString(item.chief_complaint, `${item.id}.chief_complaint`);
    assertString(item.triage_note, `${item.id}.triage_note`);
    assertString(item.condition_badge, `${item.id}.condition_badge`);
    assertNumber(item.base_xp, `${item.id}.base_xp`);
    assertNumber(item.estimated_duration_seconds, `${item.id}.estimated_duration_seconds`);
    if (!specialistIds.has(item.specialist_id)) {
      throw new Error(`${item.id}.specialist_id does not exist: ${item.specialist_id}`);
    }
    if (caseIds.has(item.id)) {
      throw new Error(`duplicate case id: ${item.id}`);
    }
    caseIds.add(item.id);
    if (item.availability?.is_published) {
      if (!Array.isArray(item.case_data?.quiz) || item.case_data.quiz.length === 0) {
        throw new Error(`${item.id}.case_data.quiz must contain at least one item`);
      }
      if (
        !Array.isArray(item.case_data?.examinations) ||
        item.case_data.examinations.length === 0
      ) {
        throw new Error(`${item.id}.case_data.examinations must contain at least one item`);
      }
    }
  }
}

function buildCaseData(item: CaseInput): Record<string, unknown> {
  return {
    title: item.title,
    slug: item.slug ?? item.id,
    availability: item.availability,
    base_xp: item.base_xp,
    estimated_duration_seconds: item.estimated_duration_seconds,
    case_data: item.case_data,
  };
}

function buildSql(data: DataInput): string {
  const specialists = [...data.specialists].sort((a, b) => {
    const sortA = a.sort_order ?? 0;
    const sortB = b.sort_order ?? 0;
    return sortA - sortB || a.id.localeCompare(b.id);
  });
  const cases = [...data.cases].sort((a, b) => a.id.localeCompare(b.id));

  const specialistValues = specialists
    .map((specialist) => {
      const name = specialist.display_name ?? specialist.name ?? specialist.id;
      return `  (${[
        sqlString(specialist.id),
        sqlString(name),
        sqlString(specialist.description),
        sqlString(specialist.icon ?? "stethoscope"),
        sqlString(specialist.status),
        String(specialist.sort_order ?? 0),
      ].join(", ")})`;
    })
    .join(",\n");

  const caseValues = cases
    .map((item) => {
      const durationMinutes = Math.ceil(item.estimated_duration_seconds / 60);
      const status = item.availability?.is_published ? "published" : "draft";
      return `  (${[
        sqlString(item.id),
        sqlString(item.specialist_id),
        sqlString(item.patient.name),
        String(item.patient.age),
        sqlString(item.patient.gender),
        sqlString(item.chief_complaint),
        sqlString(item.triage_note),
        sqlString(item.difficulty),
        sqlString(item.condition_badge),
        String(durationMinutes),
        sqlString(status),
        String(item.base_xp),
        sqlJson(buildCaseData(item)),
      ].join(", ")})`;
    })
    .join(",\n");

  return `-- Generated by packages/db/scripts/build_seed_from_data_json.ts.
-- Source of truth: docs/data.json.

begin;

delete from public.rate_limit_events;
delete from public.voice_session_events;
delete from public.conversation_messages;
delete from public.examination_events;
delete from public.quiz_submissions;
delete from public.case_results;
delete from public.case_sessions;
delete from public.user_case_stats;
delete from public.leaderboard_entries;

update public.profiles
set xp = 0;

delete from public.cases;
delete from public.specialists;

insert into public.specialists (id, name, description, icon, status, sort_order)
values
${specialistValues};

insert into public.cases (
  id,
  specialist_id,
  patient_name,
  patient_age,
  patient_gender,
  chief_complaint,
  triage_note,
  difficulty,
  condition_badge,
  estimated_duration_minutes,
  status,
  base_xp,
  case_data
)
values
${caseValues};

commit;
`;
}

const data = JSON.parse(readFileSync(dataPath, "utf8")) as DataInput;
validate(data);
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, buildSql(data));
console.log(`Wrote ${outPath}`);
console.log(`specialists=${data.specialists.length} cases=${data.cases.length}`);
