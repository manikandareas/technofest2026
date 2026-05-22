from functools import lru_cache
from typing import Any, cast

from fastapi import HTTPException, status
from pixelaid_api.models import AuthUser, CaseBrief, Profile, PublicSpecialist
from pixelaid_api.services.seed_data import CASES, SPECIALISTS
from pixelaid_api.settings import Settings, get_settings
from supabase import Client, create_client


@lru_cache
def get_supabase_admin() -> Client | None:
    settings = get_settings()
    if not settings.supabase_url or not settings.supabase_service_role_key:
        return None
    return create_client(
        str(settings.supabase_url), settings.supabase_service_role_key.get_secret_value()
    )


async def verify_bearer_token(token: str, settings: Settings) -> AuthUser:
    if settings.environment == "development" and token.startswith("dev:"):
        return AuthUser(id=token.removeprefix("dev:") or "dev-user")

    client = get_supabase_admin()
    if client is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Supabase auth is not configured.",
        )

    try:
        response = client.auth.get_user(token)
    except Exception as exc:  # pragma: no cover - SDK/network defensive boundary.
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid bearer token.",
        ) from exc

    user = getattr(response, "user", None)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid bearer token.",
        )

    return AuthUser(id=str(user.id), email=getattr(user, "email", None))


def list_specialists(include_coming_soon: bool = True) -> list[PublicSpecialist]:
    client = get_supabase_admin()
    if client is None:
        specialists = SPECIALISTS
    else:
        try:
            rows = cast(
                list[dict[str, Any]],
                client.table("specialists")
                .select("id,name,description,icon,status")
                .order("sort_order")
                .execute()
                .data,
            )
            case_rows = cast(
                list[dict[str, Any]],
                client.table("cases")
                .select("id,specialist_id")
                .eq("status", "published")
                .execute()
                .data,
            )
        except Exception:
            return list_specialists_from_seed(include_coming_soon)
        counts: dict[str, int] = {}
        for row in case_rows:
            counts[str(row["specialist_id"])] = counts.get(str(row["specialist_id"]), 0) + 1
        specialists = [
            PublicSpecialist(**row, case_count=counts.get(str(row["id"]), 0))
            for row in rows
        ]

    if include_coming_soon:
        return specialists
    return [specialist for specialist in specialists if specialist.status == "available"]


def list_specialists_from_seed(include_coming_soon: bool) -> list[PublicSpecialist]:
    if include_coming_soon:
        return SPECIALISTS
    return [specialist for specialist in SPECIALISTS if specialist.status == "available"]


def list_cases_for_specialist(specialist_id: str) -> list[CaseBrief]:
    cases = _load_cases()
    return [case for case in cases if case.specialist_id == specialist_id]


def get_case(case_id: str) -> CaseBrief:
    if case_id == "demo":
        return get_demo_case()
    for case in _load_cases():
        if case.id == case_id:
            return case
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found.")


def get_demo_case() -> CaseBrief:
    for case in _load_cases():
        if case.is_demo:
            return case
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Demo case not found.")


def ensure_profile(user: AuthUser) -> Profile:
    client = get_supabase_admin()
    if client is None:
        return Profile(id=user.id, email=user.email, display_name=user.email, xp=0)

    try:
        existing_response = (
            client.table("profiles")
            .select("id,email,display_name,avatar_url,onboarding_completed,xp")
            .eq("id", user.id)
            .maybe_single()
            .execute()
        )
        existing = cast(dict[str, Any] | None, getattr(existing_response, "data", None))
    except Exception:
        return Profile(id=user.id, email=user.email, display_name=user.email, xp=0)
    if existing:
        return Profile(**existing)

    row = {
        "id": user.id,
        "email": user.email,
        "display_name": user.email.split("@")[0] if user.email else None,
    }
    data = cast(
        list[dict[str, Any]],
        client.table("profiles").insert(row).execute().data,
    )
    return Profile(**data[0])


def update_profile(user: AuthUser, values: dict[str, Any]) -> Profile:
    client = get_supabase_admin()
    if client is None:
        return Profile(id=user.id, email=user.email, **values)

    ensure_profile(user)
    try:
        data = cast(
            list[dict[str, Any]],
            client.table("profiles").update(values).eq("id", user.id).execute().data,
        )
    except Exception:
        return Profile(id=user.id, email=user.email, **values)
    return Profile(**data[0])


def complete_onboarding(user: AuthUser) -> Profile:
    return update_profile(user, {"onboarding_completed": True})


def _load_cases() -> list[CaseBrief]:
    client = get_supabase_admin()
    if client is None:
        return CASES

    specialist_names = {specialist.id: specialist.name for specialist in list_specialists()}
    try:
        rows = cast(
            list[dict[str, Any]],
            client.table("cases")
            .select(
                "id,specialist_id,patient_name,patient_age,patient_gender,chief_complaint,"
                "triage_note,difficulty,condition_badge,estimated_duration_minutes,is_demo"
            )
            .eq("status", "published")
            .execute()
            .data,
        )
    except Exception:
        return CASES
    seed_objectives = {case.id: case.learning_objectives for case in CASES}
    return [
        CaseBrief(
            **row,
            specialist_name=specialist_names.get(str(row["specialist_id"]), "Unknown"),
            learning_objectives=seed_objectives.get(str(row["id"]), []),
        )
        for row in rows
    ]
