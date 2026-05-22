"use client";

import type { PixelAidApiComponents } from "@technofest2026/contracts";
import { useMemo, useState, useTransition } from "react";
import { Clock, FileText, Send, Stethoscope, TimerReset } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  endConsultation,
  extendTimer,
  openMedicalRecord,
  selectExamination,
  sendMessage,
  submitQuiz,
} from "./actions";

type Session = PixelAidApiComponents["schemas"]["CaseSessionResponse"];

export function ConsultationRoom({ initialSession }: { initialSession: Session }) {
  const [session, setSession] = useState(initialSession);
  const [question, setQuestion] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const selectedExamIds = useMemo(
    () => new Set(session.examinations.map((exam) => exam.examination_id)),
    [session.examinations],
  );

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
        {error ? (
          <p className="rounded-md border border-destructive/40 p-3 text-sm text-destructive">
            {error}
          </p>
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
                            setAnswers((current) => ({
                              ...current,
                              [questionItem.id]: option.id,
                            }))
                          }
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}
              <Button
                disabled={isPending || session.quiz.some((item) => !answers[item.id])}
                onClick={() => {
                  setError(null);
                  startTransition(async () => {
                    try {
                      await submitQuiz(session.id, answers);
                    } catch (caught) {
                      setError(
                        caught instanceof Error
                          ? caught.message
                          : "Quiz could not be submitted.",
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
                    Mulai dengan pertanyaan klinis. Pasien hanya menjawab fakta yang
                    aman.
                  </p>
                ) : null}
                {session.messages.map((message) => (
                  <div
                    key={message.id}
                    className={
                      message.role === "user"
                        ? "ml-auto max-w-[80%] text-right"
                        : "max-w-[80%]"
                    }
                  >
                    <p className="text-xs uppercase text-muted-foreground">
                      {message.role}
                    </p>
                    <p className="rounded-md border bg-background p-3 text-sm leading-6">
                      {message.content}
                    </p>
                  </div>
                ))}
              </div>
              <form
                className="flex gap-2"
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
                />
                <Button disabled={isPending || !question.trim()} type="submit">
                  <Send className="size-4" />
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
              disabled={
                isPending ||
                session.used_extension ||
                session.status !== "in_consultation"
              }
              onClick={() =>
                run(async () => {
                  await extendTimer(session.id);
                  return {
                    ...session,
                    remaining_seconds: session.remaining_seconds + 60,
                    used_extension: true,
                  };
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
              Mengakhiri konsultasi akan membuka quiz final. Pastikan data penting
              sudah digali.
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
                <p className="font-medium text-foreground">
                  {session.medical_record.summary}
                </p>
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
                  className="justify-between"
                  disabled={
                    isPending ||
                    selectedExamIds.has(exam.id) ||
                    session.status !== "in_consultation"
                  }
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
                    <p className="mt-2 leading-6 text-muted-foreground">
                      {exam.result}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </aside>
    </section>
  );
}
