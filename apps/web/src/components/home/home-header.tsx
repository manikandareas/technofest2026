import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/8bit/badge";

import { HOME_ASSETS } from "./home-assets";
import { HomeHeaderActions } from "./home-header-actions";

type HomeHeaderProps = {
  displayName: string;
  level: number;
  totalXp: number;
  avatarUrl?: string | null;
};

export function HomeHeader({
  displayName,
  level,
  totalXp,
  avatarUrl,
}: HomeHeaderProps) {
  const formattedName = displayName.startsWith("Dr.")
    ? displayName
    : `Dr. ${displayName}`;

  return (
    <header className="relative z-20 shrink-0">
      <div className="relative flex items-start justify-between gap-2 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] md:gap-3 md:px-6 lg:px-8 lg:pt-8">
        <Link
          href="/profile"
          className="flex min-w-0 items-start gap-2.5 rounded-none outline-none focus-visible:ring-2 focus-visible:ring-white/60 md:gap-3"
          aria-label="Buka profil"
        >
          <div className="relative size-16 shrink-0 lg:size-[4.5rem]">
            <Image
              src={avatarUrl ?? HOME_ASSETS.avatarDefault}
              alt=""
              fill
              className="object-cover object-center pixelated"
              sizes="72px"
              priority
            />
          </div>

          <div className="min-w-0 space-y-1 pt-0.5 text-white drop-shadow-[1px_1px_0_#000]">
            <p className="retro truncate text-xs leading-tight md:text-sm lg:text-base">
              {formattedName}
            </p>
            <p className="retro text-[10px] leading-none text-white lg:text-xs">
              LV. {level}
            </p>
            <Badge
              font="retro"
              variant="secondary"
              className="flex h-3 min-w-[4.25rem] items-center gap-1 border-transparent bg-[rgba(3,23,58,0.4)] px-2 py-0 text-[10px] leading-none text-white lg:h-3.5 lg:text-xs"
            >
              <Image
                src={HOME_ASSETS.iconStars}
                alt=""
                width={12}
                height={13}
                className="size-3 shrink-0 object-contain pixelated"
                aria-hidden
              />
              {totalXp.toLocaleString("id-ID")} XP
            </Badge>
          </div>
        </Link>

        <HomeHeaderActions />
      </div>
    </header>
  );
}
