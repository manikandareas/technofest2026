import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/navigation/safe-next";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = safeNextPath(requestUrl.searchParams.get("next"), "/app");

  if (code) {
    const supabase = await createSupabaseServerClient().catch(() => null);
    await supabase?.auth.exchangeCodeForSession(code).catch(() => undefined);
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
