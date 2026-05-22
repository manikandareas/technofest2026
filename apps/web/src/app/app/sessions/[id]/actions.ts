"use server";

import { revalidatePath } from "next/cache";
import type { PixelAidApiComponents } from "@technofest2026/contracts";

import { apiCatchMessage, apiErrorMessage, fail, ok } from "@/lib/api/action-result";
import { getApiClient } from "@/lib/api/server";

type CaseSession = PixelAidApiComponents["schemas"]["CaseSessionResponse"];

export async function sendMessage(sessionId: string, content: string) {
  try {
    const api = await getApiClient("gameAction");
    const { data, error } = await api.POST("/api/case-sessions/{session_id}/messages", {
      params: { path: { session_id: sessionId } },
      body: { content },
    });
    if (error || !data) {
      return fail<CaseSession>(
        apiErrorMessage(error, "Pesan belum bisa dikirim. Coba lagi sebentar."),
      );
    }
    revalidatePath(`/app/sessions/${sessionId}`);
    return ok(data.session);
  } catch (error) {
    return fail<CaseSession>(
      apiCatchMessage(error, "Pesan belum bisa dikirim karena koneksi tidak stabil."),
    );
  }
}

export async function getSessionSnapshot(sessionId: string) {
  try {
    const api = await getApiClient("authRead");
    const { data, error } = await api.GET("/api/case-sessions/{session_id}", {
      params: { path: { session_id: sessionId } },
    });
    if (error || !data) {
      return fail<CaseSession>(
        apiErrorMessage(error, "Sesi belum bisa diperbarui. Coba lagi sebentar."),
      );
    }
    return ok<CaseSession>(data as CaseSession);
  } catch (error) {
    return fail<CaseSession>(
      apiCatchMessage(error, "Sesi belum bisa diperbarui karena koneksi tidak stabil."),
    );
  }
}

export async function openMedicalRecord(sessionId: string) {
  try {
    const api = await getApiClient("gameAction");
    const { data, error } = await api.POST(
      "/api/case-sessions/{session_id}/medical-record/opened",
      { params: { path: { session_id: sessionId } } },
    );
    if (error || !data) {
      return fail<CaseSession>(
        apiErrorMessage(error, "Rekam medis belum bisa dibuka. Coba lagi."),
      );
    }
    revalidatePath(`/app/sessions/${sessionId}`);
    return ok(data);
  } catch (error) {
    return fail<CaseSession>(
      apiCatchMessage(error, "Rekam medis belum bisa dibuka karena koneksi tidak stabil."),
    );
  }
}

export async function selectExamination(sessionId: string, examinationId: string) {
  try {
    const api = await getApiClient("gameAction");
    const { data, error } = await api.POST("/api/case-sessions/{session_id}/examinations", {
      params: { path: { session_id: sessionId } },
      body: { examination_id: examinationId },
    });
    if (error || !data) {
      return fail<CaseSession>(
        apiErrorMessage(error, "Pemeriksaan belum bisa dipilih. Coba lagi."),
      );
    }
    revalidatePath(`/app/sessions/${sessionId}`);
    return ok(data);
  } catch (error) {
    return fail<CaseSession>(
      apiCatchMessage(error, "Pemeriksaan belum bisa dipilih karena koneksi tidak stabil."),
    );
  }
}

export async function extendTimer(sessionId: string) {
  try {
    const api = await getApiClient("gameAction");
    const { data, error } = await api.POST("/api/case-sessions/{session_id}/timer/extend", {
      params: { path: { session_id: sessionId } },
    });
    if (error || !data) {
      return fail(
        apiErrorMessage(error, "Perpanjangan waktu belum tersedia. Coba lagi sebentar."),
      );
    }
    revalidatePath(`/app/sessions/${sessionId}`);
    return ok(data);
  } catch (error) {
    return fail(
      apiCatchMessage(error, "Perpanjangan waktu gagal karena koneksi tidak stabil."),
    );
  }
}

export async function pauseConsultation(sessionId: string) {
  try {
    const api = await getApiClient("gameAction");
    const { data, error } = await api.POST("/api/case-sessions/{session_id}/pause", {
      params: { path: { session_id: sessionId } },
    });
    if (error || !data) {
      return fail<CaseSession>(
        apiErrorMessage(error, "Konsultasi belum bisa dijeda. Coba lagi."),
      );
    }
    revalidatePath(`/app/sessions/${sessionId}`);
    return ok(data);
  } catch (error) {
    return fail<CaseSession>(
      apiCatchMessage(error, "Konsultasi belum bisa dijeda karena koneksi tidak stabil."),
    );
  }
}

export async function resumeConsultation(sessionId: string) {
  try {
    const api = await getApiClient("gameAction");
    const { data, error } = await api.POST("/api/case-sessions/{session_id}/resume", {
      params: { path: { session_id: sessionId } },
    });
    if (error || !data) {
      return fail<CaseSession>(
        apiErrorMessage(error, "Konsultasi belum bisa dilanjutkan. Coba lagi."),
      );
    }
    revalidatePath(`/app/sessions/${sessionId}`);
    return ok(data);
  } catch (error) {
    return fail<CaseSession>(
      apiCatchMessage(error, "Konsultasi belum bisa dilanjutkan karena koneksi tidak stabil."),
    );
  }
}

export async function endConsultation(sessionId: string) {
  try {
    const api = await getApiClient("gameAction");
    const { data, error } = await api.POST(
      "/api/case-sessions/{session_id}/end-consultation",
      { params: { path: { session_id: sessionId } } },
    );
    if (error || !data) {
      return fail<CaseSession>(
        apiErrorMessage(error, "Konsultasi belum bisa diakhiri. Coba lagi."),
      );
    }
    revalidatePath(`/app/sessions/${sessionId}`);
    return ok(data);
  } catch (error) {
    return fail<CaseSession>(
      apiCatchMessage(error, "Konsultasi belum bisa diakhiri karena koneksi tidak stabil."),
    );
  }
}

export async function startVoiceSession(sessionId: string) {
  try {
    const api = await getApiClient("voiceAction");
    const { data, error } = await api.POST("/api/livekit/token", {
      body: { session_id: sessionId },
    });
    if (error || !data) {
      return fail(apiErrorMessage(error, "Voice belum siap. Mode teks tetap bisa digunakan."));
    }
    return ok(data);
  } catch (error) {
    return fail(apiCatchMessage(error, "Voice belum siap. Mode teks tetap bisa digunakan."));
  }
}

export async function tryStartVoiceSession(sessionId: string) {
  const result = await startVoiceSession(sessionId);
  if (result.error) {
    return {
      token: null,
      error: result.error,
    };
  }
  return { token: result.data, error: null };
}

export async function submitQuiz(sessionId: string, answers: Record<string, string>) {
  try {
    const api = await getApiClient("gameAction");
    const { data, error } = await api.POST("/api/case-sessions/{session_id}/quiz-submit", {
      params: { path: { session_id: sessionId } },
      body: { answers },
    });
    if (error || !data) {
      return {
        resultId: null,
        error: apiErrorMessage(error, "Quiz belum bisa dikirim. Coba lagi sebentar."),
      };
    }
    revalidatePath(`/app/sessions/${sessionId}`);
    return { resultId: data.id, error: null };
  } catch (error) {
    return {
      resultId: null,
      error: apiCatchMessage(
        error,
        "Quiz belum bisa dikirim karena koneksi ke server tidak stabil. Coba lagi sebentar.",
      ),
    };
  }
}
