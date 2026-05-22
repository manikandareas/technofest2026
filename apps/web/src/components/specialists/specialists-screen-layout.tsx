import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { AppScreenNavFooter } from "@/components/app/app-screen-nav-footer";
import { HOME_ASSETS } from "@/components/home/home-assets";
import { Button } from "@/components/ui/8bit/button";
import { ChevronLeftIcon } from "@/components/ui/8bit/chevron-left-icon";

const headerBackButtonClass =
  "size-9 shrink-0 border-transparent bg-secondary text-secondary-foreground drop-shadow-[1px_1px_0_var(--border)] hover:bg-secondary/80 sm:size-10 md:size-11 lg:size-12";

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
    <div className="pointer-events-none fixed inset-0">
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
        className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background/45 lg:from-background/10 lg:to-background/30"
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
            <ChevronLeftIcon />
          </Link>
        </Button>

        <h1 className="retro text-center text-sm leading-tight text-foreground drop-shadow-[1px_1px_0_var(--border)] sm:text-base lg:text-lg xl:text-xl">
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
    <div className="relative min-h-dvh w-full bg-background text-foreground">
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
  );
}
