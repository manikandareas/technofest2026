import Link from "next/link";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
        <Link href="/" className="font-semibold tracking-tight">
          PixelAid
        </Link>
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/app/home">Dashboard</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/app/specialists">Cases</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/sign-in">Masuk</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
