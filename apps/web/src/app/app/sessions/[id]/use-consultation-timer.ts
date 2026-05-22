"use client";

import { useCallback, useEffect, useState } from "react";
import type { PixelAidApiComponents } from "@technofest2026/contracts";

import { getSessionSnapshot } from "./actions";

export type CaseSession = PixelAidApiComponents["schemas"]["CaseSessionResponse"];

type UseConsultationTimerOptions = {
  session: CaseSession;
  onSessionChange: (session: CaseSession) => void;
  onConsultationLocked?: () => void;
  onRefreshError?: (message: string) => void;
};

export function useConsultationTimer({
  session,
  onSessionChange,
  onConsultationLocked,
  onRefreshError,
}: UseConsultationTimerOptions) {
  const [displaySeconds, setDisplaySeconds] = useState(session.remaining_seconds);
  const isConsultationActive = session.status === "in_consultation";
  const remainingSeconds = isConsultationActive ? displaySeconds : session.remaining_seconds;
  const isExpired = isConsultationActive && !session.is_paused && remainingSeconds <= 0;
  const isConsultationLocked =
    !isConsultationActive || session.is_paused || remainingSeconds <= 0;
  const shouldWarnTime = isConsultationActive && remainingSeconds <= 60 && remainingSeconds > 0;
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = String(remainingSeconds % 60).padStart(2, "0");

  const applySession = useCallback(
    (next: CaseSession) => {
      onSessionChange(next);
      setDisplaySeconds(next.remaining_seconds);
    },
    [onSessionChange],
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDisplaySeconds(session.remaining_seconds);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [session.id, session.remaining_seconds, session.status, session.is_paused]);

  useEffect(() => {
    if (!isConsultationActive) {
      return;
    }
    const interval = window.setInterval(() => {
      getSessionSnapshot(session.id)
        .then((next) => {
          applySession(next);
        })
        .catch(() => onRefreshError?.("Session refresh failed."));
    }, 2500);
    return () => window.clearInterval(interval);
  }, [applySession, isConsultationActive, onRefreshError, session.id]);

  useEffect(() => {
    if (!isConsultationActive || session.is_paused || displaySeconds <= 0) {
      return;
    }
    const timeout = window.setTimeout(() => {
      setDisplaySeconds((current) => Math.max(current - 1, 0));
    }, 1000);
    return () => window.clearTimeout(timeout);
  }, [displaySeconds, isConsultationActive, session.is_paused]);

  useEffect(() => {
    if (isConsultationLocked) {
      onConsultationLocked?.();
    }
  }, [isConsultationLocked, onConsultationLocked]);

  return {
    remainingSeconds,
    isExpired,
    isConsultationLocked,
    shouldWarnTime,
    clockLabel: `${minutes}:${seconds}`,
    applySession,
  };
}
