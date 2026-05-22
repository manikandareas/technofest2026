import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type SettingsMenuIconProps = {
  icon: LucideIcon;
  tone?: "default" | "danger" | "primary";
  className?: string;
};

export function SettingsMenuIcon({
  icon: Icon,
  tone = "default",
  className,
}: SettingsMenuIconProps) {
  return (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-lg sm:size-10",
        tone === "default" && "bg-[#eef1f6] text-foreground",
        tone === "danger" && "bg-destructive/10 text-destructive",
        tone === "primary" && "bg-primary/10 text-primary",
        className,
      )}
      aria-hidden
    >
      <Icon className="size-5 stroke-[2.5]" />
    </span>
  );
}
