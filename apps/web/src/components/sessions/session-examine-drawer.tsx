"use client";

import Image from "next/image";
import { ChevronRight, ImageIcon, Loader2, Stethoscope } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/8bit/button";

import { SessionExaminationDetailPanel } from "./session-examination-detail-panel";
import { SessionResponsivePanel } from "./session-responsive-panel";
import {
  sessionToolbarIconButtonClass,
  sessionToolbarIconClass,
  sessionToolbarLabelClass,
} from "./sessions-assets";

type ExaminationOption = {
  id: string;
  label: string;
  category: string;
  delay_seconds: number;
  asset?: ExaminationAsset | null;
};

type ExaminationAsset = {
  type: "image";
  url: string;
  alt: string;
};

export type ExaminationEvent = {
  id: string;
  examination_id: string;
  label: string;
  status: string;
  result?: string | null;
  asset?: ExaminationAsset | null;
};

type SessionExamineDrawerProps = {
  options: ExaminationOption[];
  examinations: ExaminationEvent[];
  selectedExamIds: Set<string>;
  disabled: boolean;
  isPending: boolean;
  onSelectExamination: (examinationId: string) => void;
};

function formatCategory(category: string) {
  return category.replaceAll("_", " ");
}

export function SessionExamineDrawer({
  options,
  examinations,
  selectedExamIds,
  disabled,
  isPending,
  onSelectExamination,
}: SessionExamineDrawerProps) {
  const [detailExam, setDetailExam] = useState<ExaminationEvent | null>(null);
  const [orderingExamId, setOrderingExamId] = useState<string | null>(null);

  const examinationByOptionId = useMemo(() => {
    const map = new Map<string, ExaminationEvent>();
    for (const exam of examinations) {
      map.set(exam.examination_id, exam);
    }
    return map;
  }, [examinations]);

  useEffect(() => {
    if (orderingExamId && examinationByOptionId.has(orderingExamId)) {
      setOrderingExamId(null);
    }
  }, [examinationByOptionId, orderingExamId]);

  const handleSelectExamination = (examinationId: string) => {
    setOrderingExamId(examinationId);
    onSelectExamination(examinationId);
  };

  const trigger = (
    <Button
      type="button"
      size="sm"
      variant="secondary"
      font="retro"
      className={sessionToolbarIconButtonClass}
      aria-label="Buka pemeriksaan"
    >
      <Stethoscope className={sessionToolbarIconClass} aria-hidden />
      <span className={sessionToolbarLabelClass}>Examine</span>
    </Button>
  );

  return (
    <>
      <SessionResponsivePanel
        trigger={trigger}
        title="Examine"
        icon={<Stethoscope className="size-4" aria-hidden />}
        bodyClassName="min-h-0 flex-1 overflow-y-auto px-3 pb-3 pt-3 sm:px-4"
      >
        <div className="space-y-2">
          {options.length === 0 ? (
            <p className="rounded-[1rem] border-2 border-foreground/10 bg-white p-4 text-sm text-muted-foreground">
              Tidak ada pemeriksaan tersedia untuk kasus ini.
            </p>
          ) : null}

          {options.map((option) => {
            const exam = examinationByOptionId.get(option.id);
            const isSelected = selectedExamIds.has(option.id);
            const isPendingResult = exam?.status === "pending";
            const isReady = exam?.status === "resulted";
            const isOrdering = orderingExamId === option.id && isPending && !exam;

            if (isOrdering) {
              return (
                <ExaminationListItem
                  key={option.id}
                  label={option.label}
                  category={formatCategory(option.category)}
                />
              );
            }

            if (!isSelected) {
              return (
                <button
                  key={option.id}
                  type="button"
                  className="flex w-full items-center justify-between gap-3 rounded-[1rem] border-2 border-foreground/10 bg-white px-3 py-3 text-left transition-colors hover:border-[#339af0]/40 hover:bg-[#f8fbff] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isPending || disabled}
                  onClick={() => handleSelectExamination(option.id)}
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-[#1a233e]">{option.label}</span>
                    <span className="mt-0.5 block text-[0.625rem] uppercase tracking-wide text-muted-foreground">
                      {formatCategory(option.category)}
                    </span>
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                </button>
              );
            }

            if (isPendingResult && exam) {
              return (
                <ExaminationListItem
                  key={option.id}
                  label={exam.label}
                  category={formatCategory(option.category)}
                />
              );
            }

            if (isReady && exam) {
              return (
                <button
                  key={option.id}
                  type="button"
                  className="flex w-full items-center justify-between gap-3 rounded-[1rem] border-2 border-[#82c91e]/50 bg-[#ebfbee] px-3 py-3 text-left transition-colors hover:border-[#51cf66] hover:bg-[#d3f9d8]"
                  onClick={() => setDetailExam(exam)}
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-[#1a233e]">{exam.label}</span>
                    <span className="mt-0.5 block text-[0.625rem] uppercase tracking-wide text-[#2b8a3e]">
                      Hasil siap — ketuk untuk lihat
                    </span>
                  </span>
                  <Badge variant="default" className="shrink-0">
                    Selesai
                  </Badge>
                </button>
              );
            }

            return null;
          })}
        </div>
      </SessionResponsivePanel>

      <SessionExaminationDetailPanel
        exam={detailExam}
        open={detailExam !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDetailExam(null);
          }
        }}
      />
    </>
  );
}

function ExaminationListItem({ label, category }: { label: string; category: string }) {
  return (
    <div className="flex w-full items-center justify-between gap-3 rounded-[1rem] border-2 border-foreground/10 bg-white px-3 py-3">
      <span className="min-w-0">
        <span className="block text-sm font-medium text-[#1a233e]">{label}</span>
        <span className="mt-0.5 block text-[0.625rem] uppercase tracking-wide text-muted-foreground">
          {category}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        Memproses
      </span>
    </div>
  );
}
