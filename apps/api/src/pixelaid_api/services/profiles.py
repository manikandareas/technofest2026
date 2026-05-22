from __future__ import annotations

from typing import Any
from urllib.parse import quote

from pixelaid_api.models import AuthUser, Profile, SessionActor

StoreRow = dict[str, Any]

_profiles: dict[str, StoreRow] = {}


def clear_memory_profiles() -> None:
    _profiles.clear()


def memory_profiles() -> dict[str, StoreRow]:
    return _profiles


def display_name_for(user: AuthUser | SessionActor) -> str | None:
    display_name = getattr(user, "display_name", None)
    if display_name:
        return display_name
    email = user.email
    return email.split("@")[0] if email else None


def dicebear_pixel_avatar_url(name: str) -> str:
    return f"https://api.dicebear.com/9.x/pixel-art/svg?seed={quote(name)}"


def avatar_url_for(user: AuthUser | SessionActor) -> str | None:
    avatar_url = getattr(user, "avatar_url", None)
    if avatar_url:
        return avatar_url
    display_name = display_name_for(user)
    if not display_name:
        return None
    return dicebear_pixel_avatar_url(display_name)


def ensure_memory_profile(user: AuthUser) -> Profile:
    profile = Profile(
        id=user.id,
        email=user.email,
        display_name=display_name_for(user),
        avatar_url=avatar_url_for(user),
        is_anonymous=user.is_anonymous,
        xp=0,
    )
    stored = _profiles.setdefault(user.id, profile.model_dump())
    stored.update(
        {
            "email": user.email,
            "display_name": profile.display_name,
            "avatar_url": stored.get("avatar_url") or profile.avatar_url,
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
            "avatar_url": avatar_url_for(actor),
            "gender": None,
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
