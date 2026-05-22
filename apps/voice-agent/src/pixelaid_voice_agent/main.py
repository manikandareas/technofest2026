import json
import sys

from pixelaid_shared import ServiceStatus
from pixelaid_voice_agent.config import get_settings


def main() -> None:
    mode = sys.argv[1] if len(sys.argv) > 1 else "health"
    settings = get_settings()

    if mode == "dev":
        # This intentionally stops before joining rooms. Phase 1 will wire the
        # LiveKit worker entrypoint once case-session contracts exist.
        payload = {
            "service": "voice-agent",
            "project": settings.project_name,
            "status": "ok"
            if all(settings.readiness().values())
            else "degraded",
            "checks": settings.readiness(),
        }
        print(json.dumps(payload, indent=2))
        return

    status = ServiceStatus(service="voice-agent", status="ok")
    print(status.model_dump_json(indent=2))
