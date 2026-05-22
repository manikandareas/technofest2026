"use client";

import { useEffect, useRef, useState } from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useAudioPlayback,
  useConnectionState,
  useIsSpeaking,
  useLocalParticipant,
  useTrackToggle,
  useVoiceAssistant,
} from "@livekit/components-react";
import { ConnectionState, Track } from "livekit-client";
import { Mic, MicOff, RotateCcw, Volume2, WifiOff } from "lucide-react";

import { Button } from "@/components/ui/8bit/button";
import * as AlertDialog from "@/components/ui/alert-dialog";

export type VoiceToken = {
  token: string;
  url: string;
  room_name: string;
  identity: string;
  expires_in_seconds: number;
};

export type VoiceUiState =
  | "idle"
  | "connecting"
  | "ready"
  | "listening"
  | "user_speaking"
  | "muted"
  | "patient_thinking"
  | "patient_speaking"
  | "reconnecting"
  | "disconnected"
  | "error";

type VoicePanelProps = {
  token: VoiceToken | null;
  uiState: VoiceUiState;
  error: string | null;
  isPending: boolean;
  disabled: boolean;
  onReconnect: () => void;
  onError: (message: string) => void;
  onStateChange: (state: VoiceUiState) => void;
};

const voiceStateLabels: Record<VoiceUiState, string> = {
  idle: "Preparing",
  connecting: "Connecting",
  ready: "Hold to talk",
  listening: "Listening",
  user_speaking: "Speaking",
  muted: "Muted",
  patient_thinking: "Thinking",
  patient_speaking: "Patient",
  reconnecting: "Reconnect",
  disconnected: "Reconnect",
  error: "Retry",
};

export function VoicePanel({
  token,
  uiState,
  error,
  isPending,
  disabled,
  onReconnect,
  onError,
  onStateChange,
}: VoicePanelProps) {
  const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || token?.url || "";
  const isActive = Boolean(token);
  const canReconnect = uiState === "disconnected" || uiState === "error";

  return (
    <div className="flex flex-col items-center gap-2">
      <div aria-live="polite" role="status" className="sr-only">
        {voiceStateLabels[uiState]}
      </div>

      {canReconnect ? (
        <Button
          type="button"
          size="icon"
          variant="secondary"
          font="retro"
          disabled={isPending || disabled}
          className="size-[4.75rem] rounded-full border-4 border-[#2f9e44] bg-[#82c91e] text-white shadow-[0_4px_0_#2f9e44] hover:bg-[#74b816] disabled:opacity-70 sm:size-20"
          aria-label="Reconnect voice"
          onClick={onReconnect}
        >
          <RotateCcw className="size-7 sm:size-8" aria-hidden />
        </Button>
      ) : isActive && token && livekitUrl ? (
        <LiveKitRoom
          audio={false}
          connect
          token={token.token}
          serverUrl={livekitUrl}
          onError={(caught) => onError(caught.message)}
        >
          <RoomAudioRenderer />
          <AudioUnlockButton />
          <VoiceConnectionState
            disabled={disabled}
            isPending={isPending}
            onStateChange={onStateChange}
          />
        </LiveKitRoom>
      ) : (
        <Button
          type="button"
          size="icon"
          variant="secondary"
          font="retro"
          disabled
          className="size-[4.75rem] rounded-full border-4 border-[#2f9e44] bg-[#82c91e] text-white shadow-[0_4px_0_#2f9e44] hover:bg-[#74b816] disabled:opacity-70 sm:size-20"
          aria-label="Voice is connecting"
        >
          <MicOff className="size-7 sm:size-8" aria-hidden />
        </Button>
      )}

      <p className="retro text-xs text-white drop-shadow-[1px_1px_0_#000] sm:text-sm">
        {voiceStateLabels[uiState]}
      </p>

      {error ? (
        <p className="max-w-xs rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-center text-xs text-amber-950">
          {error}
        </p>
      ) : null}

      {isActive && !livekitUrl ? (
        <p className="max-w-xs rounded-xl border border-destructive/40 bg-background/90 px-3 py-2 text-center text-xs text-destructive">
          LiveKit URL is missing. Text consultation remains available.
        </p>
      ) : null}
    </div>
  );
}

function AudioUnlockButton() {
  const { canPlayAudio, startAudio } = useAudioPlayback();
  const [failed, setFailed] = useState(false);

  if (canPlayAudio) {
    return null;
  }

  return (
    <div className="mt-1 max-w-xs rounded-xl border border-amber-300 bg-amber-50 p-3 text-center text-xs text-amber-950">
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
  disabled,
  isPending,
  onStateChange,
}: {
  disabled: boolean;
  isPending: boolean;
  onStateChange: (state: VoiceUiState) => void;
}) {
  const [showMicHelp, setShowMicHelp] = useState(false);
  const [pttHint, setPttHint] = useState<string | null>(null);
  const hasConnectedRef = useRef(false);
  const pttHoldRef = useRef(false);
  const connectionState = useConnectionState();
  const { state: agentState } = useVoiceAssistant();
  const { isMicrophoneEnabled, localParticipant } = useLocalParticipant();
  const isUserSpeaking = useIsSpeaking(localParticipant);
  const {
    enabled: micEnabled,
    pending: micPending,
    toggle: toggleMic,
  } = useTrackToggle({
    source: Track.Source.Microphone,
    onDeviceError: () => {
      setShowMicHelp(true);
    },
  });
  const effectiveMicEnabled = isMicrophoneEnabled && micEnabled;
  const canPressPtt =
    connectionState === ConnectionState.Connected && !disabled && !isPending;
  const canEnableMic = canPressPtt && !micPending;

  const setMicEnabled = (enabled: boolean) => {
    if (enabled) {
      pttHoldRef.current = true;
      if (!canPressPtt) {
        if (disabled || isPending) {
          setPttHint("Voice belum siap.");
        } else if (connectionState !== ConnectionState.Connected) {
          setPttHint("Menghubungkan voice...");
        }
        return;
      }
      if (!canEnableMic) {
        setPttHint("Menyiapkan mikrofon...");
        return;
      }
      setPttHint(null);
      if (!effectiveMicEnabled) {
        void toggleMic(true);
      }
      return;
    }

    pttHoldRef.current = false;
    setPttHint(null);
    if (!effectiveMicEnabled) {
      return;
    }
    void toggleMic(false);
  };

  useEffect(() => {
    if (!pttHint) {
      return;
    }
    const timer = window.setTimeout(() => setPttHint(null), 2500);
    return () => window.clearTimeout(timer);
  }, [pttHint]);

  useEffect(() => {
    if (micPending || !pttHoldRef.current || !canEnableMic || effectiveMicEnabled) {
      return;
    }
    setPttHint(null);
    void toggleMic(true);
  }, [canEnableMic, effectiveMicEnabled, micPending, toggleMic]);

  useEffect(() => {
    if (connectionState !== ConnectionState.Connected) {
      return;
    }
    void navigator.mediaDevices
      ?.getUserMedia({ audio: true })
      .then((stream) => {
        for (const track of stream.getTracks()) {
          track.stop();
        }
      })
      .catch(() => {
        setShowMicHelp(true);
      });
  }, [connectionState]);

  useEffect(() => {
    if (connectionState === ConnectionState.Disconnected) {
      onStateChange(hasConnectedRef.current ? "disconnected" : "connecting");
      return;
    }
    if (connectionState === ConnectionState.Reconnecting) {
      onStateChange("reconnecting");
      return;
    }
    if (connectionState !== ConnectionState.Connected) {
      onStateChange("connecting");
      return;
    }
    hasConnectedRef.current = true;
    if (!effectiveMicEnabled) {
      if (agentState === "speaking") {
        onStateChange("patient_speaking");
        return;
      }
      if (agentState === "thinking") {
        onStateChange("patient_thinking");
        return;
      }
      onStateChange("ready");
      return;
    }
    if (isUserSpeaking) {
      onStateChange("user_speaking");
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
  }, [agentState, connectionState, effectiveMicEnabled, isUserSpeaking, onStateChange]);

  return (
    <div className="mt-1 flex flex-col items-center justify-center gap-2">
      <Button
        type="button"
        size="icon"
        variant="secondary"
        font="retro"
        disabled={!canPressPtt && !effectiveMicEnabled}
        className="size-[4.75rem] rounded-full border-4 border-[#2f9e44] bg-[#82c91e] text-white shadow-[0_4px_0_#2f9e44] hover:bg-[#74b816] active:translate-y-1 active:shadow-[0_2px_0_#2f9e44] disabled:opacity-70 sm:size-20"
        aria-label={effectiveMicEnabled ? "Release to stop talking" : "Hold to talk"}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          setMicEnabled(true);
        }}
        onPointerUp={(event) => {
          event.currentTarget.releasePointerCapture(event.pointerId);
          setMicEnabled(false);
        }}
        onPointerCancel={() => setMicEnabled(false)}
        onKeyDown={(event) => {
          if (event.repeat || (event.key !== " " && event.key !== "Enter")) {
            return;
          }
          event.preventDefault();
          setMicEnabled(true);
        }}
        onKeyUp={(event) => {
          if (event.key !== " " && event.key !== "Enter") {
            return;
          }
          event.preventDefault();
          setMicEnabled(false);
        }}
      >
        {effectiveMicEnabled ? (
          <Mic className="size-7 sm:size-8" aria-hidden />
        ) : (
          <MicOff className="size-7 sm:size-8" aria-hidden />
        )}
      </Button>
      <span className="flex max-w-xs items-center justify-center gap-2 rounded-xl border border-white/20 bg-[rgba(0,24,61,0.55)] px-3 py-2 text-center text-xs text-white/85">
        {connectionState === ConnectionState.Disconnected ? <WifiOff className="size-4" /> : null}
        {effectiveMicEnabled
          ? "Release when finished speaking."
          : pttHint
            ? pttHint
            : agentState === "speaking"
              ? "Hold the mic button to interrupt or ask a follow-up."
              : "Hold the mic button to talk."}
      </span>
      <MicrophoneHelpDialog open={showMicHelp} onOpenChange={setShowMicHelp} />
    </div>
  );
}

function MicrophoneHelpDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,26rem)] -translate-x-1/2 -translate-y-1/2 rounded-md border bg-background p-5 shadow-lg">
          <AlertDialog.Title className="text-lg font-semibold">
            Izin mikrofon belum aktif
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm leading-6 text-muted-foreground">
            Untuk menggunakan push-to-talk, izinkan akses mikrofon dari browser. Jika sudah
            sempat ditolak, buka ikon gembok atau pengaturan situs di address bar, lalu
            ubah Microphone menjadi Allow. Mode teks tetap bisa digunakan.
          </AlertDialog.Description>
          <div className="mt-5 flex justify-end">
            <AlertDialog.Action asChild>
              <Button type="button" variant="secondary">
                Mengerti
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
