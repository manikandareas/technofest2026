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
    )
