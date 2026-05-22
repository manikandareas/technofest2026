"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getApiClient } from "@/lib/api/server";

export async function startCaseSession(caseId: string) {
  const api = await getApiClient();
  const guestId = (await cookies()).get("pixelaid_guest_session")?.value;
  const { data } = await api
    .POST("/api/case-sessions", {
      body: {
        case_id: caseId,
        guest_id: guestId,
      },
    })
    .catch(() => ({ data: undefined }));

  if (data?.id) {
    redirect(`/app/sessions/${data.id}`);
  }

  redirect(`/app/cases/${caseId}/brief`);
}
