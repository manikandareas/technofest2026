import { CheckCircle2, ShieldCheck } from "lucide-react";

import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/8bit/card";
import { Badge } from "@/components/ui/8bit/badge";
import { SettingsDetailScreen } from "@/components/settings/settings-detail-screen";
import { SettingsMenuIcon } from "@/components/settings/settings-menu-icon";
import {
  settingsMutedTextClass,
} from "@/components/settings/settings-styles";

const PRIVACY_POINTS = [
  "Transkrip konsultasi disimpan untuk progres latihan dan feedback pribadi.",
  "Data profil hanya dipakai untuk personalisasi dan leaderboard.",
  "Akun anonim tidak muncul di leaderboard publik.",
  "PixelAid tidak membagikan data medis simulasi ke pihak ketiga.",
] as const;

export function PrivacyScreen() {
  return (
    <SettingsDetailScreen title="PRIVASI">
      <div className="relative p-0.5 w-full">
        <div className="absolute inset-0 bg-black/10 translate-x-1 translate-y-1 dark:bg-black/30" />
        <div className="relative border-y-4 border-primary bg-card text-foreground">
          <div className="pointer-events-none absolute inset-y-0 -mx-1 border-x-4 border-primary" aria-hidden="true" />
          <div className="absolute top-1 left-1 size-1 bg-secondary" />
          <div className="absolute top-1 right-1 size-1 bg-secondary" />
          <div className="absolute bottom-1 left-1 size-1 bg-secondary" />
          <div className="absolute bottom-1 right-1 size-1 bg-secondary" />

          <CardHeader className="gap-3 px-4 pt-4 sm:px-5 sm:pt-5">
            <div className="flex items-start gap-3">
              <SettingsMenuIcon icon={ShieldCheck} tone="primary" />
              <div className="min-w-0 space-y-2">
                <Badge font="retro" variant="secondary" className="w-fit border-transparent bg-secondary/20 text-foreground text-[0.625rem] sm:text-xs">
                  Simulasi
                </Badge>
                <CardTitle font="retro" className="text-sm sm:text-base lg:text-lg">
                  Privasi simulasi PixelAid
                </CardTitle>
                <CardDescription className={settingsMutedTextClass}>
                  PixelAid dirancang untuk latihan klinis virtual. Informasi yang kamu
                  lihat di simulasi bukan rekam medis pasien sungguhan.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3 px-4 pb-4 sm:px-5 sm:pb-5">
            <ul className="space-y-2.5">
              {PRIVACY_POINTS.map((point) => (
                <li key={point} className="flex gap-2.5">
                  <CheckCircle2
                    className="mt-0.5 size-4 shrink-0 text-primary stroke-[2.5]"
                    aria-hidden
                  />
                  <span className={settingsMutedTextClass}>{point}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </div>
      </div>
    </SettingsDetailScreen>
  );
}
