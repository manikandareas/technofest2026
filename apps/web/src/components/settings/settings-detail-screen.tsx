import type { ReactNode } from "react";

import {
  SpecialistsScreenLayout,
} from "@/components/specialists/specialists-screen-layout";

import {
  settingsContentPanelClass,
  settingsDetailStackClass,
} from "./settings-styles";

type SettingsDetailScreenProps = {
  title: string;
  backHref?: string;
  backLabel?: string;
  children: ReactNode;
};

export function SettingsDetailScreen({
  title,
  backHref = "/settings",
  backLabel = "Kembali ke pengaturan",
  children,
}: SettingsDetailScreenProps) {
  return (
    <SpecialistsScreenLayout
      backHref={backHref}
      backLabel={backLabel}
      title={title}
    >
      <section className={`${settingsContentPanelClass} ${settingsDetailStackClass}`}>
        {children}
      </section>
    </SpecialistsScreenLayout>
  );
}
