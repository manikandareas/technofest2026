import Link from "next/link";
import Image from "next/image";
import { signUpWithPassword } from "@/app/auth/actions";
import { AuthForm } from "@/components/auth/auth-form";
import { GoogleButton } from "@/components/auth/google-button";
import { Card, CardContent, CardHeader, CardTitle, Separator } from "@/components/ui/8bit";
import { getPostAuthRedirectPath } from "@/lib/auth/post-auth-redirect";
import { getServerClaims } from "@/lib/supabase/server";
import { safeNextQuery } from "@/lib/navigation/safe-next";
import { redirect } from "next/navigation";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const next = safeNextQuery((await searchParams).next);
  const claims = await getServerClaims().catch(() => null);
  const isUpgrade = Boolean(claims?.is_anonymous);
  if (!isUpgrade) {
    const postAuthPath = await getPostAuthRedirectPath();
    if (postAuthPath) {
      redirect(postAuthPath);
    }
  }
  const signupNext = "/app/onboarding";
  return (
    <main className="grid min-h-dvh place-items-center bg-background px-5 py-10">
      <div className="flex flex-col items-center gap-6 w-full max-w-md">
        <Image
          src="/logo.png"
          alt="PixelAid Logo"
          width={120}
          height={120}
          className="pixelated object-contain"
          priority
        />
        <Card className="w-full">
          <CardHeader>
            <CardTitle font="retro" className="text-center text-sm sm:text-base tracking-wider uppercase">
              {isUpgrade ? "Upgrade akun PixelAid" : "Buat akun PixelAid"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
          <AuthForm
            mode={isUpgrade ? "upgrade" : "register"}
            action={signUpWithPassword}
            next={signupNext}
          />
          <Separator />
          <GoogleButton isUpgrade={isUpgrade} next={signupNext} />
          <p className="text-center text-xs sm:text-sm text-muted-foreground">
            Sudah punya akun?{" "}
            <Link
              href={next ? `/sign-in?next=${encodeURIComponent(next)}` : "/sign-in"}
              className="font-bold text-foreground hover:text-primary transition-colors underline decoration-2 underline-offset-4"
            >
              Masuk
            </Link>
          </p>
        </CardContent>
      </Card>
      </div>
    </main>
  );
}
