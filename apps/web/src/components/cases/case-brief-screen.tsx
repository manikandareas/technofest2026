import Image from "next/image";
import type { ReactNode } from "react";

import { CaseBriefLearningDrawer } from "@/components/cases/case-brief-learning-drawer";
import {
  CASES_ASSETS,
  formatCaseDisplayId,
  formatDeadlineMinutes,
  formatDifficultyLabel,
  resolvePatientAvatar,
} from "@/components/cases/cases-assets";
import { SpecialistsScreenLayout } from "@/components/specialists/specialists-screen-layout";

import { CaseBriefStartButton } from "./case-brief-start-button";

export type CaseBriefItem = {
  id: string;
  specialist_id: string;
  patient_name: string;
  patient_age: number;
  patient_gender?: string | null;
  chief_complaint: string;
  triage_note: string;
  difficulty: string;
  condition_badge: string;
  estimated_duration_minutes: number;
  patient_avatar_url?: string | null;
  consultation_avatar_url?: string | null;
  learning_objectives?: string[];
};

type CaseBriefScreenProps = {
  item: CaseBriefItem;
  startSessionAction: () => Promise<void>;
};

function normalizeGender(gender?: string | null) {
  if (!gender) return "Tidak diketahui";
  const g = gender.toLowerCase();
  if (g === "male" || g === "laki-laki" || g === "l") {
    return "Laki-laki";
  }
  if (g === "female" || g === "perempuan" || g === "p") {
    return "Perempuan";
  }
  return gender;
}

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
      {formatDifficultyLabel(difficulty)}
    </span>
  );
}

export function CaseBriefScreen({ item, startSessionAction }: CaseBriefScreenProps) {
  const avatarSrc = resolvePatientAvatar(item.patient_name, item.patient_avatar_url);
  const displayId = formatCaseDisplayId(item.id);
  const objectives = item.learning_objectives ?? [];

  return (
    <SpecialistsScreenLayout
      backHref={`/app/specialists/${item.specialist_id}`}
      backLabel="Kembali ke daftar kasus"
      title="BRIEF KASUS"
      headerAction={<CaseBriefLearningDrawer objectives={objectives} />}
      showBottomNav={false}
      footer={<CaseBriefStartButton startSessionAction={startSessionAction} />}
    >
      <section className="relative z-10 flex flex-1 flex-col px-3 pb-4 pt-2 sm:px-4 sm:pb-5 md:px-6 lg:mx-6 lg:px-8 lg:pb-6 xl:mx-auto xl:max-w-4xl xl:px-10">
        <div className="relative">
          {/* Absolute 3D Inset shadow */}
          <div className="absolute inset-0 bg-black/10 dark:bg-black/30 translate-x-1.5 translate-y-1.5" />

          {/* Core Card Container with 8-bit border */}
          <div className="relative border-y-4 border-primary bg-card text-foreground">
            {/* Absolute side borders to form complete 8-bit box */}
            <div className="pointer-events-none absolute inset-y-0 -mx-1 border-x-4 border-primary" aria-hidden="true" />
            
            {/* Corner decorations */}
            <div className="absolute top-1 left-1 size-1.5 bg-secondary" />
            <div className="absolute top-1 right-1 size-1.5 bg-secondary" />
            <div className="absolute bottom-1 left-1 size-1.5 bg-secondary" />
            <div className="absolute bottom-1 right-1 size-1.5 bg-secondary" />

            {/* Glowing line overlay to match retro screen / clinical monitor */}
            <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

            {/* Internal layout */}
            <div className="relative p-4 sm:p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-0">
                
                {/* LEFT COLUMN: Patient's Medical Profile Panel */}
                <div className="md:col-span-5 md:pr-6 lg:pr-8 flex flex-col justify-start">
                  
                  {/* Avatar wrapper */}
                  <div className="flex flex-col items-center justify-center">
                    
                    {/* Medical monitor portrait wrapper */}
                    <div className="relative p-1.5 bg-black border-2 border-primary shadow-[0_0_12px_rgba(16,185,129,0.15)] max-w-fit mx-auto">
                      <div className="relative size-28 sm:size-32 overflow-hidden bg-emerald-950/20">
                        <Image
                          src={avatarSrc}
                          alt={item.patient_name}
                          fill
                          priority
                          className="object-cover object-center pixelated"
                          sizes="(max-width: 640px) 112px, 128px"
                        />
                        {/* Dynamic scanline effect for retro feel */}
                        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
                      </div>
                      
                      {/* Frame corners to look pixelated/sci-fi */}
                      <div className="absolute top-0.5 left-0.5 size-1 bg-primary" />
                      <div className="absolute top-0.5 right-0.5 size-1 bg-primary" />
                      <div className="absolute bottom-0.5 left-0.5 size-1 bg-primary" />
                      <div className="absolute bottom-0.5 right-0.5 size-1 bg-primary" />

                      {/* Glowing Status LEDs */}
                      <div className="absolute top-2 left-2 flex gap-1 z-20">
                        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_#10b981]" />
                        <span className="size-1.5 rounded-full bg-emerald-400/80 animate-ping" style={{ animationDuration: "2s" }} />
                      </div>

                      <div className="absolute top-2 right-2 flex gap-1 z-20">
                        <span className="size-1.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_6px_#f43f5e]" />
                      </div>

                      {/* Live monitor border overlay */}
                      <div className="absolute inset-0 border border-primary/20 pointer-events-none" />
                    </div>

                    {/* ECG Line */}
                    <div className="mt-3 flex items-center justify-center gap-2 text-[0.625rem] font-mono text-primary bg-primary/5 px-2.5 py-1 border border-primary/15 rounded-sm select-none">
                      <span className="size-1.5 rounded-full bg-primary animate-ping" />
                      <span className="tracking-wider">ECG NORMAL</span>
                      <svg className="h-3 w-12 text-primary opacity-90" viewBox="0 0 50 10" fill="none">
                        <path
                          d="M0 5h12l3-4 3 8 2-6 2 2h18"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="animate-pulse"
                        />
                      </svg>
                    </div>

                  </div>

                  {/* Metadata Dashboard */}
                  <div className="mt-5 w-full space-y-2.5">
                    <div className="bg-secondary/5 dark:bg-black/20 border-y border-primary/20 -mx-4 px-4 py-3 space-y-2.5 md:-mx-0 md:px-4 md:border md:border-primary/20 md:rounded-sm">
                      <div className="flex items-center justify-between border-b border-primary/10 pb-2">
                        <span className="text-muted-foreground text-[0.6875rem] font-bold uppercase tracking-wider retro">Nama Pasien</span>
                        <span className="font-semibold text-foreground text-right text-xs sm:text-sm">{item.patient_name}</span>
                      </div>
                      
                      <div className="flex items-center justify-between border-b border-primary/10 pb-2">
                        <span className="text-muted-foreground text-[0.6875rem] font-bold uppercase tracking-wider retro">Umur</span>
                        <span className="font-semibold text-foreground text-right text-xs sm:text-sm">{item.patient_age} Tahun</span>
                      </div>
                      
                      <div className="flex items-center justify-between border-b border-primary/10 pb-2">
                        <span className="text-muted-foreground text-[0.6875rem] font-bold uppercase tracking-wider retro">Gender</span>
                        <span className="font-semibold text-foreground text-right text-xs sm:text-sm">{normalizeGender(item.patient_gender)}</span>
                      </div>
                      
                      <div className="flex items-center justify-between border-b border-primary/10 pb-2">
                        <span className="text-muted-foreground text-[0.6875rem] font-bold uppercase tracking-wider retro">ID Kasus</span>
                        <span className="font-mono text-muted-foreground text-right text-xs">{displayId}</span>
                      </div>
                      
                      <div className="flex items-center justify-between pt-0.5">
                        <span className="text-muted-foreground text-[0.6875rem] font-bold uppercase tracking-wider retro">Kondisi</span>
                        <span className="font-extrabold text-primary text-right text-xs sm:text-sm">{item.condition_badge}</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* RIGHT COLUMN: Case Narrative & Diagnostics Panel */}
                <div className="md:col-span-7 border-t border-primary/25 pt-6 md:border-t-0 md:pt-0 md:pl-6 lg:pl-8 md:border-l border-primary/25 flex flex-col justify-start space-y-5">
                  
                  {/* Chief Complaint */}
                  <div className="space-y-2 pb-5 border-b border-primary/25">
                    <div className="flex items-center gap-2">
                      <span className="size-2 bg-accent shadow-[0_0_4px_var(--accent)]" />
                      <h3 className="retro text-[0.6875rem] sm:text-xs font-bold text-accent tracking-widest uppercase">Keluhan Utama</h3>
                    </div>
                    <p className="text-sm font-semibold leading-relaxed text-foreground md:text-base">
                      {item.chief_complaint}
                    </p>
                  </div>

                  {/* Triage Summary */}
                  <div className="space-y-2 pb-5 border-b border-primary/25">
                    <div className="flex items-center gap-2">
                      <span className="size-2 bg-accent shadow-[0_0_4px_var(--accent)]" />
                      <h3 className="retro text-[0.6875rem] sm:text-xs font-bold text-accent tracking-widest uppercase">Ringkasan Triage</h3>
                    </div>
                    <div className="text-xs sm:text-sm font-medium leading-relaxed text-foreground/90 bg-primary/[0.03] dark:bg-primary/[0.01] p-3 border border-primary/10 rounded-sm">
                      {item.triage_note}
                    </div>
                  </div>

                  {/* Telemetry Footer */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    {/* Difficulty Badge Telemetry Box */}
                    <div className="bg-primary/5 dark:bg-black/10 border border-primary/15 p-3.5 flex flex-col justify-between h-full rounded-sm">
                      <span className="text-[0.625rem] sm:text-[0.6875rem] font-bold text-muted-foreground uppercase tracking-widest retro pb-2.5">Kesulitan</span>
                      <div className="flex items-center">
                        <DifficultyBadge difficulty={item.difficulty} />
                      </div>
                    </div>

                    {/* Deadline Telemetry Box */}
                    <div className="bg-rose-500/5 dark:bg-rose-500/[0.02] border border-rose-500/20 p-3.5 flex flex-col justify-between h-full rounded-sm shadow-[inset_0_0_10px_rgba(239,68,68,0.02)]">
                      <span className="text-[0.625rem] sm:text-[0.6875rem] font-bold text-rose-500 uppercase tracking-widest retro pb-2.5 animate-pulse">Deadline</span>
                      <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-mono font-extrabold text-sm sm:text-base">
                        <div className="relative size-4.5 shrink-0 animate-[pulse_1.5s_infinite]">
                          <Image
                            src={CASES_ASSETS.iconStopwatch}
                            alt=""
                            fill
                            className="object-contain pixelated"
                          />
                        </div>
                        <span className="tracking-widest drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]">
                          {formatDeadlineMinutes(item.estimated_duration_minutes)}
                        </span>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            </div>

          </div>
        </div>
      </section>
    </SpecialistsScreenLayout>
  );
}
