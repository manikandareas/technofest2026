import Link from "next/link";

import { Button } from "@/components/ui/8bit/button";

type HomeStartButtonProps = {
  href: string;
  label: string;
};

export function HomeStartButton({ href, label }: HomeStartButtonProps) {
  return (
    <div className="relative z-20 flex justify-center px-6 pb-3 lg:px-8">
      <Button
        asChild
        font="retro"
        className="h-12 w-[min(100%,20rem)] bg-[#5de44a] text-sm text-white hover:bg-[#4cd43b] lg:h-14 lg:w-[min(100%,24rem)] lg:text-base"
      >
        <Link href={href}>{label}</Link>
      </Button>
    </div>
  );
}
