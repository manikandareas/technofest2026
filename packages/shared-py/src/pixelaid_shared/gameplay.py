from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Literal

from pydantic import BaseModel, Field

SessionStatus = Literal["brief", "in_consultation", "quiz", "completed", "abandoned"]
ExamStatus = Literal["pending", "resulted"]


class MedicalRecord(BaseModel):
    summary: str
    history: list[str]
    medications: list[str]
    allergies: list[str]


class PatientFact(BaseModel):
    keywords: list[str]
    response: str
    rubric_key: str | None = None


class ExaminationConfig(BaseModel):
    id: str
    label: str
    category: str
    delay_seconds: int
    result: str
    score_key: str | None = None


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


class ScoreBreakdown(BaseModel):
    quiz: int
    interview: int
    examination: int
    medical_record: int
    time: int
    safety: int
    total: int


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
