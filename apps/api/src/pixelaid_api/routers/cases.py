from fastapi import APIRouter, Depends
from pixelaid_api.dependencies import get_current_user
from pixelaid_api.models import AuthUser, CaseBrief
from pixelaid_api.services.supabase import get_case

router = APIRouter(prefix="/api/cases", tags=["cases"])


@router.get("/{case_id}", response_model=CaseBrief)
async def case_brief(
    case_id: str,
    _: AuthUser = Depends(get_current_user),
) -> CaseBrief:
    return get_case(case_id)
