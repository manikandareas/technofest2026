"use client";

import { useEffect, useState } from "react";
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
  onStart: () => void;
  onStop: () => void;
  onError: (message: string) => void;
  onStateChange: (state: VoiceUiState) => void;
};

const voiceStateLabels: Record<VoiceUiState, string> = {
  idle: "Talk",
  connecting: "Connecting",
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
  onStart,
  onStop,
  onError,
  onStateChange,
}: VoicePanelProps) {
  const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || token?.url || "";
  const isActive = Boolean(token);
  const startLabel =
    uiState === "disconnected" || uiState === "error" ? "Reconnect voice" : "Start voice";

  return (
    <div className="flex flex-col items-center gap-2">
      <div aria-live="polite" role="status" className="sr-only">
        {voiceStateLabels[uiState]}
      </div>

      {isActive ? (
        <Button
          type="button"
          size="icon"
          variant="secondary"
          font="retro"
          className="size-[4.75rem] rounded-full border-4 border-[#2f9e44] bg-[#82c91e] text-white shadow-[0_4px_0_#2f9e44] hover:bg-[#74b816] sm:size-20"
          aria-label="Stop voice consultation"
          onClick={onStop}
        >
          <MicOff className="size-7 sm:size-8" aria-hidden />
        </Button>
      ) : (
        <Button
          type="button"
          size="icon"
          variant="secondary"
          font="retro"
          disabled={isPending || disabled}
          className="size-[4.75rem] rounded-full border-4 border-[#2f9e44] bg-[#82c91e] text-white shadow-[0_4px_0_#2f9e44] hover:bg-[#74b816] disabled:opacity-70 sm:size-20"
          aria-label={startLabel}
          onClick={onStart}
        >
          {uiState === "disconnected" || uiState === "error" ? (
            <RotateCcw className="size-7 sm:size-8" aria-hidden />
          ) : (
            <Mic className="size-7 sm:size-8" aria-hidden />
          )}
        </Button>
      )}

      <p className="retro text-xs text-white drop-shadow-[1px_1px_0_#000] sm:text-sm">
        {voiceStateLabels[uiState]}
      </p>

      {error ? (
        <p className="max-w-xs rounded-xl border border-destructive/40 bg-background/90 px-3 py-2 text-center text-xs text-destructive">
          {error} Periksa izin mikrofon browser, pastikan input device tersedia, lalu coba
          reconnect. Text consultation remains available.
        </p>
      ) : null}

      {token && livekitUrl ? (
        <LiveKitRoom
          audio
          connect
          token={token.token}
          serverUrl={livekitUrl}
          onDisconnected={() => onStateChange("disconnected")}
          onError={(caught) => onError(caught.message)}
        >
          <RoomAudioRenderer />
          <AudioUnlockButton />
          <VoiceConnectionState onError={onError} onStateChange={onStateChange} />
        </LiveKitRoom>
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
  onError,
  onStateChange,
}: {
  onError: (message: string) => void;
  onStateChange: (state: VoiceUiState) => void;
}) {
  const connectionState = useConnectionState();
  const { state: agentState } = useVoiceAssistant();
  const { isMicrophoneEnabled, lastMicrophoneError, localParticipant } = useLocalParticipant();
  const isUserSpeaking = useIsSpeaking(localParticipant);
  const {
    enabled: micEnabled,
    pending: micPending,
    toggle: toggleMic,
  } = useTrackToggle({
    source: Track.Source.Microphone,
    onDeviceError: (caught) => {
      onError(caught.message || "Microphone permission or device failed.");
    },
  });
  const effectiveMicEnabled = isMicrophoneEnabled && micEnabled;

  useEffect(() => {
    if (lastMicrophoneError) {
      onError(lastMicrophoneError.message || "Microphone permission or device failed.");
    }
  }, [lastMicrophoneError, onError]);

  useEffect(() => {
    if (connectionState === ConnectionState.Disconnected) {
      onStateChange("disconnected");
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
    if (!effectiveMicEnabled) {
      onStateChange("muted");
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
    <div className="mt-1 flex flex-wrap items-center justify-center gap-2 rounded-xl border border-white/20 bg-[rgba(0,24,61,0.55)] p-2 text-xs text-white">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={micPending}
        onClick={() => void toggleMic(!effectiveMicEnabled)}
      >
        {effectiveMicEnabled ? <Mic className="size-4" /> : <MicOff className="size-4" />}
        {effectiveMicEnabled ? "Mute" : "Unmute"}
      </Button>
      <span className="flex items-center gap-2 text-white/85">
        {connectionState === ConnectionState.Disconnected ? <WifiOff className="size-4" /> : null}
        {effectiveMicEnabled
          ? "Mic is active for the AI patient."
          : "Mic is off. Text fallback remains available."}
      </span>
    </div>
  );
}
