import asyncio
from typing import Any

import pytest

from pixelaid_voice_agent.session_telemetry import SessionEventRecorder


class FakeApiClient:
    def __init__(self) -> None:
        self.closed = False
        self.events: list[tuple[str, dict[str, object]]] = []

    async def record_event(
        self,
        session_id: str,
        event_type: str,
        *,
        severity: str = "info",
        metadata: dict[str, object] | None = None,
    ) -> None:
        await asyncio.sleep(0)
        if self.closed:
            raise RuntimeError("client closed")
        self.events.append((event_type, metadata or {}))


@pytest.mark.anyio
async def test_session_event_recorder_does_not_schedule_after_close() -> None:
    api_client = FakeApiClient()
    tasks: set[asyncio.Task[Any]] = set()
    recorder = SessionEventRecorder(api_client, "session-1", tasks)  # type: ignore[arg-type]

    recorder.record("ready")
    await recorder.drain()
    assert api_client.events == [("ready", {})]

    recorder.close()
    api_client.closed = True
    recorder.record("late_metric")
    await recorder.drain()

    assert api_client.events == [("ready", {})]
    assert tasks == set()
