import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/8bit/card";
import { HOME_ASSETS } from "@/components/home/home-assets";
import { SettingsDetailScreen } from "@/components/settings/settings-detail-screen";
import { settingsCardClass } from "@/components/settings/settings-styles";

import { AccountNameForm } from "./account-name-form";

type AccountScreenProps = {
  displayName: string;
  email?: string | null;
  avatarUrl?: string | null;
  totalXp: number;
  level: number;
  completedCases: number;
  averageBestScore: number;
};

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card font="retro" className="py-0">
      <CardContent className="space-y-1 px-3 py-3 sm:px-4 sm:py-3.5">
        <p className="text-[0.625rem] uppercase tracking-wide text-card-foreground/70 sm:text-xs">
          {label}
        </p>
        <p className="retro text-lg leading-none sm:text-xl">{value}</p>
      </CardContent>
    </Card>
  );
}

export function AccountScreen({
  displayName,
  email,
  avatarUrl,
  totalXp,
  level,
  completedCases,
  averageBestScore,
}: AccountScreenProps) {
  const avatarInitial = displayName.replace(/^Dr\.\s*/i, "").charAt(0).toUpperCase();

  return (
    <SettingsDetailScreen title="PROFIL">
      <article className={`${settingsCardClass} space-y-4 px-3 py-4 sm:px-4 sm:py-5`}>
        <div className="flex flex-col items-center gap-3 text-center">
          <Avatar className="size-20 bg-[#eef3ff] sm:size-24">
            <AvatarImage
              src={avatarUrl ?? HOME_ASSETS.avatarDefault}
              alt=""
              className="object-cover object-center pixelated"
            />
            <AvatarFallback className="bg-[#eef3ff] text-foreground pixelated">
              {avatarInitial}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-1">
            <p className="retro text-sm leading-tight sm:text-base">
              {displayName.startsWith("Dr.") ? displayName : `Dr. ${displayName}`}
            </p>
            {email ? (
              <p className="text-xs leading-snug text-[#1a233e]/70 sm:text-sm">{email}</p>
            ) : null}
          </div>
        </div>

        <AccountNameForm initialName={displayName} />
      </article>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <StatCard label="Total XP" value={totalXp.toLocaleString("id-ID")} />
        <StatCard label="Level" value={level} />
        <StatCard label="Case selesai" value={completedCases} />
        <StatCard label="Avg best" value={averageBestScore} />
      </div>
    </SettingsDetailScreen>
  );
}
