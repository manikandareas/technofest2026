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

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  const label = {
    idle: "Voice ready",
    connecting: "Connecting",
    listening: "Listening",
    user_speaking: "You are speaking",
    muted: "Mic muted",
    patient_thinking: "Patient thinking",
    patient_speaking: "Patient speaking",
    reconnecting: "Reconnecting",
    disconnected: "Disconnected",
    error: "Voice fallback",
  }[uiState];
  const startLabel = uiState === "disconnected" ? "Reconnect voice" : "Start voice";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {token ? <Mic className="size-4" /> : <MicOff className="size-4" />}
          Voice consultation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div aria-live="polite" role="status">
              <Badge variant={uiState === "error" ? "outline" : "secondary"}>{label}</Badge>
            </div>
            {token ? (
              <p className="mt-2 text-xs text-muted-foreground">
                AI patient voice is active. Transcript text is stored; raw audio is not stored by
                PixelAid.
              </p>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">
                Voice uses an AI patient with STT and TTS providers. Text consultation remains
                available if mic, connection, STT, or TTS fails.
              </p>
            )}
          </div>
          {token ? (
            <Button variant="outline" onClick={onStop} aria-label="Stop voice consultation">
              Stop voice
            </Button>
          ) : (
            <Button disabled={isPending || disabled} onClick={onStart} aria-label={startLabel}>
              {uiState === "disconnected" ? (
                <RotateCcw className="size-4" />
              ) : (
                <Mic className="size-4" />
              )}
              {startLabel}
            </Button>
          )}
        </div>
        {error ? (
          <p className="rounded-md border border-destructive/40 p-3 text-sm text-destructive">
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
      </CardContent>
    </Card>
  );
}

function AudioUnlockButton() {
  const { canPlayAudio, startAudio } = useAudioPlayback();
  const [failed, setFailed] = useState(false);

  if (canPlayAudio) {
    return null;
  }

  return (
    <div className="mt-3 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
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
    <div className="mt-3 flex flex-wrap items-center gap-2 rounded-md border bg-muted/20 p-3 text-sm">
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
      <span className="flex items-center gap-2 text-xs text-muted-foreground">
        {connectionState === ConnectionState.Disconnected ? <WifiOff className="size-4" /> : null}
        {effectiveMicEnabled
          ? "Mic is active for the AI patient."
          : "Mic is off. Text fallback remains available."}
      </span>
    </div>
  );
}
