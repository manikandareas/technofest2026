import { ChevronRight, Star } from "lucide-react";
import Link from "next/link";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/8bit/avatar";
import { Badge } from "@/components/ui/8bit/badge";
import { Card, CardContent } from "@/components/ui/8bit/card";
import { HOME_ASSETS } from "@/components/home/home-assets";

import {
  settingsCardContentClass,
  settingsCardLinkClass,
  settingsDetailCardClass,
} from "./settings-styles";

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
      href="/settings/account"
      className={settingsCardLinkClass}
      aria-label="Kelola profil"
    >
      <Card font="retro" className={`${settingsDetailCardClass} w-full`}>
        <CardContent className={`${settingsCardContentClass} p-0`}>
          <Avatar className="size-14 shrink-0 bg-secondary/20 sm:size-16 lg:size-[4.5rem]" variant="pixel">
            <AvatarImage
              src={avatarUrl ?? HOME_ASSETS.avatarDefault}
              alt=""
              className="object-cover object-center pixelated"
            />
            <AvatarFallback className="bg-secondary/20 text-foreground pixelated">
              {avatarInitial}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1 space-y-1.5">
            <p className="retro truncate text-sm leading-tight sm:text-base lg:text-lg">
              {formattedName}
            </p>
            <Badge
              font="retro"
              variant="secondary"
              className="inline-flex h-5 min-w-[5.5rem] items-center gap-1 border-transparent bg-secondary/20 px-2 py-0 text-[0.625rem] leading-none text-foreground sm:text-[0.6875rem]"
            >
              <Star className="size-3 shrink-0 fill-current stroke-[2.5]" aria-hidden />
              {totalXp.toLocaleString("id-ID")} XP
            </Badge>
          </div>

          <ChevronRight
            className="size-5 shrink-0 text-muted-foreground opacity-80"
            aria-hidden
          />
        </CardContent>
      </Card>
    </Link>
  );
}
