"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useAudioPlayback,
  useConnectionState,
  useVoiceAssistant,
} from "@livekit/components-react";
import { ConnectionState } from "livekit-client";
import {
  Clock,
  FileText,
  Mic,
  MicOff,
  Send,
  Stethoscope,
  TimerReset,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  endConsultation,
  extendTimer,
  getSessionSnapshot,
  openMedicalRecord,
  selectExamination,
  sendMessage,
  startVoiceSession,
  submitQuiz,
} from "./actions";

type Session = {
  id: string;
  status: "brief" | "in_consultation" | "quiz" | "completed" | "abandoned";
  remaining_seconds: number;
  used_extension: boolean;
  medical_record_opened: boolean;
  medical_record: {
    summary: string;
    history: string[];
    medications: string[];
    allergies: string[];
  };
  examination_options: Array<{
    id: string;
    label: string;
    category: string;
    delay_seconds: number;
  }>;
  examinations: Array<{
    id: string;
    examination_id: string;
    label: string;
    status: "pending" | "resulted";
    result?: string | null;
    resulted_at: string;
  }>;
  messages: Array<{ id: string; role: string; content: string; created_at: string }>;
  quiz: Array<{
    id: string;
    prompt: string;
    options: Array<{ id: string; label: string }>;
  }>;
};

type VoiceToken = {
  token: string;
  url: string;
  room_name: string;
  identity: string;
  expires_in_seconds: number;
};

type VoiceUiState =
  | "idle"
  | "connecting"
  | "listening"
  | "patient_thinking"
  | "patient_speaking"
  | "reconnecting"
  | "error";

export function ConsultationRoom({ initialSession }: { initialSession: Session }) {
  const [session, setSession] = useState(initialSession);
  const [question, setQuestion] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [voiceToken, setVoiceToken] = useState<VoiceToken | null>(null);
  const [voiceState, setVoiceState] = useState<VoiceUiState>("idle");
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const selectedExamIds = useMemo(
    () => new Set(session.examinations.map((exam) => exam.examination_id)),
    [session.examinations],
  );

  useEffect(() => {
    if (!voiceToken || session.status === "quiz") {
      return;
    }
    const interval = window.setInterval(() => {
      getSessionSnapshot(session.id)
        .then((next) => setSession(next as Session))
        .catch(() => {
          setVoiceError("Transcript refresh failed.");
        });
    }, 2500);
    return () => window.clearInterval(interval);
  }, [session.id, session.status, voiceToken]);

  function run(action: () => Promise<Session | unknown>) {
    setError(null);
    startTransition(async () => {
      try {
        const next = await action();
        if (next && typeof next === "object" && "id" in next) {
          setSession(next as Session);
        }
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Action failed.");
      }
    });
  }

  const minutes = Math.floor(session.remaining_seconds / 60);
  const seconds = String(session.remaining_seconds % 60).padStart(2, "0");
  const isQuizComplete = session.quiz.length > 0 && session.quiz.every((item) => answers[item.id]);

  return (
    <section className="mx-auto grid w-full max-w-7xl gap-5 px-5 py-6 lg:grid-cols-[1fr_24rem]">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Badge>{session.status === "quiz" ? "Quiz" : "Text consultation"}</Badge>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              {session.status === "quiz" ? "Final quiz" : "Ruang konsultasi"}
            </h1>
          </div>
          <div className="flex items-center gap-2 rounded-md border px-3 py-2 font-mono text-lg">
            <Clock className="size-4" />
            {minutes}:{seconds}
          </div>
        </div>
        {error ? <p className="rounded-md border border-destructive/40 p-3 text-sm text-destructive">{error}</p> : null}
        {session.status !== "quiz" ? (
          <VoicePanel
            token={voiceToken}
            uiState={voiceState}
            error={voiceError}
            isPending={isPending}
            onStateChange={setVoiceState}
            onError={(message) => {
              setVoiceError(message);
              setVoiceState("error");
              setVoiceToken(null);
            }}
            onStart={() => {
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
            onStop={() => {
              setVoiceToken(null);
              setVoiceState("idle");
            }}
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
                      <label key={option.id} className="flex items-center gap-3 rounded-md border p-3 text-sm">
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
                    <p className="rounded-md border bg-background p-3 text-sm leading-6">{message.content}</p>
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
                  run(async () => {
                    const next = await sendMessage(session.id, content);
                    return next;
                  });
                }}
              >
                <Input
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder="Tanyakan onset, faktor risiko, red flag..."
                  aria-label="Pertanyaan konsultasi teks"
                />
                <Button disabled={isPending || !question.trim()} type="submit" aria-label="Kirim pertanyaan">
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
            <Button
              variant="outline"
              className="w-full"
              disabled={isPending || session.used_extension || session.status !== "in_consultation"}
              onClick={() =>
                run(async () => {
                  await extendTimer(session.id);
                  return { ...session, remaining_seconds: session.remaining_seconds + 60, used_extension: true };
                })
              }
            >
              Extend 60s
            </Button>
            <Button
              className="w-full"
              disabled={isPending || session.status !== "in_consultation"}
              onClick={() => run(() => endConsultation(session.id))}
            >
              End consultation
            </Button>
            <p className="text-xs leading-5 text-muted-foreground">
              Mengakhiri konsultasi akan membuka quiz final. Pastikan data penting sudah digali.
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
              disabled={isPending || session.medical_record_opened}
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
                  disabled={isPending || selectedExamIds.has(exam.id) || session.status !== "in_consultation"}
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
                    <Badge variant={exam.status === "resulted" ? "default" : "secondary"}>{exam.status}</Badge>
                  </div>
                  {exam.result ? <p className="mt-2 leading-6 text-muted-foreground">{exam.result}</p> : null}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </aside>
    </section>
  );
}

function VoicePanel({
  token,
  uiState,
  error,
  isPending,
  onStart,
  onStop,
  onError,
  onStateChange,
}: {
  token: VoiceToken | null;
  uiState: VoiceUiState;
  error: string | null;
  isPending: boolean;
  onStart: () => void;
  onStop: () => void;
  onError: (message: string) => void;
  onStateChange: (state: VoiceUiState) => void;
}) {
  const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || token?.url || "";
  const label = {
    idle: "Voice ready",
    connecting: "Connecting",
    listening: "Listening",
    patient_thinking: "Patient thinking",
    patient_speaking: "Patient speaking",
    reconnecting: "Reconnecting",
    error: "Voice fallback",
  }[uiState];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {token ? <Mic className="size-4" /> : <MicOff className="size-4" />}
          Voice consultation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div aria-live="polite" role="status">
              <Badge variant={uiState === "error" ? "outline" : "secondary"}>{label}</Badge>
            </div>
            {token ? (
              <p className="mt-2 text-xs text-muted-foreground">
                AI patient voice is active. Transcript text is stored; raw audio is not
                stored by PixelAid.
              </p>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">
                Voice uses an AI patient with STT and TTS providers. Text consultation
                remains available if mic, connection, STT, or TTS fails.
              </p>
            )}
          </div>
          {token ? (
            <Button variant="outline" onClick={onStop} aria-label="Stop voice consultation">
              Stop voice
            </Button>
          ) : (
            <Button disabled={isPending} onClick={onStart} aria-label="Start voice consultation">
              <Mic className="size-4" />
              Start voice
            </Button>
          )}
        </div>
        {error ? (
          <p className="rounded-md border border-destructive/40 p-3 text-sm text-destructive">
            {error} Text consultation remains available.
          </p>
        ) : null}
        {token && livekitUrl ? (
          <LiveKitRoom
            audio
            connect
            token={token.token}
            serverUrl={livekitUrl}
            onDisconnected={() => onStateChange("idle")}
            onError={(caught) => onError(caught.message)}
          >
            <RoomAudioRenderer />
            <AudioUnlockButton />
            <VoiceConnectionState onStateChange={onStateChange} />
          </LiveKitRoom>
        ) : null}
      </CardContent>
    </Card>
  );
}

function AudioUnlockButton() {
  const { canPlayAudio, startAudio } = useAudioPlayback();
  const [failed, setFailed] = useState(false);

  if (canPlayAudio) {
    return null;
  }

  return (
    <div className="mt-3 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={async () => {
          try {
            await startAudio();
            setFailed(false);
          } catch {
            setFailed(true);
          }
        }}
      >
        <Volume2 className="size-4" />
        Enable audio
      </Button>
      {failed ? <p className="mt-2 text-xs">Audio playback is still blocked.</p> : null}
    </div>
  );
}

function VoiceConnectionState({
  onStateChange,
}: {
  onStateChange: (state: VoiceUiState) => void;
}) {
  const connectionState = useConnectionState();
  const { state: agentState } = useVoiceAssistant();

  useEffect(() => {
    if (connectionState === ConnectionState.Reconnecting) {
      onStateChange("reconnecting");
      return;
    }
    if (connectionState !== ConnectionState.Connected) {
      onStateChange("connecting");
      return;
    }
    if (agentState === "speaking") {
      onStateChange("patient_speaking");
      return;
    }
    if (agentState === "thinking") {
      onStateChange("patient_thinking");
      return;
    }
    onStateChange("listening");
  }, [agentState, connectionState, onStateChange]);

  return null;
}
