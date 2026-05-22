import { Clock, Play } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fallbackCases } from "@/lib/api/fallback";
import { getApiClient, getPublicApiClient } from "@/lib/api/server";
import { startCaseSession } from "../../actions";

export const dynamic = "force-dynamic";

async function loadCase(id: string) {
  if (id === "demo") {
    const api = await getPublicApiClient();
    const { data } = await api
      .GET("/api/public/cases/demo")
      .catch(() => ({ data: undefined }));
    return data ?? fallbackCases[0];
  }

  const api = await getApiClient();
  const { data } = await api
    .GET("/api/cases/{case_id}", { params: { path: { case_id: id } } })
    .catch(() => ({ data: undefined }));
  return data ?? fallbackCases.find((item) => item.id === id) ?? fallbackCases[0];
}

export default async function CaseBriefPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await loadCase(id);

  return (
    <main className="min-h-dvh bg-background">
      <AppHeader />
      <section className="mx-auto grid w-full max-w-6xl gap-6 px-5 py-8 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge>{item.specialist_name}</Badge>
              <Badge variant="outline">{item.condition_badge}</Badge>
              {item.is_demo ? <Badge variant="secondary">Guest demo</Badge> : null}
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">
              {item.patient_name}, {item.patient_age} tahun
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
              {item.chief_complaint}
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Clinical brief</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="leading-7">{item.triage_note}</p>
              <div className="grid gap-3 text-sm sm:grid-cols-3">
                <div>
                  <p className="text-muted-foreground">Gender</p>
                  <p className="font-medium">{item.patient_gender}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Difficulty</p>
                  <p className="font-medium capitalize">{item.difficulty}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Duration</p>
                  <p className="flex items-center gap-2 font-medium">
                    <Clock className="size-4" />
                    {item.estimated_duration_minutes} menit
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Learning objectives</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
                {(item.learning_objectives ?? []).map((objective) => (
                  <li key={objective}>{objective}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Mulai simulasi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-6 text-muted-foreground">
              Mode teks Phase 2 aktif tanpa voice dependency. Timer dimulai saat
              ruang konsultasi terbuka.
            </p>
            <form action={startCaseSession.bind(null, item.id)}>
              <Button className="w-full" type="submit">
                <Play className="size-4" />
                Start session
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
