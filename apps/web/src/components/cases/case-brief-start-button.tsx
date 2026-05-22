"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/8bit/button";

type CaseBriefStartButtonProps = {
  startSessionAction: () => Promise<void>;
};

export function CaseBriefStartButton({
  startSessionAction,
}: CaseBriefStartButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="relative z-20 flex justify-center px-3 pb-2 sm:px-4 lg:px-8">
      <Button
        type="button"
        font="retro"
        disabled={isPending}
        className="h-12 w-full max-w-md rounded-[1.125rem] border-2 border-[#3d8a28] bg-gradient-to-b from-[#8ee06a] to-[#5fc93f] text-sm text-white shadow-[0_5px_0_#3d8a28] hover:from-[#82dc62] hover:to-[#55bd38] active:translate-y-0.5 active:shadow-[0_2px_0_#3d8a28] disabled:opacity-70 lg:h-14 lg:max-w-xl lg:text-base"
        onClick={() => {
          startTransition(async () => {
            await startSessionAction();
          });
        }}
      >
        {isPending ? "Memuat..." : "Mulai Konsultasi"}
      </Button>
    </div>
  );
}
