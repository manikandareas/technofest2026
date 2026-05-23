import type { ReactNode } from "react";

type SessionDrawerHeaderProps = {
  icon: ReactNode;
  title: string;
  closeSlot: ReactNode;
};

export function SessionDrawerHeader({ icon, title, closeSlot }: SessionDrawerHeaderProps) {
  return (
    <div className="flex shrink-0 items-center justify-between gap-3 bg-[#0b1f4f] px-4 py-3 text-white">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
          {icon}
        </span>
        <h2 className="retro truncate text-sm sm:text-base">{title}</h2>
      </div>
      {closeSlot}
    </div>
  );
}
