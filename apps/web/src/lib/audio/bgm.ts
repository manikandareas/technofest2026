import { BGM_ASSET_VERSION } from "./bgm-asset-version";

export const BGM_STORAGE_KEY = "pixelaid-bgm-enabled";
/** Cache-busted so browser/Serwist never serve an older replaced MP3. */
export const BGM_SRC = `/assets/audio/home-bgm.mp3?v=${BGM_ASSET_VERSION}`;
/** Playback gain (0–1); kept below 1 so home BGM stays in the background. */
export const BGM_VOLUME = 0.35;

export function readBgmEnabled(): boolean {
  if (typeof window === "undefined") return true;
  const stored = window.localStorage.getItem(BGM_STORAGE_KEY);
  if (stored === null) return true;
  return stored === "true";
}

export function writeBgmEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(BGM_STORAGE_KEY, String(enabled));
}
