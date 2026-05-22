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
import { Separator } from "@/components/ui/8bit/separator";
import { SpecialistsScreenLayout } from "@/components/specialists/specialists-screen-layout";

import { CaseBriefStartButton } from "./case-brief-start-button";

export type CaseBriefItem = {
  id: string;
  specialist_id: string;
  patient_name: string;
  patient_age: number;
  chief_complaint: string;
  triage_note: string;
  difficulty: string;
  condition_badge: string;
  estimated_duration_minutes: number;
  learning_objectives?: string[];
};

type CaseBriefScreenProps = {
  item: CaseBriefItem;
  startSessionAction: () => Promise<void>;
};

function BriefTextSection({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5 py-3 sm:py-3.5">
      <p className="retro text-xs leading-tight sm:text-sm">{label}</p>
      <div className="text-xs font-semibold leading-snug sm:text-sm">{children}</div>
    </div>
  );
}

function BriefMetaRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-3 sm:py-3.5">
      <p className="retro shrink-0 text-xs leading-tight sm:text-sm">{label}</p>
      <div className="min-w-0 text-right">{children}</div>
    </div>
  );
}

export function CaseBriefScreen({ item, startSessionAction }: CaseBriefScreenProps) {
  const avatarSrc = resolvePatientAvatar(item.patient_name);
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
      <section className="relative z-10 flex flex-1 flex-col px-3 pb-4 pt-2 sm:px-4 sm:pb-5 md:px-6 lg:mx-6 lg:px-8 lg:pb-6 xl:mx-auto xl:max-w-md xl:px-10">
        <article className="overflow-hidden rounded-[1.75rem] border-2 border-foreground bg-white text-foreground shadow-[4px_4px_0_#000]">
          <div className="flex items-center gap-3 px-3 py-3 sm:gap-4 sm:px-4 sm:py-4">
            <div className="relative size-[4.5rem] shrink-0 overflow-hidden rounded-2xl border-2 border-[#1a233e]/10 bg-[#eef3ff] sm:size-20">
              <Image
                src={avatarSrc}
                alt=""
                fill
                priority
                className="object-cover object-center pixelated"
                sizes="80px"
              />
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <p className="retro text-sm leading-tight sm:text-base">
                {item.patient_name}, {item.patient_age} th
              </p>
              <p className="text-xs font-semibold leading-snug sm:text-sm">
                {item.condition_badge}
              </p>
              <p className="text-[0.6875rem] leading-snug text-[#1a233e]/70 sm:text-xs">
                ID: {displayId}
              </p>
            </div>
          </div>

          <Separator className="bg-[#d8dee9]" />

          <div className="px-3 sm:px-4">
            <BriefTextSection label="Keluhan Utama">
              <p>{item.chief_complaint}</p>
            </BriefTextSection>

            <Separator className="bg-[#d8dee9]" />

            <BriefTextSection label="Ringkasan Triage">
              <p>{item.triage_note}</p>
            </BriefTextSection>

            <Separator className="bg-[#d8dee9]" />

            <BriefMetaRow label="Kesulitan">
              <span className="inline-flex rounded-full border border-[#2b8a3e]/30 bg-[#d3f9d8] px-2.5 py-0.5 text-[0.6875rem] font-bold uppercase tracking-wide text-[#2b8a3e] sm:text-xs">
                {formatDifficultyLabel(item.difficulty)}
              </span>
            </BriefMetaRow>

            <Separator className="bg-[#d8dee9]" />

            <BriefMetaRow label="Deadline">
              <span className="inline-flex items-center justify-end gap-1.5 text-xs font-semibold text-[#fa5252] sm:text-sm">
                <Image
                  src={CASES_ASSETS.iconStopwatch}
                  alt=""
                  width={16}
                  height={16}
                  className="size-4 object-contain pixelated"
                  aria-hidden
                />
                {formatDeadlineMinutes(item.estimated_duration_minutes)}
              </span>
            </BriefMetaRow>
          </div>
        </article>
      </section>
    </SpecialistsScreenLayout>
  );
}
