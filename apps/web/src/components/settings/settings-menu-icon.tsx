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
        "flex size-9 shrink-0 items-center justify-center rounded-none border border-primary/10 sm:size-10",
        tone === "default" && "bg-secondary/20 text-foreground",
        tone === "danger" && "bg-destructive/10 text-destructive border-destructive/20",
        tone === "primary" && "bg-primary/15 text-primary border-primary/25",
        className,
      )}
      aria-hidden
    >
      <Icon className="size-5 stroke-[2.5]" />
    </span>
  );
}
