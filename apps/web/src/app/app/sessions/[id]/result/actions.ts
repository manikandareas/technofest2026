"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getApiClient } from "@/lib/api/server";

type PendingClaim = {
  sessionId: string;
  resultId: string;
  token: string;
};

export async function savePendingClaim(
  sessionId: string,
  resultId: string,
  token: string,
) {
  const cookieStore = await cookies();
  cookieStore.set(
    "koas_pending_claim",
    JSON.stringify({ sessionId, resultId, token }),
    {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    },
  );
  const next = encodeURIComponent(
    `/app/sessions/${sessionId}/result?result=${resultId}&claim=1`,
  );
  redirect(`/sign-in?next=${next}`);
}

export async function claimPendingGuestResult() {
  const cookieStore = await cookies();
  const raw = cookieStore.get("koas_pending_claim")?.value;
  if (!raw) {
    throw new Error("Claim data is no longer available.");
  }

  let pending: PendingClaim;
  try {
    pending = JSON.parse(raw) as PendingClaim;
  } catch {
    throw new Error("Claim data is invalid.");
  }

  const api = await getApiClient();
  const { data, error } = await api.POST("/api/demo/{session_id}/claim", {
    params: { path: { session_id: pending.sessionId } },
    body: { token: pending.token },
  });

  if (error || !data) {
    throw new Error("Guest result could not be claimed.");
  }

  cookieStore.delete("koas_pending_claim");
  cookieStore.delete("pixelaid_guest_session");
  redirect(`/app/sessions/${pending.sessionId}/result?result=${data.result.id}`);
}
