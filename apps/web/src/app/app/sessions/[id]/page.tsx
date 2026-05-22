import { notFound, redirect } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { getApiClient } from "@/lib/api/server";
import { ConsultationRoom } from "./consultation-room";

export const dynamic = "force-dynamic";

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const api = await getApiClient();
  const { data, error } = await api
    .GET("/api/case-sessions/{session_id}", {
      params: { path: { session_id: id } },
    })
    .catch(() => ({ data: undefined, error: true }));

  if (error || !data) {
    notFound();
  }
  if (data.status === "completed" && data.result_id) {
    redirect(`/app/sessions/${id}/result?result=${data.result_id}`);
  }

  return (
    <main className="min-h-dvh bg-background">
      <AppHeader />
      <ConsultationRoom initialSession={data} />
    </main>
  );
}
