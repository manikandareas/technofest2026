"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type SmartEntryClientProps = {
  hasSession: boolean;
  skipSplash: boolean;
};

function isStandalonePwa() {
  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    navigatorWithStandalone.standalone === true
  );
}

export function SmartEntryClient({ hasSession, skipSplash }: SmartEntryClientProps) {
  const router = useRouter();

  useEffect(() => {
    if (isStandalonePwa() && !skipSplash) {
      router.replace("/app/splash");
      return;
    }

    router.replace(hasSession ? "/app/home" : "/auth/guest?next=/app/home");
  }, [hasSession, router, skipSplash]);

  return (
    <main className="grid min-h-dvh place-items-center bg-[#02153d] px-5 text-white">
      <div className="space-y-3 text-center">
        <p className="retro text-xl">PixelAid</p>
        <p className="text-sm text-white/75">Menyiapkan sesi...</p>
      </div>
    </main>
  );
}
