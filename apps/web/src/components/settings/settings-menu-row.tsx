import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { SPECIALISTS_ASSETS } from "@/components/specialists/specialists-assets";
import { Separator } from "@/components/ui/8bit/separator";
import { cn } from "@/lib/utils";

import { settingsCardClass } from "./settings-styles";

type SettingsMenuLinkProps = {
  href: string;
  iconSrc: string;
  label: string;
  showChevron?: boolean;
  tone?: "default" | "danger";
  className?: string;
};

export function SettingsMenuLink({
  href,
  iconSrc,
  label,
  showChevron = true,
  tone = "default",
  className,
}: SettingsMenuLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        settingsCardClass,
        "flex items-center gap-3 px-3 py-3 outline-none transition-transform focus-visible:ring-2 focus-visible:ring-[#228be6]/70 active:scale-[0.99] sm:px-4 sm:py-3.5",
        className,
      )}
    >
      <Image
        src={iconSrc}
        alt=""
        width={32}
        height={32}
        className="size-8 shrink-0 object-contain pixelated"
        aria-hidden
      />
      <span
        className={cn(
          "min-w-0 flex-1 text-sm font-semibold leading-tight sm:text-base",
          tone === "danger" && "text-[#c92a2a]",
        )}
      >
        {label}
      </span>
      {showChevron ? (
        <Image
          src={SPECIALISTS_ASSETS.iconChevronRight}
          alt=""
          width={20}
          height={24}
          className="size-4 shrink-0 object-contain pixelated opacity-90 sm:size-5"
          aria-hidden
        />
      ) : null}
    </Link>
  );
}

type SettingsMenuGroupProps = {
  children: ReactNode;
};

export function SettingsMenuGroup({ children }: SettingsMenuGroupProps) {
  return (
    <div className={settingsCardClass}>
      {children}
    </div>
  );
}

type SettingsMenuRowProps = {
  iconSrc: string;
  label: string;
  action: ReactNode;
  withDivider?: boolean;
};

export function SettingsMenuRow({
  iconSrc,
  label,
  action,
  withDivider = false,
}: SettingsMenuRowProps) {
  return (
    <>
      {withDivider ? <Separator className="bg-[#d8dee9]" /> : null}
      <div className="flex items-center gap-3 px-3 py-3 sm:px-4 sm:py-3.5">
        <Image
          src={iconSrc}
          alt=""
          width={32}
          height={32}
          className="size-8 shrink-0 object-contain pixelated"
          aria-hidden
        />
        <span className="min-w-0 flex-1 text-sm font-semibold leading-tight sm:text-base">
          {label}
        </span>
        <div className="shrink-0">{action}</div>
      </div>
    </>
  );
}
