import { HeartPulse } from "lucide-react";

import {
  Card,
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
  settingsDetailCardClass,
  settingsMutedTextClass,
} from "@/components/settings/settings-styles";

export function AboutScreen() {
  return (
    <SettingsDetailScreen title="TENTANG">
      <Card font="retro" className={`${settingsDetailCardClass} w-full`}>
        <CardHeader className="gap-3 px-4 pt-4 sm:px-5 sm:pt-5">
          <div className="flex items-center gap-3">
            <SettingsMenuIcon
              icon={HeartPulse}
              tone="primary"
              className="size-12 rounded-2xl sm:size-14 lg:size-16 lg:rounded-[1.125rem]"
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
      </Card>
    </SettingsDetailScreen>
  );
}
