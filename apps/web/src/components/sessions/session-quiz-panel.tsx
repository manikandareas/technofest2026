"use client";

import { Button } from "@/components/ui/8bit/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type QuizOption = {
  id: string;
  label: string;
};

type QuizQuestion = {
  id: string;
  prompt: string;
  options: QuizOption[];
};

type SessionQuizPanelProps = {
  quiz: QuizQuestion[];
  answers: Record<string, string>;
  isPending: boolean;
  isQuizComplete: boolean;
  onAnswerChange: (questionId: string, optionId: string) => void;
  onSubmit: () => void;
};

export function SessionQuizPanel({
  quiz,
  answers,
  isPending,
  isQuizComplete,
  onAnswerChange,
  onSubmit,
}: SessionQuizPanelProps) {
  return (
    <Card className="mx-auto w-full max-w-lg border-2 border-foreground bg-white shadow-[4px_4px_0_#000]">
      <CardHeader>
        <CardTitle className="retro text-base sm:text-lg">Jawab quiz akhir</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {quiz.map((questionItem) => (
          <fieldset key={questionItem.id} className="space-y-3">
            <legend className="font-medium">{questionItem.prompt}</legend>
            <div className="grid gap-2">
              {questionItem.options.map((option) => (
                <label
                  key={option.id}
                  className="flex items-center gap-3 rounded-xl border-2 border-foreground/10 p-3 text-sm"
                >
                  <input
                    type="radio"
                    name={questionItem.id}
                    value={option.id}
                    checked={answers[questionItem.id] === option.id}
                    onChange={() => onAnswerChange(questionItem.id, option.id)}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>
        ))}
        <Button
          type="button"
          font="retro"
          disabled={isPending || !isQuizComplete}
          onClick={onSubmit}
        >
          Submit quiz
        </Button>
      </CardContent>
    </Card>
  );
}
