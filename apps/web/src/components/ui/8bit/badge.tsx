import { type VariantProps, cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

import { Badge as ShadcnBadge } from "@/components/ui/base/badge";

const badgeSideVariants = cva("", {
  variants: {
    variant: {
      default: "bg-primary",
      destructive: "bg-destructive",
      outline: "bg-background",
      secondary: "bg-secondary",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface BitBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeSideVariants> {
  font?: "normal" | "retro";
}

function Badge({
  children,
  className,
  font = "normal",
  variant,
  ...props
}: BitBadgeProps) {
  const sideColor = badgeSideVariants({ variant });

  return (
    <div className="relative inline-flex items-stretch">
      <ShadcnBadge
        {...props}
        className={cn(
          "h-full w-full rounded-none",
          font === "retro" && "retro",
          className,
        )}
        variant={variant}
      >
        {children}
      </ShadcnBadge>

      <div
        className={cn("-left-1.5 absolute inset-y-[4px] w-1.5", sideColor)}
        aria-hidden="true"
      />
      <div
        className={cn("-right-1.5 absolute inset-y-[4px] w-1.5", sideColor)}
        aria-hidden="true"
      />
    </div>
  );
}

export { Badge, badgeSideVariants as badgeVariants };
