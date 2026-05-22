import Link from "next/link";
import { Activity, ArrowRight, BadgeCheck } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="min-h-dvh bg-background">
      <AppHeader />
      <section className="mx-auto grid min-h-[calc(100dvh-4rem)] w-full max-w-6xl items-center gap-10 px-5 py-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-7">
          <Badge className="w-fit">PixelAid simulation PWA</Badge>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
              PixelAid
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              Latihan anamnesis, pemeriksaan awal, dan quiz klinis lewat kasus
              singkat yang aman untuk belajar sebelum masuk sesi voice.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/app">
                Mulai sebagai guest <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/register">Buat akun</Link>
            </Button>
          </div>
        </div>
        <div className="grid gap-4">
          {[
            ["Cardiology ready", "3 kasus awal: Maya, Budi, dan Siti."],
            ["Brief aman", "Diagnosis, quiz answer, dan scoring config tetap server-side."],
            ["Voice boundary", "LiveKit/OpenAI/Deepgram/ElevenLabs baru readiness env."],
          ].map(([title, body], index) => (
            <Card key={title}>
              <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                {index === 0 ? (
                  <Activity className="size-5 text-primary" />
                ) : (
                  <BadgeCheck className="size-5 text-primary" />
                )}
                <CardTitle className="text-base">{title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-6 text-muted-foreground">
                {body}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
