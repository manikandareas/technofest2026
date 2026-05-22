"use client";

import { useActionState } from "react";
import { Button, Input, Label } from "@/components/ui/8bit";

type AuthFormProps = {
  mode: "sign-in" | "register" | "upgrade";
  next?: string;
  action: (
    state: { error?: string },
    formData: FormData,
  ) => Promise<{ error?: string }>;
};

export function AuthForm({ mode, next, action }: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-4">
      {next ? <input type="hidden" name="next" value={next} /> : null}
      {mode === "sign-in" ? null : (
        <div className="space-y-2">
          <Label htmlFor="name" font="retro" className="text-[10px] sm:text-xs tracking-wider">Nama</Label>
          <Input id="name" name="name" type="text" required autoComplete="name" />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="email" font="retro" className="text-[10px] sm:text-xs tracking-wider">Email</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      {mode === "upgrade" ? null : (
        <div className="space-y-2">
          <Label htmlFor="password" font="retro" className="text-[10px] sm:text-xs tracking-wider">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
          />
        </div>
      )}
      {state.error ? (
        <p className="text-center text-[10px] sm:text-xs font-bold text-destructive retro leading-relaxed">
          {state.error}
        </p>
      ) : null}
      <Button className="w-full" type="submit" disabled={pending} font="retro">
        {pending
          ? "Memproses..."
          : mode === "sign-in"
            ? "Masuk"
            : mode === "upgrade"
              ? "Upgrade akun"
              : "Daftar"}
      </Button>
    </form>
  );
}
