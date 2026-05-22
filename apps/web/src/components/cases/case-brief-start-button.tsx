"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/8bit/button";

type CaseBriefStartButtonProps = {
  startSessionAction: () => Promise<void | { error?: string }>;
};

export function CaseBriefStartButton({
  startSessionAction,
}: CaseBriefStartButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="relative z-20 flex flex-col items-center gap-2 px-3 pb-2 sm:px-4 lg:px-8">
      <Button
        type="button"
        font="retro"
        disabled={isPending}
        className="h-12 w-full max-w-md rounded-[1.125rem] border-2 border-[#3d8a28] bg-gradient-to-b from-[#8ee06a] to-[#5fc93f] text-sm text-white shadow-[0_5px_0_#3d8a28] hover:from-[#82dc62] hover:to-[#55bd38] active:translate-y-0.5 active:shadow-[0_2px_0_#3d8a28] disabled:opacity-70 lg:h-14 lg:max-w-xl lg:text-base"
        onClick={() => {
          setError(null);
          startTransition(async () => {
            try {
              const result = await startSessionAction();
              if (result?.error) {
                setError(result.error);
              }
            } catch (caught) {
              setError(
                caught instanceof Error
                  ? caught.message
                  : "Konsultasi belum bisa dimulai. Coba lagi.",
              );
            }
          });
        }}
      >
        {isPending ? "Memuat..." : "Mulai Konsultasi"}
      </Button>
      {error ? (
        <p className="max-w-md rounded-xl border border-destructive/40 bg-background/95 px-3 py-2 text-center text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
