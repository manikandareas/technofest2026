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

_LEGACY_OPENAI_PROFILE_PROVIDERS = frozenset({"openai", "openrouter"})


def parse_tts_profile(context: dict[str, Any]) -> TtsProfile | None:
    raw = context.get("tts_profile")
    if not isinstance(raw, dict):
        return None
    normalized = dict(raw)
    if "voice_id" not in normalized and "voice" in normalized:
        normalized["voice_id"] = normalized["voice"]
    try:
        return TtsProfile.model_validate(normalized)
    except ValidationError:
        return None


def _profile_matches_runtime(profile: TtsProfile, runtime_provider: str) -> bool:
    profile_provider = profile.provider.lower()
    runtime = runtime_provider.lower()
    if profile_provider == runtime:
        return True
    if runtime == "openrouter" and profile_provider in _LEGACY_OPENAI_PROFILE_PROVIDERS:
        return True
    if runtime == "gemini" and profile_provider in {"gemini", *_LEGACY_OPENAI_PROFILE_PROVIDERS}:
        return True
    return False


def resolve_tts_profile_value(
    context: dict[str, Any],
    *,
    provider: str,
    field: TTS_PROFILE_FIELD,
    default: str,
) -> str:
    profile = parse_tts_profile(context)
    if profile is None or not _profile_matches_runtime(profile, provider):
        return default
    value = profile.model if field == "model" else profile.voice_id
    return value or default


def resolve_tts_profile_speed(context: dict[str, Any], *, default: float = 1.0) -> float:
    profile = parse_tts_profile(context)
    if profile is None:
        return default
    return profile.speed


def build_gemini_tts_instructions(context: dict[str, Any]) -> str:
    profile = parse_tts_profile(context)
    if profile and profile.voice_style:
        return (
            "Speak Indonesian clearly as a simulated patient. "
            f"Voice style: {profile.voice_style}. "
            "Keep the tone natural and concise."
        )
    return GEMINI_TTS_INSTRUCTIONS


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
    instructions = build_gemini_tts_instructions(context)
    speed = resolve_tts_profile_speed(context)

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
                speed=speed,
                instructions=instructions,
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
        "instructions": instructions,
    }
    if settings.google_api_key:
        tts_kwargs["api_key"] = settings.google_api_key
    return google.beta.GeminiTTS(**tts_kwargs)
