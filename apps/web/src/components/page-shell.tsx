import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  children?: React.ReactNode;
};

export function PageShell({
  eyebrow,
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  children,
}: PageShellProps) {
  return (
    <main className="min-h-dvh bg-background">
      <div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-5 py-6">
        <nav className="flex items-center justify-between gap-4">
          <Link href="/" className="font-semibold tracking-tight">
            PixelAid
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/app/home">Home</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/sign-in">Masuk</Link>
            </Button>
          </div>
        </nav>
        <section className="grid flex-1 items-center gap-8 py-10 md:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <Badge>{eyebrow}</Badge>
            <div className="space-y-4">
              <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
                {title}
              </h1>
              <p className="max-w-xl text-base leading-7 text-muted-foreground">
                {description}
              </p>
            </div>
            {(primaryHref || secondaryHref) && (
              <div className="flex flex-wrap gap-3">
                {primaryHref && primaryLabel ? (
                  <Button asChild>
                    <Link href={primaryHref}>{primaryLabel}</Link>
                  </Button>
                ) : null}
                {secondaryHref && secondaryLabel ? (
                  <Button asChild variant="outline">
                    <Link href={secondaryHref}>{secondaryLabel}</Link>
                  </Button>
                ) : null}
              </div>
            )}
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Status Bootstrap</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              {children ?? (
                <>
                  <p>UI route skeleton siap untuk integrasi Phase 1.</p>
                  <p>Auth, data, scoring, dan voice room belum dihubungkan.</p>
                </>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
