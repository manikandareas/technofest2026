from __future__ import annotations

from datetime import datetime, timedelta, timezone
from decimal import Decimal, ROUND_HALF_UP
from typing import Literal

from pydantic import BaseModel, Field

SessionStatus = Literal["brief", "in_consultation", "quiz", "completed", "abandoned"]
ExamStatus = Literal["pending", "resulted"]
Difficulty = Literal["easy", "medium", "hard"]

DIFFICULTY_MULTIPLIERS: dict[Difficulty, Decimal] = {
    "easy": Decimal("1.0"),
    "medium": Decimal("1.25"),
    "hard": Decimal("1.5"),
}


class MedicalRecord(BaseModel):
    summary: str
    history: list[str]
    medications: list[str]
    allergies: list[str]


class PatientFact(BaseModel):
    keywords: list[str]
    response: str
    rubric_key: str | None = None
    allowed_terms: list[str] = Field(default_factory=list)


class ExaminationConfig(BaseModel):
    id: str
    label: str
    category: str
    delay_seconds: int
    result: str
    asset: dict[str, str] | None = None
    score_key: str | None = None
    guard_terms: list[str] = Field(default_factory=list)


class TtsProfile(BaseModel):
    provider: str = "openai"
    voice_id: str
    model: str = "gpt-4o-mini-tts"
    language: str = "id"


class QuizOption(BaseModel):
    id: str
    label: str


class QuizQuestion(BaseModel):
    id: str
    prompt: str
    options: list[QuizOption]
    correct_option_id: str
    explanation: str
    safety_critical: bool = False


class CaseGameplayConfig(BaseModel):
    id: str
    patient_name: str
    timer_seconds: int
    medical_record: MedicalRecord
    patient_facts: list[PatientFact]
    examinations: list[ExaminationConfig]
    quiz: list[QuizQuestion]
    interview_rubric: list[str]
    examination_rubric: list[str]
    safety_question_ids: list[str] = Field(default_factory=list)
    feedback_template: str
    patient_persona: str = "Jawab sebagai pasien simulasi Indonesia. Singkat, natural, dan hanya pakai fakta kasus."
    tts_profile: TtsProfile = Field(
        default_factory=lambda: TtsProfile(voice_id="alloy")
    )
    forbidden_terms: list[str] = Field(default_factory=list)


class ScoreBreakdown(BaseModel):
    quiz: int
    interview: int
    examination: int
    medical_record: int
    time: int
    safety: int
    total: int


class StructuredFeedback(BaseModel):
    summary: str
    strengths: list[str] = Field(default_factory=list)
    improvements: list[str] = Field(default_factory=list)
    next_steps: list[str] = Field(default_factory=list)
    safety_note: str | None = None
    source: Literal["ai", "fallback"] = "fallback"


class FeedbackInput(BaseModel):
    case_id: str
    patient_name: str
    score: int
    stars: int
    score_breakdown: ScoreBreakdown
    missed_interview: list[str] = Field(default_factory=list)
    missed_examinations: list[str] = Field(default_factory=list)
    missed_safety_questions: list[str] = Field(default_factory=list)
    case_feedback_template: str


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def due_at(delay_seconds: int, now: datetime | None = None) -> datetime:
    return (now or utc_now()) + timedelta(seconds=delay_seconds)


def exam_status(
    resulted_at: datetime | None, now: datetime | None = None
) -> ExamStatus:
    if resulted_at and resulted_at <= (now or utc_now()):
        return "resulted"
    return "pending"


def patient_response(case: CaseGameplayConfig, question: str) -> tuple[str, str | None]:
    normalized = question.casefold()
    for fact in case.patient_facts:
        if any(keyword.casefold() in normalized for keyword in fact.keywords):
            return fact.response, fact.rubric_key
    return (
        "Saya belum paham maksud pertanyaannya, Dok. Bisa ditanyakan lebih spesifik?",
        None,
    )


class VoiceReplyValidation(BaseModel):
    ok: bool
    reasons: list[str] = Field(default_factory=list)


def validate_patient_reply(
    case: CaseGameplayConfig,
    reply: str,
    *,
    used_fact_keys: set[str],
    completed_exam_keys: set[str],
) -> VoiceReplyValidation:
    normalized = reply.casefold()
    reasons: list[str] = []
    allowed_fact_keys = {
        fact.rubric_key for fact in case.patient_facts if fact.rubric_key
    }
    unknown_fact_keys = used_fact_keys.difference(allowed_fact_keys)
    if unknown_fact_keys:
        reasons.append(f"unknown_fact_keys:{','.join(sorted(unknown_fact_keys))}")

    for term in case.forbidden_terms:
        if term.casefold() in normalized:
            reasons.append(f"forbidden_term:{term}")

    known_terms = _known_patient_terms(case)
    for token in _clinical_tokens(normalized):
        if token not in known_terms:
            reasons.append(f"invented_clinical_fact:{token}")

    for exam in case.examinations:
        if exam.score_key in completed_exam_keys or exam.id in completed_exam_keys:
            continue
        for term in exam.guard_terms:
            if term.casefold() in normalized:
                reasons.append(f"unperformed_exam_term:{term}")

    return VoiceReplyValidation(ok=not reasons, reasons=reasons)


def _known_patient_terms(case: CaseGameplayConfig) -> set[str]:
    terms: set[str] = set()
    for fact in case.patient_facts:
        for item in [*fact.keywords, fact.response, *fact.allowed_terms]:
            terms.update(_clinical_tokens(item.casefold()))
    for item in [
        case.medical_record.summary,
        *case.medical_record.history,
        *case.medical_record.medications,
        *case.medical_record.allergies,
    ]:
        terms.update(_clinical_tokens(item.casefold()))
    return terms


def _clinical_tokens(value: str) -> set[str]:
    guarded = {
        "acs",
        "akut",
        "alergi",
        "amlodipine",
        "asma",
        "bnp",
        "dada",
        "diabetes",
        "ecg",
        "edema",
        "gagal",
        "gerd",
        "hipertensi",
        "iskemia",
        "jantung",
        "kardiomegali",
        "kongesti",
        "murmur",
        "nyeri",
        "panic",
        "panik",
        "ronki",
        "sesak",
        "stemi",
        "st",
        "takikardia",
        "troponin",
    }
    return {term for term in guarded if term in value}


def calculate_score(
    case: CaseGameplayConfig,
    answers: dict[str, str],
    covered_interview_keys: set[str],
    completed_exam_keys: set[str],
    opened_medical_record: bool,
    remaining_seconds: int,
    used_extension: bool,
) -> ScoreBreakdown:
    correct_count = sum(
        1
        for question in case.quiz
        if answers.get(question.id) == question.correct_option_id
    )
    quiz = round((correct_count / max(len(case.quiz), 1)) * 35)
    interview = round(
        (
            len(covered_interview_keys.intersection(case.interview_rubric))
            / max(len(case.interview_rubric), 1)
        )
        * 25
    )
    examination = round(
        (
            len(completed_exam_keys.intersection(case.examination_rubric))
            / max(len(case.examination_rubric), 1)
        )
        * 20
    )
    medical_record = 10 if opened_medical_record else 0
    time = (
        5
        if remaining_seconds > 0 and not used_extension
        else 3
        if remaining_seconds > 0
        else 0
    )
    safety_ok = all(
        answers.get(qid) == _question(case, qid).correct_option_id
        for qid in case.safety_question_ids
    )
    safety = 5 if safety_ok else 0
    total = min(100, quiz + interview + examination + medical_record + time + safety)
    return ScoreBreakdown(
        quiz=quiz,
        interview=interview,
        examination=examination,
        medical_record=medical_record,
        time=time,
        safety=safety,
        total=total,
    )


def stars_for_score(score: int, safety_score: int) -> int:
    if score >= 70:
        stars = 3
    elif score >= 40:
        stars = 2
    elif score > 0:
        stars = 1
    else:
        stars = 0
    if safety_score == 0:
        return min(2, stars)
    return stars


def calculate_xp(base_xp: int, score: int, difficulty: Difficulty) -> int:
    bounded_score = max(0, min(score, 100))
    multiplier = DIFFICULTY_MULTIPLIERS[difficulty]
    value = Decimal(base_xp) * Decimal(bounded_score) / Decimal(100) * multiplier
    return int(value.quantize(Decimal("1"), rounding=ROUND_HALF_UP))


def calculate_retry_xp(calculated_xp: int) -> int:
    value = Decimal(max(0, calculated_xp)) * Decimal("0.2")
    return int(value.quantize(Decimal("1"), rounding=ROUND_HALF_UP))


def level_for_xp(total_xp: int) -> int:
    return max(0, total_xp) // 100 + 1


def summarize_missed_categories(
    case: CaseGameplayConfig,
    answers: dict[str, str],
    covered_interview_keys: set[str],
    completed_exam_keys: set[str],
) -> tuple[list[str], list[str], list[str]]:
    missed_interview = sorted(
        set(case.interview_rubric).difference(covered_interview_keys)
    )
    missed_examinations = sorted(
        set(case.examination_rubric).difference(completed_exam_keys)
    )
    missed_safety = [
        question.id
        for question in case.quiz
        if question.safety_critical
        and answers.get(question.id) != question.correct_option_id
    ]
    return missed_interview, missed_examinations, missed_safety


def fallback_feedback(payload: FeedbackInput) -> StructuredFeedback:
    strengths: list[str] = []
    improvements: list[str] = []
    next_steps: list[str] = []

    breakdown = payload.score_breakdown
    if breakdown.quiz >= 25:
        strengths.append(
            "Jawaban quiz sudah menangkap arah diagnosis dan keputusan klinis utama."
        )
    if breakdown.medical_record > 0:
        strengths.append(
            "Kamu memanfaatkan rekam medis sebagai konteks sebelum mengambil keputusan."
        )
    if breakdown.interview >= 15:
        strengths.append(
            "Anamnesis sudah mencakup beberapa informasi pembeda yang penting."
        )
    if not strengths:
        strengths.append(
            "Kamu sudah menyelesaikan alur konsultasi sampai tahap refleksi hasil."
        )

    if payload.missed_interview:
        improvements.append(
            "Perkuat anamnesis pada area: " + ", ".join(payload.missed_interview) + "."
        )
    if payload.missed_examinations:
        improvements.append(
            "Pertimbangkan pemeriksaan yang belum lengkap: "
            + ", ".join(payload.missed_examinations)
            + "."
        )
    if breakdown.quiz < 25:
        improvements.append(
            "Tinjau kembali hubungan data kasus dengan pilihan diagnosis dan rencana awal."
        )
    if not improvements:
        improvements.append(
            "Pertahankan struktur konsultasi dan coba tingkatkan efisiensi waktu."
        )

    next_steps.append(payload.case_feedback_template)
    next_steps.append(
        "Ulangi kasus dengan target menutup satu celah klinis sebelum membuka quiz."
    )

    safety_note = None
    if payload.missed_safety_questions:
        safety_note = "Ada keputusan safety-critical yang belum aman, sehingga bintang maksimal dibatasi."
    elif breakdown.safety > 0:
        safety_note = "Keputusan safety-critical pada kasus ini sudah aman."

    return StructuredFeedback(
        summary=(
            f"Hasil {payload.patient_name}: {payload.score}/100 dengan {payload.stars} "
            "bintang. Feedback ini dibuat dari scoring deterministik."
        ),
        strengths=strengths[:3],
        improvements=improvements[:3],
        next_steps=next_steps[:3],
        safety_note=safety_note,
        source="fallback",
    )


def _legacy_stars_for_score(score: int, safety_score: int) -> int:
    if safety_score == 0:
        return min(2, 1 if score >= 50 else 0)
    if score >= 85:
        return 3
    if score >= 70:
        return 2
    if score >= 50:
        return 1
    return 0


def _question(case: CaseGameplayConfig, question_id: str) -> QuizQuestion:
    for question in case.quiz:
        if question.id == question_id:
            return question
    raise ValueError(f"Unknown quiz question: {question_id}")
