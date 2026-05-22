from __future__ import annotations

from typing import Any, cast

from fastapi import HTTPException, status
from pixelaid_api.services.supabase import get_supabase_admin
from pixelaid_shared.cases import CASE_CONFIGS, case_config_from_data, get_case_config
from pixelaid_shared.gameplay import CaseGameplayConfig

StoreRow = dict[str, Any]


def resolve_case_config(case_id: str) -> CaseGameplayConfig:
    row = _load_case_row(case_id)
    if row is None:
        try:
            return get_case_config(case_id)
        except KeyError as exc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Case not found.",
            ) from exc
    return case_config_from_data(_case_data_item_from_row(row))


def case_exists(case_id: str) -> bool:
    if _load_case_row(case_id) is not None:
        return True
    return case_id in CASE_CONFIGS


def _load_case_row(case_id: str) -> StoreRow | None:
    client = get_supabase_admin()
    if client is None:
        return None
    response = (
        client.table("cases")
        .select(
            "id,patient_name,patient_age,patient_gender,chief_complaint,"
            "estimated_duration_minutes,case_data"
        )
        .eq("id", case_id)
        .maybe_single()
        .execute()
    )
    return cast(StoreRow | None, getattr(response, "data", None))


def _case_data_item_from_row(row: StoreRow) -> dict[str, Any]:
    raw_case_data = row.get("case_data")
    case_data = raw_case_data if isinstance(raw_case_data, dict) else {}
    duration_minutes = row.get("estimated_duration_minutes")
    duration_seconds = (
        int(duration_minutes) * 60
        if duration_minutes is not None
        else case_data.get("estimated_duration_seconds")
    )
    if duration_seconds is None:
        duration_seconds = 300

    return {
        "id": row["id"],
        "patient": {
            "name": row.get("patient_name"),
            "age": row.get("patient_age"),
            "gender": row.get("patient_gender"),
        },
        "chief_complaint": row.get("chief_complaint"),
        "estimated_duration_seconds": duration_seconds,
        "case_data": case_data.get("case_data") or {},
    }
