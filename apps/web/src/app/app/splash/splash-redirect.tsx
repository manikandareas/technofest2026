"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function SplashRedirect() {
  const router = useRouter();

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      router.replace("/app?skipSplash=1");
    }, 900);

    return () => window.clearTimeout(timeout);
  }, [router]);

  return null;
}
