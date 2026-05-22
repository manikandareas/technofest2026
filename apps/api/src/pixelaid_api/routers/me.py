from fastapi import APIRouter, Depends
from pixelaid_api.dependencies import get_current_user
from pixelaid_api.models import AuthUser, MeResponse, Profile, ProfileUpdate
from pixelaid_api.services import gameplay
from pixelaid_api.services.supabase import (
    complete_onboarding,
    ensure_profile,
    update_profile,
)

router = APIRouter(prefix="/api/me", tags=["me"])


@router.get("", response_model=MeResponse)
async def me(user: AuthUser = Depends(get_current_user)) -> MeResponse:
    profile = ensure_profile(user)
    progress = gameplay.progress(user.id)
    profile.xp = progress.total_xp
    return MeResponse(profile=profile, progress=progress)


@router.patch("/profile", response_model=Profile)
async def patch_profile(
    payload: ProfileUpdate,
    user: AuthUser = Depends(get_current_user),
) -> Profile:
    return update_profile(user, payload.model_dump(exclude_unset=True))


@router.post("/onboarding-complete", response_model=Profile)
async def onboarding_complete(user: AuthUser = Depends(get_current_user)) -> Profile:
    return complete_onboarding(user)
