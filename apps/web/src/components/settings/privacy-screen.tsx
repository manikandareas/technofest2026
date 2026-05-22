import { SettingsDetailScreen } from "@/components/settings/settings-detail-screen";
import { settingsCardClass } from "@/components/settings/settings-styles";

const PRIVACY_POINTS = [
  "Transkrip konsultasi disimpan untuk progres latihan dan feedback pribadi.",
  "Data profil hanya dipakai untuk personalisasi dan leaderboard.",
  "Akun anonim tidak muncul di leaderboard publik.",
  "PixelAid tidak membagikan data medis simulasi ke pihak ketiga.",
] as const;

export function PrivacyScreen() {
  return (
    <SettingsDetailScreen title="PRIVASI">
      <article className={`${settingsCardClass} space-y-4 px-3 py-4 sm:px-4 sm:py-5`}>
        <p className="retro text-sm leading-relaxed sm:text-base">
          Privasi simulasi PixelAid
        </p>
        <p className="text-xs leading-relaxed text-[#1a233e]/80 sm:text-sm">
          PixelAid dirancang untuk latihan klinis virtual. Informasi yang kamu
          lihat di simulasi bukan rekam medis pasien sungguhan.
        </p>
        <ul className="space-y-2 text-xs leading-relaxed text-[#1a233e]/85 sm:text-sm">
          {PRIVACY_POINTS.map((point) => (
            <li key={point} className="flex gap-2">
              <span aria-hidden className="retro shrink-0 text-[#228be6]">
                •
              </span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </article>
    </SettingsDetailScreen>
  );
}
