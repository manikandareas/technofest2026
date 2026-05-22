import * as React from "react";

import { cn } from "@/lib/utils";

import { Button as ShadcnButton } from "@/components/ui/base/button";

export interface BitButtonProps extends React.ComponentProps<typeof ShadcnButton> {
  font?: "normal" | "retro";
}

function PixelBorder({
  variant,
  size,
}: {
  variant?: BitButtonProps["variant"];
  size?: BitButtonProps["size"];
}) {
  if (variant === "ghost" || variant === "link") return null;

  if (size === "icon") {
    return (
      <>
        <div className="pointer-events-none absolute top-0 left-0 h-[5px] w-full bg-foreground md:h-1.5 dark:bg-ring" />
        <div className="pointer-events-none absolute bottom-0 h-[5px] w-full bg-foreground md:h-1.5 dark:bg-ring" />
        <div className="pointer-events-none absolute top-1 -left-1 h-1/2 w-[5px] bg-foreground md:w-1.5 dark:bg-ring" />
        <div className="pointer-events-none absolute bottom-1 -left-1 h-1/2 w-[5px] bg-foreground md:w-1.5 dark:bg-ring" />
        <div className="pointer-events-none absolute top-1 -right-1 h-1/2 w-[5px] bg-foreground md:w-1.5 dark:bg-ring" />
        <div className="pointer-events-none absolute bottom-1 -right-1 h-1/2 w-[5px] bg-foreground md:w-1.5 dark:bg-ring" />
      </>
    );
  }

  return (
    <>
      <div className="pointer-events-none absolute -top-1.5 left-1.5 h-1.5 w-1/2 bg-foreground dark:bg-ring" />
      <div className="pointer-events-none absolute -top-1.5 right-1.5 h-1.5 w-1/2 bg-foreground dark:bg-ring" />
      <div className="pointer-events-none absolute -bottom-1.5 left-1.5 h-1.5 w-1/2 bg-foreground dark:bg-ring" />
      <div className="pointer-events-none absolute -bottom-1.5 right-1.5 h-1.5 w-1/2 bg-foreground dark:bg-ring" />
      <div className="pointer-events-none absolute top-0 left-0 size-1.5 bg-foreground dark:bg-ring" />
      <div className="pointer-events-none absolute top-0 right-0 size-1.5 bg-foreground dark:bg-ring" />
      <div className="pointer-events-none absolute bottom-0 left-0 size-1.5 bg-foreground dark:bg-ring" />
      <div className="pointer-events-none absolute bottom-0 right-0 size-1.5 bg-foreground dark:bg-ring" />
      <div className="pointer-events-none absolute top-1.5 -left-1.5 h-[calc(100%-12px)] w-1.5 bg-foreground dark:bg-ring" />
      <div className="pointer-events-none absolute top-1.5 -right-1.5 h-[calc(100%-12px)] w-1.5 bg-foreground dark:bg-ring" />
      {variant !== "outline" && (
        <>
          <div className="pointer-events-none absolute top-0 left-0 h-1.5 w-full bg-foreground/20" />
          <div className="pointer-events-none absolute top-1.5 left-0 h-1.5 w-3 bg-foreground/20" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-1.5 w-full bg-foreground/20" />
          <div className="pointer-events-none absolute bottom-1.5 right-0 h-1.5 w-3 bg-foreground/20" />
        </>
      )}
    </>
  );
}

const Button = React.forwardRef<HTMLButtonElement, BitButtonProps>(function Button(
  { children, asChild, className, font = "normal", variant, size, ...props },
  ref,
) {
  const sharedClassName = cn(
    "rounded-none active:translate-y-1 transition-transform relative inline-flex items-center justify-center gap-1.5 border-none",
    size === "icon" && "mx-1 my-0",
    font === "retro" && "retro",
    className,
  );

  if (asChild && React.isValidElement(children)) {
    type ChildProps = { className?: string; children?: React.ReactNode };
    const child = children as React.ReactElement<ChildProps>;

    return (
      <ShadcnButton
        {...props}
        ref={ref}
        asChild
        className={sharedClassName}
        size={size}
        variant={variant}
      >
        {React.cloneElement(child, {
          className: cn(
            "relative inline-flex items-center justify-center gap-1.5",
            child.props.className,
          ),
          children: (
            <>
              {child.props.children}
              <PixelBorder variant={variant} size={size} />
            </>
          ),
        })}
      </ShadcnButton>
    );
  }

  return (
    <ShadcnButton
      {...props}
      ref={ref}
      className={sharedClassName}
      size={size}
      variant={variant}
      asChild={asChild}
    >
      <>
        {children}
        <PixelBorder variant={variant} size={size} />
      </>
    </ShadcnButton>
  );
});

export { Button };
