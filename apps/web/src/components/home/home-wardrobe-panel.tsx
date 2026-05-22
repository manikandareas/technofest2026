"use client";

import Image from "next/image";
import * as React from "react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/8bit/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/8bit/drawer";
import { cn } from "@/lib/utils";

import { HOME_ASSETS, WARDROBE_ASSETS } from "./home-assets";

const wardrobeItems = [
  { id: "classic", unlockLevel: 1, locked: false },
  { id: "teal-scrubs", unlockLevel: 1, locked: false },
  { id: "navy-scrubs", unlockLevel: 1, locked: false },
  { id: "green-coat", unlockLevel: 1, locked: false },
  { id: "maroon-scrubs", unlockLevel: 1, locked: false },
  { id: "black-scrubs", unlockLevel: 1, locked: false },
  { id: "locked-15", unlockLevel: 15, locked: true },
  { id: "locked-20", unlockLevel: 20, locked: true },
] as const;

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = React.useState(false);

  React.useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(media.matches);

    update();
    media.addEventListener("change", update);

    return () => media.removeEventListener("change", update);
  }, []);

  return isDesktop;
}

const WardrobeIconButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<"button">
>(function WardrobeIconButton({ className, ...props }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "absolute right-[4.5%] top-[25%] z-10 size-[3.25rem] overflow-hidden rounded-[17px] outline-none transition-transform active:translate-y-1 focus-visible:ring-2 focus-visible:ring-white/70 md:right-[6%] md:top-[22%] md:size-14 lg:right-[8%]",
        className,
      )}
      aria-label="Buka wardrobe"
      {...props}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={HOME_ASSETS.iconWardrobe}
        alt=""
        className="absolute max-w-none pixelated"
        style={{
          width: "147.34%",
          height: "147.34%",
          left: "-23.53%",
          top: "-23.81%",
        }}
      />
    </button>
  );
});

function WardrobeCloseButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="grid size-8 shrink-0 place-items-center text-xl font-black leading-none text-white/90 outline-none transition-opacity hover:text-white focus-visible:ring-2 focus-visible:ring-white/70"
      aria-label={label}
    >
      ×
    </button>
  );
}

function WardrobeOutfitGrid({
  selectedIndex,
  onSelect,
}: {
  selectedIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-2 px-3 sm:gap-2.5 sm:px-4">
      {wardrobeItems.map((item, index) => {
        const isSelected = !item.locked && selectedIndex === index;

        return (
          <button
            key={item.id}
            type="button"
            disabled={item.locked}
            onClick={() => onSelect(index)}
            aria-label={
              item.locked
                ? `Outfit terkunci, butuh level ${item.unlockLevel}`
                : `Pilih outfit ${index + 1}`
            }
            aria-pressed={isSelected}
            className={cn(
              "relative aspect-square overflow-hidden rounded-[0.85rem] border-2 bg-[#17366f] outline-none transition-transform",
              item.locked
                ? "cursor-not-allowed border-[#355f98]/70 opacity-95"
                : "border-[#4f7eb8] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-white/70",
              isSelected && "border-[#5de44a] shadow-[0_0_0_1px_#5de44a]",
            )}
          >
            <Image
              src={WARDROBE_ASSETS.outfits[index]}
              alt=""
              fill
              className="object-cover object-center pixelated"
              sizes="88px"
            />
            {isSelected ? (
              <span className="pointer-events-none absolute bottom-1 right-1 size-5 sm:size-6">
                <Image
                  src={WARDROBE_ASSETS.iconCheckSelected}
                  alt=""
                  fill
                  className="object-contain pixelated"
                  sizes="24px"
                />
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

function WardrobeFooter({
  onConfirm,
}: {
  onConfirm: () => void;
}) {
  return (
    <div className="relative mt-3 h-[3.35rem] px-3 sm:mt-4 sm:h-[3.6rem] sm:px-4">
      <Image
        src={WARDROBE_ASSETS.footerRow}
        alt=""
        fill
        className="object-fill pixelated"
        sizes="393px"
      />
      <button
        type="button"
        onClick={onConfirm}
        className="absolute inset-y-2 right-4 w-[4.6rem] outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:right-5 sm:w-[5rem]"
        aria-label="Terapkan gaya"
      >
        <span className="sr-only">Go</span>
      </button>
    </div>
  );
}

function WardrobePanelBody({
  closeSlot,
  selectedIndex,
  onSelect,
  onConfirm,
  titleId,
}: {
  closeSlot: React.ReactNode;
  selectedIndex: number;
  onSelect: (index: number) => void;
  onConfirm: () => void;
  titleId: string;
}) {
  return (
    <div className="overflow-hidden rounded-t-[1.35rem] border-2 border-[#f4c44f] bg-[#0f2557] text-white lg:rounded-[1.35rem]">
      <div className="relative flex items-center justify-between px-4 pb-1 pt-3 sm:px-5 sm:pt-4">
        <div className="size-8 shrink-0" aria-hidden />
        <h2 id={titleId} className="retro text-base tracking-[0.18em] text-white sm:text-lg">
          STYLE
        </h2>
        {closeSlot}
      </div>

      <div className="pb-[calc(0.35rem+env(safe-area-inset-bottom))] pt-1">
        <WardrobeOutfitGrid selectedIndex={selectedIndex} onSelect={onSelect} />
        <WardrobeFooter onConfirm={onConfirm} />
      </div>
    </div>
  );
}

export function HomeWardrobePanel() {
  const [open, setOpen] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const isDesktop = useIsDesktop();
  const titleId = React.useId();

  const handleConfirm = React.useCallback(() => {
    setOpen(false);
  }, []);

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <WardrobeIconButton />
        </DialogTrigger>
        <DialogContent className="w-[min(92vw,24.5625rem)] overflow-hidden border-transparent bg-transparent p-0 shadow-none">
          <DialogTitle className="sr-only">STYLE</DialogTitle>
          <WardrobePanelBody
            titleId={titleId}
            selectedIndex={selectedIndex}
            onSelect={setSelectedIndex}
            onConfirm={handleConfirm}
            closeSlot={
              <DialogClose asChild>
                <WardrobeCloseButton label="Tutup wardrobe" />
              </DialogClose>
            }
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <WardrobeIconButton />
      </DrawerTrigger>
      <DrawerContent className="max-h-none overflow-hidden border-transparent bg-transparent p-0 shadow-none [&>div:nth-child(2)]:hidden">
        <DrawerTitle className="sr-only">STYLE</DrawerTitle>
        <WardrobePanelBody
          titleId={titleId}
          selectedIndex={selectedIndex}
          onSelect={setSelectedIndex}
          onConfirm={handleConfirm}
          closeSlot={
            <DrawerClose asChild>
              <WardrobeCloseButton label="Tutup wardrobe" />
            </DrawerClose>
          }
        />
      </DrawerContent>
    </Drawer>
  );
}
