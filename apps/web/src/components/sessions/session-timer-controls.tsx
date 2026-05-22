"use client";

import Image from "next/image";
import { Pause, Play } from "lucide-react";

import { Button } from "@/components/ui/8bit/button";

import {
  SESSIONS_ASSETS,
  formatSessionClock,
  sessionHeaderIconButtonClass,
} from "./sessions-assets";

type SessionTimerControlsProps = {
  remainingSeconds: number;
  shouldWarnTime: boolean;
  isPaused: boolean;
  showPauseControl: boolean;
  disabled: boolean;
  isPending: boolean;
  onPause: () => void;
  onResume: () => void;
};

export function SessionTimerControls({
  remainingSeconds,
  shouldWarnTime,
  isPaused,
  showPauseControl,
  disabled,
  isPending,
  onPause,
  onResume,
}: SessionTimerControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={
          shouldWarnTime
            ? "flex h-10 items-center gap-1.5 rounded-[0.875rem] border-2 border-[#fa5252]/40 bg-[rgba(0,24,61,0.58)] px-2.5 font-mono text-sm text-[#fa5252] shadow-[2px_2px_0_rgba(0,0,0,0.35)] sm:h-11 sm:px-3 sm:text-base"
            : "flex h-10 items-center gap-1.5 rounded-[0.875rem] border-2 border-white/20 bg-[rgba(0,24,61,0.58)] px-2.5 font-mono text-sm text-white shadow-[2px_2px_0_rgba(0,0,0,0.35)] sm:h-11 sm:px-3 sm:text-base"
        }
      >
        <Image
          src={SESSIONS_ASSETS.iconStopwatch}
          alt=""
          width={16}
          height={16}
          className="size-4 object-contain pixelated"
          aria-hidden
        />
        {formatSessionClock(remainingSeconds)}
      </div>

      {showPauseControl ? (
        isPaused ? (
          <Button
            type="button"
            size="icon"
            variant="secondary"
            font="retro"
            className={sessionHeaderIconButtonClass}
            disabled={isPending}
            aria-label="Lanjutkan konsultasi"
            onClick={onResume}
          >
            <Play className="size-4" aria-hidden />
          </Button>
        ) : (
          <Button
            type="button"
            size="icon"
            variant="secondary"
            font="retro"
            className={sessionHeaderIconButtonClass}
            disabled={isPending || disabled || remainingSeconds <= 0}
            aria-label="Jeda konsultasi"
            onClick={onPause}
          >
            <Pause className="size-4" aria-hidden />
          </Button>
        )
      ) : null}
    </div>
  );
}
