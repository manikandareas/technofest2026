import { SettingsScreen } from "@/components/settings/settings-screen";
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

export default async function SettingsPage() {
  const api = await getApiClient();
  const { data } = await api.GET("/api/me").catch(() => ({ data: undefined }));

  const profile = data?.profile;
  const progress = data?.progress;
  const displayName = resolveDisplayName(profile?.display_name, profile?.email);
  const totalXp = progress?.total_xp ?? profile?.xp ?? 0;

  return (
    <SettingsScreen
      displayName={displayName}
      totalXp={totalXp}
      avatarUrl={profile?.avatar_url}
    />
  );
}
