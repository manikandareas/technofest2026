"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import {
  PixelHistoryIcon,
  PixelHomeIcon,
  PixelSettingsIcon,
} from "@/components/home/pixel-icons";

const NAV_ITEMS = [
  { href: "/app/home", label: "Home", icon: PixelHomeIcon },
  { href: "/history", label: "History", icon: PixelHistoryIcon },
  { href: "/profile", label: "Setting", icon: PixelSettingsIcon },
] as const;

export function AppBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-0 bottom-0 z-30 border-t-4 border-black bg-[#1a2744] pb-[env(safe-area-inset-bottom)]"
    >
      <div className="mx-auto grid max-w-md grid-cols-3 md:max-w-xl lg:max-w-2xl">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/app/home"
              ? pathname === "/app/home" || pathname === "/app"
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 px-2 py-3 transition-colors lg:gap-1.5 lg:py-4",
                active && "bg-[#243556]",
              )}
            >
              <Icon active={active} className="lg:size-8" />
              <span
                className={cn(
                  "retro text-[10px] leading-none text-white lg:text-xs",
                  active && "text-[#93C5FD]",
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
