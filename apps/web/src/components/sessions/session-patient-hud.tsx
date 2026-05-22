import Image from "next/image";

import { resolvePatientAvatar } from "@/components/cases/cases-assets";

type SessionPatientHudProps = {
  patientName: string;
  patientAge: number;
  conditionBadge: string;
  avatarUrl?: string | null;
};

export function SessionPatientHud({
  patientName,
  patientAge,
  conditionBadge,
  avatarUrl,
}: SessionPatientHudProps) {
  const avatarSrc = resolvePatientAvatar(patientName, avatarUrl);

  return (
    <div className="flex min-w-0 max-w-[min(100%,14rem)] items-center gap-2 rounded-[1rem] border-2 border-white/20 bg-[rgba(0,24,61,0.58)] px-2 py-1.5 text-white shadow-[2px_2px_0_rgba(0,0,0,0.35)] backdrop-blur-sm sm:max-w-[16rem] sm:gap-2.5 sm:px-2.5 sm:py-2">
      <div className="relative size-10 shrink-0 overflow-hidden rounded-xl border border-white/20 bg-[#eef3ff] sm:size-11">
        <Image
          src={avatarSrc}
          alt=""
          fill
          className="object-cover object-center pixelated"
          sizes="44px"
        />
      </div>
      <div className="min-w-0">
        <p className="retro truncate text-[0.6875rem] leading-tight sm:text-xs">
          {patientName}, {patientAge} th
        </p>
        <p className="truncate text-[0.625rem] font-semibold leading-snug text-white/85 sm:text-[0.6875rem]">
          {conditionBadge}
        </p>
      </div>
    </div>
  );
}
