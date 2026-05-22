import { LandingPage } from "@/features/marketing/components/landing-page";
import { getPostAuthRedirectPath } from "@/lib/auth/post-auth-redirect";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const postAuthPath = await getPostAuthRedirectPath();
  if (postAuthPath) {
    redirect(postAuthPath);
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <LandingPage />
    </main>
  );
}
