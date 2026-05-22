import { redirect } from "next/navigation";
import { getApiClient } from "@/lib/api/server";

export const dynamic = "force-dynamic";

export default async function HistoryDetailPage({
  params,
}: {
  params: Promise<{ resultId: string }>;
}) {
  const { resultId } = await params;
  const api = await getApiClient();
  const { data } = await api
    .GET("/api/history/{result_id}", {
      params: { path: { result_id: resultId } },
    })
    .catch(() => ({ data: undefined }));

  if (!data) {
    redirect("/history");
  }

  redirect(`/app/sessions/${data.session_id}/result?result=${data.id}`);
}
