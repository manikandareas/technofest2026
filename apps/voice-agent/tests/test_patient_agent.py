import pytest
from livekit.agents import llm
from pixelaid_shared.cases import CASE_CONFIGS
from pixelaid_shared.gameplay import validate_patient_reply
from pixelaid_voice_agent.patient_agent import SAFE_FALLBACK_TEXT, KoasPatientAgent


@pytest.mark.anyio
async def test_patient_agent_validates_before_tts_fallback(monkeypatch) -> None:
    agent = KoasPatientAgent(
        context={
            "case_id": "demo",
            "allowed_facts": [{"key": "onset", "response": "Mulainya dua jam lalu."}],
            "completed_examinations": [],
        },
        api_client=None,
        session_id="test",
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
    agent = KoasPatientAgent(
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
        api_client=None,
        session_id="test",
        instructions="test",
    )

    async def fake_collect(*args: object, **kwargs: object) -> str:
        return "Mulainya sekitar dua jam lalu saat saya naik tangga."

    monkeypatch.setattr(agent, "_collect_reply", fake_collect)

    result = await agent.llm_node(llm.ChatContext.empty(), [], None)  # type: ignore[arg-type]

    assert result == "Mulainya sekitar dua jam lalu saat saya naik tangga."


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
