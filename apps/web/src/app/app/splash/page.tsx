import Link from "next/link";
import { Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SplashRedirect } from "./splash-redirect";

export default function SplashPage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-primary px-5 text-primary-foreground">
      <SplashRedirect />
      <div className="space-y-6 text-center">
        <Activity className="mx-auto size-12" />
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">PixelAid</h1>
          <p className="text-primary-foreground/80">Menyiapkan ruang latihan.</p>
        </div>
        <Button asChild variant="secondary">
          <Link href="/app?skipSplash=1">Masuk</Link>
        </Button>
      </div>
    </main>
  );
}
