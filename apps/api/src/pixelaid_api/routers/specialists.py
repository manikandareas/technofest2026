from fastapi import APIRouter, Depends
from pixelaid_api.dependencies import get_current_user
from typing import cast

from pixelaid_api.models import AuthUser, CaseCard, PublicSpecialist
from pixelaid_api.services.supabase import list_cases_for_specialist, list_specialists

router = APIRouter(prefix="/api/specialists", tags=["specialists"])


@router.get("", response_model=list[PublicSpecialist])
async def specialists(_: AuthUser = Depends(get_current_user)) -> list[PublicSpecialist]:
    return list_specialists(include_coming_soon=True)


@router.get("/{specialist_id}/cases", response_model=list[CaseCard])
async def specialist_cases(
    specialist_id: str,
    _: AuthUser = Depends(get_current_user),
) -> list[CaseCard]:
    return cast(list[CaseCard], list_cases_for_specialist(specialist_id))
