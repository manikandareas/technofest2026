import { cn } from "@/lib/utils";

type IconProps = {
  className?: string;
};

export function PixelStarIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className={cn("size-4 shrink-0 pixelated", className)}
    >
      <rect x="7" y="1" width="2" height="3" fill="#FACC15" />
      <rect x="6" y="4" width="4" height="2" fill="#FACC15" />
      <rect x="5" y="6" width="6" height="2" fill="#FACC15" />
      <rect x="1" y="7" width="3" height="2" fill="#FACC15" />
      <rect x="12" y="7" width="3" height="2" fill="#FACC15" />
      <rect x="3" y="9" width="2" height="3" fill="#EAB308" />
      <rect x="11" y="9" width="2" height="3" fill="#EAB308" />
      <rect x="5" y="10" width="2" height="3" fill="#EAB308" />
      <rect x="9" y="10" width="2" height="3" fill="#EAB308" />
      <rect x="7" y="8" width="2" height="2" fill="#FDE047" />
    </svg>
  );
}

export function PixelTrophyIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className={cn("size-4 shrink-0 pixelated", className)}
    >
      <rect x="4" y="1" width="8" height="2" fill="#FACC15" />
      <rect x="3" y="3" width="10" height="2" fill="#FBBF24" />
      <rect x="4" y="5" width="8" height="3" fill="#F59E0B" />
      <rect x="1" y="4" width="2" height="4" fill="#FBBF24" />
      <rect x="13" y="4" width="2" height="4" fill="#FBBF24" />
      <rect x="6" y="8" width="4" height="2" fill="#D97706" />
      <rect x="5" y="10" width="6" height="2" fill="#B45309" />
      <rect x="4" y="12" width="8" height="2" fill="#92400E" />
    </svg>
  );
}

export function PixelHomeIcon({ className, active }: IconProps & { active?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn("size-7 shrink-0 pixelated", className)}
    >
      <rect x="10" y="4" width="4" height="4" fill={active ? "#93C5FD" : "#FFFFFF"} />
      <rect x="6" y="8" width="4" height="4" fill={active ? "#93C5FD" : "#FFFFFF"} />
      <rect x="14" y="8" width="4" height="4" fill={active ? "#93C5FD" : "#FFFFFF"} />
      <rect x="4" y="12" width="16" height="4" fill={active ? "#60A5FA" : "#E5E7EB"} />
      <rect x="6" y="16" width="12" height="6" fill={active ? "#3B82F6" : "#FFFFFF"} />
      <rect x="10" y="18" width="4" height="4" fill={active ? "#1E3A8A" : "#1E293B"} />
    </svg>
  );
}

export function PixelHistoryIcon({ className, active }: IconProps & { active?: boolean }) {
  const fill = active ? "#93C5FD" : "#FFFFFF";
  const accent = active ? "#60A5FA" : "#E5E7EB";
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn("size-7 shrink-0 pixelated", className)}
    >
      <rect x="5" y="3" width="14" height="18" fill={accent} />
      <rect x="7" y="5" width="10" height="2" fill={fill} />
      <rect x="7" y="9" width="10" height="2" fill={fill} />
      <rect x="7" y="13" width="7" height="2" fill={fill} />
      <rect x="14" y="15" width="5" height="5" fill="#1E293B" />
      <rect x="15" y="16" width="3" height="1" fill={fill} />
      <rect x="16" y="17" width="1" height="2" fill={fill} />
    </svg>
  );
}

export function PixelSettingsIcon({ className, active }: IconProps & { active?: boolean }) {
  const fill = active ? "#93C5FD" : "#FFFFFF";
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn("size-7 shrink-0 pixelated", className)}
    >
      <rect x="9" y="2" width="6" height="3" fill={fill} />
      <rect x="7" y="5" width="3" height="3" fill={fill} />
      <rect x="14" y="5" width="3" height="3" fill={fill} />
      <rect x="5" y="8" width="3" height="3" fill={fill} />
      <rect x="16" y="8" width="3" height="3" fill={fill} />
      <rect x="8" y="8" width="8" height="8" fill={active ? "#60A5FA" : "#E5E7EB"} />
      <rect x="10" y="10" width="4" height="4" fill="#1E293B" />
      <rect x="7" y="16" width="3" height="3" fill={fill} />
      <rect x="14" y="16" width="3" height="3" fill={fill} />
      <rect x="9" y="19" width="6" height="3" fill={fill} />
    </svg>
  );
}
