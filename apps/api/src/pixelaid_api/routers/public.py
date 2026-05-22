from fastapi import APIRouter
from pixelaid_api.models import CaseBrief, PublicSpecialist
from pixelaid_api.services.supabase import get_demo_case, list_specialists

router = APIRouter(prefix="/api/public", tags=["public"])


@router.get("/specialists", response_model=list[PublicSpecialist])
async def public_specialists() -> list[PublicSpecialist]:
    return list_specialists(include_coming_soon=True)


@router.get("/cases/demo", response_model=CaseBrief)
async def public_demo_case() -> CaseBrief:
    return get_demo_case()
