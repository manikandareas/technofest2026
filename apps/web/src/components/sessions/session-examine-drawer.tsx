"use client";

import { Stethoscope } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/8bit/button";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";

import { SessionDrawerHeader } from "./session-drawer-header";
import { sessionToolbarIconButtonClass } from "./sessions-assets";

type ExaminationOption = {
  id: string;
  label: string;
  delay_seconds: number;
};

type ExaminationEvent = {
  id: string;
  label: string;
  status: string;
  result?: string | null;
};

type SessionExamineDrawerProps = {
  options: ExaminationOption[];
  examinations: ExaminationEvent[];
  selectedExamIds: Set<string>;
  disabled: boolean;
  isPending: boolean;
  onSelectExamination: (examinationId: string) => void;
};

export function SessionExamineDrawer({
  options,
  examinations,
  selectedExamIds,
  disabled,
  isPending,
  onSelectExamination,
}: SessionExamineDrawerProps) {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          font="retro"
          className={sessionToolbarIconButtonClass}
          aria-label="Buka pemeriksaan"
        >
          <Stethoscope className="size-5 sm:size-6" aria-hidden />
          <span className="text-[0.625rem] leading-none sm:text-[0.6875rem]">Examine</span>
        </Button>
      </DrawerTrigger>

      <DrawerContent className="max-h-[88dvh] border-foreground bg-[#eef3ff] px-0 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <SessionDrawerHeader
          icon={<Stethoscope className="size-4" aria-hidden />}
          title="Examine"
        />

        <div className="space-y-3 px-3 pb-3 pt-3 sm:px-4">
          <div className="grid gap-2">
            {options.map((exam) => (
              <Button
                key={exam.id}
                type="button"
                variant="secondary"
                font="retro"
                className="h-auto min-h-10 justify-between whitespace-normal text-left"
                disabled={isPending || disabled || selectedExamIds.has(exam.id)}
                onClick={() => onSelectExamination(exam.id)}
              >
                <span>{exam.label}</span>
                <span className="font-mono text-xs">{exam.delay_seconds}s</span>
              </Button>
            ))}
          </div>

          <div className="space-y-2">
            {examinations.map((exam) => (
              <div
                key={exam.id}
                className="rounded-[1rem] border-2 border-foreground/10 bg-white p-3 text-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{exam.label}</p>
                  <Badge variant={exam.status === "resulted" ? "default" : "secondary"}>
                    {exam.status}
                  </Badge>
                </div>
                {exam.result ? (
                  <p className="mt-2 leading-6 text-muted-foreground">{exam.result}</p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
