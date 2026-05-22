import { AppBottomNav } from "@/components/app/app-bottom-nav";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getApiClient } from "@/lib/api/server";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const api = await getApiClient();
  const { data } = await api.GET("/api/me").catch(() => ({ data: undefined }));
  const profile = data?.profile;
  const progress = data?.progress;

  return (
    <main className="min-h-dvh bg-background pb-[calc(5.5rem+env(safe-area-inset-bottom))]">
      <section className="mx-auto w-full max-w-5xl space-y-5 px-5 py-8">
        <div className="space-y-2">
          <Badge>Profile</Badge>
          <h1 className="text-3xl font-semibold tracking-tight">
            {profile?.display_name ?? profile?.email ?? "Profil Peserta"}
          </h1>
          <p className="text-muted-foreground">Progress dihitung dari XP dan best result.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label="Total XP" value={progress?.total_xp ?? profile?.xp ?? 0} />
          <StatCard label="Level" value={progress?.level ?? 1} />
          <StatCard label="Case selesai" value={progress?.completed_cases ?? 0} />
          <StatCard label="Avg best" value={progress?.average_best_score ?? 0} />
        </div>
      </section>
      <AppBottomNav />
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{label}</CardTitle>
      </CardHeader>
      <CardContent className="font-mono text-3xl font-semibold">{value}</CardContent>
    </Card>
  );
}
