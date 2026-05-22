import Image from "next/image";

import { AppBottomNav } from "@/components/app/app-bottom-nav";

import { HomeHeader } from "./home-header";
import { HomeRecentCases } from "./home-recent-cases";
import { HomeStartButton } from "./home-start-button";

type HomeScreenProps = {
  displayName: string;
  level: number;
  totalXp: number;
  avatarUrl?: string | null;
  startHref: string;
  startLabel: string;
  recentCases: Array<{
    result_id: string;
    session_id: string;
    case_id: string;
    patient_name: string;
  }>;
};

export function HomeScreen({
  displayName,
  level,
  totalXp,
  avatarUrl,
  startHref,
  startLabel,
  recentCases,
}: HomeScreenProps) {
  return (
    <div className="relative min-h-dvh w-full bg-[#0b1320]">
      <div className="pointer-events-none absolute inset-0">
        <Image
          src="/assets/home/scene-bg.png"
          alt=""
          fill
          priority
          className="object-cover object-center pixelated lg:hidden"
          sizes="(max-width: 1023px) 100vw, 0px"
        />
        <Image
          src="/assets/home/scene-bg-desktop.png"
          alt=""
          fill
          priority
          className="hidden object-cover object-center pixelated lg:block"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/35" />
      </div>

      <main className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col md:max-w-3xl lg:max-w-5xl xl:max-w-6xl">
        <HomeHeader
          displayName={displayName}
          level={level}
          totalXp={totalXp}
          avatarUrl={avatarUrl}
        />

        <div className="relative min-h-0 flex-1 overflow-hidden pb-[11rem] md:pb-[10rem] lg:pb-[12rem]">
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center md:bottom-2 lg:bottom-4">
            <div className="relative h-[min(72vh,38rem)] w-[min(115%,34rem)] sm:h-[min(74vh,40rem)] sm:w-[min(110%,36rem)] md:h-[min(76vh,42rem)] md:w-[min(90%,38rem)] lg:h-[min(75vh,44rem)] lg:w-[min(55%,28rem)] xl:h-[min(78vh,48rem)] xl:w-[min(50%,32rem)]">
              <Image
                src="/assets/home/doctor-character.png"
                alt="Dokter koas PixelAid"
                fill
                priority
                className="origin-bottom scale-[1.35] object-contain object-bottom pixelated drop-shadow-[0_8px_0_rgba(0,0,0,0.35)] sm:scale-[1.38] md:scale-[1.4] lg:scale-[1.48] xl:scale-[1.55]"
                sizes="(max-width: 640px) 115vw, (max-width: 768px) 110vw, (max-width: 1024px) 90vw, (max-width: 1280px) 55vw, 32rem"
              />
            </div>
          </div>
        </div>

        <div className="relative z-20 pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:pb-[calc(6rem+env(safe-area-inset-bottom))]">
          <HomeRecentCases items={recentCases} />
          <HomeStartButton href={startHref} label={startLabel} />
        </div>

        <AppBottomNav />
      </main>
    </div>
  );
}
