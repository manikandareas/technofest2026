"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type ResultFeedbackRefreshProps = {
  enabled: boolean;
};

const REFRESH_DELAYS_MS = [2_000, 4_000, 8_000];

export function ResultFeedbackRefresh({ enabled }: ResultFeedbackRefreshProps) {
  const router = useRouter();

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const timeouts = REFRESH_DELAYS_MS.map((delay) =>
      window.setTimeout(() => {
        router.refresh();
      }, delay),
    );

    return () => {
      timeouts.forEach(window.clearTimeout);
    };
  }, [enabled, router]);

  return null;
}
