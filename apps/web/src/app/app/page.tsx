import { redirect } from "next/navigation";
import { getServerClaims } from "@/lib/supabase/server";

export default async function AppEntryPage() {
  const claims = await getServerClaims().catch(() => null);
  redirect(claims ? "/app/home" : "/auth/guest?next=/app/home");
}
