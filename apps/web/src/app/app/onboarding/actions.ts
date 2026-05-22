"use server";

import { redirect } from "next/navigation";
import { apiCatchMessage, apiErrorMessage } from "@/lib/api/action-result";
import { getApiClient } from "@/lib/api/server";

export type OnboardingGender = "male" | "female";

export async function completeOnboarding(gender: OnboardingGender) {
  const api = await getApiClient("gameAction");
  const { error } = await api
    .POST("/api/me/onboarding-complete", {
      body: { gender },
    })
    .catch((caught) => ({
      error: apiCatchMessage(caught, "Onboarding belum bisa disimpan. Coba lagi."),
    }));

  if (error) {
    return { error: apiErrorMessage(error, "Onboarding belum bisa disimpan. Coba lagi.") };
  }

  redirect("/app/home");
}
