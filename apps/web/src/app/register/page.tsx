import Link from "next/link";
import { signUpWithPassword } from "@/app/auth/actions";
import { AuthForm } from "@/components/auth/auth-form";
import { GoogleButton } from "@/components/auth/google-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getServerClaims } from "@/lib/supabase/server";
import { safeNextQuery } from "@/lib/navigation/safe-next";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const next = safeNextQuery((await searchParams).next);
  const claims = await getServerClaims().catch(() => null);
  const isUpgrade = Boolean(claims?.is_anonymous);
  return (
    <main className="grid min-h-dvh place-items-center bg-background px-5 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isUpgrade ? "Upgrade akun PixelAid" : "Buat akun PixelAid"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <AuthForm
            mode={isUpgrade ? "upgrade" : "register"}
            action={signUpWithPassword}
            next={next}
          />
          <Separator />
          <GoogleButton isUpgrade={isUpgrade} />
          <p className="text-center text-sm text-muted-foreground">
            Sudah punya akun?{" "}
            <Link
              href={next ? `/sign-in?next=${encodeURIComponent(next)}` : "/sign-in"}
              className="font-medium text-foreground"
            >
              Masuk
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
