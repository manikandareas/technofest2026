import { getApiClient } from "@/lib/api/server";
import { getServerClaims } from "@/lib/supabase/server";

export async function getPostAuthRedirectPath() {
  const claims = await getServerClaims().catch(() => null);
  if (!claims || claims.is_anonymous) {
    return null;
  }

  const api = await getApiClient();
  const meResult = await api.GET("/api/me").catch(() => ({ data: undefined }));
  if (meResult.data?.profile.onboarding_completed) {
    return "/app/home";
  }

  return "/app/onboarding";
}
