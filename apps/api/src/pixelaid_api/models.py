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
    patient_avatar_url: str | None = None
    case_thumbnail_url: str | None = None
    consultation_avatar_url: str | None = None


class CaseBrief(CaseCard):
    learning_objectives: list[str] = Field(default_factory=list)


class Profile(BaseModel):
    id: str
    email: str | None = None
    display_name: str | None = None
    avatar_url: str | None = None
    gender: Literal["male", "female"] | None = None
    is_anonymous: bool = False
    onboarding_completed: bool = False
    xp: int = 0


class ProgressResponse(BaseModel):
    total_xp: int = 0
    level: int = 1
    completed_cases: int = 0
    average_best_score: float = 0


class ProfileUpdate(BaseModel):
    display_name: str | None = Field(default=None, min_length=1, max_length=80)
    avatar_url: str | None = Field(default=None, max_length=500)


class OnboardingCompleteRequest(BaseModel):
    gender: Literal["male", "female"]


class MeResponse(BaseModel):
    profile: Profile
    progress: ProgressResponse


class AuthUser(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    id: str
    email: str | None = None
    display_name: str | None = None
    avatar_url: str | None = None
    is_anonymous: bool = False


class SessionActor(BaseModel):
    user_id: str
    email: str | None = None
    is_anonymous: bool = False


class CreateCaseSessionRequest(BaseModel):
    case_id: str


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


class ExaminationAsset(BaseModel):
    type: Literal["image"]
    url: str
    alt: str


class ExaminationEvent(BaseModel):
    id: str
    examination_id: str
    label: str
    status: Literal["pending", "resulted"]
    result: str | None = None
    asset: ExaminationAsset | None = None
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
    is_paused: bool = False
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
    is_retry: bool = False


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


class LeaderboardEntry(BaseModel):
    rank: int
    user_id: str
    display_name: str
    total_xp: int
    score: int
    completed_cases: int
    average_best_score: float
    latest_activity_at: str | None = None
    level: int


class LeaderboardResponse(BaseModel):
    entries: list[LeaderboardEntry]


class LiveKitTokenRequest(BaseModel):
    session_id: str


class LiveKitTokenResponse(BaseModel):
    token: str
    url: str
    room_name: str
    identity: str
    expires_in_seconds: int


class VoiceFactResponse(BaseModel):
    key: str
    response: str


class VoiceExaminationResponse(BaseModel):
    id: str
    label: str
    result: str
    score_key: str | None = None


class VoiceAgentContextResponse(BaseModel):
    session_id: str
    case_id: str
    patient_name: str
    patient_persona: str
    tts_profile: dict[str, object]
    forbidden_terms: list[str]
    allowed_facts: list[VoiceFactResponse]
    completed_examinations: list[VoiceExaminationResponse]
    safety_rules: list[str]
    recent_messages: list[ConversationMessage]


class VoiceTranscriptMessage(BaseModel):
    external_id: str = Field(min_length=1, max_length=160)
    role: Literal["user", "patient"]
    content: str = Field(min_length=1, max_length=1200)
    metadata: dict[str, object] = Field(default_factory=dict)


class VoiceTranscriptRequest(BaseModel):
    messages: list[VoiceTranscriptMessage] = Field(min_length=1, max_length=8)


class VoiceTranscriptResponse(BaseModel):
    messages: list[ConversationMessage]


class VoiceSessionEventRequest(BaseModel):
    event_type: str = Field(min_length=1, max_length=80)
    severity: Literal["info", "warning", "error"] = "info"
    metadata: dict[str, object] = Field(default_factory=dict)


class VoiceSessionEventResponse(BaseModel):
    id: str
    session_id: str
    event_type: str
    severity: str
    created_at: str
