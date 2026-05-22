"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { AlertTriangle, DoorOpen, Pause } from "lucide-react";

import { resolvePatientConsultationAvatar } from "@/components/cases/cases-assets";
import { HOME_ASSETS } from "@/components/home/home-assets";
import { SessionExamineDrawer } from "@/components/sessions/session-examine-drawer";
import { SessionMedicalRecordDrawer } from "@/components/sessions/session-medical-record-drawer";
import { SessionMessageDrawer } from "@/components/sessions/session-message-drawer";
import { SessionPatientHud } from "@/components/sessions/session-patient-hud";
import { SessionQuizPanel } from "@/components/sessions/session-quiz-panel";
import { SessionTimerControls } from "@/components/sessions/session-timer-controls";
import { sessionToolbarIconButtonClass } from "@/components/sessions/sessions-assets";
import { Button } from "@/components/ui/8bit/button";
import * as AlertDialog from "@/components/ui/alert-dialog";

import {
  endConsultation,
  extendTimer,
  getSessionSnapshot,
  openMedicalRecord,
  pauseConsultation,
  resumeConsultation,
  selectExamination,
  sendMessage,
  submitQuiz,
  tryStartVoiceSession,
} from "./actions";
import { useConsultationTimer, type CaseSession } from "./use-consultation-timer";
import { VoicePanel, type VoiceToken, type VoiceUiState } from "./voice-panel";

function ConsultationSceneBackground() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <Image
        src={HOME_ASSETS.sceneBgMobile}
        alt=""
        fill
        priority
        className="object-cover object-center pixelated lg:hidden"
        sizes="100vw"
      />
      <Image
        src={HOME_ASSETS.sceneBgDesktop}
        alt=""
        fill
        priority
        className="hidden object-cover object-center pixelated lg:block"
        sizes="100vw"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-[#02153d]/25 via-transparent to-[#02153d]/55"
      />
    </div>
  );
}

function PatientSpeechBubble({ content }: { content: string | null }) {
  if (!content) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute left-1/2 top-[38%] z-10 w-[min(88%,16rem)] -translate-x-1/2 sm:top-[36%] sm:w-[min(78%,18rem)]">
      <div className="relative rounded-[1.25rem] border-2 border-foreground bg-white px-3 py-2.5 text-xs leading-relaxed text-[#1a233e] shadow-[3px_3px_0_#000] sm:px-4 sm:py-3 sm:text-sm">
        {content}
        <span
          aria-hidden
          className="absolute -bottom-2 left-1/2 size-3 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-foreground bg-white"
        />
      </div>
    </div>
  );
}

export function ConsultationRoom({ initialSession }: { initialSession: CaseSession }) {
  const [session, setSession] = useState(initialSession);
  const [question, setQuestion] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [voiceToken, setVoiceToken] = useState<VoiceToken | null>(null);
  const [voiceState, setVoiceState] = useState<VoiceUiState>("idle");
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [voiceAutoConnectBlocked, setVoiceAutoConnectBlocked] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const voiceConnectInFlight = useRef(false);

  const clearVoiceConnection = useCallback((nextState: VoiceUiState = "idle") => {
    setVoiceToken(null);
    setVoiceState(nextState);
  }, []);

  const {
    remainingSeconds,
    isExpired,
    isConsultationLocked,
    shouldWarnTime,
    applySession,
  } = useConsultationTimer({
    session,
    onSessionChange: setSession,
    onConsultationLocked: clearVoiceConnection,
    onRefreshError: (message) => setError(message),
  });

  const selectedExamIds = useMemo(
    () => new Set(session.examinations.map((exam) => exam.examination_id)),
    [session.examinations],
  );
  const isQuizComplete = session.quiz.length > 0 && session.quiz.every((item) => answers[item.id]);
  const latestPatientMessage = useMemo(() => {
    for (let index = session.messages.length - 1; index >= 0; index -= 1) {
      const message = session.messages[index];
      if (message?.role === "patient") {
        return message.content;
      }
    }
    return session.case.chief_complaint;
  }, [session.case.chief_complaint, session.messages]);
  const patientAvatarSrc = resolvePatientConsultationAvatar(
    session.case.patient_name,
    session.case.consultation_avatar_url,
  );

  const requestVoiceConnection = useCallback(
    async ({ force = false }: { force?: boolean } = {}) => {
      if (voiceConnectInFlight.current || isConsultationLocked) {
        return;
      }
      if (!force && voiceToken) {
        return;
      }

      voiceConnectInFlight.current = true;
      if (force) {
        setVoiceToken(null);
      }
      setVoiceError(null);
      setVoiceState("connecting");

      try {
        const result = await tryStartVoiceSession(session.id);
        if (result.token) {
          setVoiceToken(result.token);
          setVoiceAutoConnectBlocked(false);
          return;
        }

        setVoiceError(result.error ?? "Voice session could not be started.");
        setVoiceState("error");
        setVoiceAutoConnectBlocked(true);
      } catch {
        setVoiceError("Voice session could not be started.");
        setVoiceState("error");
        setVoiceAutoConnectBlocked(true);
      } finally {
        voiceConnectInFlight.current = false;
      }
    },
    [isConsultationLocked, session.id, voiceToken],
  );

  useEffect(() => {
    if (session.status !== "in_consultation" || isConsultationLocked) {
      return;
    }
    if (voiceToken || voiceAutoConnectBlocked || voiceConnectInFlight.current) {
      return;
    }

    void requestVoiceConnection();
  }, [
    isConsultationLocked,
    requestVoiceConnection,
    session.status,
    voiceAutoConnectBlocked,
    voiceToken,
  ]);

  function run(action: () => Promise<CaseSession | unknown>) {
    setError(null);
    startTransition(async () => {
      try {
        const next = await action();
        if (next && typeof next === "object" && "id" in next) {
          applySession(next as CaseSession);
          if ((next as CaseSession).is_paused) {
            clearVoiceConnection();
          }
        }
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Action failed.");
      }
    });
  }

  function submitQuestion() {
    const content = question.trim();
    if (!content) return;
    setQuestion("");
    run(async () => sendMessage(session.id, content));
  }

  function handleVoiceError(message: string) {
    const normalized = message.toLowerCase();
    if (normalized.includes("client initiated disconnect")) {
      clearVoiceConnection("disconnected");
      setVoiceAutoConnectBlocked(true);
      return;
    }

    setVoiceError("Voice belum siap. Mode teks tetap bisa digunakan.");
    clearVoiceConnection("error");
    setVoiceAutoConnectBlocked(true);
  }

  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-[#02153d]">
        <ConsultationSceneBackground />

        <main className="relative mx-auto flex min-h-dvh w-full max-w-[393px] flex-col md:max-w-3xl lg:max-w-5xl xl:max-w-6xl">
          <header className="relative z-20 flex items-start justify-between gap-3 px-3 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-4 sm:pb-3 md:px-6 lg:px-8 lg:pt-6">
            <SessionPatientHud
              patientName={session.case.patient_name}
              patientAge={session.case.patient_age}
              conditionBadge={session.case.condition_badge}
              avatarUrl={session.case.patient_avatar_url}
            />
            {session.status === "in_consultation" ? (
              <SessionTimerControls
                remainingSeconds={remainingSeconds}
                shouldWarnTime={shouldWarnTime}
                isPaused={session.is_paused}
                showPauseControl
                disabled={isConsultationLocked}
                isPending={isPending}
                onPause={() => run(() => pauseConsultation(session.id))}
                onResume={() => run(() => resumeConsultation(session.id))}
              />
            ) : null}
          </header>

          <section className="relative z-10 flex min-h-0 flex-1 flex-col">
            {session.status === "quiz" ? (
              <div className="flex flex-1 items-start justify-center px-3 py-4 sm:px-4 md:px-6">
                <SessionQuizPanel
                  quiz={session.quiz}
                  answers={answers}
                  isPending={isPending}
                  isQuizComplete={isQuizComplete}
                  onAnswerChange={(questionId, optionId) =>
                    setAnswers((current) => ({ ...current, [questionId]: optionId }))
                  }
                  onSubmit={() => {
                    setError(null);
                    startTransition(async () => {
                      try {
                        await submitQuiz(session.id, answers);
                      } catch (caught) {
                        setError(
                          caught instanceof Error ? caught.message : "Quiz could not be submitted.",
                        );
                      }
                    });
                  }}
                />
              </div>
            ) : (
              <>
                <div className="relative min-h-[18rem] flex-1 sm:min-h-[22rem]">
                  <PatientSpeechBubble content={latestPatientMessage} />

                  <div className="pointer-events-none absolute inset-x-0 bottom-[1.5rem] flex justify-center">
                    <div className="relative h-[min(34vh,12rem)] w-[min(42vw,9rem)] sm:h-[min(36vh,14rem)] sm:w-[min(36vw,10rem)]">
                      <Image
                        src={patientAvatarSrc}
                        alt=""
                        fill
                        priority
                        className="object-contain object-bottom pixelated drop-shadow-[0_8px_0_rgba(0,0,0,0.25)]"
                        sizes="160px"
                      />
                    </div>
                  </div>
                </div>

                {shouldWarnTime ? (
                  <p className="mx-3 mb-2 flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50/95 px-3 py-2 text-xs text-amber-950 sm:mx-4 sm:text-sm">
                    <AlertTriangle className="size-4 shrink-0" />
                    Waktu konsultasi tersisa kurang dari 60 detik.
                  </p>
                ) : null}
                {session.is_paused ? (
                  <p className="mx-3 mb-2 flex items-center gap-2 rounded-xl border border-sky-300 bg-sky-50/95 px-3 py-2 text-xs text-sky-950 sm:mx-4 sm:text-sm">
                    <Pause className="size-4 shrink-0" />
                    Input, pemeriksaan, rekam medis, dan voice dinonaktifkan sampai konsultasi
                    dilanjutkan.
                  </p>
                ) : null}
                {error ? (
                  <p className="mx-3 mb-2 rounded-xl border border-destructive/40 bg-background/95 px-3 py-2 text-xs text-destructive sm:mx-4 sm:text-sm">
                    {error}
                  </p>
                ) : null}

                <footer className="relative z-20 shrink-0 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2 sm:px-4 md:px-6">
                  <div className="flex flex-col items-center gap-3">
                    <VoicePanel
                      token={voiceToken}
                      uiState={voiceState}
                      error={voiceError}
                      isPending={isPending}
                      disabled={isConsultationLocked}
                      onStateChange={setVoiceState}
                      onError={handleVoiceError}
                      onReconnect={() => {
                        setVoiceAutoConnectBlocked(false);
                        void requestVoiceConnection({ force: true });
                      }}
                    />

                    <div className="grid w-full grid-cols-4 gap-1.5 sm:gap-2">
                      <SessionMessageDrawer
                        messages={session.messages}
                        question={question}
                        disabled={isConsultationLocked}
                        isPending={isPending}
                        onQuestionChange={setQuestion}
                        onSubmit={submitQuestion}
                      />
                      <SessionMedicalRecordDrawer
                        opened={session.medical_record_opened}
                        record={session.medical_record}
                        disabled={isConsultationLocked}
                        isPending={isPending}
                        onOpen={() => run(() => openMedicalRecord(session.id))}
                      />
                      <SessionExamineDrawer
                        options={session.examination_options}
                        examinations={session.examinations}
                        selectedExamIds={selectedExamIds}
                        disabled={isConsultationLocked}
                        isPending={isPending}
                        onSelectExamination={(examinationId) =>
                          run(() => selectExamination(session.id, examinationId))
                        }
                      />
                      <AlertDialog.Root open={showEndConfirm} onOpenChange={setShowEndConfirm}>
                        <AlertDialog.Trigger asChild>
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            font="retro"
                            className={sessionToolbarIconButtonClass}
                            disabled={isPending || session.status !== "in_consultation"}
                            aria-label="Akhiri konsultasi"
                          >
                            <DoorOpen className="size-5 sm:size-6" aria-hidden />
                            <span className="text-[0.625rem] leading-none sm:text-[0.6875rem]">
                              End
                            </span>
                          </Button>
                        </AlertDialog.Trigger>
                        <AlertDialog.Portal>
                          <AlertDialog.Overlay className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" />
                          <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-md border bg-background p-5 shadow-lg">
                            <AlertDialog.Title className="text-lg font-semibold">
                              Akhiri konsultasi?
                            </AlertDialog.Title>
                            <AlertDialog.Description className="mt-2 text-sm leading-6 text-muted-foreground">
                              Setelah konsultasi diakhiri, sesi akan masuk ke quiz diagnosis.
                            </AlertDialog.Description>
                            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                              <AlertDialog.Cancel asChild>
                                <Button variant="outline" disabled={isPending}>
                                  Cancel
                                </Button>
                              </AlertDialog.Cancel>
                              <AlertDialog.Action asChild>
                                <Button
                                  disabled={isPending}
                                  onClick={() => {
                                    setShowEndConfirm(false);
                                    run(() => endConsultation(session.id));
                                  }}
                                >
                                  End consultation
                                </Button>
                              </AlertDialog.Action>
                            </div>
                          </AlertDialog.Content>
                        </AlertDialog.Portal>
                      </AlertDialog.Root>
                    </div>
                  </div>
                </footer>
              </>
            )}
          </section>
        </main>

        <AlertDialog.Root open={isExpired} onOpenChange={() => undefined}>
          <AlertDialog.Portal>
            <AlertDialog.Overlay className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" />
            <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-md border bg-background p-5 shadow-lg">
              <AlertDialog.Title className="text-lg font-semibold">
                Waktu konsultasi habis
              </AlertDialog.Title>
              <AlertDialog.Description className="mt-2 text-sm leading-6 text-muted-foreground">
                Konsultasi dijeda. Lanjutkan 60 detik sekali saja, atau masuk ke quiz diagnosis.
              </AlertDialog.Description>
              <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                {!session.used_extension ? (
                  <Button
                    variant="outline"
                    disabled={isPending}
                    onClick={() =>
                      run(async () => {
                        await extendTimer(session.id);
                        return getSessionSnapshot(session.id);
                      })
                    }
                  >
                    Lanjut 60 detik
                  </Button>
                ) : null}
                <Button disabled={isPending} onClick={() => run(() => endConsultation(session.id))}>
                  Masuk Quiz Diagnosis
                </Button>
              </div>
            </AlertDialog.Content>
          </AlertDialog.Portal>
        </AlertDialog.Root>
      </div>
  );
}
