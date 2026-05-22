from fastapi import APIRouter
from pixelaid_api.models import CaseBrief, PublicSpecialist
from pixelaid_api.services.supabase import (
    get_demo_case,
    get_case,
    list_cases_for_specialist,
    list_specialists,
)

router = APIRouter(prefix="/api/public", tags=["public"])


@router.get("/specialists", response_model=list[PublicSpecialist])
async def public_specialists() -> list[PublicSpecialist]:
    return list_specialists(include_coming_soon=True)


@router.get("/cases/demo", response_model=CaseBrief)
async def public_demo_case() -> CaseBrief:
    return get_demo_case()


@router.get("/cases/{case_id}", response_model=CaseBrief)
async def public_case(case_id: str) -> CaseBrief:
    return get_case(case_id)


@router.get("/specialists/{specialist_id}/cases", response_model=list[CaseBrief])
async def public_specialist_cases(specialist_id: str) -> list[CaseBrief]:
    return list_cases_for_specialist(specialist_id)
