import { AccountScreen } from "@/components/settings/account-screen";
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

export default async function SettingsAccountPage() {
  const api = await getApiClient();
  const { data } = await api.GET("/api/me").catch(() => ({ data: undefined }));

  const profile = data?.profile;
  const progress = data?.progress;
  const displayName = resolveDisplayName(profile?.display_name, profile?.email);

  return (
    <AccountScreen
      displayName={displayName}
      email={profile?.email}
      avatarUrl={profile?.avatar_url}
      totalXp={progress?.total_xp ?? profile?.xp ?? 0}
      level={progress?.level ?? 1}
      completedCases={progress?.completed_cases ?? 0}
      averageBestScore={progress?.average_best_score ?? 0}
    />
  );
}
