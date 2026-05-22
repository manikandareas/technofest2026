from fastapi import APIRouter, Depends
from pixelaid_api.dependencies import get_session_actor
from pixelaid_api.models import (
    CaseResultResponse,
    CaseSessionResponse,
    CreateCaseSessionRequest,
    HistoryResponse,
    LeaderboardResponse,
    QuizSubmitRequest,
    SelectExaminationRequest,
    SendMessageRequest,
    SendMessageResponse,
    SessionActor,
    TimerExtendResponse,
)
from pixelaid_api.services import gameplay
from pixelaid_api.settings import Settings, get_settings

router = APIRouter(tags=["case-sessions"])


@router.post("/api/case-sessions", response_model=CaseSessionResponse)
async def create_case_session(
    payload: CreateCaseSessionRequest,
    actor: SessionActor = Depends(get_session_actor),
    settings: Settings = Depends(get_settings),
) -> CaseSessionResponse:
    return gameplay.create_session(payload.case_id, actor, settings)


@router.get("/api/case-sessions/{session_id}", response_model=CaseSessionResponse)
async def get_case_session(
    session_id: str,
    actor: SessionActor = Depends(get_session_actor),
) -> CaseSessionResponse:
    return gameplay.get_session(session_id, actor)


@router.post(
    "/api/case-sessions/{session_id}/messages", response_model=SendMessageResponse
)
async def send_case_session_message(
    session_id: str,
    payload: SendMessageRequest,
    actor: SessionActor = Depends(get_session_actor),
) -> SendMessageResponse:
    user_message, patient_message, session = gameplay.send_message(
        session_id, actor, payload.content
    )
    return SendMessageResponse(
        user_message=user_message,
        patient_message=patient_message,
        session=session,
    )


@router.post(
    "/api/case-sessions/{session_id}/medical-record/opened",
    response_model=CaseSessionResponse,
)
async def open_medical_record(
    session_id: str,
    actor: SessionActor = Depends(get_session_actor),
) -> CaseSessionResponse:
    return gameplay.open_medical_record(session_id, actor)


@router.post(
    "/api/case-sessions/{session_id}/examinations", response_model=CaseSessionResponse
)
async def select_examination(
    session_id: str,
    payload: SelectExaminationRequest,
    actor: SessionActor = Depends(get_session_actor),
) -> CaseSessionResponse:
    return gameplay.select_examination(session_id, actor, payload.examination_id)


@router.post(
    "/api/case-sessions/{session_id}/timer/extend", response_model=TimerExtendResponse
)
async def extend_timer(
    session_id: str,
    actor: SessionActor = Depends(get_session_actor),
) -> TimerExtendResponse:
    remaining_seconds, used_extension = gameplay.extend_timer(session_id, actor)
    return TimerExtendResponse(
        remaining_seconds=remaining_seconds,
        used_extension=used_extension,
    )


@router.post(
    "/api/case-sessions/{session_id}/pause",
    response_model=CaseSessionResponse,
)
async def pause_consultation(
    session_id: str,
    actor: SessionActor = Depends(get_session_actor),
) -> CaseSessionResponse:
    return gameplay.pause_consultation(session_id, actor)


@router.post(
    "/api/case-sessions/{session_id}/resume",
    response_model=CaseSessionResponse,
)
async def resume_consultation(
    session_id: str,
    actor: SessionActor = Depends(get_session_actor),
) -> CaseSessionResponse:
    return gameplay.resume_consultation(session_id, actor)


@router.post(
    "/api/case-sessions/{session_id}/end-consultation",
    response_model=CaseSessionResponse,
)
async def end_consultation(
    session_id: str,
    actor: SessionActor = Depends(get_session_actor),
) -> CaseSessionResponse:
    return gameplay.end_consultation(session_id, actor)


@router.post(
    "/api/case-sessions/{session_id}/quiz-submit", response_model=CaseResultResponse
)
async def submit_quiz(
    session_id: str,
    payload: QuizSubmitRequest,
    actor: SessionActor = Depends(get_session_actor),
    settings: Settings = Depends(get_settings),
) -> CaseResultResponse:
    return gameplay.submit_quiz(session_id, actor, payload.answers, settings)


@router.get("/api/case-results/{result_id}", response_model=CaseResultResponse)
async def get_case_result(
    result_id: str,
    actor: SessionActor = Depends(get_session_actor),
) -> CaseResultResponse:
    return gameplay.get_result(result_id, actor)


@router.get("/api/history", response_model=HistoryResponse)
async def get_history(
    actor: SessionActor = Depends(get_session_actor),
) -> HistoryResponse:
    return gameplay.history(actor)


@router.get("/api/history/{result_id}", response_model=CaseResultResponse)
async def get_history_result(
    result_id: str,
    actor: SessionActor = Depends(get_session_actor),
) -> CaseResultResponse:
    return gameplay.get_result(result_id, actor)


@router.get("/api/leaderboard", response_model=LeaderboardResponse)
async def get_leaderboard() -> LeaderboardResponse:
    return gameplay.leaderboard()
