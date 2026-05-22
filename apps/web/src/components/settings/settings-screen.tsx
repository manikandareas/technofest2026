import {
  SettingsMenuGroup,
  SettingsMenuLink,
  SettingsMenuRow,
} from "@/components/settings/settings-menu-row";
import { SettingsMusicToggle } from "@/components/settings/settings-music-toggle";
import { SettingsLogoutButton } from "@/components/settings/settings-logout-button";
import { SettingsProfileCard } from "@/components/settings/settings-profile-card";
import { SETTINGS_ASSETS } from "@/components/settings/settings-assets";
import {
  settingsPanelClass,
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
      title="SETTING"
    >
      <section className={settingsPanelClass}>
        <div className="space-y-2">
          <p className={settingsSectionLabelClass}>Akun</p>
          <SettingsProfileCard
            displayName={displayName}
            totalXp={totalXp}
            avatarUrl={avatarUrl}
          />
        </div>

        <div className="space-y-2">
          <p className={settingsSectionLabelClass}>Pengaturan</p>
          <SettingsMenuGroup>
            <SettingsMenuLink
              href="/profile/privacy"
              iconSrc={SETTINGS_ASSETS.iconPrivacy}
              label="Privasi"
            />
            <SettingsMenuRow
              iconSrc={SETTINGS_ASSETS.iconMusic}
              label="Musik"
              action={<SettingsMusicToggle />}
              withDivider
            />
          </SettingsMenuGroup>
        </div>

        <div className="space-y-2">
          <p className={settingsSectionLabelClass}>Lainnya</p>
          <SettingsMenuLink
            href="/profile/about"
            iconSrc={SETTINGS_ASSETS.iconAbout}
            label="Tentang"
            showChevron={false}
          />
        </div>

        <SettingsLogoutButton />
      </section>
    </SpecialistsScreenLayout>
  );
}
