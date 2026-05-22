"use client";

import { LogOut } from "lucide-react";
import { useTransition } from "react";

import { signOutAction } from "@/app/settings/actions";
import { SettingsMenuIcon } from "@/components/settings/settings-menu-icon";
import { Button } from "@/components/ui/8bit/button";

export function SettingsLogoutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      font="retro"
      variant="ghost"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await signOutAction();
        });
      }}
      className="group relative h-auto min-h-11 w-full justify-start gap-3 rounded-none bg-card px-4 py-3.5 text-destructive transition-colors hover:bg-destructive/5 sm:min-h-[2.75rem] sm:px-5 sm:py-4 active:translate-y-0.5"
    >
      {/* Pixel destructive borders */}
      <div className="pointer-events-none absolute -top-1 left-1 h-1 w-1/2 bg-destructive/60 transition-colors group-hover:bg-destructive" />
      <div className="pointer-events-none absolute -top-1 right-1 h-1 w-1/2 bg-destructive/60 transition-colors group-hover:bg-destructive" />
      <div className="pointer-events-none absolute -bottom-1 left-1 h-1 w-1/2 bg-destructive/60 transition-colors group-hover:bg-destructive" />
      <div className="pointer-events-none absolute -bottom-1 right-1 h-1 w-1/2 bg-destructive/60 transition-colors group-hover:bg-destructive" />
      <div className="pointer-events-none absolute top-0 left-0 size-1 bg-destructive/60 transition-colors group-hover:bg-destructive" />
      <div className="pointer-events-none absolute top-0 right-0 size-1 bg-destructive/60 transition-colors group-hover:bg-destructive" />
      <div className="pointer-events-none absolute bottom-0 left-0 size-1 bg-destructive/60 transition-colors group-hover:bg-destructive" />
      <div className="pointer-events-none absolute bottom-0 right-0 size-1 bg-destructive/60 transition-colors group-hover:bg-destructive" />
      <div className="pointer-events-none absolute top-1 -left-1 h-[calc(100%-8px)] w-1 bg-destructive/60 transition-colors group-hover:bg-destructive" />
      <div className="pointer-events-none absolute top-1 -right-1 h-[calc(100%-8px)] w-1 bg-destructive/60 transition-colors group-hover:bg-destructive" />

      <SettingsMenuIcon icon={LogOut} tone="danger" className="relative z-10" />
      <span className="relative z-10 text-sm font-semibold leading-tight sm:text-base lg:text-lg">
        {pending ? "Keluar..." : "Keluar dari akun"}
      </span>
    </Button>
  );
}
