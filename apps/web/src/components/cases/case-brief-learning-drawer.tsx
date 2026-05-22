"use client";

import Image from "next/image";

import { Button } from "@/components/ui/8bit/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

import { CASES_ASSETS } from "./cases-assets";

const headerIconButtonClass =
  "size-9 shrink-0 border-transparent bg-[rgba(0,24,61,0.46)] text-white drop-shadow-[1px_1px_0_#000] hover:bg-[rgba(0,24,61,0.62)] sm:size-10 md:size-11 lg:size-12";

type CaseBriefLearningDrawerProps = {
  objectives: string[];
};

export function CaseBriefLearningDrawer({
  objectives,
}: CaseBriefLearningDrawerProps) {
  if (objectives.length === 0) {
    return <span aria-hidden className="size-10 sm:size-11 lg:size-12" />;
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          type="button"
          size="icon"
          variant="secondary"
          font="retro"
          className={headerIconButtonClass}
          aria-label="Buka tujuan pembelajaran"
        >
          <Image
            src={CASES_ASSETS.iconLearning}
            alt=""
            width={24}
            height={24}
            className="size-5 object-contain pixelated sm:size-6"
            aria-hidden
          />
        </Button>
      </DrawerTrigger>

      <DrawerContent className="border-foreground bg-card px-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <DrawerHeader className="px-0 text-left">
          <DrawerTitle className="retro text-base sm:text-lg">
            Tujuan Pembelajaran
          </DrawerTitle>
          <DrawerDescription className="text-xs sm:text-sm">
            Fokus latihan untuk kasus ini sebelum memulai konsultasi.
          </DrawerDescription>
        </DrawerHeader>

        <ul className="space-y-3 px-0 pb-2 text-sm leading-relaxed text-card-foreground/85">
          {objectives.map((objective) => (
            <li
              key={objective}
              className="rounded-xl border border-foreground/15 bg-background/70 px-3 py-2.5"
            >
              {objective}
            </li>
          ))}
        </ul>

        <DrawerFooter className="px-0">
          <DrawerClose asChild>
            <Button font="retro" variant="secondary" className="w-full">
              Tutup
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
