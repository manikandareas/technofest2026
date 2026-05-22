import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "@/app/auth/actions";

export function GoogleButton({ isUpgrade = false }: { isUpgrade?: boolean }) {
  return (
    <form action={signInWithGoogle}>
      <Button className="w-full" type="submit" variant="outline">
        {isUpgrade ? "Link Google" : "Lanjutkan dengan Google"}
      </Button>
    </form>
  );
}
