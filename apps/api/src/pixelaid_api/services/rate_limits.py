from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
import hashlib
from typing import Any, cast
from uuid import UUID

from fastapi import HTTPException, status
from pixelaid_api.services.supabase import get_supabase_admin
from pixelaid_api.settings import get_settings
from pixelaid_shared.gameplay import utc_now

StoreRow = dict[str, Any]

_memory_events: list[StoreRow] = []


@dataclass(frozen=True)
class RateLimit:
    scope: str
    limit: int
    window_seconds: int


def assert_rate_limit(
    limit: RateLimit,
    *,
    actor_type: str,
    actor_key: str,
    session_id: str | None = None,
    metadata: dict[str, object] | None = None,
) -> None:
    if limit.limit <= 0:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit reached.",
            headers={"Retry-After": str(max(limit.window_seconds, 1))},
        )
    now = utc_now()
    window_start = now - timedelta(seconds=limit.window_seconds)
    actor_hash = hash_actor(limit.scope, actor_type, actor_key)
    rows = _load_recent_events(limit.scope, actor_hash, window_start)
    if len(rows) >= limit.limit:
        oldest = min(_parse_created_at(row["created_at"]) for row in rows)
        retry_after = max(
            1,
            int(
                (oldest + timedelta(seconds=limit.window_seconds) - now).total_seconds()
            ),
        )
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit reached.",
            headers={"Retry-After": str(retry_after)},
        )
    _insert_event(
        {
            "scope": limit.scope,
            "actor_type": actor_type,
            "actor_hash": actor_hash,
            "session_id": _coerce_uuid(session_id),
            "metadata": metadata or {},
            "created_at": _iso(now),
        }
    )


def hash_actor(scope: str, actor_type: str, actor_key: str) -> str:
    return hashlib.sha256(
        f"{scope}:{actor_type}:{actor_key}".encode("utf-8")
    ).hexdigest()


def _load_recent_events(
    scope: str, actor_hash: str, window_start: datetime
) -> list[StoreRow]:
    client = get_supabase_admin()
    if client is None:
        return [
            row
            for row in _memory_events
            if row["scope"] == scope
            and row["actor_hash"] == actor_hash
            and _parse_created_at(row["created_at"]) >= window_start
        ]
    try:
        response = (
            client.table("rate_limit_events")
            .select("id,created_at")
            .eq("scope", scope)
            .eq("actor_hash", actor_hash)
            .gte("created_at", _iso(window_start))
            .execute()
        )
        return cast(list[StoreRow], response.data)
    except Exception:
        if not _allow_memory_fallback():
            raise
        return [
            row
            for row in _memory_events
            if row["scope"] == scope
            and row["actor_hash"] == actor_hash
            and _parse_created_at(row["created_at"]) >= window_start
        ]


def _insert_event(row: StoreRow) -> None:
    client = get_supabase_admin()
    if client is None:
        _memory_events.append(row)
        return
    try:
        client.table("rate_limit_events").insert(
            {key: value for key, value in row.items() if value is not None}
        ).execute()
    except Exception:
        if not _allow_memory_fallback():
            raise
        _memory_events.append(row)


def _coerce_uuid(value: str | None) -> str | None:
    if not value:
        return None
    try:
        return str(UUID(value))
    except ValueError:
        return None


def _allow_memory_fallback() -> bool:
    return get_settings().environment != "production"


def _parse_created_at(value: str | datetime) -> datetime:
    if isinstance(value, datetime):
        return value.astimezone(timezone.utc)
    return datetime.fromisoformat(str(value).replace("Z", "+00:00")).astimezone(
        timezone.utc
    )


def _iso(value: datetime) -> str:
    return value.astimezone(timezone.utc).isoformat()
