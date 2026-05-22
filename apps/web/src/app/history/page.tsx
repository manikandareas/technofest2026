import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getApiClient } from "@/lib/api/server";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const api = await getApiClient();
  const { data } = await api.GET("/api/history").catch(() => ({ data: undefined }));
  const items = data?.items ?? [];

  return (
    <main className="min-h-dvh bg-background">
      <AppHeader />
      <section className="mx-auto w-full max-w-5xl space-y-5 px-5 py-8">
        <div className="space-y-2">
          <Badge>History</Badge>
          <h1 className="text-3xl font-semibold tracking-tight">Riwayat simulasi</h1>
          <p className="text-muted-foreground">
            Detail hasil disimpan tanpa menampilkan transcript penuh.
          </p>
        </div>
        <div className="grid gap-3">
          {items.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-muted-foreground">
                Belum ada hasil simulasi.
              </CardContent>
            </Card>
          ) : null}
          {items.map((item) => (
            <Card key={item.result_id}>
              <CardHeader className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <CardTitle className="text-lg">
                    {item.patient_name} · {item.condition_badge}
                  </CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Attempt {item.attempt_number} · Best {item.best_score}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-mono text-2xl">{item.score}</p>
                  <Button asChild variant="outline">
                    <Link href={`/app/sessions/${item.session_id}/result?result=${item.result_id}`}>
                      Detail
                    </Link>
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
