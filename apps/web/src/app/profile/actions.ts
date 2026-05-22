"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getApiClient } from "@/lib/api/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ProfileActionState = {
  error?: string;
  success?: boolean;
};

function normalizeDisplayName(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  return trimmed.replace(/^Dr\.\s*/i, "");
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/sign-in");
}

export async function updateProfileAction(
  _state: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const displayName = normalizeDisplayName(String(formData.get("display_name") ?? ""));

  if (!displayName) {
    return { error: "Nama tampilan wajib diisi." };
  }

  const api = await getApiClient();
  const { error } = await api.PATCH("/api/me/profile", {
    body: {
      display_name: displayName,
    },
  });

  if (error) {
    return { error: "Gagal memperbarui profil. Coba lagi." };
  }

  revalidatePath("/profile");
  revalidatePath("/profile/account");
  revalidatePath("/app/home");

  return { success: true };
}
