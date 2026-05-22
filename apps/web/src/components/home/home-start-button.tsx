import Link from "next/link";

import { Button } from "@/components/ui/8bit/button";

type HomeStartButtonProps = {
  href: string;
  label: string;
};

export function HomeStartButton({ href, label }: HomeStartButtonProps) {
  return (
    <div className="relative z-20 px-6 pb-3 lg:px-8">
      <Button
        asChild
        font="retro"
        className="mx-auto flex h-12 w-full max-w-xs bg-[#22c55e] text-sm text-white hover:bg-[#16a34a] lg:h-14 lg:max-w-sm lg:text-base"
      >
        <Link href={href}>{label}</Link>
      </Button>
    </div>
  );
}
