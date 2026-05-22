"use client";

import { useActionState } from "react";

import { updateProfileAction } from "@/app/profile/actions";
import { Button } from "@/components/ui/8bit/button";
import { Input } from "@/components/ui/8bit/input";
import { Label } from "@/components/ui/8bit/label";

type AccountNameFormProps = {
  initialName: string;
};

export function AccountNameForm({ initialName }: AccountNameFormProps) {
  const [state, formAction, pending] = useActionState(updateProfileAction, {});

  return (
    <form action={formAction} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="display_name" font="retro" className="text-xs sm:text-sm">
          Nama tampilan
        </Label>
        <Input
          id="display_name"
          name="display_name"
          defaultValue={initialName.replace(/^Dr\.\s*/i, "")}
          maxLength={80}
          autoComplete="name"
          font="retro"
          className="bg-white text-sm sm:text-base"
        />
      </div>

      {state.error ? (
        <p className="text-xs font-semibold text-[#c92a2a] sm:text-sm">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="text-xs font-semibold text-[#2b8a3e] sm:text-sm">
          Profil berhasil diperbarui.
        </p>
      ) : null}

      <Button
        type="submit"
        font="retro"
        disabled={pending}
        className="w-full border-foreground bg-[#228be6] text-white hover:bg-[#1c7ed6]"
      >
        {pending ? "Menyimpan..." : "Simpan Profil"}
      </Button>
    </form>
  );
}
