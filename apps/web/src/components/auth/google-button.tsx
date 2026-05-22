import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "@/app/auth/actions";

export function GoogleButton() {
  return (
    <form action={signInWithGoogle}>
      <Button className="w-full" type="submit" variant="outline">
        Lanjutkan dengan Google
      </Button>
    </form>
  );
}
