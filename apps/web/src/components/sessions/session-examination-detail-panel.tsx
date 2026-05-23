"use client";

import Image from "next/image";
import { FileSearch, ImageIcon, X } from "lucide-react";

import { Button } from "@/components/ui/8bit/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/8bit/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
} from "@/components/ui/8bit/drawer";
import { useIsDesktop } from "@/lib/use-is-desktop";

import { SessionDrawerHeader } from "./session-drawer-header";
import type { ExaminationEvent } from "./session-examine-drawer";

type SessionExaminationDetailPanelProps = {
  exam: ExaminationEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function PanelCloseButton() {
  return (
    <Button
      type="button"
      size="icon"
      variant="secondary"
      font="retro"
      className="size-9 shrink-0 border-transparent bg-[#fa5252] text-white hover:bg-[#e03131]"
      aria-label="Tutup detail pemeriksaan"
    >
      <X className="size-4" aria-hidden />
    </Button>
  );
}

export function ExaminationDetailContent({ exam }: { exam: ExaminationEvent }) {
  return (
    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto">
      <div className="rounded-[1rem] border-2 border-foreground/10 bg-white p-4 sm:p-5">
        <p className="text-base font-semibold text-[#1a233e] sm:text-lg">{exam.label}</p>
        {exam.result ? (
          <p className="mt-3 text-sm leading-7 text-[#1a233e] sm:text-base sm:leading-8">
            {exam.result}
          </p>
        ) : (
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Hasil pemeriksaan belum tersedia.
          </p>
        )}
      </div>

      {exam.asset?.type === "image" ? (
        <figure className="overflow-hidden rounded-[1rem] border-2 border-foreground/10 bg-[#101827]">
          <div className="relative aspect-[4/3] w-full bg-black">
            <Image
              src={exam.asset.url}
              alt={exam.asset.alt}
              fill
              className="object-contain pixelated"
              sizes="(min-width: 1024px) 36rem, 100vw"
              priority
            />
          </div>
          <figcaption className="flex items-start gap-2 bg-white px-4 py-3 text-sm leading-6 text-[#1a233e]">
            <ImageIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
            {exam.asset.alt}
          </figcaption>
        </figure>
      ) : null}
    </div>
  );
}

export function SessionExaminationDetailPanel({
  exam,
  open,
  onOpenChange,
}: SessionExaminationDetailPanelProps) {
  const isDesktop = useIsDesktop();

  if (!exam) {
    return null;
  }

  const header = (
    <SessionDrawerHeader
      icon={<FileSearch className="size-4" aria-hidden />}
      title={exam.label}
      closeSlot={
        isDesktop ? (
          <DialogClose asChild>
            <PanelCloseButton />
          </DialogClose>
        ) : (
          <DrawerClose asChild>
            <PanelCloseButton />
          </DrawerClose>
        )
      }
    />
  );

  const body = (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-3 pb-3 pt-3 sm:px-4">
      <ExaminationDetailContent exam={exam} />
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex max-h-[min(90dvh,44rem)] w-[min(94vw,40rem)] flex-col overflow-hidden border-foreground bg-[#eef3ff] p-0">
          <DialogTitle className="sr-only">{exam.label}</DialogTitle>
          {header}
          {body}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="flex h-[100dvh] max-h-[100dvh] flex-col border-foreground bg-[#eef3ff] px-0 pb-[calc(0.75rem+env(safe-area-inset-bottom))] [&>div:nth-child(2)]:hidden">
        <DrawerTitle className="sr-only">{exam.label}</DrawerTitle>
        {header}
        {body}
      </DrawerContent>
    </Drawer>
  );
}
