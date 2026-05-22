from functools import lru_cache
from typing import Literal

from pydantic import AnyUrl
from pydantic_settings import BaseSettings, SettingsConfigDict


class VoiceAgentSettings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    project_name: str = "technofest2026"
    pixelaid_api_url: str = "http://localhost:8000"
    voice_agent_api_token: str | None = None
    livekit_url: AnyUrl | None = None
    livekit_api_key: str | None = None
    livekit_api_secret: str | None = None
    openai_api_key: str | None = None
    tts_provider: Literal["openrouter", "gemini"] = "openrouter"
    openrouter_api_key: str | None = None
    openrouter_tts_base_url: str = "https://openrouter.ai/api/v1"
    openrouter_tts_model: str = "google/gemini-3.1-flash-tts-preview"
    openrouter_tts_voice_name: str = "Kore"
    google_api_key: str | None = None
    gemini_tts_model: str = "gemini-2.5-flash-preview-tts"
    gemini_tts_voice_name: str = "Kore"
    deepgram_api_key: str | None = None
    voice_latency_profile: Literal["fast", "quality", "ptt"] = "ptt"

    def readiness(self) -> dict[str, bool]:
        return {
            "livekit": bool(
                self.livekit_url and self.livekit_api_key and self.livekit_api_secret
            ),
            "api": bool(self.pixelaid_api_url and self.voice_agent_api_token),
            "openai": bool(self.openai_api_key),
            "openrouter": bool(self.openrouter_api_key),
            "google": bool(self.google_api_key),
            "deepgram": bool(self.deepgram_api_key),
        }


@lru_cache
def get_settings() -> VoiceAgentSettings:
    return VoiceAgentSettings()
