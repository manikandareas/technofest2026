import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

import { HOME_ASSETS } from "./home-assets";

const FRAME_COUNT = 5;
const SPRITE_SHEET_WIDTH = 763;
const SPRITE_SHEET_HEIGHT = 327;
const SPRITE_FRAME_WIDTH = SPRITE_SHEET_WIDTH / FRAME_COUNT;

type SpriteStyle = CSSProperties & {
  "--doctor-character-sprite-image": string;
  "--doctor-sprite-frame-width": string;
  "--doctor-sprite-frame-height": string;
  "--doctor-sprite-sheet-width": string;
  "--doctor-sprite-sheet-height": string;
};

type DoctorCharacterSpriteProps = {
  className?: string;
  /** Apply drop shadow matching the static home character. */
  withShadow?: boolean;
};

export function DoctorCharacterSprite({
  className,
  withShadow = true,
}: DoctorCharacterSpriteProps) {
  const spriteStyle: SpriteStyle = {
    "--doctor-character-sprite-image": `url(${HOME_ASSETS.doctorCharacterSprites})`,
    "--doctor-sprite-frame-width": `${SPRITE_FRAME_WIDTH}px`,
    "--doctor-sprite-frame-height": `${SPRITE_SHEET_HEIGHT}px`,
    "--doctor-sprite-sheet-width": `${SPRITE_SHEET_WIDTH}px`,
    "--doctor-sprite-sheet-height": `${SPRITE_SHEET_HEIGHT}px`,
  };

  return (
    <div
      className={cn(
        "doctor-character-sprite-slot absolute inset-0 flex items-end justify-center",
        className,
      )}
    >
      <div
        className={cn(
          "doctor-character-idle-sprite pixelated",
          withShadow && "drop-shadow-[0_6px_0_rgba(0,0,0,0.3)]",
        )}
        style={spriteStyle}
        role="img"
        aria-label="Dokter PixelAid"
      />
    </div>
  );
}
