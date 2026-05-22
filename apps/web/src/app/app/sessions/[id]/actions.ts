"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getApiClient } from "@/lib/api/server";

export async function sendMessage(sessionId: string, content: string) {
  const api = await getApiClient();
  const { data, error } = await api.POST("/api/case-sessions/{session_id}/messages", {
    params: { path: { session_id: sessionId } },
    body: { content },
  });
  if (error || !data) {
    throw new Error("Message could not be sent.");
  }
  revalidatePath(`/app/sessions/${sessionId}`);
  return data.session;
}

export async function getSessionSnapshot(sessionId: string) {
  const api = await getApiClient();
  const { data, error } = await api.GET("/api/case-sessions/{session_id}", {
    params: { path: { session_id: sessionId } },
  });
  if (error || !data) {
    throw new Error("Session could not be refreshed.");
  }
  return data;
}

export async function openMedicalRecord(sessionId: string) {
  const api = await getApiClient();
  const { data, error } = await api.POST(
    "/api/case-sessions/{session_id}/medical-record/opened",
    { params: { path: { session_id: sessionId } } },
  );
  if (error || !data) {
    throw new Error("Medical record could not be opened.");
  }
  revalidatePath(`/app/sessions/${sessionId}`);
  return data;
}

export async function selectExamination(sessionId: string, examinationId: string) {
  const api = await getApiClient();
  const { data, error } = await api.POST("/api/case-sessions/{session_id}/examinations", {
    params: { path: { session_id: sessionId } },
    body: { examination_id: examinationId },
  });
  if (error || !data) {
    throw new Error("Examination could not be selected.");
  }
  revalidatePath(`/app/sessions/${sessionId}`);
  return data;
}

export async function extendTimer(sessionId: string) {
  const api = await getApiClient();
  const { data, error } = await api.POST("/api/case-sessions/{session_id}/timer/extend", {
    params: { path: { session_id: sessionId } },
  });
  if (error || !data) {
    throw new Error("Timer extension is no longer available.");
  }
  revalidatePath(`/app/sessions/${sessionId}`);
  return data;
}

export async function pauseConsultation(sessionId: string) {
  const api = await getApiClient();
  const { data, error } = await api.POST("/api/case-sessions/{session_id}/pause", {
    params: { path: { session_id: sessionId } },
  });
  if (error || !data) {
    throw new Error("Consultation could not be paused.");
  }
  revalidatePath(`/app/sessions/${sessionId}`);
  return data;
}

export async function resumeConsultation(sessionId: string) {
  const api = await getApiClient();
  const { data, error } = await api.POST("/api/case-sessions/{session_id}/resume", {
    params: { path: { session_id: sessionId } },
  });
  if (error || !data) {
    throw new Error("Consultation could not be resumed.");
  }
  revalidatePath(`/app/sessions/${sessionId}`);
  return data;
}

export async function endConsultation(sessionId: string) {
  const api = await getApiClient();
  const { data, error } = await api.POST(
    "/api/case-sessions/{session_id}/end-consultation",
    { params: { path: { session_id: sessionId } } },
  );
  if (error || !data) {
    throw new Error("Consultation could not be ended.");
  }
  revalidatePath(`/app/sessions/${sessionId}`);
  return data;
}

export async function startVoiceSession(sessionId: string) {
  const api = await getApiClient();
  const { data, error } = await api.POST("/api/livekit/token", {
    body: { session_id: sessionId },
  });
  if (error || !data) {
    throw new Error("Voice session could not be started.");
  }
  return data;
}

export async function submitQuiz(sessionId: string, answers: Record<string, string>) {
  const api = await getApiClient();
  const { data, error } = await api.POST("/api/case-sessions/{session_id}/quiz-submit", {
    params: { path: { session_id: sessionId } },
    body: { answers },
  });
  if (error || !data) {
    throw new Error("Quiz could not be submitted.");
  }
  revalidatePath(`/app/sessions/${sessionId}`);
  redirect(`/app/sessions/${sessionId}/result?result=${data.id}`);
}
