import Link from "next/link";
import { notFound } from "next/navigation";
import { Award, RotateCcw, Star } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getApiClient } from "@/lib/api/server";
import { startCaseSession } from "../../../cases/actions";

export const dynamic = "force-dynamic";

export default async function SessionResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ result?: string }>;
}) {
  const { id } = await params;
  const { result } = await searchParams;
  const api = await getApiClient();
  const resultId = result;

  if (!resultId) {
    notFound();
  }

  const { data, error } = await api
    .GET("/api/case-results/{result_id}", {
      params: { path: { result_id: resultId } },
    })
    .catch(() => ({ data: undefined, error: true }));

  if (error || !data || data.session_id !== id) {
    notFound();
  }

  const breakdown = data.score_breakdown;

  return (
    <main className="min-h-dvh bg-background">
      <AppHeader />
      <section className="mx-auto grid w-full max-w-6xl gap-5 px-5 py-8 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-5">
          <div className="space-y-3">
            <Badge>Result</Badge>
            <h1 className="text-3xl font-semibold tracking-tight">
              {data.case.patient_name}: {data.score}/100
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex gap-1 text-primary">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Star
                    key={index}
                    className={index < data.stars ? "size-5 fill-current" : "size-5 opacity-30"}
                  />
                ))}
              </div>
              <Badge variant={data.is_retry ? "secondary" : "default"}>
                {data.is_retry ? `Retry XP +${data.xp_awarded}` : `XP +${data.xp_awarded}`}
              </Badge>
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Score breakdown</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {[
                ["Quiz", breakdown.quiz, 35],
                ["Interview", breakdown.interview, 25],
                ["Examination", breakdown.examination, 20],
                ["Medical record", breakdown.medical_record, 10],
                ["Time", breakdown.time, 5],
                ["Safety", breakdown.safety, 5],
              ].map(([label, score, max]) => (
                <div key={label} className="rounded-md border p-3">
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="font-mono text-xl">
                    {score}/{max}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Feedback</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 leading-7 text-muted-foreground">
              <p>{textValue(data.feedback.summary, "Feedback saved.")}</p>
              <FeedbackList title="Yang sudah kuat" items={arrayValue(data.feedback.strengths)} />
              <FeedbackList title="Perlu diperbaiki" items={arrayValue(data.feedback.improvements)} />
              <FeedbackList title="Langkah berikutnya" items={arrayValue(data.feedback.next_steps)} />
              {typeof data.feedback.safety_note === "string" ? (
                <p className="rounded-md border border-primary/20 bg-primary/5 p-3 text-sm text-foreground">
                  {data.feedback.safety_note}
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Award className="size-4" />
              Attempt
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Attempt</p>
                <p className="font-mono text-lg">{data.attempt_number}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Best</p>
                <p className="font-mono text-lg">{data.best_score}</p>
              </div>
            </div>
            <form action={startCaseSession.bind(null, data.case.id)}>
              <Button type="submit" className="w-full">
                <RotateCcw className="size-4" />
                Retry case
              </Button>
            </form>
            <Button asChild variant="outline" className="w-full">
              <Link href="/history">History</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function FeedbackList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) {
    return null;
  }
  return (
    <div className="space-y-2">
      <h2 className="text-sm font-medium text-foreground">{title}</h2>
      <ul className="list-disc space-y-1 pl-5 text-sm">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function arrayValue(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function textValue(value: unknown, fallback: string) {
  return typeof value === "string" ? value : fallback;
}
