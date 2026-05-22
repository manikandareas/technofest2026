from typing import Any, cast

import pytest
from pixelaid_voice_agent import latency
from pixelaid_voice_agent.config import VoiceAgentSettings
from pixelaid_voice_agent.latency import resolve_latency_profile
from pixelaid_voice_agent.openrouter_tts import OpenRouterTTS
from pixelaid_voice_agent.tts_factory import build_llm, build_tts


def test_readiness_without_env_is_degraded() -> None:
    settings = cast(Any, VoiceAgentSettings)(
        _env_file=None,
        pixelaid_api_url="",
        voice_agent_api_token=None,
        livekit_url=None,
        livekit_api_key=None,
        livekit_api_secret=None,
        openai_api_key=None,
        openrouter_api_key=None,
        google_api_key=None,
        deepgram_api_key=None,
    )

    assert settings.project_name == "technofest2026"
    assert settings.readiness() == {
        "livekit": False,
        "api": False,
        "openai": False,
        "openrouter": False,
        "google": False,
        "deepgram": False,
    }


def test_default_tts_provider_uses_openrouter_gemini() -> None:
    settings = cast(Any, VoiceAgentSettings)(
        _env_file=None,
        openrouter_api_key="test-openrouter-key",
    )

    tts = build_tts({}, settings)

    assert isinstance(tts, OpenRouterTTS)
    assert tts.provider == "openrouter"
    assert tts.model == "google/gemini-3.1-flash-tts-preview"


def test_ptt_latency_profile_is_default_and_disables_interruption() -> None:
    settings = cast(Any, VoiceAgentSettings)(_env_file=None)
    profile = resolve_latency_profile(settings.voice_latency_profile)
    options = cast(dict[str, Any], profile.turn_handling)

    assert profile.name == "ptt"
    assert profile.aec_warmup_duration == 0.0
    assert options["turn_detection"] == "stt"
    assert options["endpointing"] == {
        "mode": "fixed",
        "min_delay": 0.15,
        "max_delay": 0.8,
    }
    assert options["interruption"] == {"enabled": False}
    assert options["preemptive_generation"]["enabled"] is True
    assert options["preemptive_generation"]["preemptive_tts"] is False
    assert options["preemptive_generation"]["max_speech_duration"] == 10.0
    assert options["preemptive_generation"]["max_retries"] == 3


def test_fast_latency_profile_remains_low_latency_with_vad_interruption() -> None:
    profile = resolve_latency_profile("fast")
    options = cast(dict[str, Any], profile.turn_handling)

    assert profile.name == "fast"
    assert profile.aec_warmup_duration == 0.0
    assert options["turn_detection"] == "stt"
    assert options["endpointing"] == {
        "mode": "fixed",
        "min_delay": 0.25,
        "max_delay": 1.0,
    }
    assert options["interruption"]["mode"] == "vad"
    assert options["interruption"]["min_duration"] == 0.7
    assert options["interruption"]["min_words"] == 1
    assert options["interruption"]["false_interruption_timeout"] == 0.6
    assert options["preemptive_generation"]["enabled"] is True
    assert options["preemptive_generation"]["preemptive_tts"] is False
    assert options["preemptive_generation"]["max_speech_duration"] == 10.0
    assert options["preemptive_generation"]["max_retries"] == 3


def test_quality_latency_profile_uses_multilingual_detector_when_available(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    turn_detector = object()
    monkeypatch.setattr(
        latency,
        "_build_multilingual_turn_detector",
        lambda: turn_detector,
    )

    profile = resolve_latency_profile("quality")
    options = cast(dict[str, Any], profile.turn_handling)

    assert profile.name == "quality"
    assert options["turn_detection"] is turn_detector
    assert options["endpointing"]["min_delay"] == 0.5
    assert options["endpointing"]["max_delay"] == 3.0
    assert options["interruption"]["mode"] == "adaptive"


def test_quality_latency_profile_falls_back_to_stt(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    def fail_detector() -> object:
        raise RuntimeError("model files missing")

    monkeypatch.setattr(latency, "_build_multilingual_turn_detector", fail_detector)

    profile = resolve_latency_profile("quality")
    options = cast(dict[str, Any], profile.turn_handling)

    assert options["turn_detection"] == "stt"


def test_llm_config_caps_voice_completion_tokens() -> None:
    settings = cast(Any, VoiceAgentSettings)(_env_file=None, openai_api_key="test-key")

    llm = build_llm(settings)

    assert cast(Any, llm)._opts.model == "gpt-4.1-mini"
    assert cast(Any, llm)._opts.max_completion_tokens == 80
