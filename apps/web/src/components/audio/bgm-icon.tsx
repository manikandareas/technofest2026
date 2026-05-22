import { cn } from "@/lib/utils";

type BgmIconProps = {
  enabled: boolean;
  className?: string;
};

/** Pixel-art music note / muted state matching home header trophy icons. */
export function BgmIcon({ enabled, className }: BgmIconProps) {
  if (enabled) {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden
        className={cn("size-6 shrink-0 pixelated", className)}
      >
        <rect x="4" y="14" width="4" height="6" fill="#E8B923" />
        <rect x="10" y="10" width="4" height="10" fill="#E8B923" />
        <rect x="16" y="6" width="4" height="14" fill="#E8B923" />
        <rect x="7" y="4" width="2" height="10" fill="#F5D76E" />
        <rect x="13" y="2" width="2" height="8" fill="#F5D76E" />
        <rect x="19" y="2" width="2" height="4" fill="#F5D76E" />
        <rect x="5" y="12" width="14" height="2" fill="#C99212" />
        <rect x="7" y="2" width="8" height="2" fill="#C99212" />
        <rect x="15" y="2" width="6" height="2" fill="#C99212" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={cn("size-6 shrink-0 pixelated", className)}
    >
      <rect x="4" y="14" width="4" height="6" fill="#8A9BB8" />
      <rect x="10" y="10" width="4" height="10" fill="#8A9BB8" />
      <rect x="16" y="6" width="4" height="14" fill="#8A9BB8" />
      <rect x="7" y="4" width="2" height="10" fill="#A8B5C9" />
      <rect x="13" y="2" width="2" height="8" fill="#A8B5C9" />
      <rect x="19" y="2" width="2" height="4" fill="#A8B5C9" />
      <rect x="3" y="19" width="18" height="2" fill="#E8B923" />
      <rect x="5" y="17" width="2" height="2" fill="#E8B923" />
      <rect x="17" y="17" width="2" height="2" fill="#E8B923" />
    </svg>
  );
}
