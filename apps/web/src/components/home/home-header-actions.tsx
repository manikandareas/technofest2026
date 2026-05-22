"use client";

import Image from "next/image";
import Link from "next/link";

import { BgmIcon } from "@/components/audio/bgm-icon";
import { useBgm } from "@/components/audio/bgm-provider";
import { Button } from "@/components/ui/8bit/button";

import { HOME_ASSETS } from "./home-assets";

const headerIconButtonClass =
  "size-9 shrink-0 border-transparent bg-[rgba(0,24,61,0.46)] text-white drop-shadow-[1px_1px_0_#000] hover:bg-[rgba(0,24,61,0.62)] md:size-10";

export function HomeHeaderActions() {
  const { enabled, toggle } = useBgm();

  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <Button
        type="button"
        size="icon"
        variant="secondary"
        font="retro"
        className={headerIconButtonClass}
        aria-label={enabled ? "Matikan musik latar" : "Nyalakan musik latar"}
        aria-pressed={enabled}
        onClick={toggle}
      >
        <BgmIcon enabled={enabled} />
      </Button>

      <Button
        asChild
        size="icon"
        variant="secondary"
        font="retro"
        className={headerIconButtonClass}
      >
        <Link href="/leaderboard" aria-label="Leaderboard">
          <Image
            src={HOME_ASSETS.iconTrophy}
            alt=""
            width={24}
            height={24}
            className="size-6 object-contain pixelated"
            aria-hidden
          />
        </Link>
      </Button>
    </div>
  );
}
