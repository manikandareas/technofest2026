import { Button } from "@/components/ui/8bit";
import { signInWithGoogle } from "@/app/auth/actions";
import { GOOGLE_AUTH_ENABLED } from "@/lib/auth/google-auth";

export function GoogleButton({
  isUpgrade = false,
  next,
}: {
  isUpgrade?: boolean;
  next?: string;
}) {
  const label = isUpgrade ? "Link Google" : "Google";
  const disabledHint = "Login Google sementara tidak tersedia.";

  return (
    <form action={signInWithGoogle} className="w-full">
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <Button
        className="w-full"
        type="submit"
        variant="outline"
        font="retro"
        disabled={!GOOGLE_AUTH_ENABLED}
        aria-disabled={!GOOGLE_AUTH_ENABLED}
        title={!GOOGLE_AUTH_ENABLED ? disabledHint : undefined}
      >
        {label}
      </Button>
    </form>
  );
}
