"use server";

import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getApiClient } from "@/lib/api/server";

export async function startCaseSession(caseId: string) {
  const cookieStore = await cookies();
  if (!cookieStore.get("pixelaid_guest_session")) {
    cookieStore.set("pixelaid_guest_session", randomUUID(), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  const api = await getApiClient();
  const { data, error } = await api.POST("/api/case-sessions", {
    body: { case_id: caseId },
  });

  if (error || !data) {
    throw new Error("Unable to start case session.");
  }

  redirect(`/app/sessions/${data.id}`);
}
