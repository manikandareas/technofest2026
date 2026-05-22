import Image from "next/image";
import Link from "next/link";

import { HOME_ASSETS } from "@/components/home/home-assets";
import { Card, CardContent } from "@/components/ui/8bit/card";
import {
  SpecialistsScreenLayout,
  specialistsContentPanelClass,
  specialistsScrollAreaClass,
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
  return (
    <div className="relative size-14 shrink-0 rounded-2xl border-2 border-foreground bg-[#f4c44f] text-foreground sm:size-16 lg:size-[4.5rem] lg:rounded-[1.125rem]">
      <span className="retro absolute inset-x-0 top-2 text-center text-[0.5rem] leading-none sm:top-2.5 sm:text-[0.5625rem] lg:top-3">
        SCORE
      </span>
      <span className="retro absolute inset-x-0 top-5 text-center text-lg leading-none sm:top-6 sm:text-xl lg:top-7 lg:text-2xl">
        {score}
      </span>
      <span className="absolute inset-x-0 bottom-1.5 text-center text-[0.625rem] font-bold leading-none sm:bottom-2">
        {"★".repeat(Math.max(0, Math.min(stars, 3)))}
      </span>
    </div>
  );
}

function HistoryCard({ item }: { item: HistoryItem }) {
  return (
    <Link
      href={`/app/sessions/${item.session_id}/result?result=${item.result_id}`}
      className="block h-full outline-none transition-transform focus-visible:ring-2 focus-visible:ring-white/70 active:scale-[0.99]"
    >
      <Card font="retro" className="h-full py-0">
        <CardContent className="flex min-h-[6.25rem] items-center gap-3 px-3 py-3 sm:min-h-[6.75rem] sm:gap-4 sm:px-4 sm:py-3.5 lg:min-h-[7.5rem] lg:px-5 lg:py-4">
          <ScoreBadge score={item.score} stars={item.stars} />

          <div className="min-w-0 flex-1 space-y-1 pr-1 sm:pr-2 lg:space-y-1.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="retro text-sm leading-tight sm:text-base lg:text-lg">
                {item.patient_name}
              </span>
              <span className="rounded-full border border-foreground bg-[#dfe8ff] px-2 py-0.5 text-[0.625rem] font-bold uppercase leading-none sm:text-[0.6875rem]">
                Best {item.best_score}
              </span>
            </div>
            <p className="text-[0.6875rem] font-semibold leading-snug sm:text-xs lg:text-sm">
              {item.condition_badge}
            </p>
            <p className="text-[0.65625rem] leading-snug text-card-foreground/75 sm:text-xs lg:text-sm">
              Attempt {item.attempt_number} / {formatHistoryDate(item.created_at)}
            </p>
          </div>

          <Image
            src={SPECIALISTS_ASSETS.iconChevronRight}
            alt=""
            width={20}
            height={24}
            className="size-4 shrink-0 object-contain pixelated opacity-90 sm:size-5 lg:size-6"
            aria-hidden
          />
        </CardContent>
      </Card>
    </Link>
  );
}

function HistoryHero({ totalResults }: { totalResults: number }) {
  return (
    <Card font="retro" className="mx-auto w-full max-w-md py-0 sm:max-w-lg lg:max-w-2xl">
      <CardContent className="flex items-center gap-3 px-3 py-3 sm:px-4 lg:gap-4 lg:px-5 lg:py-4">
        <div className="relative size-14 shrink-0 overflow-hidden rounded-2xl sm:size-16 lg:size-[4.5rem] lg:rounded-[1.125rem]">
          <Image
            src={HOME_ASSETS.navIconHistory}
            alt=""
            fill
            priority
            className="object-cover object-center pixelated"
            sizes="(max-width: 640px) 56px, (max-width: 1024px) 64px, 72px"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="retro text-sm leading-tight sm:text-base lg:text-lg">
            Riwayat Simulasi
          </p>
          <p className="mt-1 text-[0.6875rem] leading-snug text-card-foreground/80 sm:text-xs lg:text-sm">
            {totalResults > 0
              ? `${totalResults} hasil tersimpan dari sesi PixelAid.`
              : "Belum ada hasil simulasi yang tersimpan."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyHistoryState() {
  return (
    <Card font="retro" className="mt-4 py-0 sm:mt-5 lg:mt-6">
      <CardContent className="flex min-h-[11rem] flex-col items-center justify-center gap-3 px-4 py-10 text-center sm:min-h-[12rem] lg:min-h-[14rem] lg:py-14">
        <p className="retro text-sm leading-relaxed sm:text-base">NO HISTORY</p>
        <p className="max-w-xs text-xs leading-relaxed text-card-foreground/70 sm:text-sm">
          Selesaikan satu simulasi untuk melihat skor dan hasil latihan di sini.
        </p>
      </CardContent>
    </Card>
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
      <section className={specialistsContentPanelClass}>
        <HistoryHero totalResults={items.length} />

        {items.length > 0 ? (
          <div className={specialistsScrollAreaClass}>
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
