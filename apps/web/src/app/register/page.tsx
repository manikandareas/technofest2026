import Link from "next/link";
import { signUpWithPassword } from "@/app/auth/actions";
import { AuthForm } from "@/components/auth/auth-form";
import { GoogleButton } from "@/components/auth/google-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const next = safeNext((await searchParams).next);
  return (
    <main className="grid min-h-dvh place-items-center bg-background px-5 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Buat akun PixelAid</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <AuthForm mode="register" action={signUpWithPassword} next={next} />
          <Separator />
          <GoogleButton />
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

function safeNext(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("://")) {
    return undefined;
  }
  return value;
}
