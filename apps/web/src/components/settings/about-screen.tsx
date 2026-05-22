import Image from "next/image";

import { SettingsDetailScreen } from "@/components/settings/settings-detail-screen";
import { SETTINGS_ASSETS } from "@/components/settings/settings-assets";
import { settingsCardClass } from "@/components/settings/settings-styles";

export function AboutScreen() {
  return (
    <SettingsDetailScreen title="TENTANG">
      <article className={`${settingsCardClass} space-y-4 px-3 py-4 sm:px-4 sm:py-5`}>
        <div className="flex items-center gap-3">
          <Image
            src={SETTINGS_ASSETS.iconAbout}
            alt=""
            width={48}
            height={48}
            className="size-12 shrink-0 object-contain pixelated"
            aria-hidden
          />
          <div className="space-y-1">
            <p className="retro text-sm leading-tight sm:text-base">PixelAid</p>
            <p className="text-xs leading-snug text-[#1a233e]/70 sm:text-sm">
              Simulasi dokter virtual berbasis suara
            </p>
          </div>
        </div>

        <p className="text-xs leading-relaxed text-[#1a233e]/85 sm:text-sm">
          PixelAid membantu mahasiswa kedokteran berlatih anamnesis, pemeriksaan,
          dan diagnosis melalui kasus interaktif dengan pasien virtual.
        </p>

        <div className="rounded-[1rem] border-2 border-[#d8dee9] bg-[#f8f9fb] px-3 py-3 text-xs leading-relaxed text-[#1a233e]/80 sm:text-sm">
          <p className="font-semibold">Hackathon UMKT 2026</p>
          <p className="mt-1">Versi demo TechnoFest 2026</p>
        </div>
      </article>
    </SettingsDetailScreen>
  );
}
