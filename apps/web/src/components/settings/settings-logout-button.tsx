"use client";

import { useTransition } from "react";

import { signOutAction } from "@/app/profile/actions";
import { SETTINGS_ASSETS } from "@/components/settings/settings-assets";
import { settingsCardClass } from "@/components/settings/settings-styles";

export function SettingsLogoutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await signOutAction();
        });
      }}
      className={`${settingsCardClass} flex w-full items-center gap-3 px-3 py-3 text-left outline-none transition-transform focus-visible:ring-2 focus-visible:ring-[#228be6]/70 active:scale-[0.99] disabled:opacity-60 sm:px-4 sm:py-3.5`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={SETTINGS_ASSETS.iconLogout}
        alt=""
        className="size-8 shrink-0 object-contain pixelated"
        aria-hidden
      />
      <span className="text-sm font-semibold leading-tight sm:text-base">
        {pending ? "Keluar..." : "Keluar"}
      </span>
    </button>
  );
}
