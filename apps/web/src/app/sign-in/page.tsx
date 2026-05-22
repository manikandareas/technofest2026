import Link from "next/link";
import Image from "next/image";
import { signInWithPassword } from "@/app/auth/actions";
import { AuthForm } from "@/components/auth/auth-form";
import { GoogleButton } from "@/components/auth/google-button";
import { Card, CardContent, CardHeader, CardTitle, Separator } from "@/components/ui/8bit";
import { getPostAuthRedirectPath } from "@/lib/auth/post-auth-redirect";
import { safeNextQuery } from "@/lib/navigation/safe-next";
import { redirect } from "next/navigation";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const postAuthPath = await getPostAuthRedirectPath();
  if (postAuthPath) {
    redirect(postAuthPath);
  }

  const next = safeNextQuery((await searchParams).next);
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
              Masuk ke PixelAid
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
          <AuthForm mode="sign-in" action={signInWithPassword} next={next} />
          <Separator />
          <GoogleButton next={next} />
          <p className="text-center text-xs sm:text-sm text-muted-foreground">
            Belum punya akun?{" "}
            <Link
              href={next ? `/register?next=${encodeURIComponent(next)}` : "/register"}
              className="font-bold text-foreground hover:text-primary transition-colors underline decoration-2 underline-offset-4"
            >
              Daftar
            </Link>
          </p>
        </CardContent>
      </Card>
      </div>
    </main>
  );
}
