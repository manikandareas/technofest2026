"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

type SessionLoadRecoverProps = {
  title?: string;
  message?: string;
  backHref?: string;
  backLabel?: string;
  autoRefreshDelaysMs?: number[];
};

const DEFAULT_AUTO_REFRESH_DELAYS_MS = [1_500, 3_000, 6_000];

export function SessionLoadRecover({
  title = "Sesi belum siap",
  message = "Data masih dimuat atau koneksi sempat terputus. Halaman akan dicoba muat ulang otomatis.",
  backHref = "/app/home",
  backLabel = "Kembali ke home",
  autoRefreshDelaysMs = DEFAULT_AUTO_REFRESH_DELAYS_MS,
}: SessionLoadRecoverProps) {
  const router = useRouter();

  useEffect(() => {
    const timeouts = autoRefreshDelaysMs.map((delay) =>
      window.setTimeout(() => {
        router.refresh();
      }, delay),
    );

    return () => {
      timeouts.forEach(window.clearTimeout);
    };
  }, [autoRefreshDelaysMs, router]);

  return (
    <main className="grid min-h-dvh place-items-center bg-background px-5">
      <section className="w-full max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm leading-6 text-muted-foreground">{message}</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button onClick={() => router.refresh()}>Muat ulang</Button>
          <Button asChild variant="outline">
            <Link href={backHref}>{backLabel}</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
