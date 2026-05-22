"use client";

import { ClipboardList, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/8bit/button";

import { SessionDrawerHeader } from "./session-drawer-header";
import { SessionResponsivePanel } from "./session-responsive-panel";
import { sessionToolbarIconButtonClass } from "./sessions-assets";

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

export function SessionMedicalRecordDrawer({
  opened,
  record,
  disabled,
  isPending,
  onOpen,
}: SessionMedicalRecordDrawerProps) {
  const [panelOpen, setPanelOpen] = useState(false);
  const openRequestedRef = useRef(false);

  function handlePanelOpenChange(nextOpen: boolean) {
    setPanelOpen(nextOpen);
    if (!nextOpen) {
      openRequestedRef.current = false;
    }
  }

  useEffect(() => {
    if (!panelOpen || opened || disabled || isPending || openRequestedRef.current) {
      return;
    }
    openRequestedRef.current = true;
    onOpen();
  }, [disabled, isPending, onOpen, opened, panelOpen]);

  const trigger = (
    <Button
      type="button"
      size="sm"
      variant="secondary"
      font="retro"
      className={sessionToolbarIconButtonClass}
      aria-label="Buka rekam medis"
    >
      <ClipboardList aria-hidden />
      <span className="text-[0.5625rem] leading-tight sm:text-[0.6875rem]">Record</span>
    </Button>
  );

  return (
    <SessionResponsivePanel
      title="Medical Record"
      trigger={trigger}
      open={panelOpen}
      onOpenChange={handlePanelOpenChange}
    >
      <SessionDrawerHeader
        icon={<ClipboardList className="size-4" aria-hidden />}
        title="Medical Record"
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 sm:px-4">
        <div className="rounded-[1.25rem] border-2 border-foreground/10 bg-white p-4 text-sm leading-6 text-[#1a233e]">
          {opened ? (
            <div className="space-y-3">
              <p className="font-semibold">{record.summary}</p>
              <p>
                <span className="font-medium">Riwayat:</span> {record.history.join(", ")}
              </p>
              <p>
                <span className="font-medium">Obat:</span> {record.medications.join(", ")}
              </p>
              <p>
                <span className="font-medium">Alergi:</span> {record.allergies.join(", ")}
              </p>
            </div>
          ) : isPending ? (
            <p className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Membuka rekam medis...
            </p>
          ) : disabled ? (
            <p className="text-muted-foreground">
              Rekam medis tidak bisa dibuka saat konsultasi dijeda atau waktu habis.
            </p>
          ) : (
            <p className="text-muted-foreground">
              Rekam medis belum bisa dimuat. Tutup panel lalu coba lagi.
            </p>
          )}
        </div>
      </div>
    </SessionResponsivePanel>
  );
}
