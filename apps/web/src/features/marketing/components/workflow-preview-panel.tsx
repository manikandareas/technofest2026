import Image from "next/image";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type WorkflowPreviewPanelProps = {
  children: ReactNode;
  className?: string;
};

export function WorkflowPreviewPanel({
  children,
  className,
}: WorkflowPreviewPanelProps) {
  return (
    <div className={cn("min-w-0", className)}>
      <div className="min-h-[16rem] overflow-hidden rounded-2xl border border-border bg-card shadow-sm sm:min-h-[18rem]">
        {children}
      </div>
    </div>
  );
}

type WorkflowCaseBriefPreviewProps = {
  avatarSrc: string;
  patientName: string;
  patientAge: number;
  specialist: string;
  chiefComplaint: string;
  triageNote: string;
  difficulty: string;
};

export function WorkflowCaseBriefPreview({
  avatarSrc,
  patientName,
  patientAge,
  specialist,
  chiefComplaint,
  triageNote,
  difficulty,
}: WorkflowCaseBriefPreviewProps) {
  return (
    <WorkflowPreviewPanel>
      <div className="flex h-full flex-col p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-border bg-muted sm:size-[4.5rem]">
            <Image
              src={avatarSrc}
              alt={`Avatar pasien ${patientName}`}
              fill
              className="object-cover pixelated"
              sizes="72px"
            />
          </div>
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-medium text-foreground sm:text-base">
              {patientName}, {patientAge} thn
            </p>
            <p className="text-xs text-muted-foreground sm:text-sm">{specialist}</p>
            <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-foreground sm:text-xs">
              {difficulty}
            </span>
          </div>
        </div>
        <div className="mt-5 space-y-3 text-sm leading-snug sm:mt-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Keluhan
            </p>
            <p className="mt-1 text-foreground">{chiefComplaint}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Triase
            </p>
            <p className="mt-1 text-muted-foreground">{triageNote}</p>
          </div>
        </div>
        <div className="mt-auto pt-5">
          <div className="rounded-full bg-primary px-4 py-2.5 text-center text-sm font-medium text-primary-foreground">
            Mulai konsultasi
          </div>
        </div>
      </div>
    </WorkflowPreviewPanel>
  );
}

type WorkflowScorePreviewProps = {
  xp: string;
  stars: string;
  feedback: string;
  iconStarsSrc: string;
  iconTrophySrc: string;
};

export function WorkflowScorePreview({
  xp,
  stars,
  feedback,
  iconStarsSrc,
  iconTrophySrc,
}: WorkflowScorePreviewProps) {
  return (
    <WorkflowPreviewPanel>
      <div className="flex h-full flex-col p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="relative size-10 shrink-0 sm:size-11">
            <Image
              src={iconTrophySrc}
              alt=""
              fill
              className="object-contain pixelated"
              sizes="44px"
            />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground sm:text-base">
              Hasil konsultasi
            </p>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Diagnosis, anamnesis, dan RM dinilai
            </p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-2.5 sm:mt-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs text-foreground sm:text-sm">
            <span className="relative size-4">
              <Image
                src={iconStarsSrc}
                alt=""
                fill
                className="object-contain pixelated"
                sizes="16px"
              />
            </span>
            {xp}
          </span>
          <span className="rounded-full bg-muted px-3 py-1.5 text-xs text-foreground sm:text-sm">
            {stars}
          </span>
        </div>
        <div className="mt-5 rounded-xl border border-border bg-muted/60 p-4 sm:mt-6">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Feedback
          </p>
          <p className="mt-2 text-sm leading-snug text-foreground">{feedback}</p>
        </div>
      </div>
    </WorkflowPreviewPanel>
  );
}
