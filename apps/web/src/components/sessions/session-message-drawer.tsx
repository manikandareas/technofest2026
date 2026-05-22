"use client";

import { MessageSquare, Send } from "lucide-react";

import { Button } from "@/components/ui/8bit/button";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";

import { SessionDrawerHeader } from "./session-drawer-header";
import { sessionToolbarIconButtonClass } from "./sessions-assets";

type SessionMessage = {
  id: string;
  role: string;
  content: string;
  created_at: string;
};

type SessionMessageDrawerProps = {
  messages: SessionMessage[];
  question: string;
  disabled: boolean;
  isPending: boolean;
  onQuestionChange: (value: string) => void;
  onSubmit: () => void;
};

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

export function SessionMessageDrawer({
  messages,
  question,
  disabled,
  isPending,
  onQuestionChange,
  onSubmit,
}: SessionMessageDrawerProps) {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          font="retro"
          className={sessionToolbarIconButtonClass}
          aria-label="Buka pesan"
        >
          <MessageSquare className="size-5 sm:size-6" aria-hidden />
          <span className="text-[0.625rem] leading-none sm:text-[0.6875rem]">Message</span>
        </Button>
      </DrawerTrigger>

      <DrawerContent className="max-h-[88dvh] border-foreground bg-[#eef3ff] px-0 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <SessionDrawerHeader
          icon={<MessageSquare className="size-4" aria-hidden />}
          title="Message"
        />

        <div className="flex min-h-[18rem] flex-1 flex-col px-3 pb-3 pt-3 sm:px-4">
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto rounded-[1.25rem] border-2 border-foreground/10 bg-white p-3 sm:p-4">
            {messages.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Mulai dengan pertanyaan klinis. Pasien hanya menjawab fakta yang aman.
              </p>
            ) : null}
            {messages.map((message) => {
              const isUser = message.role === "user";
              return (
                <div
                  key={message.id}
                  className={isUser ? "ml-auto max-w-[85%] text-right" : "max-w-[85%]"}
                >
                  <p className="text-[0.625rem] uppercase tracking-wide text-muted-foreground">
                    {message.role}
                  </p>
                  <p className="text-[0.625rem] text-muted-foreground">
                    {formatTranscriptTime(message.created_at)}
                  </p>
                  <p
                    className={
                      isUser
                        ? "mt-1 rounded-2xl rounded-br-md border border-[#82c91e]/40 bg-[#d3f9d8] px-3 py-2 text-sm leading-6 text-[#1a233e]"
                        : "mt-1 rounded-2xl rounded-bl-md border border-foreground/10 bg-[#f1f3f5] px-3 py-2 text-sm leading-6 text-[#1a233e]"
                    }
                  >
                    {message.content}
                  </p>
                </div>
              );
            })}
          </div>

          <form
            className="mt-3 flex items-center gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              onSubmit();
            }}
          >
            <Input
              value={question}
              onChange={(event) => onQuestionChange(event.target.value)}
              placeholder="Ketik pesan..."
              aria-label="Pertanyaan konsultasi teks"
              disabled={disabled}
              className="h-11 rounded-full border-2 border-foreground/15 bg-white px-4"
            />
            <Button
              type="submit"
              size="icon"
              font="retro"
              disabled={isPending || disabled || !question.trim()}
              className="size-11 shrink-0 rounded-full border-transparent bg-[#339af0] text-white hover:bg-[#228be6]"
              aria-label="Kirim pertanyaan"
            >
              <Send className="size-4" aria-hidden />
            </Button>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
