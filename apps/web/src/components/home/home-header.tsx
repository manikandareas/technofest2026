import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/8bit/button";

import { PixelStarIcon, PixelTrophyIcon } from "./pixel-icons";

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
    <header className="relative z-20 flex items-start justify-between gap-3 px-4 pt-[max(1rem,env(safe-area-inset-top))] md:px-6 lg:px-8 lg:pt-8">
      <Link
        href="/profile"
        className="flex min-w-0 items-center gap-3 rounded-none outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        aria-label="Buka profil"
      >
        <div className="relative size-16 shrink-0 overflow-hidden rounded-full border-4 border-black bg-transparent shadow-[0_0_0_2px_#ffffff] lg:size-[4.5rem]">
          <Image
            src={avatarUrl ?? "/assets/home/avatar-default.png"}
            alt=""
            fill
            className="scale-125 object-contain object-center pixelated"
            sizes="72px"
            priority
          />
        </div>
        <div className="min-w-0 space-y-1 text-white drop-shadow-[2px_2px_0_#000] lg:space-y-1.5">
          <p className="retro truncate text-sm leading-tight lg:text-base">
            {formattedName}
          </p>
          <p className="retro text-xs leading-none text-white/90 lg:text-sm">
            LV. {level}
          </p>
          <p className="retro flex items-center gap-1.5 text-xs leading-none text-[#FDE047] lg:text-sm">
            {totalXp.toLocaleString("id-ID")} XP
            <PixelStarIcon />
          </p>
        </div>
      </Link>

      <Button
        asChild
        variant="secondary"
        size="sm"
        font="retro"
        className="h-auto shrink-0 px-3 py-2 text-[10px] lg:px-4 lg:py-2.5 lg:text-xs"
      >
        <Link href="/leaderboard" className="gap-2">
          <PixelTrophyIcon />
          Leaderboard
        </Link>
      </Button>
    </header>
  );
}
