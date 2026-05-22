from functools import lru_cache

from pydantic import AnyHttpUrl, AnyUrl, Field, SecretStr, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    project_name: str = "technofest2026"
    environment: str = "development"
    cors_origins: list[str] = Field(
        default_factory=lambda: ["http://localhost:3000"],
        validation_alias="CORS_ORIGINS",
    )
    supabase_url: AnyHttpUrl | None = None
    supabase_service_role_key: SecretStr | None = None
    livekit_url: AnyUrl | None = None
    livekit_api_key: str | None = None
    livekit_api_secret: str | None = None
    voice_agent_api_token: SecretStr | None = None
    openai_api_key: str | None = None
    openai_feedback_model: str = "gpt-5.5"
    guest_demo_session_limit: int = 3
    guest_demo_session_window_seconds: int = 24 * 60 * 60
    guest_voice_token_limit: int = 3
    guest_voice_token_window_seconds: int = 60 * 60
    authenticated_voice_token_limit: int = 10
    authenticated_voice_token_window_seconds: int = 60 * 60
    ai_feedback_generation_limit: int = 30
    ai_feedback_generation_window_seconds: int = 24 * 60 * 60
    guest_demo_claim_attempt_limit: int = 5
    guest_demo_claim_attempt_window_seconds: int = 60 * 60
    deepgram_api_key: str | None = None
    eleven_api_key: str | None = None
    elevenlabs_api_key: str | None = None

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: str | list[str]) -> list[str]:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]

        return value

    @property
    def elevenlabs_key(self) -> str | None:
        return self.elevenlabs_api_key or self.eleven_api_key


@lru_cache
def get_settings() -> Settings:
    return Settings()
