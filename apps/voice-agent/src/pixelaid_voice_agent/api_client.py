from __future__ import annotations

from typing import Any

import httpx


class PixelAidApiClient:
    def __init__(self, *, base_url: str, token: str) -> None:
        self._base_url = base_url.rstrip("/")
        self._headers = {"Authorization": f"Bearer {token}"}

    async def get_agent_context(self, session_id: str) -> dict[str, Any]:
        async with httpx.AsyncClient(base_url=self._base_url, timeout=10) as client:
            response = await client.get(
                f"/api/livekit/sessions/{session_id}/agent-context",
                headers=self._headers,
            )
            response.raise_for_status()
            return dict(response.json())

    async def store_transcript(
        self,
        session_id: str,
        messages: list[dict[str, Any]],
    ) -> None:
        async with httpx.AsyncClient(base_url=self._base_url, timeout=10) as client:
            response = await client.post(
                f"/api/livekit/sessions/{session_id}/transcript",
                headers=self._headers,
                json={"messages": messages},
            )
            response.raise_for_status()

    async def record_event(
        self,
        session_id: str,
        event_type: str,
        *,
        severity: str = "info",
        metadata: dict[str, Any] | None = None,
    ) -> None:
        async with httpx.AsyncClient(base_url=self._base_url, timeout=10) as client:
            response = await client.post(
                f"/api/livekit/sessions/{session_id}/events",
                headers=self._headers,
                json={
                    "event_type": event_type,
                    "severity": severity,
                    "metadata": metadata or {},
                },
            )
            response.raise_for_status()
