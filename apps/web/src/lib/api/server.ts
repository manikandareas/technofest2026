import { createPixelAidApiClient } from "@technofest2026/contracts";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ApiClientProfile = "publicRead" | "authRead" | "gameAction" | "voiceAction";

const API_TIMEOUT_MS: Record<ApiClientProfile, number> = {
  publicRead: 15_000,
  authRead: 20_000,
  gameAction: 35_000,
  voiceAction: 25_000,
};

const apiBaseUrl = process.env.PIXELAID_API_URL ?? "http://localhost:8000";

export async function getApiClient(profile: ApiClientProfile = "authRead") {
  const supabase = await createSupabaseServerClient().catch(() => null);
  const session = supabase ? await supabase.auth.getSession() : null;
  const accessToken = session?.data.session?.access_token;

  return createPixelAidApiClient({
    baseUrl: apiBaseUrl,
    accessToken,
    timeoutMs: API_TIMEOUT_MS[profile],
  });
}

export async function getPublicApiClient(profile: ApiClientProfile = "publicRead") {
  return createPixelAidApiClient({
    baseUrl: apiBaseUrl,
    timeoutMs: API_TIMEOUT_MS[profile],
  });
}
