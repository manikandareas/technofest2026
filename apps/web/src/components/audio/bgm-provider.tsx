"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  BGM_SRC,
  BGM_VOLUME,
  readBgmEnabled,
  writeBgmEnabled,
} from "@/lib/audio/bgm";

type BgmContextValue = {
  enabled: boolean;
  toggle: () => void;
};

const BgmContext = createContext<BgmContextValue | null>(null);

export function useBgm(): BgmContextValue {
  const value = useContext(BgmContext);
  if (!value) {
    throw new Error("useBgm must be used within BgmProvider");
  }
  return value;
}

export function BgmProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setEnabled(readBgmEnabled());
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    const audio = new Audio(BGM_SRC);
    audio.loop = true;
    audio.volume = BGM_VOLUME;
    audio.preload = "auto";
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;

    writeBgmEnabled(enabled);
    const audio = audioRef.current;
    if (!audio) return;

    if (enabled) {
      void audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [enabled, hydrated]);

  const toggle = useCallback(() => {
    setEnabled((prev) => !prev);
  }, []);

  const value = useMemo(() => ({ enabled, toggle }), [enabled, toggle]);

  return <BgmContext.Provider value={value}>{children}</BgmContext.Provider>;
}
