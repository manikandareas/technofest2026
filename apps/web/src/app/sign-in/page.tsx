import Link from "next/link";
import { signInWithPassword } from "@/app/auth/actions";
import { AuthForm } from "@/components/auth/auth-form";
import { GoogleButton } from "@/components/auth/google-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const next = safeNext((await searchParams).next);
  return (
    <main className="grid min-h-dvh place-items-center bg-background px-5 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Masuk ke PixelAid</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <AuthForm mode="sign-in" action={signInWithPassword} next={next} />
          <Separator />
          <GoogleButton />
          <p className="text-center text-sm text-muted-foreground">
            Belum punya akun?{" "}
            <Link
              href={next ? `/register?next=${encodeURIComponent(next)}` : "/register"}
              className="font-medium text-foreground"
            >
              Daftar
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

function safeNext(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("://")) {
    return undefined;
  }
  return value;
}
