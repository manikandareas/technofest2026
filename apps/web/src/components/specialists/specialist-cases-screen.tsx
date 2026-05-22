import Image from "next/image";
import Link from "next/link";

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

function getDifficultyBadgeStyles(difficulty: string) {
  const d = difficulty.toUpperCase();
  if (d === "MUDAH" || d === "EASY") {
    return {
      border: "border-primary/60",
      bg: "bg-primary/20",
      text: "text-primary",
    };
  } else if (d === "SEDANG" || d === "MODERATE" || d === "MEDIUM") {
    return {
      border: "border-sky-500/60",
      bg: "bg-sky-500/20",
      text: "text-sky-600 dark:text-sky-400",
    };
  } else {
    return {
      border: "border-accent/60",
      bg: "bg-accent/20",
      text: "text-accent",
    };
  }
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const styles = getDifficultyBadgeStyles(difficulty);
  return (
    <span className={`inline-flex items-center border-y ${styles.border} ${styles.bg} px-1.5 py-0.5 text-[0.5rem] sm:text-[0.5625rem] font-bold uppercase leading-none ${styles.text} retro relative`}>
      <span className={`pointer-events-none absolute inset-y-0 -mx-0.5 border-x ${styles.border}`} aria-hidden="true" />
      {difficulty}
    </span>
  );
}

function CaseSelectionCard({ item }: { item: SpecialistCaseItem }) {
  return (
    <Link
      href={`/app/cases/${item.id}/brief`}
      className="group block h-full outline-none"
    >
      <div className="relative h-full transition-all duration-150 transform hover:-translate-x-1 hover:-translate-y-1 active:translate-x-0 active:translate-y-0">
        <div className="absolute inset-0 bg-black/15 translate-x-1 translate-y-1 group-hover:translate-x-2 group-hover:translate-y-2 group-hover:bg-primary/5 transition-all duration-150 dark:bg-black/40" />
        
        <div className="relative h-full border-y-4 border-primary bg-card text-foreground group-hover:border-accent group-focus-visible:border-accent transition-colors duration-150">
          <div className="pointer-events-none absolute inset-y-0 -mx-1 border-x-4 border-primary group-hover:border-accent group-focus-visible:border-accent transition-colors duration-150" aria-hidden="true" />
          
          <div className="absolute top-1 left-1 size-1 bg-secondary group-hover:bg-accent transition-colors" aria-hidden="true" />
          <div className="absolute top-1 right-1 size-1 bg-secondary group-hover:bg-accent transition-colors" aria-hidden="true" />
          <div className="absolute bottom-1 left-1 size-1 bg-secondary group-hover:bg-accent transition-colors" aria-hidden="true" />
          <div className="absolute bottom-1 right-1 size-1 bg-secondary group-hover:bg-accent transition-colors" aria-hidden="true" />

          <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/0 to-accent/0 group-hover:from-accent/5 group-hover:via-accent/2 group-hover:to-accent/0 transition-all duration-200" />

          <div className="relative flex min-h-[6.75rem] items-center gap-3 px-3 py-3 sm:min-h-[7.25rem] sm:gap-4 sm:px-4 sm:py-3.5 lg:min-h-[8rem] lg:px-5 lg:py-4">
            <div className="relative size-14 shrink-0 border-2 border-primary bg-secondary/15 text-primary group-hover:border-accent group-hover:text-accent sm:size-16 lg:size-[4.5rem] transition-colors duration-150 flex flex-col items-center justify-center">
              <div className="pointer-events-none absolute inset-0.5 border border-primary/10 group-hover:border-accent/10" aria-hidden="true" />
              <span className="retro text-[0.5rem] uppercase leading-none tracking-wider text-muted-foreground group-hover:text-accent transition-colors mb-0.5 sm:mb-1">
                EST
              </span>
              <span className="retro text-base sm:text-lg lg:text-xl font-bold leading-none tracking-tighter">
                {item.estimated_duration_minutes}
              </span>
              <span className="retro text-[0.45rem] sm:text-[0.5rem] uppercase leading-none tracking-widest text-muted-foreground mt-0.5 sm:mt-1">
                MIN
              </span>
            </div>

            <div className="min-w-0 flex-1 space-y-1.5 pr-1 sm:pr-2 lg:space-y-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <p className="retro text-[0.625rem] sm:text-xs lg:text-sm font-bold leading-none text-foreground group-hover:text-accent transition-colors">
                  {item.patient_name}, {item.patient_age} Th
                </p>
                <DifficultyBadge difficulty={item.difficulty} />
              </div>
              <p className="text-[0.6875rem] font-semibold text-accent leading-snug sm:text-xs lg:text-sm">
                Keluhan: {item.chief_complaint}
              </p>
              <p className="line-clamp-2 text-[0.65625rem] leading-snug text-muted-foreground sm:text-xs lg:line-clamp-3 lg:leading-relaxed">
                {item.triage_note}
              </p>
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="inline-flex items-center gap-1 border-y border-primary/40 bg-primary/10 px-1.5 py-0.5 text-[0.5rem] sm:text-[0.5625rem] font-bold uppercase leading-none text-primary retro relative">
                  <span className="pointer-events-none absolute inset-y-0 -mx-0.5 border-x border-primary/40" aria-hidden="true" />
                  {item.patient_gender}
                </span>
                <span className="inline-flex items-center gap-1 border-y border-primary/40 bg-primary/10 px-1.5 py-0.5 text-[0.5rem] sm:text-[0.5625rem] font-bold uppercase leading-none text-primary retro relative">
                  <span className="pointer-events-none absolute inset-y-0 -mx-0.5 border-x border-primary/40" aria-hidden="true" />
                  {item.condition_badge}
                </span>
              </div>
            </div>

            <div className="relative size-5 sm:size-6 flex items-center justify-center shrink-0">
              <Image
                src={SPECIALISTS_ASSETS.iconChevronRight}
                alt=""
                width={20}
                height={24}
                className="size-4 object-contain pixelated opacity-80 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-150"
                aria-hidden
              />
            </div>
          </div>
        </div>
      </div>
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
    <div className="relative border-2 border-primary bg-card/95 p-3 sm:p-4 flex gap-3 sm:gap-4 items-start shadow-[4px_4px_0_rgba(0,0,0,0.15)] dark:shadow-[4px_4px_0_rgba(0,0,0,0.4)]">
      <div className="pointer-events-none absolute inset-0.5 border border-primary/10" aria-hidden="true" />
      
      <div className="relative size-12 sm:size-14 shrink-0 border-2 border-primary bg-secondary/15 overflow-hidden shadow-[2px_2px_0_rgba(0,0,0,0.1)] dark:shadow-[2px_2px_0_rgba(0,0,0,0.5)]">
        <Image
          src={iconSrc}
          alt={specialistName}
          fill
          priority
          className="object-cover object-center pixelated scale-100"
          sizes="(max-width: 640px) 56px, (max-width: 1024px) 64px, 72px"
        />
      </div>
      
      <div className="flex-1 space-y-1 text-left min-w-0">
        <p className="retro text-[0.625rem] sm:text-[0.6875rem] font-bold text-accent tracking-wider uppercase">
          {specialistName}
        </p>
        <p className="text-xs sm:text-sm leading-relaxed text-foreground font-medium">
          {caseCount > 0
            ? `${caseCount} kasus siap — pilih pasien untuk mulai simulasi PixelAid.`
            : "Belum ada kasus tersedia untuk spesialis ini."}
        </p>
      </div>
      
      <div className="absolute bottom-2 right-2 animate-bounce">
        <span className="block border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-6 border-t-accent size-0" />
      </div>
    </div>
  );
}

function EmptyCasesState() {
  return (
    <div className="relative border-destructive border-2 bg-card p-6 text-center space-y-3 max-w-md mx-auto my-6 shadow-[4px_4px_0_rgba(0,0,0,0.15)] dark:shadow-[4px_4px_0_rgba(0,0,0,0.5)]">
      <div className="pointer-events-none absolute inset-0.5 border border-destructive/10" aria-hidden="true" />
      <div className="inline-flex items-center justify-center p-2 border-2 border-destructive/60 bg-destructive/10 text-destructive mb-1">
        <svg
          viewBox="0 0 16 16"
          className="size-8 pixelated fill-current"
          aria-hidden="true"
        >
          <rect x="7" y="2" width="2" height="6" />
          <rect x="7" y="10" width="2" height="2" />
        </svg>
      </div>
      <p className="retro text-sm leading-none font-bold text-destructive tracking-wider">
        [ SYSTEM WARNING: CASE NOT READY ]
      </p>
      <p className="text-xs leading-relaxed text-muted-foreground">
        Kasus untuk spesialis ini sedang disiapkan oleh pusat database medis. Silakan pilih departemen spesialisasi lain atau kembali beberapa saat lagi.
      </p>
    </div>
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
      <section className={`${specialistsContentPanelClass} space-y-4 sm:space-y-5 md:space-y-6 pb-6`}>
        <SpecialistHero
          iconSrc={iconSrc}
          specialistName={specialistName}
          caseCount={cases.length}
        />

        {cases.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-5 content-start">
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