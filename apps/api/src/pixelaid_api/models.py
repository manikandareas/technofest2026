from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class PublicSpecialist(BaseModel):
    id: str
    name: str
    description: str
    icon: str
    status: str
    case_count: int = 0


class CaseCard(BaseModel):
    id: str
    specialist_id: str
    specialist_name: str
    patient_name: str
    patient_age: int
    patient_gender: str
    chief_complaint: str
    triage_note: str
    difficulty: str
    condition_badge: str
    estimated_duration_minutes: int
    is_demo: bool


class CaseBrief(CaseCard):
    learning_objectives: list[str] = Field(default_factory=list)


class Profile(BaseModel):
    id: str
    email: str | None = None
    display_name: str | None = None
    avatar_url: str | None = None
    onboarding_completed: bool = False
    xp: int = 0


class ProfileUpdate(BaseModel):
    display_name: str | None = Field(default=None, min_length=1, max_length=80)
    avatar_url: str | None = Field(default=None, max_length=500)


class MeResponse(BaseModel):
    profile: Profile


class AuthUser(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    id: str
    email: str | None = None


class GuestUser(BaseModel):
    id: str


class SessionActor(BaseModel):
    user_id: str | None = None
    guest_id: str | None = None


class CreateCaseSessionRequest(BaseModel):
    case_id: str
    guest_id: str | None = None


class ConversationMessage(BaseModel):
    id: str
    role: Literal["user", "patient", "system"]
    content: str
    created_at: str


class ExaminationOption(BaseModel):
    id: str
    label: str
    category: str
    delay_seconds: int


class ExaminationEvent(BaseModel):
    id: str
    examination_id: str
    label: str
    status: Literal["pending", "resulted"]
    result: str | None = None
    requested_at: str
    resulted_at: str


class QuizOptionResponse(BaseModel):
    id: str
    label: str


class QuizQuestionResponse(BaseModel):
    id: str
    prompt: str
    options: list[QuizOptionResponse]


class MedicalRecordResponse(BaseModel):
    summary: str
    history: list[str]
    medications: list[str]
    allergies: list[str]


class CaseSessionResponse(BaseModel):
    id: str
    case: CaseBrief
    status: Literal["brief", "in_consultation", "quiz", "completed", "abandoned"]
    remaining_seconds: int
    used_extension: bool
    medical_record_opened: bool
    medical_record: MedicalRecordResponse
    examination_options: list[ExaminationOption]
    examinations: list[ExaminationEvent]
    messages: list[ConversationMessage]
    quiz: list[QuizQuestionResponse]
    result_id: str | None = None


class SendMessageRequest(BaseModel):
    content: str = Field(min_length=1, max_length=600)


class SendMessageResponse(BaseModel):
    user_message: ConversationMessage
    patient_message: ConversationMessage
    session: CaseSessionResponse


class SelectExaminationRequest(BaseModel):
    examination_id: str


class TimerExtendResponse(BaseModel):
    remaining_seconds: int
    used_extension: bool


class QuizSubmitRequest(BaseModel):
    answers: dict[str, str]


class ScoreBreakdownResponse(BaseModel):
    quiz: int
    interview: int
    examination: int
    medical_record: int
    time: int
    safety: int
    total: int


class CaseResultResponse(BaseModel):
    id: str
    session_id: str
    case: CaseBrief
    score: int
    stars: int
    xp_awarded: int
    score_breakdown: ScoreBreakdownResponse
    feedback: dict[str, object]
    answers: dict[str, str]
    created_at: str
    attempt_number: int
    best_score: int


class HistoryItem(BaseModel):
    result_id: str
    session_id: str
    case_id: str
    patient_name: str
    condition_badge: str
    score: int
    stars: int
    created_at: str
    attempt_number: int
    best_score: int


class HistoryResponse(BaseModel):
    items: list[HistoryItem]
