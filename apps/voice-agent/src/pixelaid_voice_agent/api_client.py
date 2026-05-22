from __future__ import annotations

import httpx


class PixelAidApiClient:
    def __init__(self, *, base_url: str, token: str) -> None:
        self._client = httpx.AsyncClient(
            base_url=base_url.rstrip("/"),
            timeout=10,
            headers={"Authorization": f"Bearer {token}"},
        )

    async def aclose(self) -> None:
        await self._client.aclose()

    async def get_agent_context(self, session_id: str) -> dict[str, object]:
        response = await self._client.get(
            f"/api/livekit/sessions/{session_id}/agent-context",
        )
        response.raise_for_status()
        return dict(response.json())

    async def store_transcript(
        self,
        session_id: str,
        messages: list[dict[str, object]],
    ) -> None:
        response = await self._client.post(
            f"/api/livekit/sessions/{session_id}/transcript",
            json={"messages": messages},
        )
        response.raise_for_status()

    async def record_event(
        self,
        session_id: str,
        event_type: str,
        *,
        severity: str = "info",
        metadata: dict[str, object] | None = None,
    ) -> None:
        response = await self._client.post(
            f"/api/livekit/sessions/{session_id}/events",
            json={
                "event_type": event_type,
                "severity": severity,
                "metadata": metadata or {},
            },
        )
        response.raise_for_status()
