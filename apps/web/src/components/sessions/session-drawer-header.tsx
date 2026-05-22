import type { ReactNode } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/8bit/button";

import { SessionPanelClose } from "./session-responsive-panel";

type SessionDrawerHeaderProps = {
  icon: ReactNode;
  title: string;
};

export function SessionDrawerHeader({ icon, title }: SessionDrawerHeaderProps) {
  return (
    <div className="flex shrink-0 items-center justify-between gap-3 rounded-t-[1.25rem] bg-[#0b1f4f] px-4 py-3 text-white lg:rounded-t-[1rem]">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
          {icon}
        </span>
        <h2 className="retro truncate text-sm sm:text-base">{title}</h2>
      </div>
      <SessionPanelClose>
        <Button
          type="button"
          size="icon"
          variant="secondary"
          font="retro"
          className="size-9 shrink-0 border-transparent bg-[#fa5252] text-white hover:bg-[#e03131]"
          aria-label="Tutup panel"
        >
          <X className="size-4" aria-hidden />
        </Button>
      </SessionPanelClose>
    </div>
  );
}
