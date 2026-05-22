"use server";

import { safeNextFromForm } from "@/lib/navigation/safe-next";
import { apiCatchMessage } from "@/lib/api/action-result";
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
  const next = safeNext(formData, "/app");
  const { error } = await createSupabaseServerClient()
    .then((supabase) => supabase.auth.signInWithPassword({ email, password }))
    .catch((caught) => ({
      error: { message: apiCatchMessage(caught, "Login belum bisa diproses. Coba lagi.") },
    }));

  if (error) {
    return { error: error.message };
  }

  redirect(next);
}

export async function signUpWithPassword(
  _state: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const displayName = displayNameFromForm(formData, email);
  const avatarUrl = dicebearPixelAvatarUrl(displayName);
  const next = safeNext(formData, "/app/onboarding");

  const result = await createSupabaseServerClient()
    .then(async (supabase) => {
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
              `/auth/callback?next=${encodeURIComponent(next)}`,
            ),
          },
        );

        return { error };
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
            `/auth/callback?next=${encodeURIComponent(next)}`,
          ),
        },
      });

      return { error };
    })
    .catch((caught) => ({
      error: { message: apiCatchMessage(caught, "Registrasi belum bisa diproses. Coba lagi.") },
    }));

  if (result.error) {
    return { error: result.error.message };
  }

  redirect(next);
}

export async function signInWithGoogle(): Promise<void> {
  const result = await createSupabaseServerClient()
    .then(async (supabase) => {
      const { data: claimsData } = await supabase.auth.getClaims();
      const redirectTo = await redirectUrl("/auth/callback?next=/app");
      return claimsData?.claims?.is_anonymous
        ? supabase.auth.linkIdentity({
            provider: "google",
            options: { redirectTo },
          })
        : supabase.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo },
          });
    })
    .catch(() => ({ data: null, error: true }));

  if (result.error || !result.data?.url) {
    redirect("/sign-in?error=google_oauth_unavailable");
  }

  redirect(result.data.url);
}
