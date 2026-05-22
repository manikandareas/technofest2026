"use client";

import type { ReactNode } from "react";
import { useId } from "react";

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

type SessionResponsivePanelProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  hideTrigger?: boolean;
  title: string;
  children: ReactNode;
  size?: "default" | "detail";
  contentClassName?: string;
  bodyClassName?: string;
};

export const sessionMobileDrawerClassName =
  "flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden rounded-none border-foreground bg-[#eef3ff] p-0 shadow-none [&>div:nth-child(2)]:hidden";

export const sessionDesktopDialogClassName =
  "flex max-h-[min(88dvh,42rem)] w-[min(92vw,32rem)] flex-col overflow-hidden border-foreground bg-[#eef3ff] p-0";

export const sessionDesktopDetailDialogClassName =
  "flex max-h-[min(90dvh,44rem)] w-[min(92vw,40rem)] flex-col overflow-hidden border-foreground bg-[#eef3ff] p-0";

const desktopClassBySize = {
  default: sessionDesktopDialogClassName,
  detail: sessionDesktopDetailDialogClassName,
} as const;

export function SessionResponsivePanel({
  open,
  onOpenChange,
  trigger,
  hideTrigger = false,
  title,
  children,
  size = "default",
  contentClassName,
  bodyClassName,
}: SessionResponsivePanelProps) {
  const isDesktop = useIsDesktop();
  const titleId = useId();
  const desktopClassName = desktopClassBySize[size];

  const panelBody = (
    <div className={cn("flex min-h-0 flex-1 flex-col overflow-hidden", bodyClassName)}>
      {children}
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        {!hideTrigger && trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
        <DialogContent className={cn(desktopClassName, contentClassName)}>
          <DialogTitle id={titleId} className="sr-only">
            {title}
          </DialogTitle>
          {panelBody}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      {!hideTrigger && trigger ? <DrawerTrigger asChild>{trigger}</DrawerTrigger> : null}
      <DrawerContent className={cn(sessionMobileDrawerClassName, contentClassName)}>
        <DrawerTitle id={titleId} className="sr-only">
          {title}
        </DrawerTitle>
        {panelBody}
      </DrawerContent>
    </Drawer>
  );
}

export function SessionPanelClose({ children }: { children: React.ReactElement }) {
  const isDesktop = useIsDesktop();

  if (isDesktop) {
    return <DialogClose asChild>{children}</DialogClose>;
  }

  return <DrawerClose asChild>{children}</DrawerClose>;
}
