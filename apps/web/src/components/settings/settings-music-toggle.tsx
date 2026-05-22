"use client";

import { useBgm } from "@/components/audio/bgm-provider";
import { Switch } from "@/components/ui/8bit/switch";

export function SettingsMusicToggle() {
  const { enabled, toggle } = useBgm();

  return (
    <Switch
      checked={enabled}
      onCheckedChange={() => toggle()}
      aria-label={enabled ? "Matikan musik latar" : "Nyalakan musik latar"}
    />
  );
}
