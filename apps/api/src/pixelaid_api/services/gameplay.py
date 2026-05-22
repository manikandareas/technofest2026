from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, cast
from uuid import uuid4

from fastapi import HTTPException, status
from pixelaid_api.models import (
    CaseResultResponse,
    CaseSessionResponse,
    ConversationMessage,
    ExaminationEvent,
    ExaminationOption,
    HistoryItem,
    HistoryResponse,
    MedicalRecordResponse,
    QuizQuestionResponse,
    QuizOptionResponse,
    ScoreBreakdownResponse,
    SessionActor,
)
from pixelaid_api.services.supabase import get_case, get_supabase_admin
from pixelaid_shared.cases import CASE_CONFIGS, get_case_config
from pixelaid_shared.gameplay import (
    calculate_score,
    due_at,
    exam_status,
    patient_response,
    stars_for_score,
    utc_now,
)

StoreRow = dict[str, Any]

_sessions: dict[str, StoreRow] = {}
_messages: dict[str, list[StoreRow]] = {}
_exams: dict[str, list[StoreRow]] = {}
_results: dict[str, StoreRow] = {}
_attempts: dict[tuple[str, str], StoreRow] = {}


def create_session(case_id: str, actor: SessionActor) -> CaseSessionResponse:
    if case_id not in CASE_CONFIGS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Case not found."
        )
    if actor.guest_id and case_id != "demo":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Guests can only start the Maya demo case.",
        )
    if not actor.user_id and not actor.guest_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing owner."
        )

    client = get_supabase_admin()
    config = get_case_config(case_id)
    row = {
        "id": str(uuid4()),
        "user_id": actor.user_id,
        "guest_session_id": actor.guest_id,
        "case_id": case_id,
        "status": "brief",
        "remaining_seconds": config.timer_seconds,
        "used_extension": False,
        "session_state": {"covered_interview_keys": [], "medical_record_opened": False},
        "started_at": _iso(utc_now()),
        "ended_at": None,
        "result_id": None,
    }
    if client is None:
        _sessions[row["id"]] = row
        _messages[row["id"]] = []
        _exams[row["id"]] = []
    else:
        if actor.guest_id:
            client.table("guest_sessions").upsert({"id": actor.guest_id}).execute()
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
    return _session_response(row)


def send_message(
    session_id: str, actor: SessionActor, content: str
) -> tuple[ConversationMessage, ConversationMessage, CaseSessionResponse]:
    row = _require_status(
        _get_owned_session(session_id, actor), {"brief", "in_consultation"}
    )
    if row["status"] == "brief":
        row = _update_session(session_id, {"status": "in_consultation"})
    config = get_case_config(str(row["case_id"]))
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
    row = _get_owned_session(session_id, actor)
    state = dict(row.get("session_state") or {})
    state["medical_record_opened"] = True
    _update_session(session_id, {"session_state": state})
    return get_session(session_id, actor, auto_start=False)


def select_examination(
    session_id: str, actor: SessionActor, examination_id: str
) -> CaseSessionResponse:
    row = _require_status(_get_owned_session(session_id, actor), {"in_consultation"})
    config = get_case_config(str(row["case_id"]))
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
    now = utc_now()
    _insert_exam(
        session_id,
        {
            "examination_id": exam.id,
            "label": exam.label,
            "category": exam.category,
            "delay_seconds": exam.delay_seconds,
            "result": exam.result,
            "score_key": exam.score_key,
            "requested_at": _iso(now),
            "resulted_at": _iso(due_at(exam.delay_seconds, now)),
        },
    )
    return get_session(session_id, actor, auto_start=False)


def extend_timer(session_id: str, actor: SessionActor) -> tuple[int, bool]:
    row = _require_status(_get_owned_session(session_id, actor), {"in_consultation"})
    if row.get("used_extension"):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Timer extension has already been used.",
        )
    remaining = max(int(row.get("remaining_seconds") or 0), 0) + 60
    _update_session(
        session_id, {"remaining_seconds": remaining, "used_extension": True}
    )
    return remaining, True


def end_consultation(session_id: str, actor: SessionActor) -> CaseSessionResponse:
    _require_status(_get_owned_session(session_id, actor), {"in_consultation"})
    _update_session(session_id, {"status": "quiz"})
    return get_session(session_id, actor, auto_start=False)


def submit_quiz(
    session_id: str, actor: SessionActor, answers: dict[str, str]
) -> CaseResultResponse:
    row = _require_status(_get_owned_session(session_id, actor), {"quiz"})
    if row.get("result_id"):
        return get_result(str(row["result_id"]), actor)
    config = get_case_config(str(row["case_id"]))
    state = row.get("session_state") or {}
    completed_exam_keys = {
        str(exam.get("score_key"))
        for exam in _load_exams(session_id)
        if exam.get("score_key")
        and exam_status(_parse(exam["resulted_at"])) == "resulted"
    }
    breakdown = calculate_score(
        config,
        answers,
        set(state.get("covered_interview_keys") or []),
        completed_exam_keys,
        bool(state.get("medical_record_opened")),
        int(row.get("remaining_seconds") or 0),
        bool(row.get("used_extension")),
    )
    owner_key = _owner_key(row)
    stats_key = (owner_key, str(row["case_id"]))
    stats = _attempts.get(stats_key, {"attempts": 0, "best_score": 0})
    attempt_number = int(stats["attempts"]) + 1
    best_score = max(int(stats.get("best_score") or 0), breakdown.total)
    _attempts[stats_key] = {"attempts": attempt_number, "best_score": best_score}
    result_id = str(uuid4())
    result = {
        "id": result_id,
        "session_id": session_id,
        "user_id": row.get("user_id"),
        "guest_session_id": row.get("guest_session_id"),
        "case_id": row["case_id"],
        "score": breakdown.total,
        "xp_awarded": breakdown.total if row.get("user_id") else 0,
        "stars": stars_for_score(breakdown.total, breakdown.safety),
        "score_breakdown": breakdown.model_dump(),
        "feedback": {"summary": config.feedback_template, "placeholder": True},
        "answers": answers,
        "attempt_number": attempt_number,
        "best_score": best_score,
        "created_at": _iso(utc_now()),
    }
    client = get_supabase_admin()
    if client is None:
        _results[result_id] = result
    else:
        cast(
            list[StoreRow],
            client.table("quiz_submissions")
            .insert({"session_id": session_id, "answers": answers})
            .execute()
            .data,
        )
        data = cast(
            list[StoreRow], client.table("case_results").insert(result).execute().data
        )
        result = data[0]
    _update_session(
        session_id,
        {"status": "completed", "ended_at": _iso(utc_now()), "result_id": result_id},
    )
    return _result_response(result)


def get_result(result_id: str, actor: SessionActor) -> CaseResultResponse:
    result = _get_owned_result(result_id, actor)
    return _result_response(result)


def history(actor: SessionActor) -> HistoryResponse:
    if not actor.user_id and not actor.guest_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing owner."
        )
    client = get_supabase_admin()
    if client is None:
        rows = [
            row
            for row in _results.values()
            if (actor.user_id and row.get("user_id") == actor.user_id)
            or (actor.guest_id and row.get("guest_session_id") == actor.guest_id)
        ]
    else:
        query = client.table("case_results").select("*").order("created_at", desc=True)
        if actor.user_id:
            query = query.eq("user_id", actor.user_id)
        else:
            query = query.eq("guest_session_id", actor.guest_id)
        rows = cast(list[StoreRow], query.execute().data)
    rows = sorted(rows, key=lambda item: str(item.get("created_at")), reverse=True)
    return HistoryResponse(items=[_history_item(row) for row in rows])


def _get_owned_session(session_id: str, actor: SessionActor) -> StoreRow:
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
    if actor.user_id and row.get("user_id") == actor.user_id:
        return row
    if actor.guest_id and row.get("guest_session_id") == actor.guest_id:
        return row
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Session is not owned by this actor.",
    )


def _get_owned_result(result_id: str, actor: SessionActor) -> StoreRow:
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
    if actor.user_id and row.get("user_id") == actor.user_id:
        return row
    if actor.guest_id and row.get("guest_session_id") == actor.guest_id:
        return row
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Result is not owned by this actor.",
    )


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


def _insert_message(session_id: str, role: str, content: str) -> StoreRow:
    row = {
        "id": str(uuid4()),
        "session_id": session_id,
        "role": role,
        "content": content,
        "created_at": _iso(utc_now()),
    }
    client = get_supabase_admin()
    if client is None:
        _messages.setdefault(session_id, []).append(row)
        return row
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
    config = get_case_config(str(row["case_id"]))
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
        remaining_seconds=int(row["remaining_seconds"]),
        used_extension=bool(row["used_extension"]),
        medical_record_opened=bool(state.get("medical_record_opened")),
        medical_record=MedicalRecordResponse(**config.medical_record.model_dump()),
        examination_options=[
            ExaminationOption(
                id=item.id,
                label=item.label,
                category=item.category,
                delay_seconds=item.delay_seconds,
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
    return str(row.get("user_id") or f"guest:{row.get('guest_session_id')}")


def _iso(value: datetime) -> str:
    return value.astimezone(timezone.utc).isoformat()


def _parse(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00"))
