from __future__ import annotations

from datetime import datetime, timedelta, timezone
import json
from typing import Any, Callable, cast
from uuid import uuid4

from fastapi import HTTPException, status
from livekit.api import AccessToken, LiveKitAPI, TwirpError, TwirpErrorCode, VideoGrants
from livekit.protocol.agent_dispatch import (
    CreateAgentDispatchRequest,
    RoomAgentDispatch,
)
from livekit.protocol.room import RoomConfiguration
from pixelaid_api.models import (
    CaseResultResponse,
    CaseSessionResponse,
    ConversationMessage,
    ExaminationAsset,
    ExaminationEvent,
    ExaminationOption,
    HistoryItem,
    HistoryResponse,
    LeaderboardEntry,
    LeaderboardResponse,
    MedicalRecordResponse,
    QuizQuestionResponse,
    QuizOptionResponse,
    ScoreBreakdownResponse,
    SessionActor,
    ProgressResponse,
    LiveKitTokenResponse,
    VoiceAgentContextResponse,
    VoiceExaminationResponse,
    VoiceFactResponse,
    VoiceSessionEventResponse,
    VoiceTranscriptMessage,
)
from pixelaid_api.services import consultation_timer
from pixelaid_api.services.feedback import generate_structured_feedback
from pixelaid_api.services.profiles import (
    ensure_memory_profile_for_actor,
    get_memory_profile,
    is_leaderboard_eligible,
    memory_profiles,
)
from pixelaid_api.services.rate_limits import RateLimit, assert_rate_limit
from pixelaid_api.services.case_configs import case_exists, resolve_case_config
from pixelaid_api.services.supabase import get_case, get_supabase_admin
from pixelaid_api.settings import Settings, get_settings
from pixelaid_api.services import clock
from pixelaid_shared.gameplay import (
    calculate_score,
    calculate_retry_xp,
    calculate_xp,
    due_at,
    effective_examination_delay,
    exam_status,
    FeedbackInput,
    fallback_feedback,
    level_for_xp,
    patient_response,
    summarize_missed_categories,
    stars_for_score,
)

StoreRow = dict[str, Any]

_sessions: dict[str, StoreRow] = {}
_messages: dict[str, list[StoreRow]] = {}
_exams: dict[str, list[StoreRow]] = {}
_results: dict[str, StoreRow] = {}
_attempts: dict[tuple[str, str], StoreRow] = {}
_voice_events: dict[str, list[StoreRow]] = {}
_leaderboard: dict[str, StoreRow] = {}


def _resolve_case_id(case_id: str) -> str:
    return case_id


def create_session(
    case_id: str,
    actor: SessionActor,
    settings: Settings | None = None,
) -> CaseSessionResponse:
    case_id = _resolve_case_id(case_id)
    if not case_exists(case_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Case not found."
        )
    get_case(case_id)
    if actor.is_anonymous:
        resolved = settings or get_settings()
        assert_rate_limit(
            RateLimit(
                "anonymous_case_sessions",
                resolved.anonymous_case_session_limit,
                resolved.anonymous_case_session_window_seconds,
            ),
            actor_type="user",
            actor_key=actor.user_id,
            metadata={"case_id": case_id},
        )

    client = get_supabase_admin()
    config = resolve_case_config(case_id)
    row = {
        "id": str(uuid4()),
        "user_id": actor.user_id,
        "case_id": case_id,
        "status": "brief",
        "remaining_seconds": config.timer_seconds,
        "used_extension": False,
        "session_state": {"covered_interview_keys": [], "medical_record_opened": False},
        "started_at": _iso(clock.utc_now()),
        "ended_at": None,
        "result_id": None,
    }
    if client is None:
        ensure_memory_profile_for_actor(actor)
        _sessions[row["id"]] = row
        _messages[row["id"]] = []
        _exams[row["id"]] = []
    else:
        _ensure_session_profile(client, actor)
        data = cast(
            list[StoreRow], client.table("case_sessions").insert(row).execute().data
        )
        row = data[0]
    return get_session(str(row["id"]), actor, auto_start=False)


def get_session(
    session_id: str, actor: SessionActor, auto_start: bool = True
) -> CaseSessionResponse:
    row = _get_owned_session(session_id, actor)
    if auto_start and row["status"] == "brief":
        row = _update_session(session_id, {"status": "in_consultation"})
    row = consultation_timer.ensure_started(row, _update_session)
    return _session_response(row)


def send_message(
    session_id: str, actor: SessionActor, content: str
) -> tuple[ConversationMessage, ConversationMessage, CaseSessionResponse]:
    row = _require_status(
        _get_owned_session(session_id, actor), {"brief", "in_consultation"}
    )
    if row["status"] == "brief":
        row = _update_session(session_id, {"status": "in_consultation"})
    row = consultation_timer.assert_time_available(row, _update_session)
    config = resolve_case_config(str(row["case_id"]))
    reply, rubric_key = patient_response(config, content)
    state = dict(row.get("session_state") or {})
    covered = set(state.get("covered_interview_keys") or [])
    if rubric_key:
        covered.add(rubric_key)
    state["covered_interview_keys"] = sorted(covered)
    _update_session(session_id, {"session_state": state})
    user_message = _insert_message(session_id, "user", content)
    patient_message = _insert_message(session_id, "patient", reply)
    return (
        _message_response(user_message),
        _message_response(patient_message),
        get_session(session_id, actor, auto_start=False),
    )


def open_medical_record(session_id: str, actor: SessionActor) -> CaseSessionResponse:
    row = _require_status(
        _get_owned_session(session_id, actor), {"brief", "in_consultation"}
    )
    if row["status"] == "brief":
        row = _update_session(session_id, {"status": "in_consultation"})
    row = consultation_timer.assert_time_available(row, _update_session)
    state = dict(row.get("session_state") or {})
    state["medical_record_opened"] = True
    _update_session(session_id, {"session_state": state})
    return get_session(session_id, actor, auto_start=False)


def select_examination(
    session_id: str, actor: SessionActor, examination_id: str
) -> CaseSessionResponse:
    row = _require_status(_get_owned_session(session_id, actor), {"in_consultation"})
    row = consultation_timer.assert_time_available(row, _update_session)
    config = resolve_case_config(str(row["case_id"]))
    exam = next(
        (item for item in config.examinations if item.id == examination_id), None
    )
    if exam is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Examination not found."
        )
    if any(
        item["examination_id"] == examination_id for item in _load_exams(session_id)
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Examination has already been selected.",
        )
    now = clock.utc_now()
    _insert_exam(
        session_id,
        {
            "examination_id": exam.id,
            "label": exam.label,
            "category": exam.category,
            "delay_seconds": exam.delay_seconds,
            "result": exam.result,
            "asset": exam.asset,
            "score_key": exam.score_key,
            "requested_at": _iso(now),
            "resulted_at": _iso(due_at(effective_examination_delay(exam.delay_seconds), now)),
        },
    )
    return get_session(session_id, actor, auto_start=False)


def extend_timer(session_id: str, actor: SessionActor) -> tuple[int, bool]:
    row = _require_status(_get_owned_session(session_id, actor), {"in_consultation"})
    row = consultation_timer.ensure_started(row, _update_session)
    consultation_timer.assert_not_paused(row)
    if row.get("used_extension"):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Timer extension has already been used.",
        )
    if consultation_timer.remaining_seconds(row) > 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Timer extension is available after consultation time expires.",
        )
    updates = consultation_timer.build_extend_updates()
    state = dict(row.get("session_state") or {})
    state.update(cast(dict[str, Any], updates["session_state"]))
    _update_session(
        session_id,
        {
            "remaining_seconds": updates["remaining_seconds"],
            "used_extension": updates["used_extension"],
            "session_state": state,
        },
    )
    return 60, True


def pause_consultation(session_id: str, actor: SessionActor) -> CaseSessionResponse:
    row = _require_status(_get_owned_session(session_id, actor), {"in_consultation"})
    row = consultation_timer.ensure_started(row, _update_session)
    if consultation_timer.is_paused(row):
        return _session_response(row)
    remaining = consultation_timer.remaining_seconds(row)
    if remaining <= 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Consultation time has expired.",
        )
    _update_session(session_id, consultation_timer.build_pause_updates(row))
    return get_session(session_id, actor, auto_start=False)


def resume_consultation(session_id: str, actor: SessionActor) -> CaseSessionResponse:
    row = _require_status(_get_owned_session(session_id, actor), {"in_consultation"})
    row = consultation_timer.ensure_started(row, _update_session)
    if consultation_timer.remaining_seconds(row) <= 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Consultation time has expired.",
        )
    if not consultation_timer.is_paused(row):
        return _session_response(row)
    _update_session(session_id, consultation_timer.build_resume_updates(row))
    return get_session(session_id, actor, auto_start=False)


def end_consultation(session_id: str, actor: SessionActor) -> CaseSessionResponse:
    row = _require_status(_get_owned_session(session_id, actor), {"in_consultation"})
    row = consultation_timer.ensure_started(row, _update_session)
    _update_session(session_id, consultation_timer.build_end_updates(row))
    return get_session(session_id, actor, auto_start=False)


def submit_quiz(
    session_id: str,
    actor: SessionActor,
    answers: dict[str, str],
    settings: Settings | None = None,
    schedule_feedback_upgrade: Callable[..., object] | None = None,
) -> CaseResultResponse:
    row = _require_status(_get_owned_session(session_id, actor), {"quiz"})
    if row.get("result_id"):
        return get_result(str(row["result_id"]), actor)
    config = resolve_case_config(str(row["case_id"]))
    state = row.get("session_state") or {}
    completed_exam_keys = {
        str(exam.get("score_key"))
        for exam in _load_exams(session_id)
        if exam.get("score_key")
        and exam_status(_parse(exam["resulted_at"])) == "resulted"
    }
    covered_interview_keys = set(state.get("covered_interview_keys") or [])
    breakdown = calculate_score(
        config,
        answers,
        covered_interview_keys,
        completed_exam_keys,
        bool(state.get("medical_record_opened")),
        int(consultation_timer.remaining_seconds(row)),
        bool(row.get("used_extension")),
    )
    user_id = str(row["user_id"])
    stats_key = (user_id, str(row["case_id"]))
    stats = _load_user_case_stats(user_id, str(row["case_id"]))
    attempt_number = int(stats["attempts"]) + 1
    best_score = max(int(stats.get("best_score") or 0), breakdown.total)
    is_retry = attempt_number > 1
    case_row = _case_row(str(row["case_id"]))
    base_xp = int(case_row.get("base_xp") or 100)
    difficulty = cast(
        Any, case_row.get("difficulty") or get_case(str(row["case_id"])).difficulty
    )
    calculated_xp = calculate_xp(base_xp, breakdown.total, difficulty)
    xp_awarded = calculate_retry_xp(calculated_xp) if is_retry else calculated_xp
    stars = stars_for_score(breakdown.total, breakdown.safety)
    missed_interview, missed_exams, missed_safety = summarize_missed_categories(
        config,
        answers,
        covered_interview_keys,
        completed_exam_keys,
    )
    feedback_input = FeedbackInput(
        case_id=str(row["case_id"]),
        patient_name=config.patient_name,
        score=breakdown.total,
        stars=stars,
        score_breakdown=breakdown,
        missed_interview=missed_interview,
        missed_examinations=missed_exams,
        missed_safety_questions=missed_safety,
        case_feedback_template=config.feedback_template,
    )
    resolved_settings = settings or get_settings()
    _assert_feedback_generation_limit(row, actor, resolved_settings)
    feedback = fallback_feedback(feedback_input).model_dump()
    result_id = str(uuid4())
    result = {
        "id": result_id,
        "session_id": session_id,
        "user_id": user_id,
        "case_id": row["case_id"],
        "score": breakdown.total,
        "xp_awarded": xp_awarded,
        "stars": stars,
        "score_breakdown": breakdown.model_dump(),
        "feedback": feedback,
        "answers": answers,
        "attempt_number": attempt_number,
        "best_score": best_score,
        "is_retry": is_retry,
        "created_at": _iso(clock.utc_now()),
    }
    client = get_supabase_admin()
    if client is None:
        _results[result_id] = result
        if stats_key:
            _record_user_completion(
                user_id, str(row["case_id"]), breakdown.total, stars, xp_awarded
            )
    else:
        cast(
            list[StoreRow],
            client.table("quiz_submissions")
            .insert({"session_id": session_id, "answers": answers})
            .execute()
            .data,
        )
        data = cast(
            list[StoreRow],
            client.table("case_results").insert(result).execute().data,
        )
        result = data[0]
        if user_id:
            _record_user_completion(
                user_id, str(row["case_id"]), breakdown.total, stars, xp_awarded
            )
    _update_session(
        session_id,
        {"status": "completed", "ended_at": _iso(clock.utc_now()), "result_id": result_id},
    )
    if schedule_feedback_upgrade and resolved_settings.openai_api_key:
        schedule_feedback_upgrade(
            upgrade_result_feedback,
            result_id,
            feedback_input,
            resolved_settings,
        )
    return _result_response(result)


def upgrade_result_feedback(
    result_id: str,
    feedback_input: FeedbackInput,
    settings: Settings | None = None,
) -> None:
    try:
        feedback = generate_structured_feedback(feedback_input, settings)
    except TypeError:
        feedback = generate_structured_feedback(feedback_input)
    except Exception:
        return
    if feedback.source != "ai":
        return
    _update_result_feedback(result_id, feedback.model_dump())


def get_result(result_id: str, actor: SessionActor) -> CaseResultResponse:
    result = _get_owned_result(result_id, actor)
    return _result_response(result)


def history(actor: SessionActor) -> HistoryResponse:
    client = get_supabase_admin()
    if client is None:
        rows = [
            row
            for row in _results.values()
            if row.get("user_id") == actor.user_id
        ]
    else:
        query = client.table("case_results").select("*").order("created_at", desc=True)
        query = query.eq("user_id", actor.user_id)
        rows = cast(list[StoreRow], query.execute().data)
    rows = sorted(rows, key=lambda item: str(item.get("created_at")), reverse=True)
    return HistoryResponse(items=[_history_item(row) for row in rows])


def progress(user_id: str) -> ProgressResponse:
    client = get_supabase_admin()
    if client is None:
        total_xp = int((get_memory_profile(user_id) or {}).get("xp") or 0)
        stats = [
            row
            for (uid, _), row in _attempts.items()
            if uid == user_id and int(row.get("attempts") or 0) > 0
        ]
    else:
        try:
            profile_response = (
                client.table("profiles")
                .select("xp")
                .eq("id", user_id)
                .maybe_single()
                .execute()
            )
            profile = cast(StoreRow | None, getattr(profile_response, "data", None))
            total_xp = int((profile or {}).get("xp") or 0)
            stats = cast(
                list[StoreRow],
                client.table("user_case_stats")
                .select("*")
                .eq("user_id", user_id)
                .execute()
                .data,
            )
        except Exception:
            total_xp = int((get_memory_profile(user_id) or {}).get("xp") or 0)
            stats = [
                row
                for (uid, _), row in _attempts.items()
                if uid == user_id and int(row.get("attempts") or 0) > 0
            ]
    completed_cases = len(stats)
    average = (
        round(
            sum(int(row.get("best_score") or 0) for row in stats) / completed_cases, 1
        )
        if completed_cases
        else 0
    )
    return ProgressResponse(
        total_xp=total_xp,
        level=level_for_xp(total_xp),
        completed_cases=completed_cases,
        average_best_score=average,
    )


def leaderboard(limit: int = 50) -> LeaderboardResponse:
    client = get_supabase_admin()
    if client is None:
        rows = [
            row
            for row in _leaderboard.values()
            if is_leaderboard_eligible(str(row.get("user_id")))
        ]
    else:
        try:
            rows = cast(
                list[StoreRow],
                client.table("leaderboard_entries")
                .select("*,profiles!inner(is_anonymous)")
                .eq("profiles.is_anonymous", False)
                .order("score", desc=True)
                .order("average_best_score", desc=True)
                .order("completed_cases", desc=True)
                .order("latest_activity_at", desc=True)
                .limit(limit)
                .execute()
                .data,
            )
        except Exception:
            rows = [
                row
                for row in _leaderboard.values()
                if is_leaderboard_eligible(str(row.get("user_id")))
            ]
    rows = sorted(
        rows,
        key=lambda item: (
            int(item.get("total_xp") or item.get("score") or 0),
            float(item.get("average_best_score") or 0),
            int(item.get("completed_cases") or 0),
            str(item.get("latest_activity_at") or item.get("updated_at") or ""),
        ),
        reverse=True,
    )[:limit]
    return LeaderboardResponse(
        entries=[_leaderboard_entry(row, index + 1) for index, row in enumerate(rows)]
    )


async def issue_livekit_token(
    session_id: str,
    actor: SessionActor,
    settings: Settings,
) -> LiveKitTokenResponse:
    row = _require_status(
        _get_owned_session(session_id, actor), {"brief", "in_consultation"}
    )
    if row["status"] == "brief":
        row = _update_session(session_id, {"status": "in_consultation"})
    row = consultation_timer.assert_time_available(row, _update_session)
    if (
        not settings.livekit_url
        or not settings.livekit_api_key
        or not settings.livekit_api_secret
    ):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="LiveKit is not configured.",
        )
    if actor.is_anonymous:
        assert_rate_limit(
            RateLimit(
                "anonymous_voice_tokens",
                settings.anonymous_voice_token_limit,
                settings.anonymous_voice_token_window_seconds,
            ),
            actor_type="user",
            actor_key=actor.user_id,
            session_id=session_id,
        )
    else:
        assert_rate_limit(
            RateLimit(
                "authenticated_voice_tokens",
                settings.authenticated_voice_token_limit,
                settings.authenticated_voice_token_window_seconds,
            ),
            actor_type="user",
            actor_key=actor.user_id,
            session_id=session_id,
        )

    room_name = f"case-session-{session_id}"
    identity = f"user:{actor.user_id}"
    ttl_seconds = consultation_timer.voice_token_ttl_seconds(
        row, is_anonymous=actor.is_anonymous
    )
    metadata: dict[str, object] = {
        "session_id": session_id,
        "case_id": str(row["case_id"]),
        "actor": identity,
    }
    dispatch = RoomAgentDispatch(
        agent_name="pixelaid-patient",
        metadata=json.dumps(metadata),
    )
    await _ensure_livekit_agent_dispatch(room_name, metadata, dispatch, settings)
    room_config = RoomConfiguration(
        name=room_name,
        agents=[dispatch],
        metadata=json.dumps({"session_id": session_id}),
    )
    token = (
        AccessToken(settings.livekit_api_key, settings.livekit_api_secret)
        .with_identity(identity)
        .with_ttl(timedelta(seconds=ttl_seconds))
        .with_metadata(json.dumps(metadata))
        .with_grants(
            VideoGrants(
                room_join=True,
                room=room_name,
                can_publish=True,
                can_subscribe=True,
                can_publish_data=True,
            )
        )
        .with_room_config(room_config)
        .to_jwt()
    )
    updates: StoreRow = {
        "livekit_room_name": room_name,
        "voice_started_at": _iso(clock.utc_now()),
    }
    _update_session(session_id, updates)
    record_voice_event(
        session_id,
        "token_issued",
        "info",
        {
            "identity": identity,
            "is_anonymous": actor.is_anonymous,
            "ttl_seconds": ttl_seconds,
        },
    )
    return LiveKitTokenResponse(
        token=token,
        url=str(settings.livekit_url),
        room_name=room_name,
        identity=identity,
        expires_in_seconds=ttl_seconds,
    )


async def _ensure_livekit_agent_dispatch(
    room_name: str,
    metadata: dict[str, object],
    dispatch: RoomAgentDispatch,
    settings: Settings,
) -> None:
    if (
        not settings.livekit_url
        or not settings.livekit_api_key
        or not settings.livekit_api_secret
    ):
        return
    api = LiveKitAPI(
        url=str(settings.livekit_url),
        api_key=settings.livekit_api_key,
        api_secret=settings.livekit_api_secret,
    )
    try:
        existing: list[Any] = []
        try:
            existing = await api.agent_dispatch.list_dispatch(room_name)
        except TwirpError as exc:
            if exc.code != TwirpErrorCode.NOT_FOUND:
                raise
        if any(item.agent_name == "pixelaid-patient" for item in existing):
            return
        await api.agent_dispatch.create_dispatch(
            CreateAgentDispatchRequest(
                room=room_name,
                agent_name="pixelaid-patient",
                metadata=json.dumps(metadata),
            )
        )
    except TwirpError as exc:
        if exc.code != TwirpErrorCode.ALREADY_EXISTS:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"LiveKit agent dispatch failed: {exc.message}",
            ) from exc
    finally:
        await api.aclose()


def voice_agent_context(session_id: str) -> VoiceAgentContextResponse:
    row = _get_session_row(session_id)
    _require_status(row, {"brief", "in_consultation"})
    config = resolve_case_config(str(row["case_id"]))
    completed_exams = [
        exam
        for exam in _load_exams(session_id)
        if exam_status(_parse(str(exam["resulted_at"]))) == "resulted"
    ]
    return VoiceAgentContextResponse(
        session_id=session_id,
        case_id=str(row["case_id"]),
        patient_name=config.patient_name,
        patient_persona=config.patient_persona,
        tts_profile=config.tts_profile.model_dump(),
        forbidden_terms=config.forbidden_terms,
        allowed_facts=[
            VoiceFactResponse(key=str(fact.rubric_key or index), response=fact.response)
            for index, fact in enumerate(config.patient_facts)
        ],
        completed_examinations=[
            VoiceExaminationResponse(
                id=str(exam["examination_id"]),
                label=str(exam["label"]),
                result=str(exam["result"]),
                score_key=str(exam["score_key"]) if exam.get("score_key") else None,
            )
            for exam in completed_exams
        ],
        safety_rules=[
            "Do not reveal or name the diagnosis.",
            "Do not invent symptoms, history, examination findings, or test results.",
            "Do not mention examination results until they are completed in context.",
            "If the question is unclear, ask for clarification as the patient.",
        ],
        recent_messages=[
            _message_response(item) for item in _load_messages(session_id)[-12:]
        ],
    )


def store_voice_transcript(
    session_id: str,
    messages: list[VoiceTranscriptMessage],
) -> list[ConversationMessage]:
    row = _require_status(
        _get_session_row(session_id), {"brief", "in_consultation", "quiz", "completed"}
    )
    if row["status"] == "brief":
        row = _update_session(session_id, {"status": "in_consultation"})

    stored: list[ConversationMessage] = []
    config = resolve_case_config(str(row["case_id"]))
    state = dict(row.get("session_state") or {})
    covered = set(state.get("covered_interview_keys") or [])
    for message in messages:
        if row["status"] == "in_consultation" and message.role == "user":
            _, rubric_key = patient_response(config, message.content)
            if rubric_key:
                covered.add(rubric_key)
        stored.append(
            _message_response(
                _insert_message(
                    session_id,
                    message.role,
                    message.content,
                    external_id=message.external_id,
                    metadata={**message.metadata, "source": "voice"},
                )
            )
        )
    if row["status"] == "in_consultation":
        state["covered_interview_keys"] = sorted(covered)
        _update_session(session_id, {"session_state": state})
    return stored


def record_voice_event(
    session_id: str,
    event_type: str,
    severity: str,
    metadata: dict[str, object],
) -> VoiceSessionEventResponse:
    _get_session_row(session_id)
    row = {
        "id": str(uuid4()),
        "session_id": session_id,
        "event_type": event_type,
        "severity": severity,
        "metadata": metadata,
        "created_at": _iso(clock.utc_now()),
    }
    client = get_supabase_admin()
    if client is None:
        _voice_events.setdefault(session_id, []).append(row)
    else:
        data = cast(
            list[StoreRow],
            client.table("voice_session_events").insert(row).execute().data,
        )
        row = data[0]
    if event_type in {"disconnected", "ended"}:
        _update_session(session_id, {"voice_ended_at": _iso(clock.utc_now())})
    return VoiceSessionEventResponse(
        id=str(row["id"]),
        session_id=str(row["session_id"]),
        event_type=str(row["event_type"]),
        severity=str(row["severity"]),
        created_at=str(row["created_at"]),
    )


def _get_owned_session(session_id: str, actor: SessionActor) -> StoreRow:
    row = _get_session_row(session_id)
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Session not found."
        )
    if actor.user_id and row.get("user_id") == actor.user_id:
        return row
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Session is not owned by this actor.",
    )


def _ensure_session_profile(client: Any, actor: SessionActor) -> None:
    if not actor.user_id:
        return
    row: StoreRow = {
        "id": actor.user_id,
        "email": actor.email,
        "display_name": actor.email.split("@")[0] if actor.email else None,
        "is_anonymous": actor.is_anonymous,
    }
    row = {key: value for key, value in row.items() if value is not None}
    try:
        client.table("profiles").upsert(row, on_conflict="id").execute()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Profile could not be prepared before starting the case session.",
        ) from exc


def _get_session_row(session_id: str) -> StoreRow:
    client = get_supabase_admin()
    if client is None:
        row = _sessions.get(session_id)
    else:
        response = (
            client.table("case_sessions")
            .select("*")
            .eq("id", session_id)
            .maybe_single()
            .execute()
        )
        row = cast(StoreRow | None, getattr(response, "data", None))
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Session not found."
        )
    return row


def _get_owned_result(result_id: str, actor: SessionActor) -> StoreRow:
    row = _get_result_row(result_id)
    if actor.user_id and row.get("user_id") == actor.user_id:
        return row
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Result is not owned by this actor.",
    )


def _get_result_row(result_id: str) -> StoreRow:
    client = get_supabase_admin()
    if client is None:
        row = _results.get(result_id)
    else:
        response = (
            client.table("case_results")
            .select("*")
            .eq("id", result_id)
            .maybe_single()
            .execute()
        )
        row = cast(StoreRow | None, getattr(response, "data", None))
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Result not found."
        )
    return row


def _update_result_feedback(result_id: str, feedback: dict[str, object]) -> None:
    client = get_supabase_admin()
    if client is None:
        if result_id in _results:
            _results[result_id]["feedback"] = feedback
        return
    try:
        client.table("case_results").update(cast(Any, {"feedback": feedback})).eq(
            "id", result_id
        ).execute()
    except Exception:
        return


def _update_session(session_id: str, values: StoreRow) -> StoreRow:
    client = get_supabase_admin()
    if client is None:
        _sessions[session_id].update(values)
        return _sessions[session_id]
    data = cast(
        list[StoreRow],
        client.table("case_sessions")
        .update(values)
        .eq("id", session_id)
        .execute()
        .data,
    )
    return data[0]


def _insert_message(
    session_id: str,
    role: str,
    content: str,
    *,
    external_id: str | None = None,
    metadata: dict[str, object] | None = None,
) -> StoreRow:
    row = {
        "id": str(uuid4()),
        "session_id": session_id,
        "role": role,
        "content": content,
        "created_at": _iso(clock.utc_now()),
        "external_id": external_id,
        "metadata": metadata or {},
    }
    client = get_supabase_admin()
    if client is None:
        if external_id:
            existing = next(
                (
                    item
                    for item in _messages.setdefault(session_id, [])
                    if item.get("external_id") == external_id
                ),
                None,
            )
            if existing:
                return existing
        _messages.setdefault(session_id, []).append(row)
        return row
    if external_id:
        existing_response = (
            client.table("conversation_messages")
            .select("*")
            .eq("session_id", session_id)
            .eq("external_id", external_id)
            .maybe_single()
            .execute()
        )
        existing = cast(StoreRow | None, getattr(existing_response, "data", None))
        if existing:
            return existing
        data = cast(
            list[StoreRow],
            client.table("conversation_messages").insert(row).execute().data,
        )
        return data[0]
    row = {key: value for key, value in row.items() if value is not None}
    data = cast(
        list[StoreRow], client.table("conversation_messages").insert(row).execute().data
    )
    return data[0]


def _insert_exam(session_id: str, values: StoreRow) -> StoreRow:
    row = {"id": str(uuid4()), "session_id": session_id, **values}
    row["examination_type"] = row["examination_id"]
    client = get_supabase_admin()
    if client is None:
        _exams.setdefault(session_id, []).append(row)
        return row
    data = cast(
        list[StoreRow], client.table("examination_events").insert(row).execute().data
    )
    return data[0]


def _load_messages(session_id: str) -> list[StoreRow]:
    client = get_supabase_admin()
    if client is None:
        return _messages.get(session_id, [])
    return cast(
        list[StoreRow],
        client.table("conversation_messages")
        .select("*")
        .eq("session_id", session_id)
        .order("created_at")
        .execute()
        .data,
    )


def _load_exams(session_id: str) -> list[StoreRow]:
    client = get_supabase_admin()
    if client is None:
        return _exams.get(session_id, [])
    return cast(
        list[StoreRow],
        client.table("examination_events")
        .select("*")
        .eq("session_id", session_id)
        .order("requested_at")
        .execute()
        .data,
    )


def _session_response(row: StoreRow) -> CaseSessionResponse:
    config = resolve_case_config(str(row["case_id"]))
    state = row.get("session_state") or {}
    result_id = row.get("result_id")
    if not result_id:
        result_id = next(
            (r["id"] for r in _results.values() if r["session_id"] == row["id"]), None
        )
    return CaseSessionResponse(
        id=str(row["id"]),
        case=get_case(str(row["case_id"])),
        status=cast(Any, row["status"]),
        remaining_seconds=consultation_timer.remaining_seconds(row),
        used_extension=bool(row["used_extension"]),
        is_paused=consultation_timer.is_paused(row),
        medical_record_opened=bool(state.get("medical_record_opened")),
        medical_record=MedicalRecordResponse(**config.medical_record.model_dump()),
        examination_options=[
            ExaminationOption(
                id=item.id,
                label=item.label,
                category=item.category,
                delay_seconds=item.delay_seconds,
                asset=ExaminationAsset.model_validate(item.asset)
                if item.asset
                else None,
            )
            for item in config.examinations
        ],
        examinations=[_exam_response(item) for item in _load_exams(str(row["id"]))],
        messages=[_message_response(item) for item in _load_messages(str(row["id"]))],
        quiz=[
            QuizQuestionResponse(
                id=item.id,
                prompt=item.prompt,
                options=[
                    QuizOptionResponse(id=opt.id, label=opt.label)
                    for opt in item.options
                ],
            )
            for item in config.quiz
        ],
        result_id=str(result_id) if result_id else None,
    )


def _message_response(row: StoreRow) -> ConversationMessage:
    return ConversationMessage(
        id=str(row["id"]),
        role=cast(Any, row["role"]),
        content=str(row["content"]),
        created_at=str(row["created_at"]),
    )


def _exam_response(row: StoreRow) -> ExaminationEvent:
    status_value = exam_status(_parse(str(row["resulted_at"])))
    return ExaminationEvent(
        id=str(row["id"]),
        examination_id=str(row["examination_id"]),
        label=str(row["label"]),
        status=status_value,
        result=str(row["result"]) if status_value == "resulted" else None,
        asset=row.get("asset") if status_value == "resulted" else None,
        requested_at=str(row["requested_at"]),
        resulted_at=str(row["resulted_at"]),
    )


def _result_response(row: StoreRow) -> CaseResultResponse:
    breakdown = row.get("score_breakdown") or {}
    return CaseResultResponse(
        id=str(row["id"]),
        session_id=str(row["session_id"]),
        case=get_case(str(row["case_id"])),
        score=int(row["score"]),
        stars=int(row["stars"]),
        xp_awarded=int(row.get("xp_awarded") or 0),
        score_breakdown=ScoreBreakdownResponse(**breakdown),
        feedback=cast(dict[str, object], row.get("feedback") or {}),
        answers=cast(dict[str, str], row.get("answers") or {}),
        created_at=str(row["created_at"]),
        attempt_number=int(row.get("attempt_number") or 1),
        best_score=int(row.get("best_score") or row["score"]),
        is_retry=bool(row.get("is_retry")),
    )


def _history_item(row: StoreRow) -> HistoryItem:
    case = get_case(str(row["case_id"]))
    return HistoryItem(
        result_id=str(row["id"]),
        session_id=str(row["session_id"]),
        case_id=case.id,
        patient_name=case.patient_name,
        condition_badge=case.condition_badge,
        score=int(row["score"]),
        stars=int(row["stars"]),
        created_at=str(row["created_at"]),
        attempt_number=int(row.get("attempt_number") or 1),
        best_score=int(row.get("best_score") or row["score"]),
    )


def _require_status(row: StoreRow, allowed: set[str]) -> StoreRow:
    if row["status"] not in allowed:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Session must be in one of: {', '.join(sorted(allowed))}.",
        )
    return row


def _owner_key(row: StoreRow) -> str:
    return str(row.get("user_id"))


def _case_row(case_id: str) -> StoreRow:
    client = get_supabase_admin()
    if client is None:
        case = get_case(case_id)
        return {"id": case.id, "difficulty": case.difficulty, "base_xp": 100}
    response = (
        client.table("cases")
        .select("id,difficulty,base_xp")
        .eq("id", case_id)
        .maybe_single()
        .execute()
    )
    return cast(
        StoreRow,
        getattr(response, "data", None)
        or {"id": case_id, "difficulty": get_case(case_id).difficulty, "base_xp": 100},
    )


def _load_user_case_stats(user_id: str | None, case_id: str) -> StoreRow:
    if not user_id:
        return {"attempts": 0, "best_score": 0, "best_stars": 0}
    client = get_supabase_admin()
    if client is None:
        return _attempts.get(
            (user_id, case_id), {"attempts": 0, "best_score": 0, "best_stars": 0}
        )
    response = (
        client.table("user_case_stats")
        .select("*")
        .eq("user_id", user_id)
        .eq("case_id", case_id)
        .maybe_single()
        .execute()
    )
    return cast(
        StoreRow,
        getattr(response, "data", None)
        or {"attempts": 0, "best_score": 0, "best_stars": 0},
    )


def _record_user_completion(
    user_id: str,
    case_id: str,
    score: int,
    stars: int,
    xp_awarded: int,
) -> None:
    now = _iso(clock.utc_now())
    stats = _load_user_case_stats(user_id, case_id)
    attempts = int(stats.get("attempts") or 0) + 1
    best_score = max(int(stats.get("best_score") or 0), score)
    best_stars = max(int(stats.get("best_stars") or 0), stars)
    client = get_supabase_admin()
    if client is None:
        _record_memory_completion(
            user_id, case_id, stats, attempts, best_score, best_stars, xp_awarded, now
        )
        return

    try:
        client.table("user_case_stats").upsert(
            {
                "user_id": user_id,
                "case_id": case_id,
                "attempts": attempts,
                "best_score": best_score,
                "best_stars": best_stars,
                "first_completed_at": stats.get("first_completed_at") or now,
                "last_completed_at": now,
                "last_attempt_at": now,
            },
            on_conflict="user_id,case_id",
        ).execute()
        profile_response = (
            client.table("profiles")
            .select("xp,display_name,email,is_anonymous")
            .eq("id", user_id)
            .maybe_single()
            .execute()
        )
        profile = cast(
            StoreRow,
            getattr(profile_response, "data", None)
            or {"xp": 0, "display_name": None, "email": None, "is_anonymous": False},
        )
        total_xp = int(profile.get("xp") or 0) + xp_awarded
        client.table("profiles").update({"xp": total_xp}).eq("id", user_id).execute()
        stats_rows = cast(
            list[StoreRow],
            client.table("user_case_stats")
            .select("*")
            .eq("user_id", user_id)
            .execute()
            .data,
        )
        _upsert_leaderboard_row(client, user_id, profile, total_xp, stats_rows, now)
    except Exception:
        _record_memory_completion(
            user_id, case_id, stats, attempts, best_score, best_stars, xp_awarded, now
        )


def _record_memory_completion(
    user_id: str,
    case_id: str,
    stats: StoreRow,
    attempts: int,
    best_score: int,
    best_stars: int,
    xp_awarded: int,
    now: str,
) -> None:
    _attempts[(user_id, case_id)] = {
        "user_id": user_id,
        "case_id": case_id,
        "attempts": attempts,
        "best_score": best_score,
        "best_stars": best_stars,
        "first_completed_at": stats.get("first_completed_at") or now,
        "last_completed_at": now,
        "last_attempt_at": now,
    }
    profiles = memory_profiles()
    profile = profiles.setdefault(
        user_id,
        {"id": user_id, "xp": 0, "display_name": user_id, "is_anonymous": False},
    )
    profile["xp"] = int(profile.get("xp") or 0) + xp_awarded
    _sync_memory_leaderboard(user_id, now)


def _sync_memory_leaderboard(user_id: str, latest_activity_at: str) -> None:
    if not is_leaderboard_eligible(user_id):
        _leaderboard.pop(user_id, None)
        return
    stats = [row for (uid, _), row in _attempts.items() if uid == user_id]
    profile = get_memory_profile(user_id) or {}
    total_xp = int(profile.get("xp") or 0)
    completed_cases = len(stats)
    average = (
        round(
            sum(int(row.get("best_score") or 0) for row in stats) / completed_cases, 1
        )
        if completed_cases
        else 0
    )
    _leaderboard[user_id] = {
        "user_id": user_id,
        "display_name": str((get_memory_profile(user_id) or {}).get("display_name") or user_id),
        "score": total_xp,
        "total_xp": total_xp,
        "completed_cases": completed_cases,
        "average_best_score": average,
        "latest_activity_at": latest_activity_at,
    }


def _upsert_leaderboard_row(
    client: Any,
    user_id: str,
    profile: StoreRow,
    total_xp: int,
    stats_rows: list[StoreRow],
    latest_activity_at: str,
) -> None:
    if profile.get("is_anonymous"):
        client.table("leaderboard_entries").delete().eq("user_id", user_id).eq(
            "period", "all_time"
        ).execute()
        return
    completed_cases = len(stats_rows)
    average = (
        round(
            sum(int(row.get("best_score") or 0) for row in stats_rows)
            / completed_cases,
            1,
        )
        if completed_cases
        else 0
    )
    client.table("leaderboard_entries").upsert(
        {
            "user_id": user_id,
            "display_name": profile.get("display_name")
            or profile.get("email")
            or "PixelAid User",
            "score": total_xp,
            "total_xp": total_xp,
            "completed_cases": completed_cases,
            "average_best_score": average,
            "latest_activity_at": latest_activity_at,
            "period": "all_time",
        },
        on_conflict="user_id,period",
    ).execute()


def _leaderboard_entry(row: StoreRow, rank: int) -> LeaderboardEntry:
    total_xp = int(row.get("total_xp") or row.get("score") or 0)
    return LeaderboardEntry(
        rank=rank,
        user_id=str(row["user_id"]),
        display_name=str(row.get("display_name") or "PixelAid User"),
        total_xp=total_xp,
        score=total_xp,
        completed_cases=int(row.get("completed_cases") or 0),
        average_best_score=float(row.get("average_best_score") or 0),
        latest_activity_at=(
            str(row.get("latest_activity_at") or row.get("updated_at"))
            if row.get("latest_activity_at") or row.get("updated_at")
            else None
        ),
        level=level_for_xp(total_xp),
    )


def _assert_feedback_generation_limit(
    row: StoreRow,
    actor: SessionActor,
    settings: Settings,
) -> None:
    actor_type = "user"
    actor_key = str(row.get("user_id") or actor.user_id)
    assert_rate_limit(
        RateLimit(
            "ai_feedback_generations",
            settings.ai_feedback_generation_limit,
            settings.ai_feedback_generation_window_seconds,
        ),
        actor_type=actor_type,
        actor_key=actor_key,
        session_id=str(row["id"]),
        metadata={"case_id": str(row["case_id"])},
    )


def refresh_leaderboard_for_user(user_id: str) -> None:
    now = _iso(clock.utc_now())
    client = get_supabase_admin()
    if client is None:
        _sync_memory_leaderboard(user_id, now)
        return

    profile_response = (
        client.table("profiles")
        .select("xp,display_name,email,is_anonymous")
        .eq("id", user_id)
        .maybe_single()
        .execute()
    )
    profile = cast(StoreRow | None, getattr(profile_response, "data", None))
    if not profile:
        return
    stats_rows = cast(
        list[StoreRow],
        client.table("user_case_stats")
        .select("*")
        .eq("user_id", user_id)
        .execute()
        .data,
    )
    _upsert_leaderboard_row(
        client,
        user_id,
        profile,
        int(profile.get("xp") or 0),
        stats_rows,
        now,
    )


def _iso(value: datetime) -> str:
    return value.astimezone(timezone.utc).isoformat()


def _parse(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00"))
