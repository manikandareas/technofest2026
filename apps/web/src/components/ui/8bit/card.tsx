import type * as React from "react";

import { cn } from "@/lib/utils";

import {
  Card as ShadcnCard,
  CardAction as ShadcnCardAction,
  CardContent as ShadcnCardContent,
  CardDescription as ShadcnCardDescription,
  CardFooter as ShadcnCardFooter,
  CardHeader as ShadcnCardHeader,
  CardTitle as ShadcnCardTitle,
} from "@/components/ui/base/card";

export interface BitCardProps extends React.ComponentProps<"div"> {
  font?: "normal" | "retro";
}

function Card({ className, font = "normal", ...props }: BitCardProps) {
  return (
    <div
      className={cn(
        "relative border-y-6 border-foreground bg-card p-0! text-card-foreground dark:border-ring",
        className,
      )}
    >
      <ShadcnCard
        {...props}
        className={cn(
          "flex h-full w-full! flex-col rounded-none border-0 bg-card text-card-foreground shadow-none",
          font === "retro" && "retro",
        )}
      />

      <div
        className="pointer-events-none absolute inset-0 -mx-1.5 border-x-6 border-inherit"
        aria-hidden="true"
      />
    </div>
  );
}

function CardHeader({ className, font = "normal", ...props }: BitCardProps) {
  return (
    <ShadcnCardHeader
      className={cn(font === "retro" && "retro", className)}
      {...props}
    />
  );
}

function CardTitle({ className, font = "normal", ...props }: BitCardProps) {
  return (
    <ShadcnCardTitle
      className={cn(font === "retro" && "retro", className)}
      {...props}
    />
  );
}

function CardDescription({ className, font = "normal", ...props }: BitCardProps) {
  return (
    <ShadcnCardDescription
      className={cn(font === "retro" && "retro", className)}
      {...props}
    />
  );
}

function CardAction({ className, font = "normal", ...props }: BitCardProps) {
  return (
    <ShadcnCardAction
      className={cn(font === "retro" && "retro", className)}
      {...props}
    />
  );
}

function CardContent({ className, font = "normal", ...props }: BitCardProps) {
  return (
    <ShadcnCardContent
      className={cn("flex-1", font === "retro" && "retro", className)}
      {...props}
    />
  );
}

function CardFooter({ className, font = "normal", ...props }: BitCardProps) {
  return (
    <ShadcnCardFooter
      data-slot="card-footer"
      className={cn(font === "retro" && "retro", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
