import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getApiClient } from "@/lib/api/server";

export const dynamic = "force-dynamic";

export default async function AppHomePage() {
  const api = await getApiClient();
  const { data } = await api.GET("/api/me").catch(() => ({ data: undefined }));
  const profile = data?.profile;
  const progress = data?.progress;

  return (
    <main className="min-h-dvh bg-background">
      <AppHeader />
      <section className="mx-auto w-full max-w-6xl space-y-6 px-5 py-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="space-y-2">
            <Badge>Dashboard</Badge>
            <h1 className="text-3xl font-semibold tracking-tight">
              {profile?.display_name ? `Halo, ${profile.display_name}` : "Dashboard Koas"}
            </h1>
            <p className="max-w-2xl text-muted-foreground">
              Mulai dari Cardiology demo, lanjutkan onboarding, lalu simpan progress
              setelah akun aktif.
            </p>
          </div>
          <Button asChild>
            <Link href="/app/specialists">Pilih specialist</Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">XP</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold">
              {progress?.total_xp ?? profile?.xp ?? 0}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Level</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold">{progress?.level ?? 1}</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Case selesai</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold">
              {progress?.completed_cases ?? 0}
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
