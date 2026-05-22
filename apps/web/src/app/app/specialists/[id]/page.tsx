import { SpecialistCasesScreen } from "@/components/specialists/specialist-cases-screen";
import { fallbackCases, fallbackSpecialists } from "@/lib/api/fallback";
import { getPublicApiClient } from "@/lib/api/server";

export const dynamic = "force-dynamic";

export default async function SpecialistDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const api = await getPublicApiClient();
  const { data } = await api
    .GET("/api/public/specialists/{specialist_id}/cases", {
      params: { path: { specialist_id: id } },
    })
    .catch(() => ({ data: undefined }));
  const cases = data ?? fallbackCases.filter((item) => item.specialist_id === id);
  const specialistName =
    cases[0]?.specialist_name ??
    fallbackSpecialists.find((item) => item.id === id)?.name ??
    "Specialist";

  return (
    <SpecialistCasesScreen
      specialistId={id}
      specialistName={specialistName}
      cases={cases}
    />
  );
}
