import type { ReactNode } from "react";

import { AppBottomNav } from "@/components/app/app-bottom-nav";

type AppScreenNavFooterProps = {
  children?: ReactNode;
};

/** Shared bottom spacing + navbar used by home, specialists, and other app screens. */
export function AppScreenNavFooter({ children }: AppScreenNavFooterProps) {
  return (
    <>
      <div className="relative z-20 pb-[calc(5.25rem+env(safe-area-inset-bottom))] lg:pb-[calc(6rem+env(safe-area-inset-bottom))]">
        {children}
      </div>
      <AppBottomNav />
    </>
  );
}
