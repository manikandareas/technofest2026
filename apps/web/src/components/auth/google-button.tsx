import { Button } from "@/components/ui/8bit";
import { signInWithGoogle } from "@/app/auth/actions";

export function GoogleButton({ isUpgrade = false }: { isUpgrade?: boolean }) {
  return (
    <form action={signInWithGoogle} className="w-full">
      <Button className="w-full" type="submit" variant="outline" font="retro">
        {isUpgrade ? "Link Google" : "Google"}
      </Button>
    </form>
  );
}
