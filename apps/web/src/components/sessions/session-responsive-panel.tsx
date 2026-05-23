"use client";

import { type ReactNode, useState } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/8bit/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/8bit/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/8bit/drawer";
import { useIsDesktop } from "@/lib/use-is-desktop";
import { cn } from "@/lib/utils";

import { SessionDrawerHeader } from "./session-drawer-header";

type SessionResponsivePanelProps = {
  trigger: ReactNode;
  title: string;
  icon: ReactNode;
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  contentClassName?: string;
  bodyClassName?: string;
};

function PanelCloseButton() {
  return (
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
  );
}

export function SessionResponsivePanel({
  trigger,
  title,
  icon,
  children,
  open: controlledOpen,
  onOpenChange,
  contentClassName,
  bodyClassName,
}: SessionResponsivePanelProps) {
  const isDesktop = useIsDesktop();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const header = (
    <SessionDrawerHeader
      icon={icon}
      title={title}
      closeSlot={
        isDesktop ? (
          <DialogClose asChild>
            <PanelCloseButton />
          </DialogClose>
        ) : (
          <DrawerClose asChild>
            <PanelCloseButton />
          </DrawerClose>
        )
      }
    />
  );

  const body = (
    <div className={cn("flex min-h-0 flex-1 flex-col overflow-hidden", bodyClassName)}>
      {children}
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent
          className={cn(
            "flex max-h-[min(88dvh,42rem)] w-[min(92vw,36rem)] flex-col overflow-hidden border-foreground bg-[#eef3ff] p-0",
            contentClassName,
          )}
        >
          <DialogTitle className="sr-only">{title}</DialogTitle>
          {header}
          {body}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent
        className={cn(
          "flex h-[100dvh] max-h-[100dvh] flex-col border-foreground bg-[#eef3ff] px-0 pb-[calc(0.75rem+env(safe-area-inset-bottom))] [&>div:nth-child(2)]:hidden",
          contentClassName,
        )}
      >
        <DrawerTitle className="sr-only">{title}</DrawerTitle>
        {header}
        {body}
      </DrawerContent>
    </Drawer>
  );
}
