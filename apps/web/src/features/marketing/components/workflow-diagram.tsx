import Image from "next/image";

import { MARKETING_ASSETS } from "@/features/marketing/marketing-assets";

export function WorkflowDiagram() {
  return (
    <div className="relative min-h-[17rem] overflow-hidden rounded-2xl border border-border bg-muted sm:min-h-[19.75rem]">
      <div className="absolute inset-0">
        <Image
          src={MARKETING_ASSETS.sceneBgMobile}
          alt=""
          fill
          className="object-cover object-center pixelated opacity-70"
          sizes="(max-width: 768px) 100vw, 560px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-muted via-muted/70 to-muted/30" />
      </div>

      <div className="relative flex h-full min-h-[17rem] flex-col justify-end gap-4 p-5 sm:min-h-[19.75rem] sm:p-6">
        <div className="flex items-end justify-between gap-3">
          <div className="relative h-28 w-24 shrink-0 sm:h-32 sm:w-28">
            <Image
              src={MARKETING_ASSETS.demoConsultationAvatar}
              alt="Pasien simulasi"
              fill
              className="object-contain object-bottom pixelated"
              sizes="112px"
            />
          </div>
          <div className="relative h-32 w-28 shrink-0 sm:h-36 sm:w-32">
            <Image
              src={MARKETING_ASSETS.doctorCharacter}
              alt="Dokter virtual PixelAid"
              fill
              className="object-contain object-bottom pixelated"
              sizes="128px"
            />
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          <div className="rounded-full border border-border/80 bg-card/90 px-3 py-2 text-center text-[11px] font-medium text-muted-foreground backdrop-blur-sm sm:text-xs">
            Baca modul saja
          </div>
          <div className="rounded-full border border-border/80 bg-card/90 px-3 py-2 text-center text-[11px] font-medium text-muted-foreground backdrop-blur-sm sm:text-xs">
            Soal tulis statis
          </div>
          <div className="rounded-full border border-primary/30 bg-primary/10 px-3 py-2 text-center text-[11px] font-semibold text-foreground backdrop-blur-sm sm:text-xs">
            PixelAid — ngobrol & periksa pasien
          </div>
        </div>
      </div>
    </div>
  );
}
