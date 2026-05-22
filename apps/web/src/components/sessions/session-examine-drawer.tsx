"use client";

import Image from "next/image";
import { ChevronRight, ImageIcon, Loader2, Stethoscope } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/8bit/button";

import { SessionDrawerHeader } from "./session-drawer-header";
import { SessionResponsivePanel } from "./session-responsive-panel";
import { sessionToolbarIconButtonClass } from "./sessions-assets";

type ExaminationAsset = {
  type: "image";
  url: string;
  alt: string;
};

type ExaminationOption = {
  id: string;
  label: string;
  category: string;
  delay_seconds: number;
  asset?: ExaminationAsset | null;
};

type ExaminationEvent = {
  id: string;
  examination_id: string;
  label: string;
  status: string;
  result?: string | null;
  asset?: ExaminationAsset | null;
};

type ExamListState = "available" | "ordering" | "pending" | "resulted";

type SessionExamineDrawerProps = {
  options: ExaminationOption[];
  examinations: ExaminationEvent[];
  selectedExamIds: Set<string>;
  disabled: boolean;
  isPending: boolean;
  onSelectExamination: (examinationId: string) => void;
};

function ExaminationDetailContent({ exam }: { exam: ExaminationEvent }) {
  return (
    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 sm:px-4">
      {exam.asset?.type === "image" ? (
        <figure className="overflow-hidden rounded-[1rem] border-2 border-foreground/10 bg-[#101827]">
          <div className="relative min-h-[14rem] w-full sm:min-h-[18rem]">
            <Image
              src={exam.asset.url}
              alt={exam.asset.alt}
              fill
              className="object-contain object-center pixelated p-2"
              sizes="(min-width: 1024px) 36rem, 92vw"
              priority
            />
          </div>
          <figcaption className="flex items-start gap-2 border-t border-foreground/10 bg-white px-3 py-3 text-sm leading-6 text-[#1a233e]">
            <ImageIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
            {exam.asset.alt}
          </figcaption>
        </figure>
      ) : null}

      <div className="rounded-[1.25rem] border-2 border-foreground/10 bg-white p-4 text-sm leading-7 text-[#1a233e]">
        <p className="mb-2 font-semibold">Hasil pemeriksaan</p>
        {exam.result ? (
          <p className="whitespace-pre-wrap">{exam.result}</p>
        ) : (
          <p className="text-muted-foreground">Hasil pemeriksaan belum tersedia.</p>
        )}
      </div>
    </div>
  );
}

export function SessionExamineDrawer({
  options,
  examinations,
  selectedExamIds,
  disabled,
  isPending,
  onSelectExamination,
}: SessionExamineDrawerProps) {
  const [orderingExamId, setOrderingExamId] = useState<string | null>(null);
  const [detailExamId, setDetailExamId] = useState<string | null>(null);

  const examItems = useMemo(
    () =>
      options.map((option) => {
        const event = examinations.find((exam) => exam.examination_id === option.id) ?? null;
        let state: ExamListState = "available";

        if (orderingExamId === option.id && !event) {
          state = "ordering";
        } else if (event?.status === "resulted") {
          state = "resulted";
        } else if (event?.status === "pending") {
          state = "pending";
        } else if (selectedExamIds.has(option.id)) {
          state = "pending";
        }

        return { option, event, state };
      }),
    [examinations, options, orderingExamId, selectedExamIds],
  );

  const detailExam = useMemo(() => {
    if (!detailExamId) {
      return null;
    }
    return examinations.find((exam) => exam.examination_id === detailExamId) ?? null;
  }, [detailExamId, examinations]);

  useEffect(() => {
    if (!orderingExamId) {
      return;
    }
    if (selectedExamIds.has(orderingExamId)) {
      setOrderingExamId(null);
      return;
    }
    if (!isPending) {
      setOrderingExamId(null);
    }
  }, [isPending, orderingExamId, selectedExamIds]);

  function handleExamClick(optionId: string, state: ExamListState) {
    if (state === "available") {
      setOrderingExamId(optionId);
      onSelectExamination(optionId);
      return;
    }
    if (state === "resulted") {
      setDetailExamId(optionId);
    }
  }

  const trigger = (
    <Button
      type="button"
      size="sm"
      variant="secondary"
      font="retro"
      className={sessionToolbarIconButtonClass}
      aria-label="Buka pemeriksaan"
    >
      <Stethoscope aria-hidden />
      <span className="text-[0.5625rem] leading-tight sm:text-[0.6875rem]">Examine</span>
    </Button>
  );

  return (
    <>
      <SessionResponsivePanel title="Examine" trigger={trigger}>
        <SessionDrawerHeader icon={<Stethoscope className="size-4" aria-hidden />} title="Examine" />

        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 sm:px-4">
          <div className="grid gap-2">
            {examItems.map(({ option, state }) => {
              const isLoading = state === "ordering" || state === "pending";
              const isDisabled =
                state === "resulted"
                  ? false
                  : state === "available"
                    ? disabled || isPending
                    : true;

              return (
                <Button
                  key={option.id}
                  type="button"
                  variant="secondary"
                  font="retro"
                  className="h-auto min-h-11 justify-between whitespace-normal text-left"
                  disabled={isDisabled}
                  onClick={() => handleExamClick(option.id, state)}
                >
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span>{option.label}</span>
                    <span className="text-[0.625rem] uppercase tracking-normal text-muted-foreground">
                      {option.category.replaceAll("_", " ")}
                    </span>
                  </span>

                  <span className="flex shrink-0 items-center gap-1.5">
                    {isLoading ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin" aria-hidden />
                        <span className="text-xs">Memproses...</span>
                      </>
                    ) : state === "resulted" ? (
                      <>
                        <Badge variant="default">Selesai</Badge>
                        <ChevronRight className="size-4" aria-hidden />
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground">Pilih</span>
                    )}
                  </span>
                </Button>
              );
            })}
          </div>
        </div>
      </SessionResponsivePanel>

      <SessionResponsivePanel
        hideTrigger
        size="detail"
        open={detailExamId !== null && detailExam !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDetailExamId(null);
          }
        }}
        title={detailExam?.label ?? "Detail pemeriksaan"}
      >
        {detailExam ? (
          <>
            <SessionDrawerHeader
              icon={<Stethoscope className="size-4" aria-hidden />}
              title={detailExam.label}
            />
            <ExaminationDetailContent exam={detailExam} />
          </>
        ) : null}
      </SessionResponsivePanel>
    </>
  );
}
