"use client";

import Image from "next/image";
import * as React from "react";

import { Button } from "@/components/ui/8bit/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/8bit/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/8bit/drawer";
import { cn } from "@/lib/utils";

import { HOME_ASSETS } from "./home-assets";

const wardrobeItems = [
  {
    name: "Classic",
    label: "Dipakai",
    swatch: "bg-[#5de44a]",
    active: true,
  },
  {
    name: "Night Shift",
    label: "Terkunci",
    swatch: "bg-[#4f72ff]",
    active: false,
  },
  {
    name: "Surgeon",
    label: "Terkunci",
    swatch: "bg-[#ffde59]",
    active: false,
  },
  {
    name: "Resident",
    label: "Terkunci",
    swatch: "bg-[#ff7a90]",
    active: false,
  },
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

function WardrobePanelContent({
  closeSlot,
  surface,
}: {
  closeSlot: React.ReactNode;
  surface: "dialog" | "drawer";
}) {
  const title =
    surface === "dialog" ? (
      <DialogTitle className="text-left text-base leading-6 text-white sm:text-lg">
        Wardrobe
      </DialogTitle>
    ) : (
      <DrawerTitle className="text-left text-base leading-6 text-white sm:text-lg">
        Wardrobe
      </DrawerTitle>
    );
  const description =
    surface === "dialog" ? (
      <DialogDescription className="mt-2 max-w-[18rem] text-left text-xs leading-5 text-[#cfe4ff] sm:text-sm">
        Pilih tampilan dokter untuk sesi simulasi PixelAid.
      </DialogDescription>
    ) : (
      <DrawerDescription className="mt-2 max-w-[18rem] text-left text-xs leading-5 text-[#cfe4ff] sm:text-sm">
        Pilih tampilan dokter untuk sesi simulasi PixelAid.
      </DrawerDescription>
    );

  return (
    <div className="relative overflow-hidden bg-[#0b2761] text-white">
      <div className="absolute inset-x-0 top-0 h-1 bg-[#6ca8ff]" aria-hidden />
      <div className="absolute inset-x-5 top-5 h-2 bg-white/10" aria-hidden />

      <div className="relative px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-5 sm:px-6 lg:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            {title}
            {description}
          </div>
          {closeSlot}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-[0.86fr_1fr] lg:gap-6">
          <div className="relative min-h-[14rem] overflow-hidden border-4 border-[#041432] bg-[#153b7c] shadow-[0_6px_0_#041432] sm:min-h-[16rem]">
            <div className="absolute inset-x-8 bottom-6 h-5 rounded-[50%] bg-[#071839]/45 blur-[2px]" />
            <Image
              src={HOME_ASSETS.doctorCharacter}
              alt="Dokter PixelAid"
              width={208}
              height={408}
              className="absolute bottom-4 left-1/2 h-[82%] w-auto -translate-x-1/2 object-contain pixelated"
            />
            <div className="absolute left-3 top-3 border-2 border-[#041432] bg-[#ffde59] px-2 py-1 text-[10px] font-black uppercase text-[#402100]">
              Lv. 1
            </div>
          </div>

          <div className="grid content-start gap-3">
            {wardrobeItems.map((item) => (
              <button
                key={item.name}
                type="button"
                disabled={!item.active}
                className={cn(
                  "grid min-h-16 grid-cols-[2.75rem_1fr_auto] items-center gap-3 border-4 border-[#041432] bg-[#eef3ff] px-3 py-2 text-left text-[#071839] shadow-[0_4px_0_#041432] outline-none transition-transform focus-visible:ring-2 focus-visible:ring-white/80",
                  item.active
                    ? "active:translate-y-1 active:shadow-none"
                    : "cursor-not-allowed opacity-70",
                )}
              >
                <span
                  className={cn(
                    "size-10 border-4 border-[#041432] shadow-[inset_0_4px_0_rgba(255,255,255,0.38)]",
                    item.swatch,
                  )}
                  aria-hidden
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-black">{item.name}</span>
                  <span className="block text-[11px] font-bold uppercase text-[#38618f]">
                    Doctor outfit
                  </span>
                </span>
                <span
                  className={cn(
                    "whitespace-nowrap border-2 border-[#041432] px-2 py-1 text-[10px] font-black uppercase",
                    item.active ? "bg-[#5de44a] text-[#063817]" : "bg-[#d7e1f5] text-[#5a6680]",
                  )}
                >
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <Button
            type="button"
            font="retro"
            className="h-11 w-full bg-[#5de44a] text-xs text-white hover:bg-[#4cd43b] sm:h-12 sm:text-sm"
          >
            Gunakan Outfit
          </Button>
        </div>
      </div>
    </div>
  );
}

export function HomeWardrobePanel() {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useIsDesktop();

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <WardrobeIconButton />
        </DialogTrigger>
        <DialogContent className="w-[min(92vw,48rem)] overflow-hidden border-[#041432] bg-[#0b2761] p-0 text-white">
          <WardrobePanelContent
            surface="dialog"
            closeSlot={
              <DialogClose asChild>
                <button
                  type="button"
                  className="grid size-9 shrink-0 place-items-center border-4 border-[#041432] bg-[#ffde59] text-lg font-black leading-none text-[#402100] shadow-[0_3px_0_#041432] outline-none transition-transform active:translate-y-1 focus-visible:ring-2 focus-visible:ring-white/80"
                  aria-label="Tutup wardrobe"
                >
                  x
                </button>
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
      <DrawerContent className="max-h-[88dvh] overflow-hidden border-[#041432] bg-[#0b2761] p-0 text-white">
        <WardrobePanelContent
          surface="drawer"
          closeSlot={
            <DrawerClose asChild>
              <button
                type="button"
                className="grid size-9 shrink-0 place-items-center border-4 border-[#041432] bg-[#ffde59] text-lg font-black leading-none text-[#402100] shadow-[0_3px_0_#041432] outline-none transition-transform active:translate-y-1 focus-visible:ring-2 focus-visible:ring-white/80"
                aria-label="Tutup wardrobe"
              >
                x
              </button>
            </DrawerClose>
          }
        />
      </DrawerContent>
    </Drawer>
  );
}
