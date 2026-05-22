import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { AppScreenNavFooter } from "@/components/app/app-screen-nav-footer";
import { BgmProvider } from "@/components/audio/bgm-provider";
import { HOME_ASSETS } from "@/components/home/home-assets";
import { Button } from "@/components/ui/8bit/button";

import { SpecialistCard } from "./specialist-card";

const headerBackButtonClass =
  "size-9 shrink-0 border-transparent bg-[rgba(0,24,61,0.46)] text-white drop-shadow-[1px_1px_0_#000] hover:bg-[rgba(0,24,61,0.62)] sm:size-10 md:size-11 lg:size-12";

export type SpecialistListItem = {
  id: string;
  name: string;
  description: string;
  status: string;
};

type SpecialistsScreenProps = {
  specialists: SpecialistListItem[];
};

export function SpecialistsScreen({ specialists }: SpecialistsScreenProps) {
  return (
    <BgmProvider>
      <div className="relative min-h-dvh w-full bg-[#02153d]">
        <div className="pointer-events-none absolute inset-0">
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
          <header className="relative z-20 shrink-0 px-3 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-4 sm:pb-4 md:px-6 lg:px-8 lg:pb-5 lg:pt-8">
            <div className="grid grid-cols-[2.5rem_1fr_2.5rem] items-center gap-2 sm:grid-cols-[2.75rem_1fr_2.75rem] lg:grid-cols-[3rem_1fr_3rem]">
              <Button
                asChild
                size="icon"
                variant="secondary"
                font="retro"
                className={headerBackButtonClass}
              >
                <Link href="/app/home" aria-label="Kembali ke home">
                  <ArrowLeft
                    className="size-5 sm:size-6"
                    aria-hidden
                    strokeWidth={2.5}
                  />
                </Link>
              </Button>

              <h1 className="retro text-center text-sm leading-tight text-white drop-shadow-[1px_1px_0_#000] sm:text-base lg:text-lg xl:text-xl">
                CHOOSE SPESIALIST
              </h1>

              <span aria-hidden className="size-10 sm:size-11 lg:size-12" />
            </div>
          </header>

          <section className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-[1.75rem] bg-[#d4d4d4] px-3 pt-4 sm:rounded-t-[2rem] sm:px-4 sm:pt-5 md:px-6 lg:mx-6 lg:max-h-[calc(100dvh-7.5rem)] lg:rounded-[2rem] lg:px-8 lg:pt-7 xl:mx-auto xl:max-w-4xl xl:px-10 xl:pt-8">
            <p className="mx-auto max-w-md text-center text-xs leading-relaxed text-black sm:max-w-lg sm:text-sm lg:max-w-2xl lg:text-base lg:leading-relaxed">
              Pick your field to begin treating patients and solving cases.
            </p>

            <div className="mt-4 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-y-contain pb-2 [-webkit-overflow-scrolling:touch] sm:mt-5 lg:mt-6 lg:grid lg:grid-cols-2 lg:content-start lg:gap-4 xl:gap-5">
              {specialists.map((specialist) => (
                <SpecialistCard
                  key={specialist.id}
                  id={specialist.id}
                  name={specialist.name}
                  description={specialist.description}
                  status={specialist.status}
                />
              ))}
            </div>
          </section>

          <AppScreenNavFooter />
        </main>
      </div>
    </BgmProvider>
  );
}
