from __future__ import annotations

from collections.abc import AsyncIterator
from typing import Any, cast

import pytest
from livekit.agents.metrics import TTSMetrics
from pixelaid_voice_agent.openrouter_tts import OpenRouterTTS, OpenRouterTtsOptions


class FakeOpenRouterResponse:
    status_code = 200
    headers = {"x-generation-id": "generation-1"}

    async def aread(self) -> bytes:
        return b""

    async def aiter_bytes(self) -> AsyncIterator[bytes]:
        yield b"\0" * 9600
        yield b"\0" * 9600


class FakeOpenRouterStream:
    async def __aenter__(self) -> FakeOpenRouterResponse:
        return FakeOpenRouterResponse()

    async def __aexit__(
        self,
        exc_type: type[BaseException] | None,
        exc: BaseException | None,
        traceback: Any,
    ) -> None:
        return None


class FakeOpenRouterClient:
    def stream(self, *args: object, **kwargs: object) -> FakeOpenRouterStream:
        return FakeOpenRouterStream()

    async def aclose(self) -> None:
        return None


@pytest.mark.anyio
async def test_openrouter_tts_emits_livekit_metrics() -> None:
    metrics: list[TTSMetrics] = []
    tts = OpenRouterTTS(
        OpenRouterTtsOptions(
            api_key="test-key",
            model="google/gemini-3.1-flash-tts-preview",
            voice="Kore",
        )
    )
    tts.on("metrics_collected", metrics.append)
    cast(Any, tts)._client = FakeOpenRouterClient()

    async with tts.synthesize("Halo Dok.") as stream:
        async for _ in stream:
            pass

    await tts.aclose()

    assert len(metrics) == 1
    assert metrics[0].request_id == "generation-1"
    assert metrics[0].characters_count == len("Halo Dok.")
    assert metrics[0].ttfb >= 0
    assert metrics[0].duration >= metrics[0].ttfb
    assert metrics[0].metadata is not None
    assert metrics[0].metadata.model_name == "google/gemini-3.1-flash-tts-preview"
    assert metrics[0].metadata.model_provider == "openrouter"
