import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  Award,
  CheckCircle2,
  History,
  MessageSquare,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Star,
  Trophy,
  UserPlus,
} from "lucide-react";

import { Badge } from "@/components/ui/8bit/badge";
import { Button } from "@/components/ui/8bit/button";
import { SpecialistsScreenLayout } from "@/components/specialists/specialists-screen-layout";
import { SessionLoadRecover } from "@/components/sessions/session-load-recover";
import { getApiClient } from "@/lib/api/server";
import { withReadRetries } from "@/lib/api/retry-read";
import { cn } from "@/lib/utils";
import { startCaseSession } from "../../../cases/actions";
import { ResultFeedbackRefresh } from "./result-feedback-refresh";

export const dynamic = "force-dynamic";

// Custom Retro Medical Card for unified 8-bit retro medicine dashboard look
function RetroMedicalCard({
  title,
  icon: Icon,
  children,
  className,
  headerAction,
}: {
  title?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
}) {
  return (
    <div className={cn("relative", className)}>
      {/* Absolute 3D Inset shadow */}
      <div className="absolute inset-0 bg-black/5 dark:bg-black/25 translate-x-1.5 translate-y-1.5 pointer-events-none" />

      {/* Core Card Container with 8-bit border */}
      <div className="relative border-y-4 border-primary bg-card text-foreground">
        {/* Absolute side borders to form complete 8-bit box */}
        <div className="pointer-events-none absolute inset-y-0 -mx-1 border-x-4 border-primary" aria-hidden="true" />
        
        {/* Corner decorations */}
        <div className="absolute top-1 left-1 size-1.5 bg-secondary" />
        <div className="absolute top-1 right-1 size-1.5 bg-secondary" />
        <div className="absolute bottom-1 left-1 size-1.5 bg-secondary" />
        <div className="absolute bottom-1 right-1 size-1.5 bg-secondary" />

        {/* Glowing line overlay to match retro screen / clinical monitor */}
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

        {/* Card Header (if title exists) */}
        {title && (
          <div className="border-b-2 border-primary/10 px-4 py-3 sm:px-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {Icon && <Icon className="size-4 text-accent stroke-[2]" />}
              <h3 className="retro text-[10px] sm:text-xs font-bold tracking-wider text-foreground">
                {title}
              </h3>
            </div>
            {headerAction && <div className="text-xs">{headerAction}</div>}
          </div>
        )}

        {/* Card Content */}
        <div className="p-4 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

// Styled Feedback Sub-List Panel
function FeedbackList({
  title,
  items,
  type,
}: {
  title: string;
  items: string[];
  type: "strength" | "improvement" | "next_step";
}) {
  if (items.length === 0) {
    return null;
  }

  const iconConfig = {
    strength: {
      icon: CheckCircle2,
      colorClass: "text-emerald-500",
      bgClass: "bg-emerald-500/5 border-emerald-500/10",
    },
    improvement: {
      icon: AlertCircle,
      colorClass: "text-amber-500",
      bgClass: "bg-amber-500/5 border-amber-500/10",
    },
    next_step: {
      icon: ArrowRight,
      colorClass: "text-primary",
      bgClass: "bg-primary/5 border-primary/10",
    },
  }[type];

  const BulletIcon = iconConfig.icon;

  return (
    <div className={cn("border-2 border-primary/10 p-4 rounded-none space-y-3", iconConfig.bgClass)}>
      <h4 className="retro text-[10px] font-bold tracking-wider text-foreground flex items-center gap-2">
        <BulletIcon className={cn("size-4", iconConfig.colorClass)} />
        <span>{title}</span>
      </h4>
      <ul className="space-y-2 pl-6">
        {items.map((item, idx) => (
          <li key={idx} className="text-xs sm:text-sm leading-relaxed text-muted-foreground list-none relative">
            <span className={cn("absolute -left-5 top-1.5 size-1.5 bg-current rounded-none", iconConfig.colorClass)} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function SessionResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ result?: string }>;
}) {
  const { id } = await params;
  const { result } = await searchParams;
  const resultId = result;

  if (!resultId) {
    notFound();
  }

  const loadResult = await withReadRetries(
    async () => {
      const api = await getApiClient();
      return api.GET("/api/case-results/{result_id}", {
        params: { path: { result_id: resultId } },
      });
    },
    {
      isDefinitiveNotFound: (attempt) => attempt.response?.status === 404,
    },
  );

  if (loadResult.status === "not_found") {
    notFound();
  }

  if (loadResult.status === "transient") {
    return (
      <SessionLoadRecover
        title="Hasil belum siap"
        message="Evaluasi kasus masih diproses. Halaman akan dicoba muat ulang otomatis."
      />
    );
  }

  const data = loadResult.data;
  if (data.session_id !== id) {
    notFound();
  }

  const api = await getApiClient();
  const meResult = await api.GET("/api/me").catch(() => ({ data: undefined }));
  const isAnonymous = Boolean(meResult.data?.profile.is_anonymous);
  const currentResultPath = `/app/sessions/${id}/result?result=${encodeURIComponent(resultId)}`;
  const breakdown = data.score_breakdown;
  const isFallbackFeedback = data.feedback.source === "fallback";
  const scoreRows = [
    ["Quiz", breakdown.quiz, 35],
    ["Interview", breakdown.interview, 25],
    ["Examination", breakdown.examination, 20],
    ["Medical record", breakdown.medical_record, 10],
    ["Time", breakdown.time, 5],
    ["Safety", breakdown.safety, 5],
  ] as const;

  return (
    <SpecialistsScreenLayout
      backHref="/app/home"
      backLabel="Kembali ke home"
      title="EVALUASI KASUS"
      showBottomNav={true}
    >
      <ResultFeedbackRefresh enabled={isFallbackFeedback} />
      <section className="relative z-10 mx-auto grid w-full max-w-6xl gap-6 px-3 pb-8 pt-2 sm:px-4 md:px-6 lg:px-8 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          {/* Main Patient Result Header Box */}
          <div className="relative">
            {/* Absolute 3D Inset shadow */}
            <div className="absolute inset-0 bg-black/5 dark:bg-black/25 translate-x-1.5 translate-y-1.5 pointer-events-none" />

            {/* Core Card Container with 8-bit border */}
            <div className="relative border-y-4 border-primary bg-card/95 text-foreground">
              {/* Absolute side borders to form complete 8-bit box */}
              <div className="pointer-events-none absolute inset-y-0 -mx-1 border-x-4 border-primary" aria-hidden="true" />
              
              {/* Corner decorations */}
              <div className="absolute top-1 left-1 size-1.5 bg-accent" />
              <div className="absolute top-1 right-1 size-1.5 bg-accent" />
              <div className="absolute bottom-1 left-1 size-1.5 bg-accent" />
              <div className="absolute bottom-1 right-1 size-1.5 bg-accent" />

              {/* Glowing line overlay to match retro screen / clinical monitor */}
              <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

              <div className="grid gap-5 p-5 sm:p-6 md:grid-cols-[1fr_auto] md:items-end relative z-10">
                <div className="space-y-3">
                  <Badge font="retro" variant="secondary" className="bg-accent text-accent-foreground">
                    RESULT
                  </Badge>
                  <div className="space-y-2">
                    <h1 className="retro text-xl leading-tight sm:text-2xl text-primary md:text-3xl">
                      {data.case.patient_name}
                    </h1>
                    <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                      Evaluasi selesai. Skor, XP, dan feedback disimpan ke riwayat latihan Anda.
                    </p>
                  </div>
                </div>

                {/* Score HUD Display */}
                <div className="relative w-full border-2 border-primary bg-secondary/15 p-4 text-foreground shadow-[3px_3px_0_var(--border)] md:w-56">
                  <p className="retro text-[10px] sm:text-xs text-accent font-bold uppercase tracking-wider">Score</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="font-mono text-4xl sm:text-5xl font-bold leading-none text-primary">{data.score}</span>
                    <span className="text-xs sm:text-sm font-semibold text-muted-foreground">/100</span>
                  </div>
                  <div className="mt-3 flex gap-1">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <Star
                        key={index}
                        className={cn(
                          "size-5 stroke-[1.5]",
                          index < data.stars ? "text-accent fill-accent" : "text-primary/20"
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Anonymous Save Progress Prompt */}
          {isAnonymous ? (
            <div className="relative">
              {/* Absolute 3D Inset shadow */}
              <div className="absolute inset-0 bg-black/5 dark:bg-black/25 translate-x-1 translate-y-1 pointer-events-none" />

              {/* Core Container with 8-bit border */}
              <div className="relative border-y-4 border-accent bg-card text-foreground">
                <div className="pointer-events-none absolute inset-y-0 -mx-1 border-x-4 border-accent" aria-hidden="true" />
                
                {/* Corner decorations */}
                <div className="absolute top-1 left-1 size-1 bg-primary" />
                <div className="absolute top-1 right-1 size-1 bg-primary" />
                <div className="absolute bottom-1 left-1 size-1 bg-primary" />
                <div className="absolute bottom-1 right-1 size-1 bg-primary" />

                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <h2 className="retro text-sm sm:text-base text-accent font-bold">Simpan progress demo</h2>
                    <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                      Upgrade akun agar result ini tetap tersimpan dan bisa masuk leaderboard setelah login.
                    </p>
                  </div>
                  <Button asChild font="retro" className="shrink-0 bg-accent hover:bg-accent/80 text-accent-foreground">
                    <Link href={`/register?next=${encodeURIComponent(currentResultPath)}`}>
                      <UserPlus className="size-4" />
                      Upgrade
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ) : null}

          {/* Score Breakdown Panel */}
          <RetroMedicalCard title="SCORE BREAKDOWN" icon={Award}>
            <div className="grid gap-4 sm:grid-cols-2">
              {scoreRows.map(([label, score, max]) => (
                <div
                  key={label}
                  className="relative border border-primary/20 bg-secondary/5 p-4 shadow-[2px_2px_0_rgba(0,0,0,0.02)]"
                >
                  <p className="retro text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                    {label}
                  </p>
                  <p className="mt-1 font-mono text-2xl font-bold text-foreground">
                    {score}<span className="text-sm font-semibold text-muted-foreground">/{max}</span>
                  </p>
                  
                  {/* Styled progress bar matching elegant retro rules */}
                  <div className="mt-2.5 h-3 border border-primary/20 bg-secondary/20 p-0.5">
                    <div
                      className="h-full bg-primary transition-all duration-500 relative"
                      style={{ width: `${Math.min(100, (Number(score) / Number(max)) * 100)}%` }}
                    >
                      {/* Scanline pattern for authentic 8-bit visual texture */}
                      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:12px_100%]" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </RetroMedicalCard>

          {/* Detailed Feedback Panel */}
          <RetroMedicalCard title="FEEDBACK & EVALUATION" icon={MessageSquare}>
            <div className="space-y-6">
              {/* Central Case Summary Quote */}
              <div className="relative border-l-4 border-accent pl-4 py-2 bg-secondary/10">
                <p className="text-sm leading-relaxed text-foreground italic">
                  &ldquo;{textValue(data.feedback.summary, "Feedback saved.")}&rdquo;
                </p>
              </div>

              {/* Strengths, Improvements, Next Steps panels */}
              <div className="space-y-4">
                <FeedbackList
                  title="YANG SUDAH KUAT"
                  items={arrayValue(data.feedback.strengths)}
                  type="strength"
                />
                <FeedbackList
                  title="PERLU DIPERBAIKI"
                  items={arrayValue(data.feedback.improvements)}
                  type="improvement"
                />
                <FeedbackList
                  title="LANGKAH BERIKUTNYA"
                  items={arrayValue(data.feedback.next_steps)}
                  type="next_step"
                />
              </div>

              {/* Safety Alert (if present) */}
              {typeof data.feedback.safety_note === "string" ? (
                <div className="border border-destructive/20 bg-destructive/5 p-4 text-xs sm:text-sm text-destructive flex gap-3 items-start relative overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-destructive/30 to-transparent" />
                  <ShieldAlert className="size-5 shrink-0 text-destructive mt-0.5" />
                  <div className="space-y-1">
                    <p className="retro text-[9px] font-bold tracking-wider uppercase text-destructive/80">Catatan Keselamatan</p>
                    <p className="leading-relaxed font-medium">{data.feedback.safety_note}</p>
                  </div>
                </div>
              ) : null}
            </div>
          </RetroMedicalCard>
        </div>

        {/* Right column (Sidebar details & actions) */}
        <div className="space-y-6">
          <RetroMedicalCard title="ATTEMPT SUMMARY" icon={Award}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="relative border border-primary/20 bg-secondary/5 p-3 text-foreground shadow-[2px_2px_0_rgba(0,0,0,0.02)]">
                  <p className="retro text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Attempt</p>
                  <p className="font-mono text-lg font-bold text-foreground mt-0.5">{data.attempt_number}</p>
                </div>
                <div className="relative border border-primary/20 bg-secondary/5 p-3 text-foreground shadow-[2px_2px_0_rgba(0,0,0,0.02)]">
                  <p className="retro text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Best Score</p>
                  <p className="font-mono text-lg font-bold text-foreground mt-0.5">{data.best_score}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="relative border border-primary/20 bg-secondary/5 p-3 text-foreground shadow-[2px_2px_0_rgba(0,0,0,0.02)]">
                  <p className="retro text-[9px] text-muted-foreground font-bold uppercase tracking-wider">XP Awarded</p>
                  <p className="font-mono text-lg font-bold text-foreground mt-0.5">+{data.xp_awarded}</p>
                </div>
                <div className="relative border border-primary/20 bg-secondary/5 p-3 text-foreground shadow-[2px_2px_0_rgba(0,0,0,0.02)]">
                  <p className="retro text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Status Mode</p>
                  <p className="font-mono text-lg font-bold text-foreground mt-0.5">{data.is_retry ? "Retry" : "First"}</p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3 pt-2">
                <form action={startCaseSession.bind(null, data.case.id)}>
                  <Button type="submit" font="retro" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2.5">
                    <RotateCcw className="size-4" />
                    Retry case
                  </Button>
                </form>

                <Button asChild variant="outline" font="retro" className="w-full py-2.5">
                  <Link href="/history">
                    <History className="size-4" />
                    History
                  </Link>
                </Button>

                <Button asChild variant="outline" font="retro" className="w-full py-2.5">
                  <Link href="/leaderboard">
                    <Trophy className="size-4" />
                    Leaderboard
                  </Link>
                </Button>
              </div>

              {/* Medical Disclaimer */}
              <div className="relative border-2 border-primary/15 bg-secondary/5 p-3.5 mt-2">
                <div className="flex gap-2.5 items-start text-xs text-muted-foreground leading-normal font-medium">
                  <ShieldCheck className="size-4 shrink-0 text-primary mt-0.5" />
                  <span>PixelAid adalah simulasi edukatif, bukan alat diagnosis medis nyata.</span>
                </div>
              </div>
            </div>
          </RetroMedicalCard>
        </div>
      </section>
    </SpecialistsScreenLayout>
  );
}

function arrayValue(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function textValue(value: unknown, fallback: string) {
  return typeof value === "string" ? value : fallback;
}
