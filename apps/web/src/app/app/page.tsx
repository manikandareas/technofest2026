import { getServerClaims } from "@/lib/supabase/server";
import { SmartEntryClient } from "./smart-entry-client";

export default async function AppEntryPage({
  searchParams,
}: {
  searchParams: Promise<{ skipSplash?: string }>;
}) {
  const claims = await getServerClaims().catch(() => null);
  const { skipSplash } = await searchParams;
  return <SmartEntryClient hasSession={Boolean(claims)} skipSplash={skipSplash === "1"} />;
}
