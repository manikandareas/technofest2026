import { Info, Music, Shield } from "lucide-react";

import {
  SettingsMenuGroup,
  SettingsMenuLink,
  SettingsMenuRow,
} from "@/components/settings/settings-menu-row";
import { SettingsMusicToggle } from "@/components/settings/settings-music-toggle";
import { SettingsLogoutButton } from "@/components/settings/settings-logout-button";
import { SettingsProfileCard } from "@/components/settings/settings-profile-card";
import {
  settingsContentPanelClass,
  settingsSectionClass,
  settingsSectionLabelClass,
} from "@/components/settings/settings-styles";
import {
  SpecialistsScreenLayout,
} from "@/components/specialists/specialists-screen-layout";

type SettingsScreenProps = {
  displayName: string;
  totalXp: number;
  avatarUrl?: string | null;
};

export function SettingsScreen({
  displayName,
  totalXp,
  avatarUrl,
}: SettingsScreenProps) {
  return (
    <SpecialistsScreenLayout
      backHref="/app/home"
      backLabel="Kembali ke home"
      title="PENGATURAN"
    >
      <section className={`${settingsContentPanelClass} flex w-full flex-col gap-5 sm:gap-6`}>
        <div className={settingsSectionClass}>
          <p className={settingsSectionLabelClass}>Akun</p>
          <SettingsProfileCard
            displayName={displayName}
            totalXp={totalXp}
            avatarUrl={avatarUrl}
          />
        </div>

        <div className={settingsSectionClass}>
          <p className={settingsSectionLabelClass}>Preferensi</p>
          <SettingsMenuGroup>
            <SettingsMenuRow
              icon={Music}
              label="Musik latar"
              action={<SettingsMusicToggle />}
            />
          </SettingsMenuGroup>
        </div>

        <div className={settingsSectionClass}>
          <p className={settingsSectionLabelClass}>Privasi & Info</p>
          <SettingsMenuGroup>
            <SettingsMenuLink
              href="/settings/privacy"
              icon={Shield}
              label="Privasi"
              variant="grouped"
            />
            <SettingsMenuLink
              href="/settings/about"
              icon={Info}
              label="Tentang PixelAid"
              variant="grouped"
              withDivider
            />
          </SettingsMenuGroup>
        </div>

        <div className={settingsSectionClass}>
          <p className={settingsSectionLabelClass}>Sesi</p>
          <SettingsLogoutButton />
        </div>
      </section>
    </SpecialistsScreenLayout>
  );
}
