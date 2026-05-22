"use client";

import Image from "next/image";
import { Clock3, ImageIcon, Stethoscope } from "lucide-react";

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
  category: string;
  delay_seconds: number;
};

type ExaminationAsset = {
  type: "image";
  url: string;
  alt: string;
};

type ExaminationEvent = {
  id: string;
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

export function SessionExamineDrawer({
  options,
  examinations,
  selectedExamIds,
  disabled,
  isPending,
  onSelectExamination,
}: SessionExamineDrawerProps) {
  const statusLabel = (status: string) => (status === "resulted" ? "Selesai" : "Diproses");

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
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span>{exam.label}</span>
                  <span className="text-[0.625rem] uppercase tracking-normal text-muted-foreground">
                    {exam.category.replaceAll("_", " ")}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-1 font-mono text-xs">
                  <Clock3 className="size-3" aria-hidden />
                  {exam.delay_seconds}s
                </span>
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
                    {statusLabel(exam.status)}
                  </Badge>
                </div>
                {exam.asset?.type === "image" ? (
                  <figure className="mt-3 overflow-hidden rounded-lg border border-foreground/10 bg-[#101827]">
                    <div className="relative aspect-[4/3] w-full">
                      <Image
                        src={exam.asset.url}
                        alt={exam.asset.alt}
                        fill
                        className="object-cover pixelated"
                        sizes="(min-width: 640px) 28rem, 92vw"
                      />
                    </div>
                    <figcaption className="flex items-start gap-2 bg-white px-3 py-2 text-xs leading-5 text-muted-foreground">
                      <ImageIcon className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                      {exam.asset.alt}
                    </figcaption>
                  </figure>
                ) : null}
                {exam.result ? (
                  <p className="mt-2 leading-6 text-muted-foreground">{exam.result}</p>
                ) : (
                  <p className="mt-2 leading-6 text-muted-foreground">
                    Hasil pemeriksaan sedang diproses.
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
