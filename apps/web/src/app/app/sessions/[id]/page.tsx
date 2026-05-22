import { notFound, redirect } from "next/navigation";

import { SessionLoadRecover } from "@/components/sessions/session-load-recover";
import { getApiClient } from "@/lib/api/server";
import { withReadRetries } from "@/lib/api/retry-read";

import { ConsultationRoom } from "./consultation-room";

export const dynamic = "force-dynamic";

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const loadResult = await withReadRetries(
    async () => {
      const api = await getApiClient();
      return api.GET("/api/case-sessions/{session_id}", {
        params: { path: { session_id: id } },
      });
    },
    {
      isDefinitiveNotFound: (attempt) => attempt.response?.status === 404,
    },
  );

  if (loadResult.status === "not_found") {
    notFound();
  }

  if (loadResult.status === "transient") {
    return (
      <SessionLoadRecover
        title="Konsultasi belum siap"
        message="Sesi simulasi masih disinkronkan. Halaman akan dicoba muat ulang otomatis."
      />
    );
  }

  const data = loadResult.data;
  if (data.status === "completed" && data.result_id) {
    redirect(`/app/sessions/${id}/result?result=${data.result_id}`);
  }

  return <ConsultationRoom initialSession={data} />;
}
