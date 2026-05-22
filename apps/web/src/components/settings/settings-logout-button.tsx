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
      variant="outline"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await signOutAction();
        });
      }}
      className="h-auto min-h-11 w-full justify-start gap-3 border-destructive/80 bg-card px-4 py-3.5 text-destructive hover:bg-destructive/5 sm:min-h-[2.75rem] sm:px-5 sm:py-4"
    >
      <SettingsMenuIcon icon={LogOut} tone="danger" />
      <span className="text-sm font-semibold leading-tight sm:text-base lg:text-lg">
        {pending ? "Keluar..." : "Keluar dari akun"}
      </span>
    </Button>
  );
}
