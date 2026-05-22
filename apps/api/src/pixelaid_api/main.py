from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pixelaid_api.routers import case_sessions, cases, me, public, specialists, system
from pixelaid_api.settings import Settings, get_settings


def create_app(settings: Settings | None = None) -> FastAPI:
    resolved_settings = settings or get_settings()
    app = FastAPI(
        title="PixelAid API",
        version="0.1.0",
        summary="HTTP API for the technofest2026 PixelAid workspace.",
    )
    app.dependency_overrides[get_settings] = lambda: resolved_settings

    app.add_middleware(
        CORSMiddleware,
        allow_origins=resolved_settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(system.router)
    app.include_router(public.router)
    app.include_router(me.router)
    app.include_router(specialists.router)
    app.include_router(cases.router)
    app.include_router(case_sessions.router)

    return app


app = create_app()


def main() -> None:
    import uvicorn

    uvicorn.run("pixelaid_api.main:app", host="0.0.0.0", port=8000, reload=True)
