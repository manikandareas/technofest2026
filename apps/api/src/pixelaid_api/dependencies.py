from typing import Annotated

from fastapi import Depends, Header, HTTPException, status
from pixelaid_api.models import AuthUser, SessionActor
from pixelaid_api.services.supabase import verify_bearer_token
from pixelaid_api.settings import Settings, get_settings


async def get_current_user(
    authorization: Annotated[str | None, Header()] = None,
    settings: Settings = Depends(get_settings),
) -> AuthUser:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing bearer token.",
        )

    token = authorization.removeprefix("Bearer ").removeprefix("bearer ").strip()
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing bearer token.",
        )

    return await verify_bearer_token(token, settings)


async def get_session_actor(
    authorization: Annotated[str | None, Header()] = None,
    x_guest_session: Annotated[str | None, Header()] = None,
    settings: Settings = Depends(get_settings),
) -> SessionActor:
    if authorization and authorization.lower().startswith("bearer "):
        user = await get_current_user(authorization, settings)
        return SessionActor(user_id=user.id)
    if x_guest_session:
        return SessionActor(guest_id=x_guest_session.strip())
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Missing authenticated user or guest session.",
    )
