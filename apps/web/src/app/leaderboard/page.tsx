import { AppHeader } from "@/components/app-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPublicApiClient } from "@/lib/api/server";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const api = await getPublicApiClient();
  const { data } = await api.GET("/api/leaderboard").catch(() => ({ data: undefined }));
  const entries = data?.entries ?? [];

  return (
    <main className="min-h-dvh bg-background">
      <AppHeader />
      <section className="mx-auto w-full max-w-5xl space-y-5 px-5 py-8">
        <div className="space-y-2">
          <Badge>Leaderboard</Badge>
          <h1 className="text-3xl font-semibold tracking-tight">Peringkat PixelAid</h1>
          <p className="text-muted-foreground">
            Ranking global berdasarkan total XP, lalu rata-rata best score dan jumlah case.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Global</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {entries.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada entry leaderboard.</p>
            ) : null}
            {entries.map((entry) => (
              <div
                key={`${entry.user_id}-${entry.rank}`}
                className="grid grid-cols-[3rem_1fr_auto] items-center gap-3 rounded-md border p-3"
              >
                <p className="font-mono text-lg">#{entry.rank}</p>
                <div>
                  <p className="font-medium">{entry.display_name}</p>
                  <p className="text-sm text-muted-foreground">
                    Level {entry.level} · {entry.completed_cases} case · avg{" "}
                    {entry.average_best_score}
                  </p>
                </div>
                <p className="font-mono text-xl">{entry.total_xp} XP</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
