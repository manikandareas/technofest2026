from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any, Literal

from livekit.agents import TurnHandlingOptions
from livekit.plugins.turn_detector.multilingual import MultilingualModel

VoiceLatencyProfileName = Literal["fast", "quality"]

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class VoiceLatencyProfile:
    name: VoiceLatencyProfileName
    turn_handling: TurnHandlingOptions
    aec_warmup_duration: float | None


def resolve_latency_profile(
    profile_name: VoiceLatencyProfileName,
) -> VoiceLatencyProfile:
    if profile_name == "quality":
        return VoiceLatencyProfile(
            name="quality",
            turn_handling={
                "turn_detection": _resolve_quality_turn_detection(),
                "endpointing": {
                    "mode": "fixed",
                    "min_delay": 0.5,
                    "max_delay": 3.0,
                },
                "interruption": {
                    "enabled": True,
                    "mode": "adaptive",
                    "min_duration": 0.5,
                    "min_words": 0,
                    "false_interruption_timeout": 1.5,
                    "resume_false_interruption": True,
                },
                "preemptive_generation": {
                    "enabled": True,
                    "preemptive_tts": False,
                    "max_speech_duration": 10.0,
                    "max_retries": 3,
                },
            },
            aec_warmup_duration=1.0,
        )

    return VoiceLatencyProfile(
        name="fast",
        turn_handling={
            "turn_detection": "stt",
            "endpointing": {
                "mode": "fixed",
                "min_delay": 0.25,
                "max_delay": 1.0,
            },
            "interruption": {
                "enabled": True,
                "mode": "vad",
                "min_duration": 0.7,
                "min_words": 1,
                "false_interruption_timeout": 0.6,
                "resume_false_interruption": True,
            },
            "preemptive_generation": {
                "enabled": True,
                "preemptive_tts": False,
                "max_speech_duration": 10.0,
                "max_retries": 3,
            },
        },
        aec_warmup_duration=0.0,
    )


def _resolve_quality_turn_detection() -> Any:
    try:
        return _build_multilingual_turn_detector()
    except Exception as exc:
        logger.warning(
            "LiveKit multilingual turn detector is unavailable; falling back to "
            "STT turn detection. Run `uv run python -m livekit.agents download-files` "
            "from apps/voice-agent to enable the quality latency profile. Error: %s",
            exc,
        )
        return "stt"


def _build_multilingual_turn_detector() -> MultilingualModel:
    return MultilingualModel()
