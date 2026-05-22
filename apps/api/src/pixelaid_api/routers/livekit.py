from fastapi import APIRouter, Depends
from pixelaid_api.dependencies import get_session_actor, require_voice_agent
from pixelaid_api.models import (
    LiveKitTokenRequest,
    LiveKitTokenResponse,
    SessionActor,
    VoiceAgentContextResponse,
    VoiceSessionEventRequest,
    VoiceSessionEventResponse,
    VoiceTranscriptRequest,
    VoiceTranscriptResponse,
)
from pixelaid_api.services import gameplay
from pixelaid_api.settings import Settings, get_settings

router = APIRouter(tags=["livekit"])


@router.post("/api/livekit/token", response_model=LiveKitTokenResponse)
async def create_livekit_token(
    payload: LiveKitTokenRequest,
    actor: SessionActor = Depends(get_session_actor),
    settings: Settings = Depends(get_settings),
) -> LiveKitTokenResponse:
    return await gameplay.issue_livekit_token(payload.session_id, actor, settings)


@router.get(
    "/api/livekit/sessions/{session_id}/agent-context",
    response_model=VoiceAgentContextResponse,
)
async def get_voice_agent_context(
    session_id: str,
    _: None = Depends(require_voice_agent),
) -> VoiceAgentContextResponse:
    return gameplay.voice_agent_context(session_id)


@router.post(
    "/api/livekit/sessions/{session_id}/transcript",
    response_model=VoiceTranscriptResponse,
)
async def store_voice_transcript(
    session_id: str,
    payload: VoiceTranscriptRequest,
    _: None = Depends(require_voice_agent),
) -> VoiceTranscriptResponse:
    return VoiceTranscriptResponse(
        messages=gameplay.store_voice_transcript(session_id, payload.messages)
    )


@router.post(
    "/api/livekit/sessions/{session_id}/events",
    response_model=VoiceSessionEventResponse,
)
async def store_voice_event(
    session_id: str,
    payload: VoiceSessionEventRequest,
    _: None = Depends(require_voice_agent),
) -> VoiceSessionEventResponse:
    return gameplay.record_voice_event(
        session_id,
        payload.event_type,
        payload.severity,
        payload.metadata,
    )
