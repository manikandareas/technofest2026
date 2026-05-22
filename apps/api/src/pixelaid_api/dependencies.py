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
    settings: Settings = Depends(get_settings),
) -> SessionActor:
    if authorization and authorization.lower().startswith("bearer "):
        user = await get_current_user(authorization, settings)
        return SessionActor(
            user_id=user.id,
            email=user.email,
            is_anonymous=user.is_anonymous,
        )
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Missing bearer token.",
    )


async def require_voice_agent(
    authorization: Annotated[str | None, Header()] = None,
    settings: Settings = Depends(get_settings),
) -> None:
    configured = (
        settings.voice_agent_api_token.get_secret_value()
        if settings.voice_agent_api_token
        else None
    )
    if not configured:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Voice agent API token is not configured.",
        )
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing voice agent bearer token.",
        )
    token = authorization.removeprefix("Bearer ").removeprefix("bearer ").strip()
    if token != configured:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid voice agent bearer token.",
        )
