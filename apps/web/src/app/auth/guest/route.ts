import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/navigation/safe-next";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const next = safeNextPath(requestUrl.searchParams.get("next"));
  const supabase = await createSupabaseServerClient();
  const { data: claimsData } = await supabase.auth.getClaims();

  if (!claimsData?.claims) {
    const { error } = await supabase.auth.signInAnonymously();
    if (error) {
      const signInUrl = new URL("/sign-in", requestUrl.origin);
      signInUrl.searchParams.set("next", next);
      signInUrl.searchParams.set("error", "anonymous_unavailable");
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
