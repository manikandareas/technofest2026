import { HeartPulse } from "lucide-react";

import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/8bit/card";
import { Separator } from "@/components/ui/8bit/separator";
import { SettingsDetailScreen } from "@/components/settings/settings-detail-screen";
import { SettingsMenuIcon } from "@/components/settings/settings-menu-icon";
import {
  settingsMutedTextClass,
} from "@/components/settings/settings-styles";

export function AboutScreen() {
  return (
    <SettingsDetailScreen title="TENTANG">
      <div className="relative p-0.5 w-full">
        <div className="absolute inset-0 bg-black/10 translate-x-1 translate-y-1 dark:bg-black/30" />
        <div className="relative border-y-4 border-primary bg-card text-foreground">
          <div className="pointer-events-none absolute inset-y-0 -mx-1 border-x-4 border-primary" aria-hidden="true" />
          <div className="absolute top-1 left-1 size-1 bg-secondary" />
          <div className="absolute top-1 right-1 size-1 bg-secondary" />
          <div className="absolute bottom-1 left-1 size-1 bg-secondary" />
          <div className="absolute bottom-1 right-1 size-1 bg-secondary" />

          <CardHeader className="gap-3 px-4 pt-4 sm:px-5 sm:pt-5">
            <div className="flex items-center gap-3">
              <SettingsMenuIcon
                icon={HeartPulse}
                tone="primary"
                className="size-12 rounded-none border-2 border-primary/25 sm:size-14 lg:size-16"
              />
              <div className="min-w-0 space-y-1">
                <CardTitle font="retro" className="text-sm sm:text-base lg:text-lg">
                  PixelAid
                </CardTitle>
                <CardDescription className={settingsMutedTextClass}>
                  Simulasi dokter virtual berbasis suara
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 px-4 sm:px-5">
            <Separator />
            <p className={settingsMutedTextClass}>
              PixelAid membantu mahasiswa kedokteran berlatih anamnesis, pemeriksaan,
              dan diagnosis melalui kasus interaktif dengan pasien virtual.
            </p>
          </CardContent>

          <CardFooter className="flex-col items-stretch gap-1 px-4 pb-4 sm:px-5 sm:pb-5">
            <p className="text-xs font-semibold leading-snug sm:text-sm">Hackathon UMKT 2026</p>
            <p className={settingsMutedTextClass}>Versi demo TechnoFest 2026</p>
          </CardFooter>
        </div>
      </div>
    </SettingsDetailScreen>
  );
}
