import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const steps = [
  ["Talk", "Tanyakan keluhan utama, kronologi, faktor risiko, dan red flag."],
  ["Examine", "Pilih pemeriksaan klinis awal yang relevan untuk kasus."],
  ["Quiz", "Kunci diagnosis kerja dan keputusan awal setelah konsultasi."],
  ["Feedback", "Lihat skor, XP, dan area yang perlu diperbaiki."],
];

export default function OnboardingPage() {
  return (
    <main className="min-h-dvh bg-background">
      <AppHeader />
      <section className="mx-auto w-full max-w-6xl space-y-6 px-5 py-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Kenali alur simulasi</h1>
          <p className="text-muted-foreground">
            Phase 1 menyiapkan shell konten dan auth sebelum konsultasi voice real-time.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {steps.map(([title, body]) => (
            <Card key={title}>
              <CardHeader>
                <CardTitle className="text-base">{title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-6 text-muted-foreground">
                {body}
              </CardContent>
            </Card>
          ))}
        </div>
        <Button asChild>
          <Link href="/app/home">Selesai</Link>
        </Button>
      </section>
    </main>
  );
}
