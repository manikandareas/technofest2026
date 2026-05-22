import { SpecialistCard } from "./specialist-card";
import {
  SpecialistsScreenLayout,
  specialistsContentPanelClass,
  specialistsScrollAreaClass,
} from "./specialists-screen-layout";

export type SpecialistListItem = {
  id: string;
  name: string;
  description: string;
  status: string;
};

type SpecialistsScreenProps = {
  specialists: SpecialistListItem[];
};

export function SpecialistsScreen({ specialists }: SpecialistsScreenProps) {
  const availableCount = specialists.filter((item) => item.status === "available").length;

  return (
    <SpecialistsScreenLayout
      backHref="/app/home"
      backLabel="Kembali ke home"
      title="CHOOSE SPECIALIST"
    >
      <section className={specialistsContentPanelClass}>
        <div className="mx-auto max-w-md space-y-1 text-center sm:max-w-lg lg:max-w-2xl">
          <p className="text-xs leading-relaxed text-white drop-shadow-[1px_1px_0_#000] sm:text-sm lg:text-base lg:leading-relaxed">
            Pilih bidang spesialisasi untuk mulai menangani pasien dan menyelesaikan kasus.
          </p>
          <p className="text-[0.625rem] font-bold uppercase tracking-wide text-white/75 drop-shadow-[1px_1px_0_#000] sm:text-[0.6875rem]">
            {availableCount} spesialis tersedia
          </p>
        </div>

        <div className={specialistsScrollAreaClass}>
          {specialists.map((specialist) => (
            <SpecialistCard
              key={specialist.id}
              id={specialist.id}
              name={specialist.name}
              description={specialist.description}
              status={specialist.status}
            />
          ))}
        </div>
      </section>
    </SpecialistsScreenLayout>
  );
}
