import { Button } from "@/components/ui/8bit";
import { signInWithGoogle } from "@/app/auth/actions";

export function GoogleButton({
  isUpgrade = false,
  next,
}: {
  isUpgrade?: boolean;
  next?: string;
}) {
  return (
    <form action={signInWithGoogle} className="w-full">
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <Button className="w-full" type="submit" variant="outline" font="retro">
        {isUpgrade ? "Link Google" : "Google"}
      </Button>
    </form>
  );
}
