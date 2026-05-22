import { PageShell } from "@/components/page-shell";

export default function LeaderboardPage() {
  return (
    <PageShell
      eyebrow="Leaderboard"
      title="Peringkat PixelAid"
      description="Leaderboard global akan memakai result terpublikasi dan aturan scoring deterministik."
      primaryHref="/app/home"
      primaryLabel="Home"
    />
  );
}
