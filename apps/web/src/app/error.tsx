"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="grid min-h-dvh place-items-center bg-background px-5">
      <section className="w-full max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Halaman gagal dimuat</h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Koneksi API atau sesi mungkin terputus. Coba muat ulang tanpa kehilangan
          progres yang sudah tersimpan.
        </p>
        <Button onClick={reset}>Muat ulang</Button>
      </section>
    </main>
  );
}
