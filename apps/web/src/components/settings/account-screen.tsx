import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/8bit/card";
import { Separator } from "@/components/ui/8bit/separator";
import { HOME_ASSETS } from "@/components/home/home-assets";
import { SettingsDetailScreen } from "@/components/settings/settings-detail-screen";
import {
  settingsDetailCardClass,
  settingsMutedTextClass,
} from "@/components/settings/settings-styles";

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
    <Card font="retro" className={settingsDetailCardClass}>
      <CardContent className="space-y-1 px-3 py-3 sm:px-4 sm:py-3.5 lg:px-5 lg:py-4">
        <p className="text-[0.625rem] uppercase tracking-wide text-card-foreground/70 sm:text-xs">
          {label}
        </p>
        <p className="retro text-lg leading-none sm:text-xl lg:text-2xl">{value}</p>
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
  const formattedName = displayName.startsWith("Dr.")
    ? displayName
    : `Dr. ${displayName}`;

  return (
    <SettingsDetailScreen title="PROFIL">
      <Card font="retro" className={`${settingsDetailCardClass} w-full`}>
        <CardHeader className="items-center gap-3 px-4 pb-0 pt-4 text-center sm:px-5 sm:pt-5">
          <Avatar className="size-20 bg-[#eef3ff] sm:size-24 lg:size-28">
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
            <CardTitle font="retro" className="text-sm sm:text-base lg:text-lg">
              {formattedName}
            </CardTitle>
            {email ? (
              <CardDescription className={settingsMutedTextClass}>{email}</CardDescription>
            ) : null}
          </div>
        </CardHeader>

        <CardContent className="space-y-4 px-4 pb-4 pt-4 sm:px-5 sm:pb-5">
          <Separator />
          <AccountNameForm initialName={displayName} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-5">
        <StatCard label="Total XP" value={totalXp.toLocaleString("id-ID")} />
        <StatCard label="Level" value={level} />
        <StatCard label="Case selesai" value={completedCases} />
        <StatCard label="Avg best" value={averageBestScore} />
      </div>
    </SettingsDetailScreen>
  );
}
