import Image from "next/image";
import Link from "next/link";

import { SPECIALISTS_ASSETS, resolveSpecialistIcon } from "./specialists-assets";

type SpecialistCardProps = {
  id: string;
  name: string;
  description: string;
  status: string;
};

export function SpecialistCard({ id, name, description, status }: SpecialistCardProps) {
  const available = status === "available";
  const iconSrc = resolveSpecialistIcon(id);

  const content = (
    <>
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
        <p className="retro text-sm leading-tight text-black sm:text-base lg:text-lg">
          {name}
        </p>
        <p className="text-[0.6875rem] leading-snug text-black/85 sm:text-xs lg:text-sm lg:leading-relaxed">
          {description}
        </p>
      </div>

      <Image
        src={SPECIALISTS_ASSETS.iconChevronRight}
        alt=""
        width={20}
        height={24}
        className="size-4 shrink-0 object-contain pixelated opacity-90 sm:size-5 lg:size-6"
        aria-hidden
      />
    </>
  );

  const className =
    "flex h-full min-h-[5.25rem] items-center gap-3 rounded-[1.125rem] border-2 border-black bg-white px-3 py-3 transition-transform sm:min-h-[5.75rem] sm:gap-4 sm:px-4 sm:py-3.5 lg:min-h-[6.5rem] lg:rounded-[1.25rem] lg:px-5 lg:py-4";

  if (!available) {
    return (
      <div
        className={`${className} cursor-not-allowed opacity-55`}
        aria-disabled="true"
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      href={`/app/specialists/${id}`}
      className={`${className} outline-none hover:bg-white/95 focus-visible:ring-2 focus-visible:ring-[#033676] active:scale-[0.99]`}
    >
      {content}
    </Link>
  );
}
