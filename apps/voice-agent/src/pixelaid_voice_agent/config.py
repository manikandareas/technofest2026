from functools import lru_cache

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
    deepgram_api_key: str | None = None

    def readiness(self) -> dict[str, bool]:
        return {
            "livekit": bool(
                self.livekit_url and self.livekit_api_key and self.livekit_api_secret
            ),
            "api": bool(self.pixelaid_api_url and self.voice_agent_api_token),
            "openai": bool(self.openai_api_key),
            "deepgram": bool(self.deepgram_api_key),
        }


@lru_cache
def get_settings() -> VoiceAgentSettings:
    return VoiceAgentSettings()
