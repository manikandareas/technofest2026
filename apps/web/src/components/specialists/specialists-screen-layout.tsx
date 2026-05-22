import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { AppScreenNavFooter } from "@/components/app/app-screen-nav-footer";
import { BgmProvider } from "@/components/audio/bgm-provider";
import { CASES_ASSETS } from "@/components/cases/cases-assets";
import { HOME_ASSETS } from "@/components/home/home-assets";
import { Button } from "@/components/ui/8bit/button";

const headerBackButtonClass =
  "size-9 shrink-0 border-transparent bg-[rgba(0,24,61,0.46)] text-white drop-shadow-[1px_1px_0_#000] hover:bg-[rgba(0,24,61,0.62)] sm:size-10 md:size-11 lg:size-12";

export const specialistsContentPanelClass =
  "relative z-10 flex flex-col px-3 pt-2 sm:px-4 sm:pt-3 md:px-6 lg:mx-6 lg:px-8 lg:pt-4 xl:mx-auto xl:max-w-4xl xl:px-10 xl:pt-5";

export const specialistsScrollAreaClass =
  "mt-4 flex flex-col gap-3 sm:mt-5 lg:mt-6 lg:grid lg:grid-cols-2 lg:content-start lg:gap-4 xl:gap-5";

type SpecialistsScreenLayoutProps = {
  backHref: string;
  backLabel: string;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  headerAction?: ReactNode;
  showBottomNav?: boolean;
};

function SpecialistsSceneBackground() {
  return (
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
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-[#02153d]/20 via-transparent to-[#02153d]/45 lg:from-[#02153d]/10 lg:to-[#02153d]/30"
      />
    </div>
  );
}

function SpecialistsScreenHeader({
  backHref,
  backLabel,
  title,
  headerAction,
}: Pick<
  SpecialistsScreenLayoutProps,
  "backHref" | "backLabel" | "title" | "headerAction"
>) {
  return (
    <header className="relative z-20 shrink-0 px-3 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-4 sm:pb-4 md:px-6 lg:px-8 lg:pb-5 lg:pt-8">
      <div className="grid grid-cols-[2.5rem_1fr_2.5rem] items-center gap-2 sm:grid-cols-[2.75rem_1fr_2.75rem] lg:grid-cols-[3rem_1fr_3rem]">
        <Button
          asChild
          size="icon"
          variant="secondary"
          font="retro"
          className={headerBackButtonClass}
        >
          <Link href={backHref} aria-label={backLabel}>
            <Image
              src={CASES_ASSETS.iconBack}
              alt=""
              width={20}
              height={20}
              className="size-5 object-contain pixelated sm:size-6"
              aria-hidden
            />
          </Link>
        </Button>

        <h1 className="retro text-center text-sm leading-tight text-white drop-shadow-[1px_1px_0_#000] sm:text-base lg:text-lg xl:text-xl">
          {title}
        </h1>

        <div className="flex justify-end">{headerAction}</div>
      </div>
    </header>
  );
}

export function SpecialistsScreenLayout({
  backHref,
  backLabel,
  title,
  children,
  footer,
  headerAction,
  showBottomNav = true,
}: SpecialistsScreenLayoutProps) {
  return (
    <BgmProvider>
      <div className="relative min-h-dvh w-full bg-[#02153d]">
        <SpecialistsSceneBackground />

        <main className="relative mx-auto flex min-h-dvh w-full max-w-[393px] flex-col md:max-w-3xl lg:max-w-5xl xl:max-w-6xl">
          <SpecialistsScreenHeader
            backHref={backHref}
            backLabel={backLabel}
            title={title}
            headerAction={headerAction}
          />

          {children}

          <AppScreenNavFooter showBottomNav={showBottomNav}>
            {footer}
          </AppScreenNavFooter>
        </main>
      </div>
    </BgmProvider>
  );
}
