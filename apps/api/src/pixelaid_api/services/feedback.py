from __future__ import annotations

from openai import OpenAI
from pixelaid_api.settings import Settings, get_settings
from pixelaid_shared.gameplay import (
    FeedbackInput,
    StructuredFeedback,
    fallback_feedback,
)


def generate_structured_feedback(
    payload: FeedbackInput,
    settings: Settings | None = None,
) -> StructuredFeedback:
    resolved = settings or get_settings()
    if not resolved.openai_api_key:
        return fallback_feedback(payload)

    client = OpenAI(api_key=resolved.openai_api_key, timeout=8.0)
    try:
        response = client.responses.parse(
            model=resolved.openai_feedback_model,
            input=[
                {
                    "role": "system",
                    "content": (
                        "Tulis feedback pembelajaran klinis dalam Bahasa Indonesia. "
                        "Gunakan hanya data scoring deterministik yang diberikan. "
                        "Jangan mengubah atau menyebutkan scoring baru, XP, bintang, "
                        "atau grading medis di luar data input."
                    ),
                },
                {
                    "role": "user",
                    "content": payload.model_dump_json(),
                },
            ],
            text_format=StructuredFeedback,
        )
    except Exception:
        return fallback_feedback(payload)

    parsed = response.output_parsed
    if parsed is None:
        return fallback_feedback(payload)
    parsed.source = "ai"
    return parsed
