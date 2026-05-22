import type { PixelAidApiComponents } from "@technofest2026/contracts";
import { Clock, MessageSquareText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type CaseSession = PixelAidApiComponents["schemas"]["CaseSessionResponse"];

export function ConsultationRoom({
  initialSession,
}: {
  initialSession: CaseSession;
}) {
  return (
    <section className="mx-auto grid w-full max-w-6xl gap-5 px-5 py-8 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-5">
        <div className="space-y-3">
          <Badge>{initialSession.case.specialist_name}</Badge>
          <h1 className="text-3xl font-semibold tracking-tight">
            {initialSession.case.patient_name}
          </h1>
          <p className="max-w-3xl leading-7 text-muted-foreground">
            {initialSession.case.chief_complaint}
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquareText className="size-4" />
              Consultation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {initialSession.messages.length > 0 ? (
              initialSession.messages.map((message) => (
                <div key={message.id} className="rounded-md border p-3">
                  <p className="text-xs uppercase text-muted-foreground">
                    {message.role}
                  </p>
                  <p className="leading-7">{message.content}</p>
                </div>
              ))
            ) : (
              <p className="text-sm leading-6 text-muted-foreground">
                Session room is ready. Interactive consultation controls are
                wired in the next gameplay phase.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="size-4" />
            Session
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="text-muted-foreground">Status</p>
            <p className="font-medium capitalize">
              {initialSession.status.replace("_", " ")}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Remaining</p>
            <p className="font-mono text-lg">{initialSession.remaining_seconds}s</p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
