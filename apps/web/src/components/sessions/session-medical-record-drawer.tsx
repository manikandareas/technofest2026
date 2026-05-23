"use client";

import { ClipboardList } from "lucide-react";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/8bit/button";

import { SessionResponsivePanel } from "./session-responsive-panel";
import {
  sessionToolbarIconButtonClass,
  sessionToolbarIconClass,
  sessionToolbarLabelClass,
} from "./sessions-assets";

type MedicalRecord = {
  summary: string;
  history: string[];
  medications: string[];
  allergies: string[];
};

type SessionMedicalRecordDrawerProps = {
  opened: boolean;
  record: MedicalRecord;
  disabled: boolean;
  isPending: boolean;
  onOpen: () => void;
};

function MedicalRecordContent({
  opened,
  record,
  isPending,
}: {
  opened: boolean;
  record: MedicalRecord;
  isPending: boolean;
}) {
  if (!opened) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-[1.25rem] border-2 border-foreground/10 bg-white p-6 text-center">
        <p className="text-sm text-muted-foreground">
          {isPending ? "Membuka rekam medis..." : "Memuat rekam medis pasien..."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto rounded-[1.25rem] border-2 border-foreground/10 bg-white p-4 text-sm leading-6 text-[#1a233e] sm:p-5">
      <div className="space-y-4">
        <section>
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Ringkasan
          </h3>
          <p className="text-base font-semibold leading-7">{record.summary}</p>
        </section>
        <section>
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Riwayat
          </h3>
          <ul className="list-disc space-y-1 pl-5">
            {record.history.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section>
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Obat
          </h3>
          <ul className="list-disc space-y-1 pl-5">
            {record.medications.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section>
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Alergi
          </h3>
          <ul className="list-disc space-y-1 pl-5">
            {record.allergies.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

export function SessionMedicalRecordDrawer({
  opened,
  record,
  disabled,
  isPending,
  onOpen,
}: SessionMedicalRecordDrawerProps) {
  const [panelOpen, setPanelOpen] = useState(false);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      setPanelOpen(nextOpen);
      if (nextOpen && !opened && !disabled) {
        onOpen();
      }
    },
    [disabled, onOpen, opened],
  );

  const trigger = (
    <Button
      type="button"
      size="sm"
      variant="secondary"
      font="retro"
      className={sessionToolbarIconButtonClass}
      aria-label="Buka rekam medis"
    >
      <ClipboardList className={sessionToolbarIconClass} aria-hidden />
      <span className={sessionToolbarLabelClass}>Record</span>
    </Button>
  );

  return (
    <SessionResponsivePanel
      trigger={trigger}
      title="Medical Record"
      icon={<ClipboardList className="size-4" aria-hidden />}
      open={panelOpen}
      onOpenChange={handleOpenChange}
      bodyClassName="flex min-h-0 flex-1 flex-col px-3 pb-3 pt-3 sm:px-4"
    >
      <MedicalRecordContent opened={opened} record={record} isPending={isPending} />
    </SessionResponsivePanel>
  );
}
