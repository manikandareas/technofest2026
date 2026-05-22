"use client";

import { useBgm } from "@/components/audio/bgm-provider";
import { cn } from "@/lib/utils";

export function SettingsMusicToggle() {
  const { enabled, toggle } = useBgm();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={enabled ? "Matikan musik latar" : "Nyalakan musik latar"}
      onClick={toggle}
      className={cn(
        "relative h-7 w-12 shrink-0 rounded-full border-2 border-foreground transition-colors",
        enabled ? "bg-[#228be6]" : "bg-[#ced4da]",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute top-0.5 size-5 rounded-full border-2 border-foreground bg-white transition-transform",
          enabled ? "translate-x-[1.35rem]" : "translate-x-0.5",
        )}
      />
    </button>
  );
}
