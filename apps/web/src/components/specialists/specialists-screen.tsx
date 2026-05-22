import Image from "next/image";
import { HOME_ASSETS } from "@/components/home/home-assets";
import { SpecialistCard } from "./specialist-card";
import {
  SpecialistsScreenLayout,
  specialistsContentPanelClass,
} from "./specialists-screen-layout";

export type SpecialistListItem = {
  id: string;
  name: string;
  description: string;
  status: string;
  case_count?: number;
};

type SpecialistsScreenProps = {
  specialists: SpecialistListItem[];
};

export function SpecialistsScreen({ specialists }: SpecialistsScreenProps) {
  const availableCount = specialists.filter((item) => item.status === "available").length;

  return (
    <SpecialistsScreenLayout
      backHref="/app/home"
      backLabel="Kembali ke home"
      title="CHOOSE SPECIALIST"
    >
      <section className={`${specialistsContentPanelClass} space-y-4 sm:space-y-5 md:space-y-6 pb-6`}>
        {/* Dr. Pixel Dialogue Box */}
        <div className="relative border-2 border-primary bg-card/95 p-3 sm:p-4 flex gap-3 sm:gap-4 items-start shadow-[4px_4px_0_rgba(0,0,0,0.15)] dark:shadow-[4px_4px_0_rgba(0,0,0,0.4)]">
          <div className="pointer-events-none absolute inset-0.5 border border-primary/10" aria-hidden="true" />
          
          <div className="relative size-12 sm:size-14 shrink-0 border-2 border-primary bg-secondary/15 overflow-hidden shadow-[2px_2px_0_rgba(0,0,0,0.1)] dark:shadow-[2px_2px_0_rgba(0,0,0,0.5)]">
            <Image
              src={HOME_ASSETS.doctorCharacter}
              alt="Dr. Pixel"
              fill
              className="object-cover object-[top_center] scale-125 translate-y-1 pixelated"
            />
          </div>
          
          <div className="flex-1 space-y-1 text-left min-w-0">
            <p className="retro text-[0.625rem] sm:text-[0.6875rem] font-bold text-accent tracking-wider">
              Dr. Pixel
            </p>
            <p className="text-xs sm:text-sm leading-relaxed text-foreground font-medium">
              Pilih bidang spesialisasi untuk mulai menangani pasien dan menyelesaikan kasus medis hari ini.
            </p>
          </div>
          
          <div className="absolute bottom-2 right-2 animate-bounce">
            <span className="block border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-6 border-t-accent size-0" />
          </div>
        </div>

        {/* Operational Status HUD */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-card border-2 border-primary p-3 sm:p-4 shadow-[4px_4px_0_rgba(0,0,0,0.15)] dark:shadow-[4px_4px_0_rgba(0,0,0,0.3)]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="size-2 bg-primary animate-pulse border border-foreground/30 shadow-[1px_1px_0_rgba(0,0,0,0.15)]" />
              <p className="retro text-[0.5625rem] sm:text-[0.625rem] font-bold uppercase text-primary tracking-wider">
                SISTEM OPERASIONAL
              </p>
            </div>
            <p className="text-[0.6875rem] sm:text-xs text-muted-foreground font-medium leading-normal">
              Semua sistem diagnostik online. Silakan pilih departemen spesialis untuk memulai simulasi.
            </p>
          </div>
          
          <div className="space-y-1.5 w-full">
            <div className="flex justify-between items-end text-[0.5625rem] sm:text-[0.625rem] font-bold uppercase tracking-wider retro">
              <span className="text-muted-foreground">Departemen Siap</span>
              <span className="text-accent">{availableCount} / {specialists.length} SIAP</span>
            </div>
            
            <div className="relative h-4 border-2 border-primary bg-secondary/20 p-0.5">
              <div 
                className="h-full bg-primary transition-all duration-700 relative" 
                style={{ width: `${(availableCount / specialists.length) * 100}%` }}
              >
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:12px_100%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Specialists Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-5 content-start">
          {specialists.map((specialist) => (
            <SpecialistCard
              key={specialist.id}
              id={specialist.id}
              name={specialist.name}
              description={specialist.description}
              status={specialist.status}
              case_count={specialist.case_count}
            />
          ))}
        </div>
      </section>
    </SpecialistsScreenLayout>
  );
}
