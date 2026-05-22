"use server";

import { redirect } from "next/navigation";
import { apiCatchMessage, apiErrorMessage } from "@/lib/api/action-result";
import { getApiClient } from "@/lib/api/server";
import { getServerClaims } from "@/lib/supabase/server";

async function createCaseSession(caseId: string) {
  const claims = await getServerClaims().catch(() => null);
  if (!claims) {
    redirect(`/auth/guest?next=${encodeURIComponent(`/app/cases/${caseId}/brief`)}`);
  }

  const api = await getApiClient("gameAction");
  const { data, error } = await api
    .POST("/api/case-sessions", {
      body: { case_id: caseId },
    })
    .catch((caught) => ({
      data: undefined,
      error: apiCatchMessage(caught, "Konsultasi belum bisa dimulai. Coba lagi."),
    }));

  if (error || !data) {
    return {
      error: apiErrorMessage(error, "Konsultasi belum bisa dimulai. Coba lagi."),
    };
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
