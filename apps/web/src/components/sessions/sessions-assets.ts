import { CASES_ASSETS } from "@/components/cases/cases-assets";

/** Static assets for consultation room (Figma node 40:3). */
export const SESSIONS_ASSETS = {
  iconStopwatch: CASES_ASSETS.iconStopwatch,
} as const;

export function formatSessionClock(remainingSeconds: number): string {
  const minutes = Math.floor(Math.max(remainingSeconds, 0) / 60);
  const seconds = String(Math.max(remainingSeconds, 0) % 60).padStart(2, "0");
  return `${String(minutes).padStart(2, "0")}.${seconds}`;
}

export const sessionToolbarIconButtonClass =
  "h-auto min-h-10 w-full flex-row items-center justify-center gap-1 border-transparent bg-[rgba(0,24,61,0.55)] px-1.5 py-2 text-white drop-shadow-[1px_1px_0_#000] hover:bg-[rgba(0,24,61,0.72)] sm:gap-1.5 sm:px-2 [&_svg]:size-4 [&_svg]:shrink-0 sm:[&_svg]:size-[1.125rem]";

export const sessionHeaderIconButtonClass =
  "size-9 shrink-0 border-transparent bg-white/90 text-[#1a233e] drop-shadow-[1px_1px_0_#000] hover:bg-white sm:size-10";
