"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { HOME_ASSETS } from "@/components/home/home-assets";
import { FigmaSpriteImage } from "@/components/home/figma-sprite-image";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    href: "/app/home",
    label: "Home",
    iconSrc: HOME_ASSETS.navIconHome,
    sprite: false as const,
  },
  {
    href: "/history",
    label: "History",
    iconSrc: HOME_ASSETS.navIconHistory,
    sprite: true as const,
    spriteProps: {
      widthPercent: 130.23,
      heightPercent: 196.87,
      leftPercent: -18.85,
      topPercent: -24.69,
    },
  },
  {
    href: "/profile",
    label: "Setting",
    iconSrc: HOME_ASSETS.navIconSetting,
    sprite: false as const,
  },
] as const;

function NavIcon({
  src,
  sprite,
  spriteProps,
}: {
  src: string;
  sprite: boolean;
  spriteProps?: {
    widthPercent: number;
    heightPercent: number;
    leftPercent: number;
    topPercent: number;
  };
}) {
  if (sprite && spriteProps) {
    return (
      <FigmaSpriteImage
        src={src}
        alt=""
        boxClassName="size-[2.375rem] lg:size-12"
        {...spriteProps}
      />
    );
  }

  return (
    <Image
      src={src}
      alt=""
      width={50}
      height={50}
      className="size-[2.375rem] object-contain pixelated lg:size-12"
      aria-hidden
    />
  );
}

export function AppBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-0 bottom-0 z-30 bg-[#101f3f] pb-[calc(env(safe-area-inset-bottom)+0.25rem)] lg:pb-[calc(env(safe-area-inset-bottom)+1rem)]"
    >
      <div className="relative mx-auto grid h-[3.625rem] max-w-[393px] grid-cols-3 md:max-w-xl lg:h-[4.5rem] lg:max-w-2xl">
        {NAV_ITEMS.map((item) => {
          const { href, label, iconSrc, sprite } = item;
          const active =
            href === "/app/home"
              ? pathname === "/app/home" ||
                pathname === "/app" ||
                pathname.startsWith("/app/specialists")
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex flex-col items-center justify-end gap-0 px-2 pb-1 pt-1.5 transition-colors lg:gap-1 lg:pb-2 lg:pt-2",
                active && "bg-[#033676]",
              )}
            >
              <NavIcon
                src={iconSrc}
                sprite={sprite}
                spriteProps={"spriteProps" in item ? item.spriteProps : undefined}
              />
              <span className="retro text-[10px] leading-none text-white lg:text-[0.8125rem]">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
