import { PageShell } from "@/components/page-shell";

export default function ProfilePage() {
  return (
    <PageShell
      eyebrow="Profile"
      title="Profil dan progress"
      description="Profil, onboarding state, XP, dan progression akan terhubung ke Supabase/Auth bridge."
      primaryHref="/app/home"
      primaryLabel="Home"
    />
  );
}
