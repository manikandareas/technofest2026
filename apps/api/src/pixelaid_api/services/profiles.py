from __future__ import annotations

from typing import Any

from pixelaid_api.models import AuthUser, Profile, SessionActor

StoreRow = dict[str, Any]

_profiles: dict[str, StoreRow] = {}


def clear_memory_profiles() -> None:
    _profiles.clear()


def memory_profiles() -> dict[str, StoreRow]:
    return _profiles


def display_name_for(user: AuthUser | SessionActor) -> str | None:
    email = user.email
    return email.split("@")[0] if email else None


def ensure_memory_profile(user: AuthUser) -> Profile:
    profile = Profile(
        id=user.id,
        email=user.email,
        display_name=display_name_for(user),
        is_anonymous=user.is_anonymous,
        xp=0,
    )
    stored = _profiles.setdefault(user.id, profile.model_dump())
    stored.update(
        {
            "email": user.email,
            "display_name": profile.display_name,
            "is_anonymous": user.is_anonymous,
        }
    )
    return Profile(**stored)


def ensure_memory_profile_for_actor(actor: SessionActor) -> None:
    _profiles.setdefault(
        actor.user_id,
        {
            "id": actor.user_id,
            "email": actor.email,
            "display_name": display_name_for(actor) or actor.user_id,
            "is_anonymous": actor.is_anonymous,
            "xp": 0,
        },
    )


def get_memory_profile(user_id: str) -> StoreRow | None:
    return _profiles.get(user_id)


def is_leaderboard_eligible(user_id: str) -> bool:
    profile = _profiles.get(user_id)
    if profile is None:
        return False
    return not bool(profile.get("is_anonymous"))
