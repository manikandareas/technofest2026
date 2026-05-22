import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/8bit/avatar";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/8bit/card";
import { Separator } from "@/components/ui/8bit/separator";
import { HOME_ASSETS } from "@/components/home/home-assets";
import { SettingsDetailScreen } from "@/components/settings/settings-detail-screen";
import {
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
    <div className="relative p-0.5">
      <div className="absolute inset-0 bg-black/10 translate-x-1 translate-y-1 dark:bg-black/30" />
      <div className="relative border-y-4 border-primary bg-card text-foreground">
        <div className="pointer-events-none absolute inset-y-0 -mx-1 border-x-4 border-primary" aria-hidden="true" />
        <div className="absolute top-1 left-1 size-1 bg-secondary" />
        <div className="absolute top-1 right-1 size-1 bg-secondary" />
        <div className="absolute bottom-1 left-1 size-1 bg-secondary" />
        <div className="absolute bottom-1 right-1 size-1 bg-secondary" />
        
        <div className="px-3 py-3 sm:px-4 sm:py-3.5 lg:px-5 lg:py-4">
          <p className="text-[0.625rem] font-bold uppercase tracking-wider text-muted-foreground sm:text-xs retro">
            {label}
          </p>
          <p className="retro text-base font-bold leading-none text-primary mt-1.5 sm:text-lg lg:text-xl">{value}</p>
        </div>
      </div>
    </div>
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
      <div className="relative p-0.5 w-full">
        <div className="absolute inset-0 bg-black/10 translate-x-1 translate-y-1 dark:bg-black/30" />
        <div className="relative border-y-4 border-primary bg-card text-foreground">
          <div className="pointer-events-none absolute inset-y-0 -mx-1 border-x-4 border-primary" aria-hidden="true" />
          <div className="absolute top-1 left-1 size-1 bg-secondary" />
          <div className="absolute top-1 right-1 size-1 bg-secondary" />
          <div className="absolute bottom-1 left-1 size-1 bg-secondary" />
          <div className="absolute bottom-1 right-1 size-1 bg-secondary" />

          <CardHeader className="items-center gap-3 px-4 pb-0 pt-4 text-center sm:px-5 sm:pt-5">
            <Avatar className="size-20 bg-secondary/20 sm:size-24 lg:size-28" variant="pixel">
              <AvatarImage
                src={avatarUrl ?? HOME_ASSETS.avatarDefault}
                alt=""
                className="object-cover object-center pixelated"
              />
              <AvatarFallback className="bg-secondary/20 text-foreground pixelated">
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
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-5">
        <StatCard label="Total XP" value={totalXp.toLocaleString("id-ID")} />
        <StatCard label="Level" value={level} />
        <StatCard label="Case selesai" value={completedCases} />
        <StatCard label="Avg best" value={averageBestScore} />
      </div>
    </SettingsDetailScreen>
  );
}
