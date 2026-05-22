"use server";

import { safeNextFromForm } from "@/lib/navigation/safe-next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

type AuthState = {
  error?: string;
};

async function getRequestOrigin() {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const forwardedProto = headerStore.get("x-forwarded-proto");

  if (!host) {
    return "http://localhost:3000";
  }

  const protocol = forwardedProto ?? (host.startsWith("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}

async function redirectUrl(path: string) {
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? (await getRequestOrigin());
  return new URL(path, origin).toString();
}

function safeNext(formData: FormData, fallback: string) {
  return safeNextFromForm(formData, fallback);
}

function displayNameFromForm(formData: FormData, email: string) {
  const name = String(formData.get("name") ?? "").trim();
  return name || email.split("@")[0] || "PixelAid User";
}

function dicebearPixelAvatarUrl(name: string) {
  return `https://api.dicebear.com/9.x/pixel-art/svg?seed=${encodeURIComponent(name)}`;
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
  const displayName = displayNameFromForm(formData, email);
  const avatarUrl = dicebearPixelAvatarUrl(displayName);
  const supabase = await createSupabaseServerClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (claimsData?.claims?.is_anonymous) {
    const { error } = await supabase.auth.updateUser(
      {
        email,
        data: {
          display_name: displayName,
          avatar_url: avatarUrl,
        },
      },
      {
        emailRedirectTo: await redirectUrl(
          `/auth/callback?next=${encodeURIComponent(safeNext(formData, "/app/onboarding"))}`,
        ),
      },
    );

    if (error) {
      return { error: error.message };
    }

    redirect(safeNext(formData, "/app/onboarding"));
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
        avatar_url: avatarUrl,
      },
      emailRedirectTo: await redirectUrl(
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
  const { data: claimsData } = await supabase.auth.getClaims();
  const redirectTo = await redirectUrl("/auth/callback?next=/app");
  const { data, error } = claimsData?.claims?.is_anonymous
    ? await supabase.auth.linkIdentity({
        provider: "google",
        options: { redirectTo },
      })
    : await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });

  if (error || !data.url) {
    redirect("/sign-in?error=google_oauth_unavailable");
  }

  redirect(data.url);
}
