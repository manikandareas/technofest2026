import Link from "next/link";
import { HeartPulse, Lock } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fallbackSpecialists } from "@/lib/api/fallback";
import { getPublicApiClient } from "@/lib/api/server";

export const dynamic = "force-dynamic";

export default async function SpecialistsPage() {
  const api = await getPublicApiClient();
  const { data } = await api
    .GET("/api/public/specialists")
    .catch(() => ({ data: fallbackSpecialists }));
  const specialists = data ?? fallbackSpecialists;

  return (
    <main className="min-h-dvh bg-background">
      <AppHeader />
      <section className="mx-auto w-full max-w-6xl space-y-6 px-5 py-8">
        <div className="space-y-2">
          <Badge>Specialists</Badge>
          <h1 className="text-3xl font-semibold tracking-tight">Pilih bidang klinis</h1>
          <p className="max-w-2xl text-muted-foreground">
            Cardiology tersedia untuk demo publik. Specialist lain tetap terkunci
            sampai konten dan guardrail klinisnya siap.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {specialists.map((specialist) => {
            const available = specialist.status === "available";
            return (
              <Card key={specialist.id}>
                <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
                  <div className="flex items-center gap-3">
                    {available ? (
                      <HeartPulse className="size-5 text-primary" />
                    ) : (
                      <Lock className="size-5 text-muted-foreground" />
                    )}
                    <CardTitle>{specialist.name}</CardTitle>
                  </div>
                  <Badge variant={available ? "default" : "outline"}>
                    {available ? `${specialist.case_count} cases` : "Coming soon"}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-5">
                  <p className="text-sm leading-6 text-muted-foreground">
                    {specialist.description}
                  </p>
                  <Button asChild disabled={!available} variant={available ? "default" : "outline"}>
                    <Link href={available ? `/app/specialists/${specialist.id}` : "#"}>
                      Buka case list
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </main>
  );
}
