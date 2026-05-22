"use server";

import { redirect } from "next/navigation";
import { getApiClient } from "@/lib/api/server";

export type OnboardingGender = "male" | "female";

export async function completeOnboarding(gender: OnboardingGender) {
  const api = await getApiClient();
  const { error } = await api.POST("/api/me/onboarding-complete", {
    body: { gender },
  });

  if (error) {
    return { error: "Onboarding could not be completed." };
  }

  redirect("/app/home");
}
