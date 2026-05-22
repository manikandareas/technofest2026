# PixelAid Voice Agent

LiveKit Agents worker for realtime patient voice consultation.

Required environment:

```bash
LIVEKIT_URL=
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
OPENAI_API_KEY=
TTS_PROVIDER=openrouter
OPENROUTER_API_KEY=
OPENROUTER_TTS_MODEL=google/gemini-3.1-flash-tts-preview
OPENROUTER_TTS_VOICE_NAME=Kore
DEEPGRAM_API_KEY=
VOICE_LATENCY_PROFILE=ptt
PIXELAID_API_URL=http://127.0.0.1:8000
VOICE_AGENT_API_TOKEN=
```

Deepgram is used for STT. OpenAI is used for response generation.
OpenRouter is the default TTS provider, using Gemini TTS through OpenRouter credits.

## Latency profile

`VOICE_LATENCY_PROFILE=ptt` is the default for push-to-talk consultation. It uses
STT turn detection, prewarmed Silero VAD, short endpointing, no AEC warmup pause,
and disables automatic interruption so patient replies are not cancelled by
ambient audio while the mic is normally off.

Set `VOICE_LATENCY_PROFILE=fast` to restore continuous mic behavior with VAD-based
interruption.

Set `VOICE_LATENCY_PROFILE=quality` only after downloading LiveKit turn detector
files. The quality profile uses the multilingual turn detector when those files
are available, then falls back to `stt` turn detection if they are missing.

```bash
uv run python -m livekit.agents download-files
```

Set `TTS_PROVIDER=gemini` with `GOOGLE_API_KEY` to use Gemini directly instead of
OpenRouter.
