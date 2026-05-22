import Image from "next/image";

import { AppScreenNavFooter } from "@/components/app/app-screen-nav-footer";

import { DoctorCharacterSprite } from "./doctor-character-sprite";
import { HOME_ASSETS } from "./home-assets";
import { HomeHeader } from "./home-header";
import { HomeStartButton } from "./home-start-button";
import { HomeWardrobePanel } from "./home-wardrobe-panel";

type HomeScreenProps = {
  displayName: string;
  level: number;
  totalXp: number;
  avatarUrl?: string | null;
  startHref: string;
  startLabel: string;
};

export function HomeScreen({
  displayName,
  level,
  totalXp,
  avatarUrl,
  startHref,
  startLabel,
}: HomeScreenProps) {
  return (
    <div className="relative min-h-dvh w-full bg-[#02153d]">
      <div className="pointer-events-none absolute inset-0">
        <Image
          src={HOME_ASSETS.sceneBgMobile}
          alt=""
          fill
          priority
          className="object-cover object-center pixelated lg:hidden"
          sizes="100vw"
        />
        <Image
          src={HOME_ASSETS.sceneBgDesktop}
          alt=""
          fill
          priority
          className="hidden object-cover object-center pixelated lg:block"
          sizes="100vw"
        />
      </div>

      <main className="relative mx-auto flex min-h-dvh w-full max-w-[393px] flex-col md:max-w-3xl lg:max-w-5xl xl:max-w-6xl">
        <HomeHeader
          displayName={displayName}
          level={level}
          totalXp={totalXp}
          avatarUrl={avatarUrl}
        />

        <div className="relative min-h-0 flex-1">
          <HomeWardrobePanel />

          <div className="pointer-events-none absolute inset-x-0 bottom-[calc(7.25rem+env(safe-area-inset-bottom))] flex justify-center md:bottom-[5.75rem] lg:bottom-[7.5rem]">
            <div className="relative h-[min(44vh,22rem)] w-[min(48vw,11.5rem)] sm:h-[min(46vh,23rem)] sm:w-[min(46vw,12rem)] md:h-[min(48vh,25rem)] md:w-[min(42vw,13rem)] lg:h-[min(50vh,27rem)] lg:w-[min(30vw,14rem)] xl:h-[min(52vh,30rem)] xl:w-[min(26vw,15rem)]">
              <div
                aria-hidden
                className="absolute bottom-[2%] left-1/2 h-[10%] w-[65%] -translate-x-1/2 rounded-[50%] bg-[#1a3a6b]/55 blur-[2px]"
              />
              <DoctorCharacterSprite />
            </div>
          </div>
        </div>

        <AppScreenNavFooter>
          <HomeStartButton href={startHref} label={startLabel} />
        </AppScreenNavFooter>
      </main>
    </div>
  );
}
