"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import {
  AlertTriangle,
  Clock,
  FileText,
  Pause,
  Play,
  Send,
  Stethoscope,
  TimerReset,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  startVoiceSession,
  submitQuiz,
} from "./actions";
import { useConsultationTimer, type CaseSession } from "./use-consultation-timer";
import { VoicePanel, type VoiceToken, type VoiceUiState } from "./voice-panel";

function formatTranscriptTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function ConsultationRoom({ initialSession }: { initialSession: CaseSession }) {
  const [session, setSession] = useState(initialSession);
  const [question, setQuestion] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [voiceToken, setVoiceToken] = useState<VoiceToken | null>(null);
  const [voiceState, setVoiceState] = useState<VoiceUiState>("idle");
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  const stopVoice = useCallback(() => {
    setVoiceToken(null);
    setVoiceState("idle");
  }, []);

  const {
    remainingSeconds,
    isExpired,
    isConsultationLocked,
    shouldWarnTime,
    clockLabel,
    applySession,
  } = useConsultationTimer({
    session,
    onSessionChange: setSession,
    onConsultationLocked: stopVoice,
    onRefreshError: (message) => setError(message),
  });

  const selectedExamIds = useMemo(
    () => new Set(session.examinations.map((exam) => exam.examination_id)),
    [session.examinations],
  );
  const isQuizComplete = session.quiz.length > 0 && session.quiz.every((item) => answers[item.id]);

  function run(action: () => Promise<CaseSession | unknown>) {
    setError(null);
    startTransition(async () => {
      try {
        const next = await action();
        if (next && typeof next === "object" && "id" in next) {
          applySession(next as CaseSession);
          if ((next as CaseSession).is_paused) {
            stopVoice();
          }
        }
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Action failed.");
      }
    });
  }

  return (
    <section className="mx-auto grid w-full max-w-7xl gap-5 px-5 py-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
      <div className="space-y-5">
        <div className="rounded-md border bg-card p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <Badge>
                {session.status === "quiz" ? "Quiz" : session.is_paused ? "Paused" : "Consultation"}
              </Badge>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight">
                {session.status === "quiz" ? "Final quiz" : "Ruang konsultasi"}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {session.is_paused
                  ? "Konsultasi dijeda. Resume untuk melanjutkan timer dan kontrol klinis."
                  : "Gunakan voice atau teks untuk menggali informasi pasien."}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex h-11 items-center gap-2 rounded-md border px-3 font-mono text-lg">
                <Clock className="size-4" />
                {clockLabel}
              </div>
              {session.status === "in_consultation" ? (
                session.is_paused ? (
                  <Button
                    disabled={isPending}
                    onClick={() => run(() => resumeConsultation(session.id))}
                  >
                    <Play className="size-4" />
                    Resume
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    disabled={isPending || remainingSeconds <= 0}
                    onClick={() => run(() => pauseConsultation(session.id))}
                  >
                    <Pause className="size-4" />
                    Pause
                  </Button>
                )
              ) : null}
            </div>
          </div>
        </div>
        {shouldWarnTime ? (
          <p className="flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
            <AlertTriangle className="size-4" />
            Waktu konsultasi tersisa kurang dari 60 detik.
          </p>
        ) : null}
        {session.is_paused ? (
          <p className="flex items-center gap-2 rounded-md border border-sky-300 bg-sky-50 p-3 text-sm text-sky-950">
            <Pause className="size-4" />
            Input, pemeriksaan, rekam medis, dan voice dinonaktifkan sampai konsultasi dilanjutkan.
          </p>
        ) : null}
        {error ? (
          <p className="rounded-md border border-destructive/40 p-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}
        {session.status !== "quiz" ? (
          <VoicePanel
            token={voiceToken}
            uiState={voiceState}
            error={voiceError}
            isPending={isPending}
            disabled={isConsultationLocked}
            onStateChange={setVoiceState}
            onError={(message) => {
              setVoiceError(message);
              setVoiceState("error");
              stopVoice();
            }}
            onStart={() => {
              if (isConsultationLocked) {
                return;
              }
              setVoiceError(null);
              setVoiceState("connecting");
              startTransition(async () => {
                try {
                  const token = await startVoiceSession(session.id);
                  setVoiceToken(token);
                } catch (caught) {
                  setVoiceError(
                    caught instanceof Error ? caught.message : "Voice session could not be started.",
                  );
                  setVoiceState("error");
                }
              });
            }}
            onStop={stopVoice}
          />
        ) : null}
        {session.status === "quiz" ? (
          <Card>
            <CardHeader>
              <CardTitle>Jawab quiz akhir</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {session.quiz.map((questionItem) => (
                <fieldset key={questionItem.id} className="space-y-3">
                  <legend className="font-medium">{questionItem.prompt}</legend>
                  <div className="grid gap-2">
                    {questionItem.options.map((option) => (
                      <label
                        key={option.id}
                        className="flex items-center gap-3 rounded-md border p-3 text-sm"
                      >
                        <input
                          type="radio"
                          name={questionItem.id}
                          value={option.id}
                          checked={answers[questionItem.id] === option.id}
                          onChange={() =>
                            setAnswers((current) => ({ ...current, [questionItem.id]: option.id }))
                          }
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}
              <Button
                disabled={isPending || !isQuizComplete}
                onClick={() => {
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
              >
                Submit quiz
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Transcript</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="min-h-80 space-y-3 rounded-md border bg-muted/20 p-4">
                {session.messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Mulai dengan pertanyaan klinis. Pasien hanya menjawab fakta yang aman.
                  </p>
                ) : null}
                {session.messages.map((message) => (
                  <div
                    key={message.id}
                    className={message.role === "user" ? "ml-auto max-w-[80%] text-right" : "max-w-[80%]"}
                  >
                    <p className="text-xs uppercase text-muted-foreground">{message.role}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {formatTranscriptTime(message.created_at)}
                    </p>
                    <p className="rounded-md border bg-background p-3 text-sm leading-6">
                      {message.content}
                    </p>
                  </div>
                ))}
              </div>
              <form
                className="flex flex-col gap-2 sm:flex-row"
                onSubmit={(event) => {
                  event.preventDefault();
                  const content = question.trim();
                  if (!content) return;
                  setQuestion("");
                  run(async () => sendMessage(session.id, content));
                }}
              >
                <Input
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder="Tanyakan onset, faktor risiko, red flag..."
                  aria-label="Pertanyaan konsultasi teks"
                  disabled={isConsultationLocked}
                />
                <Button
                  disabled={isPending || isConsultationLocked || !question.trim()}
                  type="submit"
                  aria-label="Kirim pertanyaan"
                >
                  <Send className="size-4" />
                  <span className="sm:sr-only">Kirim</span>
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
      <aside className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TimerReset className="size-4" />
              Timer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <AlertDialog.Root open={showEndConfirm} onOpenChange={setShowEndConfirm}>
              <AlertDialog.Trigger asChild>
                <Button
                  className="w-full"
                  disabled={isPending || session.status !== "in_consultation"}
                >
                  End consultation
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
            <p className="text-xs leading-5 text-muted-foreground">
              {session.used_extension
                ? "Perpanjangan 60 detik sudah digunakan."
                : "Perpanjangan 60 detik tersedia ketika waktu konsultasi habis."}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="size-4" />
              Medical record
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Button
              variant="outline"
              className="w-full"
              disabled={isPending || isConsultationLocked || session.medical_record_opened}
              onClick={() => run(() => openMedicalRecord(session.id))}
            >
              {session.medical_record_opened ? "Opened" : "Open record"}
            </Button>
            {session.medical_record_opened ? (
              <div className="space-y-2 leading-6 text-muted-foreground">
                <p className="font-medium text-foreground">{session.medical_record.summary}</p>
                <p>Riwayat: {session.medical_record.history.join(", ")}</p>
                <p>Obat: {session.medical_record.medications.join(", ")}</p>
                <p>Alergi: {session.medical_record.allergies.join(", ")}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Stethoscope className="size-4" />
              Examinations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2">
              {session.examination_options.map((exam) => (
                <Button
                  key={exam.id}
                  variant="outline"
                  className="h-auto min-h-10 justify-between whitespace-normal text-left"
                  disabled={isPending || isConsultationLocked || selectedExamIds.has(exam.id)}
                  onClick={() => run(() => selectExamination(session.id, exam.id))}
                >
                  <span>{exam.label}</span>
                  <span className="font-mono text-xs">{exam.delay_seconds}s</span>
                </Button>
              ))}
            </div>
            <div className="space-y-2">
              {session.examinations.map((exam) => (
                <div key={exam.id} className="rounded-md border p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{exam.label}</p>
                    <Badge variant={exam.status === "resulted" ? "default" : "secondary"}>
                      {exam.status}
                    </Badge>
                  </div>
                  {exam.result ? (
                    <p className="mt-2 leading-6 text-muted-foreground">{exam.result}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </aside>
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
    </section>
  );
}
