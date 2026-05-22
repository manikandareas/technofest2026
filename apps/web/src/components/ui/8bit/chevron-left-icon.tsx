import { cn } from "@/lib/utils";

type ChevronLeftIconProps = {
  className?: string;
};

/** Pixel chevron-left from the 8bitcn pagination registry. */
export function ChevronLeftIcon({ className }: ChevronLeftIconProps) {
  return (
    <svg
      viewBox="0 0 256 256"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth="0.25"
      className={cn("size-5 sm:size-6", className)}
      aria-hidden
    >
      <rect width="14" height="14" rx="1" transform="matrix(-1 0 0 1 128 136)" />
      <rect width="14" height="14" rx="1" transform="matrix(-1 0 0 1 144 152)" />
      <rect width="14" height="14" rx="1" transform="matrix(-1 0 0 1 160 72)" />
      <rect width="14" height="14" rx="1" transform="matrix(-1 0 0 1 160 168)" />
      <rect width="14" height="14" rx="1" transform="matrix(-1 0 0 1 112 120)" />
      <rect width="14" height="14" rx="1" transform="matrix(-1 0 0 1 128 104)" />
      <rect width="14" height="14" rx="1" transform="matrix(-1 0 0 1 144 88)" />
    </svg>
  );
}
