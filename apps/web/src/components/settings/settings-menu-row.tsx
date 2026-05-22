import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/8bit/card";
import { Separator } from "@/components/ui/8bit/separator";
import { cn } from "@/lib/utils";

import { SettingsMenuIcon } from "./settings-menu-icon";
import {
  settingsCardContentClass,
  settingsCardLinkClass,
  settingsDetailCardClass,
} from "./settings-styles";

type SettingsMenuLinkProps = {
  href: string;
  icon: LucideIcon;
  label: string;
  showChevron?: boolean;
  tone?: "default" | "danger";
  variant?: "standalone" | "grouped";
  withDivider?: boolean;
  className?: string;
};

function SettingsMenuLinkContent({
  icon,
  label,
  showChevron = true,
  tone = "default",
}: Pick<
  SettingsMenuLinkProps,
  "icon" | "label" | "showChevron" | "tone"
>) {
  return (
    <>
      <SettingsMenuIcon icon={icon} tone={tone} />
      <span
        className={cn(
          "min-w-0 flex-1 text-sm font-semibold leading-tight sm:text-base lg:text-lg",
          tone === "danger" && "text-destructive",
        )}
      >
        {label}
      </span>
      {showChevron ? (
        <ChevronRight
          className="size-5 shrink-0 text-muted-foreground opacity-80"
          aria-hidden
        />
      ) : null}
    </>
  );
}

export function SettingsMenuLink({
  href,
  icon,
  label,
  showChevron = true,
  tone = "default",
  variant = "standalone",
  withDivider = false,
  className,
}: SettingsMenuLinkProps) {
  const row = (
    <div className={settingsCardContentClass}>
      <SettingsMenuLinkContent
        icon={icon}
        label={label}
        showChevron={showChevron}
        tone={tone}
      />
    </div>
  );

  if (variant === "grouped") {
    return (
      <>
        {withDivider ? <Separator /> : null}
        <Link href={href} className={cn(settingsCardLinkClass, className)}>
          {row}
        </Link>
      </>
    );
  }

  return (
    <Link href={href} className={cn(settingsCardLinkClass, className)}>
      <Card font="retro" className={cn(settingsDetailCardClass, "w-full")}>
        <CardContent className="p-0">{row}</CardContent>
      </Card>
    </Link>
  );
}

type SettingsMenuGroupProps = {
  children: ReactNode;
};

export function SettingsMenuGroup({ children }: SettingsMenuGroupProps) {
  return (
    <Card font="retro" className={cn(settingsDetailCardClass, "w-full")}>
      <div className="divide-y divide-border/40">{children}</div>
    </Card>
  );
}

type SettingsMenuRowProps = {
  icon: LucideIcon;
  label: string;
  action: ReactNode;
  withDivider?: boolean;
};

export function SettingsMenuRow({
  icon,
  label,
  action,
  withDivider = false,
}: SettingsMenuRowProps) {
  return (
    <>
      {withDivider ? <Separator /> : null}
      <div className={settingsCardContentClass}>
        <SettingsMenuIcon icon={icon} />
        <span className="min-w-0 flex-1 text-sm font-semibold leading-tight sm:text-base lg:text-lg">
          {label}
        </span>
        <div className="shrink-0">{action}</div>
      </div>
    </>
  );
}
