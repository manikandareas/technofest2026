from __future__ import annotations

from collections.abc import Callable
from datetime import datetime, timezone
from typing import Any

from fastapi import HTTPException, status
from pixelaid_api.services import clock
from pixelaid_shared.cases import get_case_config

StoreRow = dict[str, Any]
UpdateSession = Callable[[str, StoreRow], StoreRow]


def _iso(value: datetime) -> str:
    return value.astimezone(timezone.utc).isoformat()


def _parse(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def remaining_seconds(row: StoreRow, *, now: datetime | None = None) -> int:
    stored_remaining = max(int(row.get("remaining_seconds") or 0), 0)
    if row["status"] != "in_consultation":
        return stored_remaining
    state = dict(row.get("session_state") or {})
    if state.get("timer_paused_at"):
        paused_remaining = state.get("timer_paused_remaining_seconds")
        if paused_remaining is not None:
            return max(int(paused_remaining), 0)
        return stored_remaining
    started_at = state.get("timer_started_at")
    budget = state.get("timer_budget_seconds")
    if not started_at or budget is None:
        return stored_remaining
    current = now or clock.utc_now()
    elapsed_seconds = int((current - _parse(str(started_at))).total_seconds())
    return max(int(budget) - max(elapsed_seconds, 0), 0)


def is_paused(row: StoreRow) -> bool:
    if row["status"] != "in_consultation":
        return False
    state = dict(row.get("session_state") or {})
    return bool(state.get("timer_paused_at"))


def assert_not_paused(row: StoreRow) -> None:
    if is_paused(row):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Consultation is paused.",
        )


def ensure_started(row: StoreRow, update_session: UpdateSession) -> StoreRow:
    if row["status"] != "in_consultation":
        return row
    state = dict(row.get("session_state") or {})
    if state.get("timer_started_at") and state.get("timer_budget_seconds"):
        return row
    config = get_case_config(str(row["case_id"]))
    state["timer_started_at"] = _iso(clock.utc_now())
    state["timer_budget_seconds"] = int(
        row.get("remaining_seconds") or config.timer_seconds
    )
    return update_session(str(row["id"]), {"session_state": state})


def assert_time_available(row: StoreRow, update_session: UpdateSession) -> StoreRow:
    row = ensure_started(row, update_session)
    assert_not_paused(row)
    if remaining_seconds(row) <= 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Consultation time has expired.",
        )
    return row


def build_pause_updates(row: StoreRow) -> StoreRow:
    remaining = remaining_seconds(row)
    state = dict(row.get("session_state") or {})
    state["timer_paused_at"] = _iso(clock.utc_now())
    state["timer_budget_seconds"] = remaining
    state["timer_paused_remaining_seconds"] = remaining
    return {"remaining_seconds": remaining, "session_state": state}


def build_resume_updates(row: StoreRow) -> StoreRow:
    remaining = remaining_seconds(row)
    state = dict(row.get("session_state") or {})
    state["timer_started_at"] = _iso(clock.utc_now())
    state["timer_budget_seconds"] = remaining
    state.pop("timer_paused_at", None)
    state.pop("timer_paused_remaining_seconds", None)
    return {"remaining_seconds": remaining, "session_state": state}


def build_extend_updates() -> StoreRow:
    state: dict[str, Any] = {
        "timer_started_at": _iso(clock.utc_now()),
        "timer_budget_seconds": 60,
    }
    return {
        "remaining_seconds": 60,
        "used_extension": True,
        "session_state": state,
    }


def build_end_updates(row: StoreRow) -> StoreRow:
    state = dict(row.get("session_state") or {})
    state["timer_ended_at"] = _iso(clock.utc_now())
    state.pop("timer_paused_at", None)
    state.pop("timer_paused_remaining_seconds", None)
    return {
        "status": "quiz",
        "remaining_seconds": remaining_seconds(row),
        "session_state": state,
    }


def voice_token_ttl_seconds(row: StoreRow, *, is_anonymous: bool) -> int:
    remaining = remaining_seconds(row)
    if is_anonymous:
        return min(max(remaining, 0) + 60, 10 * 60)
    return 15 * 60
