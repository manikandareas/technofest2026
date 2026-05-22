from typing import Any

from fastapi import APIRouter, Depends
from pixelaid_api.settings import Settings, get_settings
from pixelaid_shared import ServiceStatus

router = APIRouter(tags=["system"])


@router.get("/healthz", response_model=ServiceStatus)
async def healthz() -> ServiceStatus:
    return ServiceStatus(service="api", status="ok")


@router.get("/readyz")
async def readyz(settings: Settings = Depends(get_settings)) -> dict[str, Any]:
    checks = {
        "supabase": bool(settings.supabase_url and settings.supabase_service_role_key),
        "supabase_auth": bool(
            settings.supabase_url
            and (settings.supabase_anon_key or settings.supabase_service_role_key)
        ),
        "livekit": bool(
            settings.livekit_url
            and settings.livekit_api_key
            and settings.livekit_api_secret
        ),
        "openai": bool(settings.openai_api_key),
        "deepgram": bool(settings.deepgram_api_key),
    }

    return {
        "service": "api",
        "project": settings.project_name,
        "status": "ok" if all(checks.values()) else "degraded",
        "checks": checks,
    }
