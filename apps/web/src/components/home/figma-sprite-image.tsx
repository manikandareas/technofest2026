import { cn } from "@/lib/utils";

type FigmaSpriteImageProps = {
  src: string;
  alt: string;
  className?: string;
  /** Tailwind arbitrary size for the clipping box, e.g. `size-[45px]`. */
  boxClassName?: string;
  widthPercent: number;
  heightPercent: number;
  leftPercent: number;
  topPercent: number;
  priority?: boolean;
};

/** Crops a Figma-exported sprite sheet the same way as the MCP reference layout. */
export function FigmaSpriteImage({
  src,
  alt,
  className,
  boxClassName = "size-full",
  widthPercent,
  heightPercent,
  leftPercent,
  topPercent,
  priority,
}: FigmaSpriteImageProps) {
  return (
    <div className={cn("relative overflow-hidden", boxClassName, className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        className="pointer-events-none absolute max-w-none pixelated"
        style={{
          width: `${widthPercent}%`,
          height: `${heightPercent}%`,
          left: `${leftPercent}%`,
          top: `${topPercent}%`,
        }}
      />
    </div>
  );
}
