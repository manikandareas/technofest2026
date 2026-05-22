from __future__ import annotations

from typing import Any, Literal

from livekit.plugins import deepgram, google, openai
from pydantic import ValidationError

from pixelaid_shared.gameplay import TtsProfile
from pixelaid_voice_agent.config import VoiceAgentSettings
from pixelaid_voice_agent.openrouter_tts import OpenRouterTTS, OpenRouterTtsOptions

TTS_PROFILE_FIELD = Literal["model", "voice_id"]

GEMINI_TTS_INSTRUCTIONS = (
    "Speak Indonesian clearly as a simulated patient. Keep the tone natural, "
    "slightly worried, and concise."
)


def parse_tts_profile(context: dict[str, Any]) -> TtsProfile | None:
    raw = context.get("tts_profile")
    if not isinstance(raw, dict):
        return None
    try:
        return TtsProfile.model_validate(raw)
    except ValidationError:
        return None


def resolve_tts_profile_value(
    context: dict[str, Any],
    *,
    provider: str,
    field: TTS_PROFILE_FIELD,
    default: str,
) -> str:
    profile = parse_tts_profile(context)
    if profile is None or profile.provider.lower() != provider.lower():
        return default
    value = profile.model if field == "model" else profile.voice_id
    return value or default


def build_stt(settings: VoiceAgentSettings) -> Any:
    return deepgram.STT(
        model="nova-3",
        language="id",
        interim_results=True,
        smart_format=True,
        endpointing_ms=250,
        no_delay=True,
        filler_words=False,
        api_key=settings.deepgram_api_key or "",
    )


def build_llm(settings: VoiceAgentSettings) -> Any:
    return openai.LLM(
        model="gpt-4.1-mini",
        api_key=settings.openai_api_key or "",
        temperature=0.2,
        max_completion_tokens=80,
    )


def build_tts(context: dict[str, Any], settings: VoiceAgentSettings) -> Any:
    if settings.tts_provider == "openrouter":
        if not settings.openrouter_api_key:
            raise RuntimeError(
                "OPENROUTER_API_KEY is required when TTS_PROVIDER=openrouter."
            )
        return OpenRouterTTS(
            OpenRouterTtsOptions(
                api_key=settings.openrouter_api_key,
                base_url=settings.openrouter_tts_base_url,
                model=resolve_tts_profile_value(
                    context,
                    provider="openrouter",
                    field="model",
                    default=settings.openrouter_tts_model,
                ),
                voice=resolve_tts_profile_value(
                    context,
                    provider="openrouter",
                    field="voice_id",
                    default=settings.openrouter_tts_voice_name,
                ),
            )
        )

    tts_kwargs: dict[str, Any] = {
        "model": resolve_tts_profile_value(
            context,
            provider="gemini",
            field="model",
            default=settings.gemini_tts_model,
        ),
        "voice_name": resolve_tts_profile_value(
            context,
            provider="gemini",
            field="voice_id",
            default=settings.gemini_tts_voice_name,
        ),
        "instructions": GEMINI_TTS_INSTRUCTIONS,
    }
    if settings.google_api_key:
        tts_kwargs["api_key"] = settings.google_api_key
    return google.beta.GeminiTTS(**tts_kwargs)
