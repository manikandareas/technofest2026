import { AppHeader } from "@/components/app-header";
import { CaseCard } from "@/components/case-card";
import { Badge } from "@/components/ui/badge";
import { fallbackCases } from "@/lib/api/fallback";
import { getApiClient } from "@/lib/api/server";

export const dynamic = "force-dynamic";

export default async function SpecialistDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const api = await getApiClient();
  const { data } = await api
    .GET("/api/specialists/{specialist_id}/cases", {
      params: { path: { specialist_id: id } },
    })
    .catch(() => ({ data: undefined }));
  const cases = data ?? fallbackCases.filter((item) => item.specialist_id === id);

  return (
    <main className="min-h-dvh bg-background">
      <AppHeader />
      <section className="mx-auto w-full max-w-6xl space-y-6 px-5 py-8">
        <div className="space-y-2">
          <Badge>Case list</Badge>
          <h1 className="text-3xl font-semibold tracking-tight">Cardiology cases</h1>
          <p className="max-w-2xl text-muted-foreground">
            Brief hanya menampilkan data aman untuk persiapan simulasi. Jawaban klinis
            dan konfigurasi scoring tetap di API.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {cases.map((item) => (
            <CaseCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </main>
  );
}
