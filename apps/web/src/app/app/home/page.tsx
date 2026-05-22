import { HomeScreen } from "@/components/home/home-screen";
import { getApiClient } from "@/lib/api/server";

export const dynamic = "force-dynamic";

function resolveDisplayName(
  displayName?: string | null,
  email?: string | null,
): string {
  if (displayName?.trim()) return displayName.trim();
  if (email?.trim()) return email.split("@")[0] ?? "Peserta";
  return "Peserta";
}

export default async function AppHomePage() {
  const api = await getApiClient();
  const meResult = await api.GET("/api/me").catch(() => ({ data: undefined }));

  const profile = meResult.data?.profile;
  const progress = meResult.data?.progress;

  const displayName = resolveDisplayName(profile?.display_name, profile?.email);
  const level = progress?.level ?? 1;
  const totalXp = progress?.total_xp ?? profile?.xp ?? 0;

  return (
    <HomeScreen
      displayName={displayName}
      level={level}
      totalXp={totalXp}
      avatarUrl={profile?.avatar_url}
      gender={profile?.gender}
      startHref="/app/specialists"
      startLabel="Start"
    />
  );
}
