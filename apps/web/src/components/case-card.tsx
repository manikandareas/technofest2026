import Link from "next/link";
import { Clock, Stethoscope } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type CaseCardProps = {
  id: string;
  patient_name: string;
  patient_age: number;
  patient_gender: string;
  chief_complaint: string;
  triage_note: string;
  difficulty: string;
  condition_badge: string;
  estimated_duration_minutes: number;
  is_demo: boolean;
};

export function CaseCard({ item }: { item: CaseCardProps }) {
  return (
    <Card className="h-full">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge>{item.condition_badge}</Badge>
          <Badge variant="outline">{item.difficulty}</Badge>
          {item.is_demo ? <Badge variant="secondary">Demo</Badge> : null}
        </div>
        <CardTitle className="text-xl">
          {item.patient_name}, {item.patient_age} tahun
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2 text-sm">
          <p className="font-medium">{item.chief_complaint}</p>
          <p className="leading-6 text-muted-foreground">{item.triage_note}</p>
        </div>
        <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <Stethoscope className="size-4" />
            {item.patient_gender}
          </span>
          <span className="flex items-center gap-2">
            <Clock className="size-4" />
            {item.estimated_duration_minutes} menit
          </span>
        </div>
        <Button asChild className="w-full">
          <Link href={`/app/cases/${item.id}/brief`}>Buka brief</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
