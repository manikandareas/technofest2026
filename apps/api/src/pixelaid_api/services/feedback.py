from __future__ import annotations

from openai import OpenAI
from pixelaid_api.settings import Settings, get_settings
from pixelaid_shared.gameplay import (
    FeedbackInput,
    StructuredFeedback,
    fallback_feedback,
    user_friendly_feedback_topic,
)

_BANNED_FEEDBACK_TERMS = (
    "case_id",
    "score_breakdown",
    "missed_interview",
    "missed_examinations",
    "missed_safety_questions",
    "correct_option_id",
    "safety_critical",
    "feedback_template",
    "deterministik",
)


def generate_structured_feedback(
    payload: FeedbackInput,
    settings: Settings | None = None,
) -> StructuredFeedback:
    resolved = settings or get_settings()
    if not resolved.openai_api_key:
        return fallback_feedback(payload)

    client = OpenAI(
        api_key=resolved.openai_api_key,
        timeout=resolved.openai_feedback_timeout_seconds,
    )
    try:
        response = client.responses.parse(
            model=resolved.openai_feedback_model,
            input=[
                {
                    "role": "system",
                    "content": (
                        "Tulis feedback pembelajaran klinis dalam Bahasa Indonesia "
                        "yang ramah untuk pemain PixelAid. Gunakan kalimat pendek, "
                        "hangat, dan mudah dipahami mahasiswa. Jangan menyebut nama "
                        "field, nama variable, JSON, rubric key, id internal, XP, "
                        "atau mekanisme scoring. Hindari pola snake_case, kebab-case, "
                        "prefiks teknis untuk item yang ditanya atau diperiksa, dan "
                        "istilah sistem internal apa pun. "
                        "Boleh menyebut skor dan bintang yang ada di konteks, tetapi "
                        "jangan membuat skor baru. Fokus pada apa yang sudah baik, "
                        "apa yang perlu dilengkapi, dan langkah latihan berikutnya."
                    ),
                },
                {
                    "role": "user",
                    "content": _feedback_context(payload),
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
    return _sanitize_feedback(parsed)


def _feedback_context(payload: FeedbackInput) -> str:
    breakdown = payload.score_breakdown
    missed_interview = _friendly_list(payload.missed_interview)
    missed_examinations = _friendly_list(payload.missed_examinations)
    missed_safety = _friendly_list(payload.missed_safety_questions)
    return "\n".join(
        [
            f"Pasien: {payload.patient_name}",
            f"Hasil pemain: {payload.score}/100, {payload.stars} bintang",
            (
                "Ringkasan area nilai: "
                f"kuis {breakdown.quiz}, wawancara {breakdown.interview}, "
                f"pemeriksaan {breakdown.examination}, rekam medis "
                f"{breakdown.medical_record}, waktu {breakdown.time}, "
                f"keamanan klinis {breakdown.safety}"
            ),
            f"Hal wawancara yang masih bisa dilengkapi: {missed_interview}",
            f"Pemeriksaan yang masih bisa dipertimbangkan: {missed_examinations}",
            f"Keputusan penting yang perlu diperhatikan: {missed_safety}",
            f"Arah belajar kasus: {payload.case_feedback_template}",
            (
                "Tulis output sebagai feedback final untuk pemain. Jangan menyebut "
                "nama teknis dari sistem, ID, atau istilah internal."
            ),
        ]
    )


def _friendly_list(items: list[str]) -> str:
    if not items:
        return "tidak ada catatan khusus"
    return ", ".join(user_friendly_feedback_topic(item) for item in items)


def _sanitize_feedback(feedback: StructuredFeedback) -> StructuredFeedback:
    feedback.summary = _clean_feedback_text(feedback.summary)
    feedback.strengths = [_clean_feedback_text(item) for item in feedback.strengths]
    feedback.improvements = [
        _clean_feedback_text(item) for item in feedback.improvements
    ]
    feedback.next_steps = [_clean_feedback_text(item) for item in feedback.next_steps]
    if feedback.safety_note is not None:
        feedback.safety_note = _clean_feedback_text(feedback.safety_note)
    return feedback


def _clean_feedback_text(text: str) -> str:
    cleaned = text
    replacements = {
        "next-best-step": "langkah awal yang paling aman",
        "next_step": "langkah awal yang paling aman",
        "safety-critical": "keputusan klinis penting",
        "safety_critical": "keputusan klinis penting",
        "ordered_ns1": "pemeriksaan NS1",
        "asked_bleeding_warning": "tanda bahaya perdarahan",
        "score_breakdown": "rincian nilai",
        "missed_interview": "area wawancara yang perlu dilengkapi",
        "missed_examinations": "pemeriksaan yang perlu dipertimbangkan",
        "missed_safety_questions": "keputusan penting yang perlu diperhatikan",
        "case_id": "kasus",
    }
    for raw, friendly in replacements.items():
        cleaned = cleaned.replace(raw, friendly)
    for banned in _BANNED_FEEDBACK_TERMS:
        cleaned = cleaned.replace(banned, "")
    return " ".join(cleaned.split())
