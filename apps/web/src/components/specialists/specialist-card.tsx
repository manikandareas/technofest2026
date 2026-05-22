import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { SPECIALISTS_ASSETS, resolveSpecialistIcon } from "./specialists-assets";

type SpecialistCardProps = {
  id: string;
  name: string;
  description: string;
  status: string;
  case_count?: number;
};

function PixelLockIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className={cn("size-5 shrink-0 pixelated", className)}
    >
      <rect x="5" y="2" width="6" height="2" fill="currentColor" />
      <rect x="4" y="4" width="2" height="3" fill="currentColor" />
      <rect x="10" y="4" width="2" height="3" fill="currentColor" />
      <rect x="2" y="7" width="12" height="7" fill="currentColor" />
      <rect x="7" y="9" width="2" height="2" fill="#000000" />
      <rect x="7" y="11" width="2" height="1" fill="#000000" />
    </svg>
  );
}

export function SpecialistCard({ id, name, description, status, case_count }: SpecialistCardProps) {
  const available = status === "available";
  const iconSrc = resolveSpecialistIcon(id);

  if (!available) {
    return (
      <div 
        className="relative p-0.5 filter grayscale opacity-55 cursor-not-allowed select-none" 
        aria-disabled="true"
      >
        <div className="relative border-y-4 border-muted-foreground bg-muted/20 text-muted-foreground">
          <div className="pointer-events-none absolute inset-y-0 -mx-1 border-x-4 border-muted-foreground" aria-hidden="true" />
          
          <div className="flex min-h-[5.25rem] items-center gap-3 px-3 py-3 sm:min-h-[5.75rem] sm:gap-4 sm:px-4 sm:py-3.5 lg:min-h-[6.5rem] lg:px-5 lg:py-4">
            <div className="relative size-14 shrink-0 overflow-hidden border-2 border-muted-foreground sm:size-16 lg:size-[4.5rem] bg-muted/10">
              <Image
                src={iconSrc}
                alt=""
                fill
                className="object-cover object-center pixelated opacity-30 grayscale"
                sizes="(max-width: 640px) 56px, (max-width: 1024px) 64px, 72px"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                <PixelLockIcon className="text-muted-foreground size-6 sm:size-7" />
              </div>
            </div>

            <div className="min-w-0 flex-1 space-y-1.5 pr-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <p className="retro text-[0.625rem] sm:text-xs lg:text-sm font-bold leading-none text-muted-foreground/80">
                  {name}
                </p>
                <span className="inline-flex items-center gap-1 border-y border-muted-foreground bg-muted/30 px-1.5 py-0.5 text-[0.5rem] sm:text-[0.5625rem] font-bold uppercase leading-none text-muted-foreground/80 retro relative">
                  <span className="pointer-events-none absolute inset-y-0 -mx-0.5 border-x border-muted-foreground" aria-hidden="true" />
                  TERKUNCI
                </span>
              </div>
              <p className="line-clamp-2 text-[0.6875rem] leading-snug text-muted-foreground/60 sm:text-xs lg:line-clamp-3 lg:text-sm lg:leading-relaxed">
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link
      href={`/app/specialists/${id}`}
      className="group block h-full outline-none"
    >
      <div className="relative h-full transition-all duration-150 transform hover:-translate-x-1 hover:-translate-y-1 active:translate-x-0 active:translate-y-0">
        <div className="absolute inset-0 bg-black/15 translate-x-1 translate-y-1 group-hover:translate-x-2 group-hover:translate-y-2 group-hover:bg-primary/5 transition-all duration-150 dark:bg-black/40" />
        
        <div className="relative h-full border-y-4 border-primary bg-card text-foreground group-hover:border-accent group-focus-visible:border-accent transition-colors duration-150">
          <div className="pointer-events-none absolute inset-y-0 -mx-1 border-x-4 border-primary group-hover:border-accent group-focus-visible:border-accent transition-colors duration-150" aria-hidden="true" />
          
          <div className="absolute top-1 left-1 size-1 bg-secondary group-hover:bg-accent transition-colors" />
          <div className="absolute top-1 right-1 size-1 bg-secondary group-hover:bg-accent transition-colors" />
          <div className="absolute bottom-1 left-1 size-1 bg-secondary group-hover:bg-accent transition-colors" />
          <div className="absolute bottom-1 right-1 size-1 bg-secondary group-hover:bg-accent transition-colors" />

          <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/0 to-accent/0 group-hover:from-accent/5 group-hover:via-accent/2 group-hover:to-accent/0 transition-all duration-200" />

          <div className="relative flex min-h-[5.25rem] items-center gap-3 px-3 py-3 sm:min-h-[5.75rem] sm:gap-4 sm:px-4 sm:py-3.5 lg:min-h-[6.5rem] lg:px-5 lg:py-4">
            <div className="relative size-14 shrink-0 overflow-hidden border-2 border-primary group-hover:border-accent sm:size-16 lg:size-[4.5rem] bg-secondary/10 transition-colors duration-150">
              <Image
                src={iconSrc}
                alt=""
                fill
                className="object-cover object-center pixelated scale-100 group-hover:scale-105 transition-transform duration-200"
                sizes="(max-width: 640px) 56px, (max-width: 1024px) 64px, 72px"
              />
            </div>

            <div className="min-w-0 flex-1 space-y-1.5 pr-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <p className="retro text-[0.625rem] sm:text-xs lg:text-sm font-bold leading-none text-foreground group-hover:text-accent transition-colors">
                  {name}
                </p>
                <span className="inline-flex items-center gap-1 border-y border-primary/50 bg-primary/10 px-1.5 py-0.5 text-[0.5rem] sm:text-[0.5625rem] font-bold uppercase leading-none text-primary retro relative">
                  <span className="pointer-events-none absolute inset-y-0 -mx-0.5 border-x border-primary/50" aria-hidden="true" />
                  {case_count ?? 3} KASUS
                </span>
              </div>
              <p className="line-clamp-2 text-[0.6875rem] leading-snug text-muted-foreground sm:text-xs lg:line-clamp-3 lg:text-sm lg:leading-relaxed">
                {description}
              </p>
            </div>

            <div className="relative size-5 sm:size-6 flex items-center justify-center shrink-0">
              <Image
                src={SPECIALISTS_ASSETS.iconChevronRight}
                alt=""
                width={20}
                height={24}
                className="size-4 object-contain pixelated opacity-80 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-150"
                aria-hidden
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
