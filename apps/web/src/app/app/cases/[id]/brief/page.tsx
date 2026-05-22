import { CaseBriefScreen } from "@/components/cases/case-brief-screen";
import { fallbackCases } from "@/lib/api/fallback";
import { getPublicApiClient } from "@/lib/api/server";

import { startCaseSessionInline } from "../../actions";

export const dynamic = "force-dynamic";

async function loadCase(id: string) {
  const api = await getPublicApiClient();
  const { data } = await api
    .GET("/api/public/cases/{case_id}", { params: { path: { case_id: id } } })
    .catch(() => ({ data: undefined }));
  return data ?? fallbackCases.find((item) => item.id === id) ?? fallbackCases[0];
}

export default async function CaseBriefPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await loadCase(id);
  const startSessionAction = startCaseSessionInline.bind(null, item.id);

  return <CaseBriefScreen item={item} startSessionAction={startSessionAction} />;
}
