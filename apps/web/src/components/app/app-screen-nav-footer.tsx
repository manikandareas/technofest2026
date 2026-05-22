import type { ReactNode } from "react";

import { AppBottomNav } from "@/components/app/app-bottom-nav";

type AppScreenNavFooterProps = {
  children?: ReactNode;
  showBottomNav?: boolean;
};

/** Shared bottom spacing + navbar used by home, specialists, and other app screens. */
export function AppScreenNavFooter({
  children,
  showBottomNav = true,
}: AppScreenNavFooterProps) {
  return (
    <>
      <div
        className={
          showBottomNav
            ? "relative z-20 pb-[calc(5.25rem+env(safe-area-inset-bottom))] lg:pb-[calc(6rem+env(safe-area-inset-bottom))]"
            : "relative z-20 pb-[calc(1rem+env(safe-area-inset-bottom))]"
        }
      >
        {children}
      </div>
      {showBottomNav ? <AppBottomNav /> : null}
    </>
  );
}
