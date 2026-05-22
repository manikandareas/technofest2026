import type { ReactNode } from "react";

import {
  SpecialistsScreenLayout,
} from "@/components/specialists/specialists-screen-layout";

import { settingsPanelClass } from "./settings-styles";

type SettingsDetailScreenProps = {
  title: string;
  backHref?: string;
  backLabel?: string;
  children: ReactNode;
};

export function SettingsDetailScreen({
  title,
  backHref = "/profile",
  backLabel = "Kembali ke pengaturan",
  children,
}: SettingsDetailScreenProps) {
  return (
    <SpecialistsScreenLayout
      backHref={backHref}
      backLabel={backLabel}
      title={title}
    >
      <section className={settingsPanelClass}>{children}</section>
    </SpecialistsScreenLayout>
  );
}
