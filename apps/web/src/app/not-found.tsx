import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-background px-5">
      <section className="w-full max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Halaman tidak ditemukan</h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Case atau hasil yang diminta tidak tersedia untuk sesi saat ini.
        </p>
        <Button asChild>
          <Link href="/app/home">Kembali ke home</Link>
        </Button>
      </section>
    </main>
  );
}
