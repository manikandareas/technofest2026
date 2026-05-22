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
          onDisconnected={() => onStateChange("disconnected")}
          onError={(caught) => onError(caught.message)}
        >
          <RoomAudioRenderer />
          <AudioUnlockButton />
          <VoiceConnectionState
            disabled={disabled}
            isPending={isPending}
            onError={onError}
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
        <p className="max-w-xs rounded-xl border border-destructive/40 bg-background/90 px-3 py-2 text-center text-xs text-destructive">
          {error} Periksa izin mikrofon browser, pastikan input device tersedia, lalu coba
          reconnect. Text consultation remains available.
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
  onError,
  onStateChange,
}: {
  disabled: boolean;
  isPending: boolean;
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
  const canTalk =
    connectionState === ConnectionState.Connected &&
    agentState !== "speaking" &&
    !disabled &&
    !isPending &&
    !micPending;

  const setMicEnabled = (enabled: boolean) => {
    if (enabled && !canTalk) {
      return;
    }
    if (!enabled && !effectiveMicEnabled) {
      return;
    }
    void toggleMic(enabled);
  };

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
        disabled={!canTalk && !effectiveMicEnabled}
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
        onPointerLeave={() => setMicEnabled(false)}
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
          : agentState === "speaking"
            ? "Patient is answering. Mic stays off."
            : "Hold the mic button to talk."}
      </span>
    </div>
  );
}
