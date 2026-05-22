import { createPixelAidApiClient } from "@technofest2026/contracts";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getApiClient() {
  const supabase = await createSupabaseServerClient().catch(() => null);
  const claimsResponse = supabase ? await supabase.auth.getClaims() : null;
  const session =
    claimsResponse?.data && !claimsResponse.error ? await supabase?.auth.getSession() : null;
  const accessToken = session?.data.session?.access_token;

  return createPixelAidApiClient({
    baseUrl: process.env.PIXELAID_API_URL ?? "http://localhost:8000",
    accessToken,
  });
}

export async function getPublicApiClient() {
  return createPixelAidApiClient({
    baseUrl: process.env.PIXELAID_API_URL ?? "http://localhost:8000",
  });
}
