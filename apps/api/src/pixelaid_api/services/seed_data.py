from __future__ import annotations

import json
from pathlib import Path

from pixelaid_api.models import CaseBrief, PublicSpecialist


def _find_data_json() -> Path | None:
    for parent in Path(__file__).resolve().parents:
        candidate = parent / "docs" / "data.json"
        if candidate.exists():
            return candidate
    return None


def _duration_minutes(seconds: int) -> int:
    return max(1, (seconds + 59) // 60)


def _load_seed_data() -> tuple[list[PublicSpecialist], list[CaseBrief]]:
    data_path = _find_data_json()
    if data_path is None:
        return [], []

    data = json.loads(data_path.read_text())
    specialist_rows = data.get("specialists") or []
    case_rows = data.get("cases") or []
    case_counts: dict[str, int] = {}
    for row in case_rows:
        if row.get("availability", {}).get("is_published"):
            specialist_id = str(row["specialist_id"])
            case_counts[specialist_id] = case_counts.get(specialist_id, 0) + 1

    specialists = [
        PublicSpecialist(
            id=str(row["id"]),
            name=str(row.get("display_name") or row.get("name") or row["id"]),
            description=str(row["description"]),
            icon=str(row.get("icon") or "stethoscope"),
            status=str(row["status"]),
            case_count=case_counts.get(str(row["id"]), 0),
        )
        for row in specialist_rows
    ]
    specialist_names = {item.id: item.name for item in specialists}

    cases = [
        CaseBrief(
            id=str(row["id"]),
            specialist_id=str(row["specialist_id"]),
            specialist_name=specialist_names.get(str(row["specialist_id"]), "Unknown"),
            patient_name=str(row["patient"]["name"]),
            patient_age=int(row["patient"]["age"]),
            patient_gender=str(row["patient"]["gender"]),
            chief_complaint=str(row["chief_complaint"]),
            triage_note=str(row["triage_note"]),
            difficulty=str(row["difficulty"]),
            condition_badge=str(row["condition_badge"]),
            estimated_duration_minutes=_duration_minutes(
                int(row["estimated_duration_seconds"])
            ),
            learning_objectives=[
                str(item)
                for item in (
                    (row.get("case_data") or {}).get("learning_focus") or []
                )
            ],
        )
        for row in case_rows
        if row.get("availability", {}).get("is_published")
    ]
    return specialists, cases


SPECIALISTS, CASES = _load_seed_data()
