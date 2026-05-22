import Image from "next/image";
import Link from "next/link";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/8bit/badge";
import { HOME_ASSETS } from "@/components/home/home-assets";
import { SPECIALISTS_ASSETS } from "@/components/specialists/specialists-assets";

import { settingsCardClass } from "./settings-styles";

type SettingsProfileCardProps = {
  displayName: string;
  totalXp: number;
  avatarUrl?: string | null;
};

export function SettingsProfileCard({
  displayName,
  totalXp,
  avatarUrl,
}: SettingsProfileCardProps) {
  const formattedName = displayName.startsWith("Dr.")
    ? displayName
    : `Dr. ${displayName}`;
  const avatarInitial = displayName.replace(/^Dr\.\s*/i, "").charAt(0).toUpperCase();

  return (
    <Link
      href="/profile/account"
      className={`${settingsCardClass} flex items-center gap-3 px-3 py-3 outline-none transition-transform focus-visible:ring-2 focus-visible:ring-[#228be6]/70 active:scale-[0.99] sm:gap-4 sm:px-4 sm:py-3.5`}
    >
      <Avatar className="size-14 shrink-0 bg-[#eef3ff] sm:size-16">
        <AvatarImage
          src={avatarUrl ?? HOME_ASSETS.avatarDefault}
          alt=""
          className="object-cover object-center pixelated"
        />
        <AvatarFallback className="bg-[#eef3ff] text-foreground pixelated">
          {avatarInitial}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1 space-y-1.5">
        <p className="retro truncate text-sm leading-tight sm:text-base">
          {formattedName}
        </p>
        <Badge
          font="retro"
          variant="secondary"
          className="inline-flex h-5 min-w-[5.5rem] items-center gap-1 border-transparent bg-[#eef1f6] px-2 py-0 text-[0.625rem] leading-none text-foreground sm:text-[0.6875rem]"
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

      <Image
        src={SPECIALISTS_ASSETS.iconChevronRight}
        alt=""
        width={20}
        height={24}
        className="size-4 shrink-0 object-contain pixelated opacity-90 sm:size-5"
        aria-hidden
      />
    </Link>
  );
}
