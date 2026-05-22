import { getPostAuthRedirectPath } from "@/lib/auth/post-auth-redirect";
import { getServerClaims } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SmartEntryClient } from "./smart-entry-client";

export default async function AppEntryPage({
  searchParams,
}: {
  searchParams: Promise<{ skipSplash?: string }>;
}) {
  const postAuthPath = await getPostAuthRedirectPath();
  if (postAuthPath) {
    redirect(postAuthPath);
  }

  const claims = await getServerClaims().catch(() => null);
  const { skipSplash } = await searchParams;
  return <SmartEntryClient hasSession={Boolean(claims)} skipSplash={skipSplash === "1"} />;
}
