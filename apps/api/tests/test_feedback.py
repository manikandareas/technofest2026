from __future__ import annotations

from typing import Any, cast

from pixelaid_api.services import feedback as feedback_service
from pixelaid_api.settings import Settings
from pixelaid_shared.gameplay import FeedbackInput, ScoreBreakdown, StructuredFeedback


def test_feedback_service_uses_structured_output(monkeypatch) -> None:
    expected = StructuredFeedback(
        summary="Kamu sudah mengarah ke keputusan klinis yang aman.",
        strengths=["Anamnesis fokus."],
        improvements=["Lengkapi ECG."],
        next_steps=["Ulangi kasus."],
    )

    class FakeResponses:
        def parse(self, **kwargs: Any) -> object:
            assert kwargs["model"] == "test-feedback-model"
            assert kwargs["text_format"] is StructuredFeedback
            prompt = "\n".join(message["content"] for message in kwargs["input"])
            assert "missed_interview" not in prompt
            assert "asked_bleeding_warning" not in prompt
            assert "ordered_ns1" not in prompt
            assert "next-best-step" not in prompt
            assert "tanda bahaya perdarahan" in prompt
            assert "pemeriksaan NS1" in prompt
            assert "langkah awal yang paling aman" in prompt
            return type("ParsedResponse", (), {"output_parsed": expected})()

    class FakeOpenAI:
        def __init__(self, **kwargs: Any) -> None:
            assert kwargs["api_key"] == "test-key"

        responses = FakeResponses()

    monkeypatch.setattr(feedback_service, "OpenAI", FakeOpenAI)

    result = feedback_service.generate_structured_feedback(
        _feedback_input(),
        cast(Any, Settings)(
            _env_file=None,
            openai_api_key="test-key",
            openai_feedback_model="test-feedback-model",
        ),
    )

    assert result.source == "ai"
    assert result.summary == expected.summary


def test_feedback_service_falls_back_without_key() -> None:
    result = feedback_service.generate_structured_feedback(
        _feedback_input(),
        cast(Any, Settings)(_env_file=None, openai_api_key=None),
    )

    assert result.source == "fallback"
    assert "XP" not in result.summary
    assert "deterministik" not in result.summary


def test_feedback_service_sanitizes_internal_terms(monkeypatch) -> None:
    expected = StructuredFeedback(
        summary="Nilai dari score_breakdown sudah baik.",
        strengths=["Tidak ada masalah pada missed_interview."],
        improvements=["Jangan lupa next-best-step."],
        next_steps=["Lengkapi ordered_ns1."],
        safety_note="Hati-hati dengan safety_critical.",
    )

    class FakeResponses:
        def parse(self, **kwargs: Any) -> object:
            return type("ParsedResponse", (), {"output_parsed": expected})()

    class FakeOpenAI:
        def __init__(self, **kwargs: Any) -> None:
            return None

        responses = FakeResponses()

    monkeypatch.setattr(feedback_service, "OpenAI", FakeOpenAI)

    result = feedback_service.generate_structured_feedback(
        _feedback_input(),
        cast(Any, Settings)(_env_file=None, openai_api_key="test-key"),
    )

    rendered = " ".join(
        [
            result.summary,
            *result.strengths,
            *result.improvements,
            *result.next_steps,
            result.safety_note or "",
        ]
    )
    assert result.source == "ai"
    assert "score_breakdown" not in rendered
    assert "missed_interview" not in rendered
    assert "next-best-step" not in rendered
    assert "ordered_ns1" not in rendered
    assert "safety_critical" not in rendered


def test_feedback_service_falls_back_on_invalid_output(monkeypatch) -> None:
    class FakeResponses:
        def parse(self, **kwargs: Any) -> object:
            return type("ParsedResponse", (), {"output_parsed": None})()

    class FakeOpenAI:
        def __init__(self, **kwargs: Any) -> None:
            return None

        responses = FakeResponses()

    monkeypatch.setattr(feedback_service, "OpenAI", FakeOpenAI)

    result = feedback_service.generate_structured_feedback(
        _feedback_input(),
        cast(Any, Settings)(_env_file=None, openai_api_key="test-key"),
    )

    assert result.source == "fallback"


def _feedback_input() -> FeedbackInput:
    return FeedbackInput(
        case_id="internal-medicine-dengue-warning-signs",
        patient_name="Raka",
        score=80,
        stars=3,
        score_breakdown=ScoreBreakdown(
            quiz=35,
            interview=20,
            examination=15,
            medical_record=10,
            time=5,
            safety=5,
            total=90,
        ),
        case_feedback_template="Pertahankan struktur konsultasi.",
        missed_interview=["asked_bleeding_warning"],
        missed_examinations=["ordered_ns1"],
        missed_safety_questions=["next-best-step"],
    )
