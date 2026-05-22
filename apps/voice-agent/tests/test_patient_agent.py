from typing import Any, cast

import pytest
from livekit.agents import llm
from pixelaid_shared.cases import CASE_CONFIGS
from pixelaid_shared.gameplay import validate_patient_reply
from pixelaid_voice_agent.patient_agent import SAFE_FALLBACK_TEXT, PixelAidPatientAgent


class SyncEventRecorder:
    def __init__(self) -> None:
        self.events: list[dict[str, object]] = []

    def record(
        self,
        event_type: str,
        *,
        severity: str = "info",
        metadata: dict[str, object] | None = None,
    ) -> None:
        self.events.append(
            {
                "event_type": event_type,
                "severity": severity,
                "metadata": metadata or {},
            }
        )


@pytest.mark.anyio
async def test_patient_agent_validates_before_tts_fallback(monkeypatch) -> None:
    agent = PixelAidPatientAgent(
        context={
            "case_id": "demo",
            "allowed_facts": [{"key": "onset", "response": "Mulainya dua jam lalu."}],
            "completed_examinations": [],
        },
        instructions="test",
    )
    replies = iter(["Ini ACS.", "Troponin saya naik."])

    async def fake_collect(*args: object, **kwargs: object) -> str:
        return next(replies)

    monkeypatch.setattr(agent, "_collect_reply", fake_collect)

    result = await agent.llm_node(llm.ChatContext.empty(), [], None)  # type: ignore[arg-type]

    assert result == SAFE_FALLBACK_TEXT


@pytest.mark.anyio
async def test_patient_agent_accepts_safe_grounded_reply(monkeypatch) -> None:
    agent = PixelAidPatientAgent(
        context={
            "case_id": "demo",
            "allowed_facts": [
                {
                    "key": "onset",
                    "response": "Mulainya sekitar dua jam lalu saat saya naik tangga.",
                }
            ],
            "completed_examinations": [],
        },
        instructions="test",
    )

    async def fake_collect(*args: object, **kwargs: object) -> str:
        return "Mulainya sekitar dua jam lalu saat saya naik tangga."

    monkeypatch.setattr(agent, "_collect_reply", fake_collect)

    result = await agent.llm_node(llm.ChatContext.empty(), [], None)  # type: ignore[arg-type]

    assert result == "Mulainya sekitar dua jam lalu saat saya naik tangga."


@pytest.mark.anyio
async def test_patient_agent_records_validation_reasons_before_retry(monkeypatch) -> None:
    telemetry = SyncEventRecorder()
    agent = PixelAidPatientAgent(
        context={
            "case_id": "demo",
            "allowed_facts": [
                {
                    "key": "onset",
                    "response": "Mulainya sekitar dua jam lalu saat saya naik tangga.",
                }
            ],
            "completed_examinations": [],
        },
        telemetry=telemetry,
        instructions="test",
    )
    replies = iter(
        [
            "Sepertinya ini ACS.",
            "Mulainya sekitar dua jam lalu saat saya naik tangga.",
        ]
    )

    async def fake_collect(*args: object, **kwargs: object) -> str:
        return next(replies)

    monkeypatch.setattr(agent, "_collect_reply", fake_collect)

    result = await agent.llm_node(llm.ChatContext.empty(), [], None)  # type: ignore[arg-type]

    assert result == "Mulainya sekitar dua jam lalu saat saya naik tangga."
    validation_event = next(
        event for event in telemetry.events if event["event_type"] == "validation_failed"
    )
    retry_event = next(event for event in telemetry.events if event["event_type"] == "safety_retry")
    validation_metadata = validation_event["metadata"]
    retry_metadata = retry_event["metadata"]
    assert isinstance(validation_metadata, dict)
    assert isinstance(retry_metadata, dict)
    validation_reasons = cast(list[str], validation_metadata["reasons"])
    retry_reasons = cast(list[str], retry_metadata["reasons"])
    assert "forbidden_term:acs" in validation_reasons
    assert retry_reasons == validation_reasons


def test_voice_guardrails_cover_all_mvp_cases() -> None:
    for case in CASE_CONFIGS.values():
        assert not validate_patient_reply(
            case,
            "Sepertinya diagnosis saya ACS dan troponin saya naik.",
            used_fact_keys=set(),
            completed_exam_keys=set(),
        ).ok
        assert not validate_patient_reply(
            case,
            "Saya punya murmur dan ronki berat.",
            used_fact_keys=set(),
            completed_exam_keys=set(),
        ).ok
        assert not validate_patient_reply(
            case,
            "Hasil ECG dan BNP saya abnormal.",
            used_fact_keys=set(),
            completed_exam_keys=set(),
        ).ok
        unknown = validate_patient_reply(
            case,
            SAFE_FALLBACK_TEXT,
            used_fact_keys={"unknown-fact-key"},
            completed_exam_keys=set(),
        )
        assert unknown.ok is False
        assert any(reason.startswith("unknown_fact_keys") for reason in unknown.reasons)
        assert validate_patient_reply(
            case,
            SAFE_FALLBACK_TEXT,
            used_fact_keys=set(),
            completed_exam_keys=set(),
        ).ok
