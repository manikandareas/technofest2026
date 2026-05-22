"use server";

import { redirect } from "next/navigation";
import { getApiClient } from "@/lib/api/server";
import { getServerClaims } from "@/lib/supabase/server";

export async function startCaseSession(caseId: string) {
  const claims = await getServerClaims().catch(() => null);
  if (!claims) {
    redirect(`/auth/guest?next=${encodeURIComponent(`/app/cases/${caseId}/brief`)}`);
  }

  const api = await getApiClient();
  const { data, error } = await api.POST("/api/case-sessions", {
    body: { case_id: caseId },
  });

  if (error || !data) {
    const detail =
      error && typeof error === "object" && "detail" in error
        ? String(error.detail)
        : "API did not return a session.";
    throw new Error(`Unable to start case session: ${detail}`);
  }

  redirect(`/app/sessions/${data.id}`);
}
