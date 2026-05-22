"use server";

import { redirect } from "next/navigation";
import { getApiClient } from "@/lib/api/server";
import { getServerClaims } from "@/lib/supabase/server";

async function createCaseSession(caseId: string) {
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
    return { error: `Unable to start case session: ${detail}` };
  }

  return { sessionId: data.id };
}

export async function startCaseSession(caseId: string) {
  const result = await createCaseSession(caseId);
  if (result.error) {
    redirect(`/app/cases/${caseId}/brief?start_error=1`);
  }

  redirect(`/app/sessions/${result.sessionId}`);
}

export async function startCaseSessionInline(caseId: string) {
  const result = await createCaseSession(caseId);
  if (result.error) {
    return { error: result.error };
  }

  redirect(`/app/sessions/${result.sessionId}`);
}
