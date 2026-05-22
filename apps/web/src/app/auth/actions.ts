"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type AuthState = {
  error?: string;
};

function redirectUrl(path: string) {
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return new URL(path, origin).toString();
}

function safeNext(formData: FormData, fallback: string) {
  const value = String(formData.get("next") ?? "");
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("://")) {
    return fallback;
  }
  return value;
}

export async function signInWithPassword(
  _state: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  redirect(safeNext(formData, "/app"));
}

export async function signUpWithPassword(
  _state: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectUrl(
        `/auth/callback?next=${encodeURIComponent(safeNext(formData, "/app/onboarding"))}`,
      ),
    },
  });

  if (error) {
    return { error: error.message };
  }

  redirect(safeNext(formData, "/app/onboarding"));
}

export async function signInWithGoogle(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: redirectUrl("/auth/callback?next=/app") },
  });

  if (error || !data.url) {
    redirect("/sign-in?error=google_oauth_unavailable");
  }

  redirect(data.url);
}
