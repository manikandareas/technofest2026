import { Badge } from "@/components/ui/8bit/badge";
import { SpecialistsScreenLayout } from "@/components/specialists/specialists-screen-layout";
import { getPublicApiClient } from "@/lib/api/server";
import { Medal, Trophy } from "lucide-react";

export const dynamic = "force-dynamic";

function RankMedallion({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="relative group/medallion">
        {/* 3D shadow */}
        <div className="absolute inset-0 translate-x-0.5 translate-y-0.5 bg-black/15 pointer-events-none" />
        <div className="relative flex size-10 items-center justify-center border-2 border-yellow-600 bg-yellow-400 text-yellow-950 font-bold retro text-xs animate-pulse">
          <Medal className="size-5 shrink-0 stroke-[2]" />
          <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white font-mono text-[8px] px-1 border border-black rounded-sm leading-none">1</span>
        </div>
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="relative">
        <div className="absolute inset-0 translate-x-0.5 translate-y-0.5 bg-black/15 pointer-events-none" />
        <div className="relative flex size-10 items-center justify-center border-2 border-slate-400 bg-slate-200 text-slate-800 font-bold retro text-xs">
          <Medal className="size-5 shrink-0 stroke-[2]" />
          <span className="absolute -top-1.5 -right-1.5 bg-blue-500 text-white font-mono text-[8px] px-1 border border-black rounded-sm leading-none">2</span>
        </div>
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="relative">
        <div className="absolute inset-0 translate-x-0.5 translate-y-0.5 bg-black/15 pointer-events-none" />
        <div className="relative flex size-10 items-center justify-center border-2 border-amber-800 bg-amber-600 text-amber-50 font-bold retro text-xs">
          <Medal className="size-5 shrink-0 stroke-[2]" />
          <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white font-mono text-[8px] px-1 border border-black rounded-sm leading-none">3</span>
        </div>
      </div>
    );
  }
  return (
    <div className="relative">
      <div className="absolute inset-0 translate-x-0.5 translate-y-0.5 bg-black/5 pointer-events-none" />
      <div className="relative flex size-10 items-center justify-center border-2 border-muted-foreground/20 bg-secondary/15 text-muted-foreground font-mono text-sm font-bold">
        #{rank}
      </div>
    </div>
  );
}

export default async function LeaderboardPage() {
  const api = await getPublicApiClient();
  const { data } = await api.GET("/api/leaderboard").catch(() => ({ data: undefined }));
  const entries = data?.entries ?? [];

  return (
    <SpecialistsScreenLayout
      backHref="/app/home"
      backLabel="Kembali ke home"
      title="LEADERBOARD"
      showBottomNav={true}
    >
      <section className="relative z-10 mx-auto w-full max-w-4xl space-y-6 px-3 pb-8 pt-2 sm:px-4 md:px-6 lg:px-8">
        {/* Adaptive Medical Banner Card */}
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
                  LEADERBOARD
                </Badge>
                <div className="space-y-2">
                  <h2 className="retro text-lg sm:text-2xl text-primary leading-tight">
                    Peringkat PixelAid
                  </h2>
                  <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                    Ranking global berdasarkan total XP, rata-rata best score, dan jumlah kasus yang selesai.
                  </p>
                </div>
              </div>

              {/* Trophy Box Display */}
              <div className="flex size-16 sm:size-20 shrink-0 items-center justify-center border-2 border-primary bg-secondary/15 text-primary shadow-[3px_3px_0_var(--border)] self-start md:self-auto">
                <Trophy className="size-8 sm:size-10" />
              </div>
            </div>
          </div>
        </div>

        {/* Global Ranking Headers */}
        <div className="flex items-center justify-between border-b-2 border-primary/20 pb-2">
          <h3 className="retro text-xs sm:text-sm text-primary uppercase tracking-wider">
            Ranking Global
          </h3>
          <span className="font-mono text-[10px] text-muted-foreground">
            {entries.length} CHIRURGEONS
          </span>
        </div>

        {/* Entries List */}
        <div className="space-y-4">
          {entries.length === 0 ? (
            <div className="relative p-6 text-center">
              <div className="absolute inset-0 bg-black/5 dark:bg-black/25 translate-x-1 translate-y-1 pointer-events-none" />
              <div className="relative border-2 border-dashed border-primary/30 bg-card/50 p-6">
                <p className="text-sm text-muted-foreground">Belum ada entry leaderboard.</p>
              </div>
            </div>
          ) : (
            entries.map((entry) => (
              <div
                key={`${entry.user_id}-${entry.rank}`}
                className="group relative block transition-all duration-150 transform hover:-translate-x-1 hover:-translate-y-1 active:translate-x-0 active:translate-y-0"
              >
                {/* Absolute 3D Shadow layer */}
                <div className="absolute inset-0 bg-black/10 dark:bg-black/35 translate-x-1 translate-y-1 group-hover:translate-x-2 group-hover:translate-y-2 transition-all duration-150 pointer-events-none" />
                
                {/* The 8-bit border card container */}
                <div className="relative border-y-4 border-primary bg-card text-foreground group-hover:border-accent transition-colors duration-150">
                  {/* Side overlay borders */}
                  <div className="pointer-events-none absolute inset-y-0 -mx-1 border-x-4 border-primary group-hover:border-accent transition-colors duration-150" aria-hidden="true" />
                  
                  {/* Cheerful corner decorations */}
                  <div className="absolute top-1 left-1 size-1 bg-secondary group-hover:bg-accent transition-colors" />
                  <div className="absolute top-1 right-1 size-1 bg-secondary group-hover:bg-accent transition-colors" />
                  <div className="absolute bottom-1 left-1 size-1 bg-secondary group-hover:bg-accent transition-colors" />
                  <div className="absolute bottom-1 right-1 size-1 bg-secondary group-hover:bg-accent transition-colors" />

                  {/* Glowing top line beam on hover */}
                  <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-accent/0 to-transparent group-hover:via-accent/45 transition-all duration-200" />

                  {/* Content */}
                  <div className="relative z-10 flex items-center gap-4 p-4">
                    <div className="shrink-0">
                      <RankMedallion rank={entry.rank} />
                    </div>
                    
                    <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="min-w-0">
                        <p className="retro text-xs sm:text-sm font-bold text-foreground group-hover:text-accent transition-colors truncate">
                          {entry.display_name}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] sm:text-xs text-muted-foreground mt-1">
                          <span className="bg-secondary/15 px-1.5 py-0.5 border border-primary/10 rounded-sm">
                            LVL {String(entry.level).padStart(2, '0')}
                          </span>
                          <span className="text-muted-foreground/60">·</span>
                          <span className="text-primary/80 font-semibold">
                            {String(entry.completed_cases).padStart(2, '0')} CASES
                          </span>
                          <span className="text-muted-foreground/60">·</span>
                          <span className="text-accent/90">
                            AVG {String(entry.average_best_score).padStart(3, '0')} PTS
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-baseline gap-1 self-end sm:self-center shrink-0">
                        <span className="font-mono text-base sm:text-xl font-bold text-primary">
                          {entry.total_xp.toLocaleString()}
                        </span>
                        <span className="font-mono text-[10px] font-semibold uppercase text-muted-foreground tracking-wider">XP</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </SpecialistsScreenLayout>
  );
}
