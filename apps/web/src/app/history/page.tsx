import Image from "next/image";
import Link from "next/link";

import { HOME_ASSETS } from "@/components/home/home-assets";
import {
  SpecialistsScreenLayout,
  specialistsContentPanelClass,
} from "@/components/specialists/specialists-screen-layout";
import { SPECIALISTS_ASSETS } from "@/components/specialists/specialists-assets";
import { getApiClient } from "@/lib/api/server";

export const dynamic = "force-dynamic";

type HistoryItem = {
  result_id: string;
  session_id: string;
  patient_name: string;
  condition_badge: string;
  score: number;
  stars: number;
  created_at: string;
  attempt_number: number;
  best_score: number;
};

function formatHistoryDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Waktu tidak tersedia";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function ScoreBadge({ score, stars }: { score: number; stars: number }) {
  const filledStars = Math.max(0, Math.min(stars, 3));
  const starString = "★".repeat(filledStars) + "☆".repeat(3 - filledStars);

  return (
    <div className="relative size-14 shrink-0 border-2 border-primary bg-secondary/15 text-primary group-hover:border-accent group-hover:text-accent sm:size-16 lg:size-[4.5rem] flex flex-col items-center justify-center transition-colors duration-150">
      <div className="pointer-events-none absolute inset-0.5 border border-primary/10 group-hover:border-accent/10" aria-hidden="true" />
      <span className="retro text-[0.5rem] uppercase leading-none tracking-wider text-muted-foreground group-hover:text-accent/80 mb-0.5 sm:mb-1 transition-colors">
        SCORE
      </span>
      <span className="retro text-base sm:text-lg lg:text-xl font-bold leading-none tracking-tighter">
        {score}
      </span>
      <span className="retro text-[0.5rem] sm:text-[0.5625rem] leading-none text-accent tracking-wider mt-0.5 sm:mt-1">
        {starString}
      </span>
    </div>
  );
}

function HistoryCard({ item }: { item: HistoryItem }) {
  return (
    <Link
      href={`/app/sessions/${item.session_id}/result?result=${item.result_id}`}
      className="group block h-full outline-none"
    >
      <div className="relative h-full transition-all duration-150 transform hover:-translate-x-1 hover:-translate-y-1 active:translate-x-0 active:translate-y-0">
        <div className="absolute inset-0 bg-black/15 translate-x-1 translate-y-1 group-hover:translate-x-2 group-hover:translate-y-2 group-hover:bg-primary/5 transition-all duration-150 dark:bg-black/40" />
        
        <div className="relative h-full border-y-4 border-primary bg-card text-foreground group-hover:border-accent group-focus-visible:border-accent transition-colors duration-150">
          <div className="pointer-events-none absolute inset-y-0 -mx-1 border-x-4 border-primary group-hover:border-accent group-focus-visible:border-accent transition-colors duration-150" aria-hidden="true" />
          
          <div className="absolute top-1 left-1 size-1 bg-secondary group-hover:bg-accent transition-colors" aria-hidden="true" />
          <div className="absolute top-1 right-1 size-1 bg-secondary group-hover:bg-accent transition-colors" aria-hidden="true" />
          <div className="absolute bottom-1 left-1 size-1 bg-secondary group-hover:bg-accent transition-colors" aria-hidden="true" />
          <div className="absolute bottom-1 right-1 size-1 bg-secondary group-hover:bg-accent transition-colors" aria-hidden="true" />

          <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/0 to-accent/0 group-hover:from-accent/5 group-hover:via-accent/2 group-hover:to-accent/0 transition-all duration-200" />

          <div className="relative flex min-h-[6.25rem] items-center gap-3 px-3 py-3 sm:min-h-[6.75rem] sm:gap-4 sm:px-4 sm:py-3.5 lg:min-h-[7.5rem] lg:px-5 lg:py-4">
            <ScoreBadge score={item.score} stars={item.stars} />

            <div className="min-w-0 flex-1 space-y-1.5 pr-1 sm:pr-2 lg:space-y-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <p className="retro text-[0.625rem] sm:text-xs lg:text-sm font-bold leading-none text-foreground group-hover:text-accent transition-colors">
                  {item.patient_name}
                </p>
                <span className="inline-flex items-center gap-1 border-y border-primary/50 bg-primary/10 px-1.5 py-0.5 text-[0.5rem] sm:text-[0.5625rem] font-bold uppercase leading-none text-primary retro relative">
                  <span className="pointer-events-none absolute inset-y-0 -mx-0.5 border-x border-primary/50" aria-hidden="true" />
                  BEST {item.best_score}
                </span>
              </div>
              <p className="text-[0.6875rem] font-semibold text-muted-foreground leading-none sm:text-xs lg:text-sm">
                {item.condition_badge}
              </p>
              
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-0.5">
                <span className="inline-flex items-center gap-1 border-y border-sky-500/50 bg-sky-500/10 px-1.5 py-0.5 text-[0.5rem] sm:text-[0.5625rem] font-bold uppercase leading-none text-sky-600 dark:text-sky-400 retro relative">
                  <span className="pointer-events-none absolute inset-y-0 -mx-0.5 border-x border-sky-500/50" aria-hidden="true" />
                  ATTEMPT {item.attempt_number}
                </span>
                <span className="text-[0.65625rem] leading-none text-muted-foreground font-medium sm:text-xs">
                  {formatHistoryDate(item.created_at)}
                </span>
              </div>
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

function HistoryHero({ totalResults }: { totalResults: number }) {
  return (
    <div className="relative border-2 border-primary bg-card/95 p-3 sm:p-4 flex gap-3 sm:gap-4 items-start shadow-[4px_4px_0_rgba(0,0,0,0.15)] dark:shadow-[4px_4px_0_rgba(0,0,0,0.4)]">
      <div className="pointer-events-none absolute inset-0.5 border border-primary/10" aria-hidden="true" />
      
      <div className="relative size-12 sm:size-14 shrink-0 border-2 border-primary bg-secondary/15 overflow-hidden shadow-[2px_2px_0_rgba(0,0,0,0.1)] dark:shadow-[2px_2px_0_rgba(0,0,0,0.5)]">
        <Image
          src={HOME_ASSETS.navIconHistory}
          alt="History"
          fill
          priority
          className="object-cover object-center pixelated scale-100"
          sizes="(max-width: 640px) 56px, (max-width: 1024px) 64px, 72px"
        />
      </div>
      
      <div className="flex-1 space-y-1 text-left min-w-0">
        <p className="retro text-[0.625rem] sm:text-[0.6875rem] font-bold text-accent tracking-wider uppercase">
          HISTORY TERMINAL
        </p>
        <p className="text-xs sm:text-sm leading-relaxed text-foreground font-medium">
          {totalResults > 0
            ? `Sistem mendeteksi ${totalResults} rekaman medis dari sesi latihan PixelAid Anda.`
            : "Belum ada hasil simulasi yang tersimpan di sistem."}
        </p>
      </div>
      
      <div className="absolute bottom-2 right-2 animate-bounce">
        <span className="block border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-6 border-t-accent size-0" />
      </div>
    </div>
  );
}

function EmptyHistoryState() {
  return (
    <div className="relative border-destructive border-2 bg-card p-6 text-center space-y-3 max-w-md mx-auto my-6 shadow-[4px_4px_0_rgba(0,0,0,0.15)] dark:shadow-[4px_4px_0_rgba(0,0,0,0.5)]">
      <div className="pointer-events-none absolute inset-0.5 border border-destructive/10" aria-hidden="true" />
      <div className="inline-flex items-center justify-center p-2 border-2 border-destructive/60 bg-destructive/10 text-destructive mb-1">
        <svg
          viewBox="0 0 16 16"
          className="size-8 pixelated fill-current"
          aria-hidden="true"
        >
          <rect x="7" y="2" width="2" height="6" />
          <rect x="7" y="10" width="2" height="2" />
        </svg>
      </div>
      <p className="retro text-sm leading-none font-bold text-destructive tracking-wider">
        [ SYSTEM WARNING: NO RECORDS FOUND ]
      </p>
      <p className="text-xs leading-relaxed text-muted-foreground">
        Selesaikan minimal satu skenario simulasi penanganan pasien untuk mencatat skor, performa, dan hasil latihan di terminal ini.
      </p>
    </div>
  );
}

export default async function HistoryPage() {
  const api = await getApiClient();
  const { data } = await api.GET("/api/history").catch(() => ({ data: undefined }));
  const items = (data?.items ?? []) as HistoryItem[];

  return (
    <SpecialistsScreenLayout
      backHref="/app/home"
      backLabel="Kembali ke home"
      title="HISTORY"
    >
      <section className={`${specialistsContentPanelClass} space-y-4 sm:space-y-5 md:space-y-6 pb-6`}>
        <HistoryHero totalResults={items.length} />

        {items.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-5 content-start">
            {items.map((item) => (
              <HistoryCard key={item.result_id} item={item} />
            ))}
          </div>
        ) : (
          <EmptyHistoryState />
        )}
      </section>
    </SpecialistsScreenLayout>
  );
}
