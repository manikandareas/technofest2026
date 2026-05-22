import { SpecialistsScreen } from "@/components/specialists/specialists-screen";
import { fallbackSpecialists } from "@/lib/api/fallback";
import { getPublicApiClient } from "@/lib/api/server";

export const dynamic = "force-dynamic";

export default async function SpecialistsPage() {
  const api = await getPublicApiClient();
  const { data } = await api
    .GET("/api/public/specialists")
    .catch(() => ({ data: fallbackSpecialists }));
  const specialists = data ?? fallbackSpecialists;

  return <SpecialistsScreen specialists={specialists} />;
}
