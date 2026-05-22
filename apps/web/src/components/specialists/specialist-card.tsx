import Image from "next/image";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/8bit/card";

import { SPECIALISTS_ASSETS, resolveSpecialistIcon } from "./specialists-assets";

type SpecialistCardProps = {
  id: string;
  name: string;
  description: string;
  status: string;
};

function SpecialistCardContent({
  id,
  name,
  description,
  status,
}: SpecialistCardProps) {
  const available = status === "available";
  const iconSrc = resolveSpecialistIcon(id);

  return (
    <Card font="retro" className="h-full py-0">
      <CardContent className="flex min-h-[5.25rem] items-center gap-3 px-3 py-3 sm:min-h-[5.75rem] sm:gap-4 sm:px-4 sm:py-3.5 lg:min-h-[6.5rem] lg:px-5 lg:py-4">
        <div className="relative size-14 shrink-0 overflow-hidden rounded-2xl sm:size-16 lg:size-[4.5rem] lg:rounded-[1.125rem]">
          <Image
            src={iconSrc}
            alt=""
            fill
            className="object-cover object-center pixelated"
            sizes="(max-width: 640px) 56px, (max-width: 1024px) 64px, 72px"
          />
        </div>

        <div className="min-w-0 flex-1 space-y-1 pr-1 sm:pr-2 lg:space-y-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="retro text-sm leading-tight sm:text-base lg:text-lg">
              {name}
            </p>
            {!available ? (
              <span className="rounded-full border border-foreground/40 bg-muted px-2 py-0.5 text-[0.5625rem] font-bold uppercase leading-none text-muted-foreground sm:text-[0.625rem]">
                Soon
              </span>
            ) : null}
          </div>
          <p className="line-clamp-2 text-[0.6875rem] leading-snug text-card-foreground/85 sm:text-xs lg:line-clamp-3 lg:text-sm lg:leading-relaxed">
            {description}
          </p>
        </div>

        {available ? (
          <Image
            src={SPECIALISTS_ASSETS.iconChevronRight}
            alt=""
            width={20}
            height={24}
            className="size-4 shrink-0 object-contain pixelated opacity-90 sm:size-5 lg:size-6"
            aria-hidden
          />
        ) : (
          <span aria-hidden className="size-4 shrink-0 sm:size-5 lg:size-6" />
        )}
      </CardContent>
    </Card>
  );
}

export function SpecialistCard(props: SpecialistCardProps) {
  const available = props.status === "available";

  if (!available) {
    return (
      <div className="h-full cursor-not-allowed opacity-55" aria-disabled="true">
        <SpecialistCardContent {...props} />
      </div>
    );
  }

  return (
    <Link
      href={`/app/specialists/${props.id}`}
      className="block h-full outline-none transition-transform focus-visible:ring-2 focus-visible:ring-white/70 active:scale-[0.99]"
    >
      <SpecialistCardContent {...props} />
    </Link>
  );
}
