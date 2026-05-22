import { HomeScreen } from "@/components/home/home-screen";
import { getApiClient } from "@/lib/api/server";

export const dynamic = "force-dynamic";

function resolveDisplayName(
  displayName?: string | null,
  email?: string | null,
): string {
  if (displayName?.trim()) return displayName.trim();
  if (email?.trim()) return email.split("@")[0] ?? "Koas";
  return "Koas";
}

export default async function AppHomePage() {
  const api = await getApiClient();
  const [meResult, historyResult] = await Promise.all([
    api.GET("/api/me").catch(() => ({ data: undefined })),
    api.GET("/api/history").catch(() => ({ data: undefined })),
  ]);

  const profile = meResult.data?.profile;
  const progress = meResult.data?.progress;
  const recentCases = historyResult.data?.items ?? [];

  const displayName = resolveDisplayName(profile?.display_name, profile?.email);
  const level = progress?.level ?? 1;
  const totalXp = progress?.total_xp ?? profile?.xp ?? 0;

  return (
    <HomeScreen
      displayName={displayName}
      level={level}
      totalXp={totalXp}
      avatarUrl={profile?.avatar_url}
      startHref="/app/specialists"
      startLabel="Start"
      recentCases={recentCases}
    />
  );
}
