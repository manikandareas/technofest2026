"use client";

import { ClipboardList } from "lucide-react";

import { Button } from "@/components/ui/8bit/button";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";

import { SessionDrawerHeader } from "./session-drawer-header";
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
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          font="retro"
          className={sessionToolbarIconButtonClass}
          aria-label="Buka rekam medis"
        >
          <ClipboardList className="size-5 sm:size-6" aria-hidden />
          <span className="text-[0.625rem] leading-none sm:text-[0.6875rem]">
            Medical Record
          </span>
        </Button>
      </DrawerTrigger>

      <DrawerContent className="max-h-[88dvh] border-foreground bg-[#eef3ff] px-0 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <SessionDrawerHeader
          icon={<ClipboardList className="size-4" aria-hidden />}
          title="Medical Record"
        />

        <div className="space-y-3 px-3 pb-3 pt-3 sm:px-4">
          {!opened ? (
            <Button
              type="button"
              font="retro"
              className="w-full"
              disabled={isPending || disabled}
              onClick={onOpen}
            >
              Buka rekam medis
            </Button>
          ) : null}

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
            ) : (
              <p className="text-muted-foreground">
                Rekam medis belum dibuka. Buka rekam medis untuk melihat riwayat pasien.
              </p>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
