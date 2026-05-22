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
    livekit_url: AnyUrl | None = None
    livekit_api_key: str | None = None
    livekit_api_secret: str | None = None
    openai_api_key: str | None = None
    deepgram_api_key: str | None = None
    eleven_api_key: str | None = None
    elevenlabs_api_key: str | None = None

    @property
    def elevenlabs_key(self) -> str | None:
        return self.elevenlabs_api_key or self.eleven_api_key

    def readiness(self) -> dict[str, bool]:
        return {
            "livekit": bool(
                self.livekit_url and self.livekit_api_key and self.livekit_api_secret
            ),
            "openai": bool(self.openai_api_key),
            "deepgram": bool(self.deepgram_api_key),
            "elevenlabs": bool(self.elevenlabs_key),
        }


@lru_cache
def get_settings() -> VoiceAgentSettings:
    return VoiceAgentSettings()
