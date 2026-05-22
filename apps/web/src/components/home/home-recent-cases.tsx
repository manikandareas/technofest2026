import Link from "next/link";

import { Badge } from "@/components/ui/8bit/badge";

type HomeRecentCasesProps = {
  items: Array<{
    result_id: string;
    session_id: string;
    case_id: string;
    patient_name: string;
  }>;
};

export function HomeRecentCases({ items }: HomeRecentCasesProps) {
  const recent = items.slice(0, 3);
  if (recent.length === 0) return null;

  return (
    <section
      aria-label="Case terbaru"
      className="relative z-20 px-4 pb-3 lg:px-8"
    >
      <p className="retro mb-2 text-center text-[10px] text-white/90 drop-shadow-[1px_1px_0_#000] lg:text-xs">
        Recent Cases
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2 lg:gap-3">
        {recent.map((item) => (
          <Link
            key={item.result_id}
            href={`/app/sessions/${item.session_id}/result?result=${item.result_id}`}
            aria-label={`Buka hasil ${item.patient_name}`}
          >
            <Badge
              variant="secondary"
              font="retro"
              className="cursor-pointer px-3 py-1.5 text-[10px] hover:opacity-90 lg:text-xs"
            >
              {item.patient_name}
            </Badge>
          </Link>
        ))}
      </div>
    </section>
  );
}
