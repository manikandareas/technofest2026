from typing import Any, cast

from pixelaid_voice_agent.config import VoiceAgentSettings


def test_readiness_without_env_is_degraded() -> None:
    settings = cast(Any, VoiceAgentSettings)(_env_file=None)

    assert settings.project_name == "technofest2026"
    assert settings.readiness() == {
        "livekit": False,
        "api": False,
        "openai": False,
        "deepgram": False,
    }
