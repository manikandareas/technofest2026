import Image from "next/image";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/8bit/card";

import {
  SPECIALISTS_ASSETS,
  resolveSpecialistIcon,
} from "./specialists-assets";
import {
  SpecialistsScreenLayout,
  specialistsContentPanelClass,
  specialistsScrollAreaClass,
} from "./specialists-screen-layout";

type SpecialistCaseItem = {
  id: string;
  specialist_id: string;
  specialist_name?: string;
  patient_name: string;
  patient_age: number;
  patient_gender: string;
  chief_complaint: string;
  triage_note: string;
  difficulty: string;
  condition_badge: string;
  estimated_duration_minutes: number;
};

type SpecialistCasesScreenProps = {
  specialistId: string;
  specialistName: string;
  cases: SpecialistCaseItem[];
};

function CaseSelectionCard({ item }: { item: SpecialistCaseItem }) {
  return (
    <Link
      href={`/app/cases/${item.id}/brief`}
      className="block h-full outline-none transition-transform focus-visible:ring-2 focus-visible:ring-white/70 active:scale-[0.99]"
    >
      <Card font="retro" className="h-full py-0">
        <CardContent className="flex min-h-[6.75rem] items-center gap-3 px-3 py-3 sm:min-h-[7.25rem] sm:gap-4 sm:px-4 sm:py-3.5 lg:min-h-[8rem] lg:px-5 lg:py-4">
          <div className="relative size-14 shrink-0 rounded-2xl border-2 border-foreground bg-[#f4c44f] text-foreground sm:size-16 lg:size-[4.5rem] lg:rounded-[1.125rem]">
            <span className="retro absolute inset-x-0 top-2 text-center text-[0.5rem] leading-none sm:top-2.5 sm:text-[0.5625rem] lg:top-3">
              CASE
            </span>
            <span className="retro absolute inset-x-0 bottom-2 text-center text-lg leading-none sm:bottom-2.5 sm:text-xl lg:bottom-3 lg:text-2xl">
              {item.estimated_duration_minutes}
            </span>
          </div>

          <div className="min-w-0 flex-1 space-y-1 pr-1 sm:pr-2 lg:space-y-1.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="retro text-sm leading-tight sm:text-base lg:text-lg">
                {item.patient_name}, {item.patient_age}
              </span>
              <span className="rounded-full border border-foreground bg-[#dfe8ff] px-2 py-0.5 text-[0.625rem] font-bold uppercase leading-none sm:text-[0.6875rem]">
                {item.difficulty}
              </span>
            </div>
            <p className="text-[0.6875rem] font-semibold leading-snug sm:text-xs lg:text-sm">
              {item.chief_complaint}
            </p>
            <p className="line-clamp-2 text-[0.65625rem] leading-snug text-card-foreground/75 sm:text-xs lg:text-sm lg:leading-relaxed">
              {item.triage_note}
            </p>
            <p className="text-[0.625rem] font-bold uppercase tracking-normal text-card-foreground/60 sm:text-[0.6875rem]">
              {item.condition_badge} / {item.patient_gender}
            </p>
          </div>

          <Image
            src={SPECIALISTS_ASSETS.iconChevronRight}
            alt=""
            width={20}
            height={24}
            className="size-4 shrink-0 object-contain pixelated opacity-90 sm:size-5 lg:size-6"
            aria-hidden
          />
        </CardContent>
      </Card>
    </Link>
  );
}

function SpecialistHero({
  iconSrc,
  specialistName,
  caseCount,
}: {
  iconSrc: string;
  specialistName: string;
  caseCount: number;
}) {
  return (
    <Card font="retro" className="mx-auto w-full max-w-md py-0 sm:max-w-lg lg:max-w-2xl">
      <CardContent className="flex items-center gap-3 px-3 py-3 sm:px-4 lg:gap-4 lg:px-5 lg:py-4">
        <div className="relative size-14 shrink-0 overflow-hidden rounded-2xl sm:size-16 lg:size-[4.5rem] lg:rounded-[1.125rem]">
          <Image
            src={iconSrc}
            alt=""
            fill
            priority
            className="object-cover object-center pixelated"
            sizes="(max-width: 640px) 56px, (max-width: 1024px) 64px, 72px"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="retro text-sm leading-tight sm:text-base lg:text-lg">
            {specialistName}
          </p>
          <p className="mt-1 text-[0.6875rem] leading-snug text-card-foreground/80 sm:text-xs lg:text-sm">
            {caseCount > 0
              ? `${caseCount} kasus siap — pilih pasien untuk mulai simulasi PixelAid.`
              : "Belum ada kasus tersedia untuk spesialis ini."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyCasesState() {
  return (
    <Card font="retro" className="mt-4 py-0 sm:mt-5 lg:mt-6">
      <CardContent className="flex flex-col items-center justify-center gap-3 px-4 py-10 text-center lg:py-14">
        <p className="retro text-sm leading-relaxed sm:text-base">CASE NOT READY</p>
        <p className="max-w-xs text-xs leading-relaxed text-card-foreground/70 sm:text-sm">
          Kasus untuk spesialis ini sedang disiapkan. Coba spesialis lain atau kembali nanti.
        </p>
      </CardContent>
    </Card>
  );
}

export function SpecialistCasesScreen({
  specialistId,
  specialistName,
  cases,
}: SpecialistCasesScreenProps) {
  const iconSrc = resolveSpecialistIcon(specialistId);

  return (
    <SpecialistsScreenLayout
      backHref="/app/specialists"
      backLabel="Kembali ke daftar spesialis"
      title="SELECT CASE"
    >
      <section className={specialistsContentPanelClass}>
        <SpecialistHero
          iconSrc={iconSrc}
          specialistName={specialistName}
          caseCount={cases.length}
        />

        {cases.length > 0 ? (
          <div className={specialistsScrollAreaClass}>
            {cases.map((item) => (
              <CaseSelectionCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <EmptyCasesState />
        )}
      </section>
    </SpecialistsScreenLayout>
  );
}
