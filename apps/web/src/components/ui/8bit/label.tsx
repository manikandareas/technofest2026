import type * as React from "react";

import { cn } from "@/lib/utils";

import { Label as ShadcnLabel } from "@/components/ui/base/label";

export interface BitLabelProps extends React.ComponentProps<typeof ShadcnLabel> {
  font?: "normal" | "retro";
}

function Label({ className, font = "normal", ...props }: BitLabelProps) {
  return (
    <ShadcnLabel
      className={cn(font === "retro" && "retro", className)}
      {...props}
    />
  );
}

export { Label };
